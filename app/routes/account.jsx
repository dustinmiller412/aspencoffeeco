import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  /** @type {LoaderReturnData} */
  const {customer} = useLoaderData();

  const heading = customer
    ? customer.firstName
      ? `Welcome back, ${customer.firstName}`
      : `My Account`
    : 'My Account';

  return (
    <div className="max-w-4xl mx-auto px-4 pb-10 pt-48">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight m-0">{heading}</h1>
        <Logout />
      </div>
      <AccountMenu />
      <div className="mt-8">
        <Outlet context={{customer}} />
      </div>
    </div>
  );
}

function AccountMenu() {
  return (
    <nav
      role="navigation"
      className="flex gap-1 border-b border-[var(--border)] overflow-x-auto"
    >
      {[
        {to: '/account/orders', label: 'Orders'},
        {to: '/account/subscriptions', label: 'Subscriptions'},
        {to: '/account/profile', label: 'Profile'},
        {to: '/account/addresses', label: 'Addresses'},
      ].map(({to, label}) => (
        <NavLink
          key={to}
          to={to}
          className={({isActive}) =>
            `px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              isActive
                ? 'border-[var(--foreground)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function Logout() {
  return (
    <Form method="POST" action="/account/logout">
      <button
        type="submit"
        className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        Sign out
      </button>
    </Form>
  );
}

/** @typedef {import('./+types/account').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
