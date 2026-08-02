import {data, redirect, Form, useLoaderData, useActionData, useNavigation} from 'react-router';
import {sealClient} from '~/lib/seal.server';

const CUSTOMER_EMAIL_QUERY = `#graphql
  query CustomerEmail {
    customer {
      emailAddress {
        emailAddress
      }
    }
  }
`;

/** @type {Route.MetaFunction} */
export const meta = () => [{title: 'Subscriptions'}];

/** @param {Route.LoaderArgs} */
export async function loader({context}) {
  const {customerAccount, env} = context;
  await customerAccount.handleAuthStatus();

  if (!env.SEAL_API_TOKEN) {
    return {subscriptions: [], email: null, error: 'Seal Subscriptions is not configured.'};
  }

  const {data: customerData, errors} = await customerAccount.query(CUSTOMER_EMAIL_QUERY);
  if (errors?.length || !customerData?.customer?.emailAddress?.emailAddress) {
    throw new Error('Could not load customer email');
  }

  const email = customerData.customer.emailAddress.emailAddress;
  const seal = sealClient(env.SEAL_API_TOKEN);

  try {
    const result = await seal.getSubscriptionsByEmail(email);
    return {subscriptions: result.subscriptions ?? [], email};
  } catch (err) {
    return {subscriptions: [], email, error: err.message};
  }
}

/** @param {Route.ActionArgs} */
export async function action({request, context}) {
  const {customerAccount, env} = context;
  await customerAccount.handleAuthStatus();

  if (!env.SEAL_API_TOKEN) {
    return data({error: 'Seal Subscriptions is not configured.'}, {status: 500});
  }

  const form = await request.formData();
  const _action = form.get('_action');
  const subscriptionId = form.get('subscriptionId');
  const billingAttemptId = form.get('billingAttemptId');
  const email = form.get('email');

  const seal = sealClient(env.SEAL_API_TOKEN);

  try {
    switch (_action) {
      case 'pause':
        await seal.pauseSubscription(Number(subscriptionId));
        break;
      case 'resume':
        await seal.resumeSubscription(Number(subscriptionId));
        break;
      case 'cancel':
        await seal.cancelSubscription(Number(subscriptionId));
        break;
      case 'skip':
        await seal.skipBillingAttempt(Number(billingAttemptId), Number(subscriptionId));
        break;
      case 'unskip':
        await seal.unskipBillingAttempt(Number(billingAttemptId), Number(subscriptionId));
        break;
      case 'update-payment': {
        const result = await seal.getMagicLink(email);
        if (result?.magic_link) {
          return redirect(result.magic_link);
        }
        return data({error: 'Could not generate payment update link.'}, {status: 500});
      }
      default:
        return data({error: `Unknown action: ${_action}`}, {status: 400});
    }

    return {success: true};
  } catch (err) {
    return data({error: err.message}, {status: 500});
  }
}

export default function AccountSubscriptions() {
  /** @type {LoaderReturnData} */
  const {subscriptions, email, error: loaderError} = useLoaderData();
  const actionData = useActionData();
  const {state} = useNavigation();
  const isSubmitting = state !== 'idle';

  return (
    <div className="account-subscriptions">
      <h2>My Subscriptions</h2>
      <br />

      {(loaderError || actionData?.error) && (
        <p>
          <mark>
            <small>{loaderError ?? actionData.error}</small>
          </mark>
        </p>
      )}

      {!loaderError && !subscriptions.length && (
        <p>You don&apos;t have any subscriptions yet.</p>
      )}

      {subscriptions.map((sub) => (
        <SubscriptionCard
          key={sub.id}
          subscription={sub}
          email={email}
          isSubmitting={isSubmitting}
        />
      ))}
    </div>
  );
}

/**
 * @param {{
 *   subscription: SealSubscription;
 *   email: string;
 *   isSubmitting: boolean;
 * }}
 */
function SubscriptionCard({subscription, email, isSubmitting}) {
  const nextAttempt = subscription.billing_attempts?.find((a) => !a.completed_at);
  const isActive = subscription.status === 'ACTIVE';
  const isPaused = subscription.status === 'PAUSED';
  const canManage = isActive || isPaused;

  return (
    <fieldset style={{marginBottom: '2rem'}}>
      <legend>
        Subscription #{subscription.id} &mdash;{' '}
        <StatusBadge status={subscription.status} />
      </legend>

      {subscription.items?.length > 0 && (
        <div>
          <strong>Items:</strong>
          <ul>
            {subscription.items.map((item) => (
              <li key={item.id}>
                {item.title} &times; {item.quantity} &mdash;{' '}
                {formatPrice(item.price, subscription.currency)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p>Delivery: every {subscription.delivery_interval}</p>

      {nextAttempt && (
        <p>
          Next order:{' '}
          {nextAttempt.status === 'SKIPPED' ? (
            <em>Skipped ({formatDate(nextAttempt.date)})</em>
          ) : (
            <strong>{formatDate(nextAttempt.date)}</strong>
          )}
        </p>
      )}

      {subscription.card_brand && (
        <p>
          Payment: {subscription.card_brand} &middot;&middot;&middot;&middot;{' '}
          {subscription.card_last_digits} (exp {subscription.card_expiry_month}/
          {subscription.card_expiry_year})
        </p>
      )}

      {canManage && (
        <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem'}}>
          {nextAttempt && isActive && (
            <Form method="POST">
              <input
                type="hidden"
                name="_action"
                value={nextAttempt.status === 'SKIPPED' ? 'unskip' : 'skip'}
              />
              <input type="hidden" name="subscriptionId" value={subscription.id} />
              <input type="hidden" name="billingAttemptId" value={nextAttempt.id} />
              <button type="submit" disabled={isSubmitting}>
                {nextAttempt.status === 'SKIPPED' ? 'Unskip next order' : 'Skip next order'}
              </button>
            </Form>
          )}

          <Form method="POST">
            <input type="hidden" name="_action" value={isActive ? 'pause' : 'resume'} />
            <input type="hidden" name="subscriptionId" value={subscription.id} />
            <button type="submit" disabled={isSubmitting}>
              {isActive ? 'Pause' : 'Resume'}
            </button>
          </Form>

          <Form method="POST">
            <input type="hidden" name="_action" value="update-payment" />
            <input type="hidden" name="email" value={email} />
            <button type="submit" disabled={isSubmitting}>
              Update payment method
            </button>
          </Form>

          <Form method="POST">
            <input type="hidden" name="_action" value="cancel" />
            <input type="hidden" name="subscriptionId" value={subscription.id} />
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={(e) => {
                if (!confirm('Cancel this subscription? This cannot be undone.')) {
                  e.preventDefault();
                }
              }}
            >
              Cancel
            </button>
          </Form>
        </div>
      )}
    </fieldset>
  );
}

/** @param {{status: string}} */
function StatusBadge({status}) {
  const colors = {
    ACTIVE: 'green',
    PAUSED: 'orange',
    CANCELLED: 'red',
    EXPIRED: 'gray',
  };
  return (
    <span style={{color: colors[status] ?? 'inherit', fontWeight: 'bold'}}>
      {status}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatPrice(price, currency = 'USD') {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return new Intl.NumberFormat('en-US', {style: 'currency', currency}).format(num);
}

/**
 * @typedef {{
 *   id: number;
 *   status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
 *   delivery_interval: string;
 *   billing_interval: string;
 *   currency: string;
 *   card_brand?: string;
 *   card_last_digits?: string;
 *   card_expiry_month?: number;
 *   card_expiry_year?: number;
 *   items?: Array<{id: number; title: string; quantity: number; price: string}>;
 *   billing_attempts?: Array<{id: number; date: string; completed_at: string | null; status: string}>;
 * }} SealSubscription
 */

/** @typedef {import('./+types/account.subscriptions').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
