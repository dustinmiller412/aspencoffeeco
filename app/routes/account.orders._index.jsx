import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import {useRef} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Orders'}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  /** @type {LoaderReturnData} */
  const {customer, filters} = useLoaderData();
  const {orders} = customer;

  return (
    <div>
      <OrderSearchForm currentFilters={filters} />
      <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}

/**
 * @param {{
 *   orders: CustomerOrdersFragment['orders'];
 *   filters: OrderFilterParams;
 * }}
 */
function OrdersTable({orders, filters}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div aria-live="polite">
      {orders?.nodes.length ? (
        <PaginatedResourceSection connection={orders}>
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

/**
 * @param {{hasFilters?: boolean}}
 */
function EmptyOrders({hasFilters = false}) {
  return (
    <div className="py-16 text-center text-[var(--muted-foreground)]">
      {hasFilters ? (
        <>
          <p className="mb-4">No orders found matching your search.</p>
          <Link
            to="/account/orders"
            className="text-sm underline underline-offset-4 hover:text-[var(--foreground)]"
          >
            Clear filters →
          </Link>
        </>
      ) : (
        <>
          <p className="mb-4">You haven&apos;t placed any orders yet.</p>
          <Link
            to="/collections"
            className="text-sm underline underline-offset-4 hover:text-[var(--foreground)]"
          >
            Start Shopping →
          </Link>
        </>
      )}
    </div>
  );
}

/**
 * @param {{
 *   currentFilters: OrderFilterParams;
 * }}
 */
function OrderSearchForm({currentFilters}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mb-6 max-w-none"
      aria-label="Search orders"
      style={{maxWidth: '100%'}}
    >
      <div className="flex flex-wrap gap-3 items-end">
        <input
          type="search"
          name={ORDER_FILTER_FIELDS.NAME}
          placeholder="Order #"
          aria-label="Order number"
          defaultValue={currentFilters.name || ''}
          className="order-search-input flex-1 min-w-[140px]"
        />
        <input
          type="search"
          name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
          placeholder="Confirmation #"
          aria-label="Confirmation number"
          defaultValue={currentFilters.confirmationNumber || ''}
          className="order-search-input flex-1 min-w-[160px]"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="px-4 py-2 text-sm font-medium bg-[var(--foreground)] text-[var(--background)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSearching ? 'Searching…' : 'Search'}
        </button>
        {hasFilters && (
          <button
            type="button"
            disabled={isSearching}
            onClick={() => {
              setSearchParams(new URLSearchParams());
              formRef.current?.reset();
            }}
            className="px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-md hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}

/**
 * @param {{order: OrderItemFragment}}
 */
const FINANCIAL_STATUS_STYLES = {
  PAID: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  PENDING: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  REFUNDED: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  PARTIALLY_REFUNDED: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  VOIDED: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
};

const FULFILLMENT_STATUS_STYLES = {
  SUCCESS: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  FAILURE: 'bg-red-500/15 text-red-600 dark:text-red-400',
  PENDING: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
};

function StatusBadge({label, styleMap}) {
  const cls =
    styleMap[label] ?? 'bg-[var(--muted)] text-[var(--muted-foreground)]';
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

function OrderItem({order}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  const orderUrl = `/account/orders/${btoa(order.id)}`;

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-[var(--border)] last:border-0">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={orderUrl}
            className="font-semibold hover:underline underline-offset-2"
          >
            Order #{order.number}
          </Link>
          {order.financialStatus && (
            <StatusBadge
              label={order.financialStatus}
              styleMap={FINANCIAL_STATUS_STYLES}
            />
          )}
          {fulfillmentStatus && (
            <StatusBadge
              label={fulfillmentStatus}
              styleMap={FULFILLMENT_STATUS_STYLES}
            />
          )}
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          {new Date(order.processedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          {order.confirmationNumber && (
            <span> · #{order.confirmationNumber}</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <Money
          data={order.totalPrice}
          className="font-medium tabular-nums"
        />
        <Link
          to={orderUrl}
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors whitespace-nowrap"
        >
          View →
        </Link>
      </div>
    </div>
  );
}

/**
 * @typedef {{
 *   customer: CustomerOrdersFragment;
 *   filters: OrderFilterParams;
 * }} OrdersLoaderData
 */

/** @typedef {import('./+types/account.orders._index').Route} Route */
/** @typedef {import('~/lib/orderFilters').OrderFilterParams} OrderFilterParams */
/** @typedef {import('customer-accountapi.generated').CustomerOrdersFragment} CustomerOrdersFragment */
/** @typedef {import('customer-accountapi.generated').OrderItemFragment} OrderItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
