import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  Link,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Profile'}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

/**
 * @param {Route.ActionArgs}
 */
export async function action({request, context}) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer = {};
    const validInputKeys = ['firstName', 'lastName'];
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key] = value;
      }
    }

    // update customer and possibly password
    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      customer: data?.customerUpdate?.customer,
    };
  } catch (error) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext();
  const {state} = useNavigation();
  /** @type {ActionReturnData} */
  const action = useActionData();
  const customer = action?.customer ?? account?.customer;
  const isSaving = state !== 'idle';

  const email = account?.customer?.emailAddress?.emailAddress;
  const defaultAddress = account?.customer?.defaultAddress;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr]">
      <section className="block-card p-6 md:p-8">
        <h2 className="mb-6 text-3xl">Personal information</h2>
        <Form method="PUT" style={{maxWidth: '100%'}}>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="firstName" className="account-label">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                aria-label="First name"
                defaultValue={customer.firstName ?? ''}
                minLength={2}
                className="account-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lastName" className="account-label">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Last name"
                aria-label="Last name"
                defaultValue={customer.lastName ?? ''}
                minLength={2}
                className="account-input"
              />
            </div>
          </div>

          {action?.error && (
            <p className="mb-4 text-sm font-semibold text-destructive">{action.error}</p>
          )}
          {action?.customer && !action?.error && (
            <p className="mb-4 border-2 border-ink bg-pop-1 px-3 py-2 text-sm font-bold">
              Profile updated.
            </p>
          )}

          <button type="submit" disabled={isSaving} className="btn-ink">
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
        </Form>
      </section>

      <section className="block-card overflow-hidden">
        <div className="border-b-2 border-ink bg-pop-1 px-6 py-4">
          <p className="eyebrow m-0">Account details</p>
        </div>
        <dl className="m-0 divide-y-2 divide-ink">
          <div className="px-6 py-5">
            <dt className="account-label mb-1">Sign-in email</dt>
            <dd className="m-0 break-all font-semibold">{email || '—'}</dd>
            <dd className="m-0 mt-1 text-xs opacity-70">
              This is the email you sign in with.
            </dd>
          </div>
          <div className="px-6 py-5">
            <dt className="account-label mb-1">Default shipping address</dt>
            <dd className="m-0 text-sm leading-relaxed">
              {defaultAddress?.formatted?.length
                ? defaultAddress.formatted.join(', ')
                : 'No default address yet.'}
            </dd>
            <dd className="m-0 mt-3">
              <Link to="/account/addresses" className="eyebrow underline decoration-cta decoration-[3px] underline-offset-4">
                Manage addresses →
              </Link>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

/**
 * @typedef {{
 *   error: string | null;
 *   customer: CustomerFragment | null;
 * }} ActionResponse
 */

/** @typedef {import('customer-accountapi.generated').CustomerFragment} CustomerFragment */
/** @typedef {import('@shopify/hydrogen/customer-account-api-types').CustomerUpdateInput} CustomerUpdateInput */
/** @typedef {import('./+types/account.profile').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
