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
    <div>
      <header className="border-b-2 border-ink bg-pop-1 px-6 pb-0 pt-14 md:pt-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-4">Your account</p>
              <h1 className="m-0 text-5xl md:text-6xl">{heading}</h1>
            </div>
            <Logout />
          </div>
          <AccountMenu />
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Outlet context={{customer}} />
      </div>
    </div>
  );
}

function AccountMenu() {
  return (
    <nav
      role="navigation"
      className="-mb-0.5 flex gap-2 overflow-x-auto"
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
            `whitespace-nowrap border-2 px-4 py-2.5 font-display text-xs uppercase transition-colors ${
              isActive
                ? 'border-ink border-b-paper bg-paper text-ink'
                : 'border-transparent text-ink hover:border-ink hover:bg-paper-2'
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
        className="btn-outline px-4 py-2 text-xs"
      >
        Sign out
      </button>
    </Form>
  );
}

/** @typedef {import('./+types/account').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
