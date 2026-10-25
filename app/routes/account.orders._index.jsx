import {seoMeta} from '~/lib/meta';
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
import {EmptyState} from '~/components/EmptyState';
import {Logo} from '~/components/Header';
import {OrderStatusBadge} from '~/components/OrderStatusBadge';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({matches}) => seoMeta({title: 'Orders', matches});

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
    <EmptyState
      title={hasFilters ? 'No matching orders' : 'No orders yet'}
      body={
        hasFilters
          ? 'Nothing matches that order or confirmation number.'
          : 'Once you place an order it will show up here, with tracking as soon as it ships.'
      }
      cta={hasFilters ? {to: '/account/orders', label: 'Clear search'} : {to: '/collections/coffee', label: 'Shop coffee'}}
    />
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
          className="btn-ink px-4 py-2"
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
            className="btn-outline px-4 py-2"
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
function OrderItem({order}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  const orderUrl = `/account/orders/${btoa(order.id)}`;
  const lineItems = order.lineItems?.nodes ?? [];
  const shown = lineItems.slice(0, 3);
  const extra = lineItems.length - shown.length;

  return (
    <Link
      to={orderUrl}
      className="block-card group mb-5 flex flex-col gap-5 p-4 text-ink no-underline transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:no-underline hover:shadow-block-lg sm:flex-row sm:items-center"
    >
      <div className="flex shrink-0 items-center">
        {shown.map((item, i) => (
          <div
            key={item.id}
            className={`h-16 w-16 overflow-hidden border-2 border-ink bg-paper ${i > 0 ? '-ml-4' : ''}`}
            style={{zIndex: shown.length - i}}
          >
            {item.image?.url ? (
              <img
                src={item.image.url}
                alt={item.image.altText || item.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <Logo variant="mark" label="" className="m-auto mt-3 h-8 opacity-25" />
            )}
          </div>
        ))}
        {extra > 0 ? (
          <span className="-ml-4 flex h-16 w-16 items-center justify-center border-2 border-ink bg-pop-2 font-display text-sm">
            +{extra}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="m-0 font-display text-xl uppercase leading-none">Order #{order.number}</p>
        <p className="mt-2 text-sm">
          {new Date(order.processedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          {shown[0] ? (
            <span>
              {' · '}
              {shown[0].title}
              {lineItems.length > 1 ? ` + ${lineItems.length - 1} more` : ''}
            </span>
          ) : null}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {order.financialStatus && (
            <OrderStatusBadge status={order.financialStatus} kind="financial" />
          )}
          {fulfillmentStatus && (
            <OrderStatusBadge status={fulfillmentStatus} kind="fulfillment" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">
        <Money data={order.totalPrice} className="font-display text-2xl tabular-nums" />
        <span className="eyebrow inline-flex items-center gap-1">
          View order
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
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
