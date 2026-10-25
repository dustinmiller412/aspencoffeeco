import {CartForm, Money} from '@shopify/hydrogen';
import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher} from 'react-router';

export const FREE_SHIPPING_THRESHOLD = 40;

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';
  const isAside = layout === 'aside';
  const summaryId = useId();
  const discountsHeadingId = useId();
  const discountCodeInputId = useId();
  const giftCardHeadingId = useId();
  const giftCardInputId = useId();
  const subscriptionLineCount =
    cart?.lines?.nodes?.filter((line) => line?.sellingPlanAllocation?.sellingPlan)
      ?.length || 0;

  return (
    <div
      aria-labelledby={summaryId}
      className={`${className} ${
        isAside
          ? 'mt-4 border-t-2 border-ink bg-paper pt-4'
          : 'block-card mt-8 p-6'
      }`}
    >
      <FreeShippingProgress subtotal={cart?.cost?.subtotalAmount} />
      <h4 id={summaryId} className="eyebrow m-0">
        Order summary
      </h4>
      <dl role="group" className="mt-2 flex items-center justify-between font-display text-xl uppercase">
        <dt>Subtotal</dt>
        <dd className="m-0">
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart?.cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </dd>
      </dl>
      <div className="mt-2.5 space-y-2.5">
        <CartDiscounts
          discountCodes={cart?.discountCodes}
          discountsHeadingId={discountsHeadingId}
          discountCodeInputId={discountCodeInputId}
        />
        <CartGiftCard
          giftCardCodes={cart?.appliedGiftCards}
          giftCardHeadingId={giftCardHeadingId}
          giftCardInputId={giftCardInputId}
        />
      </div>
      {subscriptionLineCount > 0 ? (
        <p className="mt-3 text-sm font-semibold">
          Includes {subscriptionLineCount} subscription item
          {subscriptionLineCount > 1 ? 's' : ''}
        </p>
      ) : null}
      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} layout={layout} />
    </div>
  );
}

/** @param {{subtotal: {amount: string; currencyCode: string} | undefined}} */
function FreeShippingProgress({subtotal}) {
  const amount = parseFloat(subtotal?.amount || '0');
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - amount);
  const progress = Math.min(100, (amount / FREE_SHIPPING_THRESHOLD) * 100);
  const qualified = remaining === 0;

  return (
    <div className="mb-4 border-2 border-ink bg-pop-2 px-3 py-2.5">
      <p className="text-sm font-semibold">
        {qualified ? (
          <span className="font-bold uppercase tracking-wide">
            You&apos;ve unlocked free shipping!
          </span>
        ) : (
          <>
            Add{' '}
            <span className="font-medium">
              ${remaining.toFixed(2)}
            </span>{' '}
            more for free shipping
          </>
        )}
      </p>
      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress to free shipping"
        className="mt-2 h-3 w-full overflow-hidden border-2 border-ink bg-paper-2"
      >
        <div
          className={`h-full transition-all duration-500 ${
            qualified ? 'bg-pop-1' : 'bg-cta'
          }`}
          style={{width: `${progress}%`}}
        />
      </div>
    </div>
  );
}

/**
 * @param {{checkoutUrl?: string; layout: CartSummaryProps['layout']}}
 */
function CartCheckoutActions({checkoutUrl, layout}) {
  if (!checkoutUrl) return null;

  return (
    <div className="mt-5 space-y-3">
      <a
        href={checkoutUrl}
        target="_self"
        className="btn-cta w-full"
      >
        Continue to checkout
      </a>
      {layout === 'aside' ? (
        <a
          href="/cart"
          className="btn-outline w-full"
        >
          View bag
        </a>
      ) : null}
      <p className="pt-2 text-sm leading-relaxed">
        Shipping and taxes are calculated at checkout.
      </p>
    </div>
  );
}

/**
 * @param {{
 *   discountCodes?: CartApiQueryFragment['discountCodes'];
 *   discountsHeadingId: string;
 *   discountCodeInputId: string;
 * }}
 */
function CartDiscounts({
  discountCodes,
  discountsHeadingId,
  discountCodeInputId,
}) {
  const codes =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div>
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt id={discountsHeadingId}>Discounts</dt>
          <UpdateDiscountForm>
            <div
              className="cart-discount"
              role="group"
              aria-labelledby={discountsHeadingId}
            >
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button type="submit" aria-label="Remove discount">
                Remove
              </button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="mt-1.5 flex items-center">
          <label htmlFor={discountCodeInputId} className="sr-only">
            Discount code
          </label>
          <input
            id={discountCodeInputId}
            type="text"
            name="discountCode"
            placeholder="Discount code"
            className="m-0 h-10 min-w-0 flex-1 border-2 border-ink bg-paper-2 px-3 text-sm"
          />
          <button
            type="submit"
            aria-label="Apply discount code"
            className="inline-flex h-10 items-center border-2 border-ink bg-ink px-3 font-display text-xs uppercase text-paper-2 transition-colors hover:bg-pop-1 hover:text-ink"
          >
            Apply
          </button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

/**
 * @param {{
 *   discountCodes?: string[];
 *   children: React.ReactNode;
 * }}
 */
function UpdateDiscountForm({discountCodes, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

/**
 * @param {{
 *   giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
 *   giftCardHeadingId: string;
 *   giftCardInputId: string;
 * }}
 */
function CartGiftCard({giftCardCodes, giftCardHeadingId, giftCardInputId}) {
  const giftCardCodeInput = useRef(null);
  const removeButtonRefs = useRef(new Map());
  const previousCardIdsRef = useRef([]);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const [removedCardIndex, setRemovedCardIndex] = useState(null);

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      if (giftCardCodeInput.current !== null) {
        giftCardCodeInput.current.value = '';
      }
    }
  }, [giftCardAddFetcher.data]);

  useEffect(() => {
    const currentCardIds = giftCardCodes?.map((card) => card.id) || [];

    if (removedCardIndex !== null && giftCardCodes) {
      const focusTargetIndex = Math.min(
        removedCardIndex,
        giftCardCodes.length - 1,
      );
      const focusTargetCard = giftCardCodes[focusTargetIndex];
      const focusButton = focusTargetCard
        ? removeButtonRefs.current.get(focusTargetCard.id)
        : null;

      if (focusButton) {
        focusButton.focus();
      } else if (giftCardCodeInput.current) {
        giftCardCodeInput.current.focus();
      }

      setRemovedCardIndex(null);
    }

    previousCardIdsRef.current = currentCardIds;
  }, [giftCardCodes, removedCardIndex]);

  const handleRemoveClick = (cardId) => {
    const index = previousCardIdsRef.current.indexOf(cardId);
    if (index !== -1) {
      setRemovedCardIndex(index);
    }
  };

  return (
    <div>
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl className="m-0">
          <dt id={giftCardHeadingId}>Applied Gift Card(s)</dt>
          {giftCardCodes.map((giftCard) => (
            <dd key={giftCard.id} className="cart-discount">
              <RemoveGiftCardForm
                giftCardId={giftCard.id}
                lastCharacters={giftCard.lastCharacters}
                onRemoveClick={() => handleRemoveClick(giftCard.id)}
                buttonRef={(el) => {
                  if (el) {
                    removeButtonRefs.current.set(giftCard.id, el);
                  } else {
                    removeButtonRefs.current.delete(giftCard.id);
                  }
                }}
              >
                <code>***{giftCard.lastCharacters}</code>
                &nbsp;
                <Money data={giftCard.amountUsed} />
              </RemoveGiftCardForm>
            </dd>
          ))}
        </dl>
      )}

      <AddGiftCardForm fetcherKey="gift-card-add">
        <div className="mt-1.5 flex items-center">
          <label htmlFor={giftCardInputId} className="sr-only">
            Gift card code
          </label>
          <input
            id={giftCardInputId}
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
            className="m-0 h-10 min-w-0 flex-1 border-2 border-ink bg-paper-2 px-3 text-sm"
          />
          <button
            type="submit"
            disabled={giftCardAddFetcher.state !== 'idle'}
            aria-label="Apply gift card code"
            className="inline-flex h-10 items-center border-2 border-ink bg-ink px-3 font-display text-xs uppercase text-paper-2 transition-colors hover:bg-pop-1 hover:text-ink disabled:opacity-60"
          >
            Apply
          </button>
        </div>
      </AddGiftCardForm>
    </div>
  );
}

/**
 * @param {{
 *   fetcherKey?: string;
 *   children: React.ReactNode;
 * }}
 */
function AddGiftCardForm({fetcherKey, children}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {children}
    </CartForm>
  );
}

/**
 * @param {{
 *   giftCardId: string;
 *   lastCharacters: string;
 *   children: React.ReactNode;
 *   onRemoveClick?: () => void;
 *   buttonRef?: (el: HTMLButtonElement | null) => void;
 * }}
 */
function RemoveGiftCardForm({
  giftCardId,
  lastCharacters,
  children,
  onRemoveClick,
  buttonRef,
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
      &nbsp;
      <button
        type="submit"
        aria-label={`Remove gift card ending in ${lastCharacters}`}
        onClick={onRemoveClick}
        ref={buttonRef}
      >
        Remove
      </button>
    </CartForm>
  );
}

/**
 * @typedef {{
 *   cart: OptimisticCart<CartApiQueryFragment | null>;
 *   layout: CartLayout;
 * }} CartSummaryProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
