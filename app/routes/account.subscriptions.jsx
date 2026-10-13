import {data, Form, useLoaderData, useActionData, useNavigation} from 'react-router';
import {EmptyState} from '~/components/EmptyState';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import {sealClient} from '~/lib/seal.server';
import {sendEmail} from '~/lib/email.server';
import {CUSTOMER_EMAIL_QUERY} from '~/graphql/customer-account/CustomerEmailQuery';

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

  const seal = sealClient(env.SEAL_API_TOKEN);

  try {
    switch (_action) {
      case 'pause':
        await seal.pauseSubscription(Number(subscriptionId));
        break;
      case 'resume':
        await seal.resumeSubscription(Number(subscriptionId));
        break;
      case 'cancel': {
        await seal.cancelSubscription(Number(subscriptionId));
        const reason = form.get('reason')?.toString() ?? 'No reason provided';
        const comment = form.get('comment')?.toString() ?? '';
        const customerName = form.get('customerName')?.toString() ?? 'A customer';
        const customerEmail = form.get('customerEmail')?.toString() ?? '';
        if (env.POSTMARK_API_KEY) {
          await sendEmail({
            apiKey: env.POSTMARK_API_KEY,
            from: 'Aspen Coffee Co <hello@aspencoffee.co>',
            to: 'dustin@aspencoffee.co',
            replyTo: customerEmail || undefined,
            subject: `Subscription #${subscriptionId} cancelled`,
            text: [
              `${customerName} (${customerEmail || 'no email'}) cancelled subscription #${subscriptionId}.`,
              '',
              `Reason: ${reason}`,
              comment ? `Comments: ${comment}` : '',
            ].filter(Boolean).join('\n'),
          });
        }
        break;
      }
      case 'skip':
        await seal.skipBillingAttempt(Number(billingAttemptId), Number(subscriptionId));
        break;
      case 'unskip':
        await seal.unskipBillingAttempt(Number(billingAttemptId), Number(subscriptionId));
        break;
      default:
        return data({error: `Unknown action: ${_action}`}, {status: 400});
    }
    return {success: true, action: _action};
  } catch (err) {
    return data({error: err.message}, {status: 500});
  }
}

const ACTION_MESSAGES = {
  pause: 'Subscription paused.',
  resume: 'Subscription resumed.',
  cancel: 'Subscription cancelled.',
  skip: 'Next order skipped.',
  unskip: 'Next order unskipped.',
};

export default function AccountSubscriptions() {
  /** @type {LoaderReturnData} */
  const {subscriptions, email: _email, error: loaderError} = useLoaderData();
  const actionData = useActionData();
  const {state} = useNavigation();
  const isSubmitting = state !== 'idle';

  useEffect(() => {
    if (!actionData) return;
    if (actionData.error) {
      toast.error(actionData.error);
    } else if (actionData.success) {
      toast.success(ACTION_MESSAGES[actionData.action] ?? 'Done.');
    }
  }, [actionData]);

  return (
    <div>
      {loaderError && (
        <p className="mb-4 text-sm text-destructive font-semibold">{loaderError}</p>
      )}

      {!loaderError && !subscriptions.length && (
        <EmptyState
          title="No subscriptions yet"
          body="Subscribe for free shipping, first access to new drops, and a reliable coffee routine without the guesswork. Pause, skip or cancel anytime from here."
          cta={{to: '/collections/subscriptions', label: 'Subscribe & save'}}
          tone="bg-pop-1"
        />
      )}

      <div className="flex flex-col gap-4">
        {subscriptions.map((sub) => (
          <SubscriptionCard
            key={sub.id}
            subscription={sub}
            isSubmitting={isSubmitting}
          />
        ))}
      </div>
    </div>
  );
}

/** @param {{subscription: SealSubscription; isSubmitting: boolean}} */
function SubscriptionCard({subscription, isSubmitting}) {
  const pending = subscription.billing_attempts?.filter((a) => !a.completed_at) ?? [];
  // Seal uses skipped_on (a timestamp) to mark a skipped attempt, not a status field
  const nextAttempt = pending[0];
  const isNextSkipped = !!nextAttempt?.skipped_on;
  const nextDelivery = pending.find((a) => !a.skipped_on) ?? nextAttempt;

  const isActive = subscription.status === 'ACTIVE';
  const isPaused = subscription.status === 'PAUSED';
  const canManage = isActive || isPaused;

  return (
    <div className="block-card p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="font-semibold">Subscription #{subscription.id}</p>
        <StatusBadge status={subscription.status} />
      </div>

      {subscription.items?.length > 0 && (
        <ul className="mb-3 space-y-1">
          {subscription.items.map((item) => (
            <li key={item.id} className="text-sm text-muted-foreground">
              {item.title} × {item.quantity} —{' '}
              {formatPrice(item.price, subscription.currency)}
            </li>
          ))}
        </ul>
      )}

      <div className="text-sm text-muted-foreground space-y-1 mb-4">
        <p>Delivery every {subscription.delivery_interval}</p>

        {nextDelivery && (
          <p>
            Next order:{' '}
            <span className="text-foreground font-medium">
              {formatDate(nextDelivery.date)}
            </span>
          </p>
        )}

        {isNextSkipped && nextAttempt && (
          <p className="font-bold">
            {formatDate(nextAttempt.date)} skipped
          </p>
        )}

        {subscription.card_brand && (
          <p>
            {subscription.card_brand} ···· {subscription.card_last_digits}{' '}
            <span className="text-xs">(exp {subscription.card_expiry_month}/{subscription.card_expiry_year})</span>
          </p>
        )}
      </div>

      {canManage && (
        <div className="flex flex-wrap gap-2 pt-3 border-t-2 border-ink">
          {nextAttempt && isActive && (
            <Form method="POST">
              <input type="hidden" name="_action" value={isNextSkipped ? 'unskip' : 'skip'} />
              <input type="hidden" name="subscriptionId" value={subscription.id} />
              <input type="hidden" name="billingAttemptId" value={nextAttempt.id} />
              <button type="submit" disabled={isSubmitting}
                className="pill disabled:opacity-50">
                {isNextSkipped
                  ? `Unskip ${new Date(nextAttempt.date).toLocaleString('en-US', {month: 'long'})}`
                  : 'Skip next'}
              </button>
            </Form>
          )}

          <Form method="POST">
            <input type="hidden" name="_action" value={isActive ? 'pause' : 'resume'} />
            <input type="hidden" name="subscriptionId" value={subscription.id} />
            <button type="submit" disabled={isSubmitting}
              className="pill disabled:opacity-50">
              {isActive ? 'Pause' : 'Resume'}
            </button>
          </Form>

          <CancelButton
            subscriptionId={subscription.id}
            customerName={[subscription.first_name, subscription.last_name].filter(Boolean).join(' ')}
            customerEmail={subscription.email}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
    </div>
  );
}

const CANCEL_REASONS = [
  "It's too expensive",
  "I have too much coffee",
  "I didn't enjoy the coffee",
  "I want to try a different roaster",
  "I'm taking a break",
  "Other",
];

function CancelButton({subscriptionId, customerName, customerEmail, isSubmitting}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) setReason(''); }}>
      <Dialog.Trigger asChild>
        <button
          disabled={isSubmitting}
          className="pill text-destructive hover:bg-destructive hover:text-paper-2 disabled:opacity-50"
        >
          Cancel
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink/60 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-paper-2 border-2 border-ink shadow-block-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <Dialog.Title className="mb-2 text-2xl">
            Before you go…
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-5">
            We&apos;d love to know why you&apos;re cancelling so we can improve.
          </Dialog.Description>

          <Form method="POST" onSubmit={() => setOpen(false)}>
            <input type="hidden" name="_action" value="cancel" />
            <input type="hidden" name="subscriptionId" value={subscriptionId} />
            <input type="hidden" name="customerName" value={customerName} />
            <input type="hidden" name="customerEmail" value={customerEmail} />

            <div className="flex flex-col gap-2 mb-4">
              {CANCEL_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`text-left px-3.5 py-2.5 text-sm border transition-colors ${
                    reason === r
                      ? 'border-[var(--foreground)] bg-[var(--accent)] font-medium'
                      : 'border-[var(--border)] hover:bg-[var(--accent)]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <input type="hidden" name="reason" value={reason} />

            <textarea
              name="comment"
              placeholder="Anything else you'd like us to know? (optional)"
              rows={3}
              className="account-input w-full resize-none mb-4 text-sm"
            />

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={!reason || isSubmitting}
                className="w-full px-4 py-2.5 text-sm font-medium btn bg-destructive text-paper-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Cancelling…' : 'Confirm cancellation'}
              </button>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="btn-outline w-full"
                >
                  Keep my subscription
                </button>
              </Dialog.Close>
            </div>
          </Form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** @param {{status: string}} */
function StatusBadge({status}) {
  const cls = {
    ACTIVE: 'border-2 border-ink bg-pop-1 text-ink',
    PAUSED: 'border-2 border-ink bg-cta text-ink',
    CANCELLED: 'border-2 border-ink bg-destructive text-paper-2',
    EXPIRED: 'bg-[var(--muted)] text-muted-foreground',
  }[status] ?? 'bg-[var(--muted)] text-muted-foreground';

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium ${cls}`}>
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
