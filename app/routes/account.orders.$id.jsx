import {redirect, useLoaderData} from 'react-router';
import {seoMeta} from '~/lib/meta';
import {OrderStatusBadge} from '~/components/OrderStatusBadge';
import {Money, Image} from '@shopify/hydrogen';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data, matches}) =>
  seoMeta({title: `Order ${data?.order?.name ?? ''}`.trim(), matches});

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params, context}) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors} = await customerAccount.query(CUSTOMER_ORDER_QUERY, {
    variables: {
      orderId,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  // No fulfillment yet means the order hasn't shipped; show it as processing.
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? 'OPEN';

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' ? firstDiscount : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? firstDiscount.percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  /** @type {LoaderReturnData} */
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData();
  return (
    <div className="block-card p-6 md:p-8 [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_td]:border-2 [&_td]:border-ink [&_td]:p-3 [&_th]:border-2 [&_th]:border-ink [&_th]:bg-pop-1 [&_th]:p-3 [&_th]:text-left [&_th]:text-xs [&_th]:uppercase">
      <h2 className="mb-3 text-4xl">Order {order.name}</h2>
      <p>Placed on {new Date(order.processedAt).toDateString()}</p>
      {order.confirmationNumber && (
        <p>Confirmation: {order.confirmationNumber}</p>
      )}
      <br />
      <div>
        <table>
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Price</th>
              <th scope="col">Quantity</th>
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((lineItem, lineItemIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
            ))}
          </tbody>
          <tfoot>
            {((discountValue && discountValue.amount) ||
              discountPercentage) && (
              <tr>
                <th scope="row" colSpan={3} className="!text-right">Discounts</th>
                <td>
                  {discountPercentage ? (
                    <span>-{discountPercentage}% OFF</span>
                  ) : (
                    discountValue && <Money data={discountValue} />
                  )}
                </td>
              </tr>
            )}
            <tr>
              <th scope="row" colSpan={3} className="!text-right">Subtotal</th>
              <td>
                <Money data={order.subtotal} />
              </td>
            </tr>
            <tr>
              <th scope="row" colSpan={3} className="!text-right">Shipping</th>
              <td>
                <Money data={order.totalShipping} />
              </td>
            </tr>
            <tr>
              <th scope="row" colSpan={3} className="!text-right">Tax</th>
              <td>
                <Money data={order.totalTax} />
              </td>
            </tr>
            <tr>
              <th scope="row" colSpan={3} className="!text-right">Total</th>
              <td className="font-display text-lg">
                <Money data={order.totalPrice} />
              </td>
            </tr>
          </tfoot>
        </table>
        <div>
          <h3>Shipping Address</h3>
          {order?.shippingAddress ? (
            <address className="not-italic leading-relaxed">
              {(order.shippingAddress.formatted ?? [order.shippingAddress.name]).map(
                (line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ),
              )}
            </address>
          ) : (
            <p>No shipping address defined</p>
          )}
          <h3>Status</h3>
          <OrderStatusBadge status={fulfillmentStatus} kind="fulfillment" />
        </div>
      </div>
      <br />
      <p>
        <a target="_blank" href={order.statusPageUrl} rel="noreferrer">
          View Order Status →
        </a>
      </p>
    </div>
  );
}

/**
 * @param {{lineItem: OrderLineItemFullFragment}}
 */
function OrderLineRow({lineItem}) {
  return (
    <tr key={lineItem.id}>
      <td>
        <div>
          {lineItem?.image && (
            <div>
              <Image data={lineItem.image} width={96} height={96} className="h-24 w-24 object-cover" />
            </div>
          )}
          <div>
            <p>{lineItem.title}</p>
            <small>{lineItem.variantTitle}</small>
          </div>
        </div>
      </td>
      <td>
        <Money data={lineItem.price} />
      </td>
      <td>{lineItem.quantity}</td>
      <td>
        <Money data={lineItem.totalPrice} />
      </td>
    </tr>
  );
}

/** @typedef {import('./+types/account.orders.$id').Route} Route */
/** @typedef {import('customer-accountapi.generated').OrderLineItemFullFragment} OrderLineItemFullFragment */
/** @typedef {import('customer-accountapi.generated').OrderQuery} OrderQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
