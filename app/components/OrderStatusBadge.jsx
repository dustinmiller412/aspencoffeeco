const LABELS = {
  financial: {
    PAID: 'Paid',
    PENDING: 'Payment pending',
    REFUNDED: 'Refunded',
    PARTIALLY_REFUNDED: 'Partly refunded',
    VOIDED: 'Voided',
  },
  fulfillment: {
    SUCCESS: 'Shipped',
    OPEN: 'Processing',
    PENDING: 'Processing',
    IN_PROGRESS: 'In transit',
    FAILURE: 'Delivery issue',
    ERROR: 'Delivery issue',
    CANCELLED: 'Cancelled',
  },
};

const TONES = {
  PAID: 'bg-pop-1',
  SUCCESS: 'bg-pop-1',
  PENDING: 'bg-cta',
  OPEN: 'bg-cta',
  IN_PROGRESS: 'bg-pop-2',
  REFUNDED: 'bg-pop-2',
  PARTIALLY_REFUNDED: 'bg-pop-2',
  FAILURE: 'bg-destructive text-paper-2',
  ERROR: 'bg-destructive text-paper-2',
};

/**
 * Human-readable pill for Shopify order statuses (e.g. SUCCESS → "Shipped").
 * @param {{status?: string | null; kind: 'financial' | 'fulfillment'}}
 */
export function OrderStatusBadge({status, kind}) {
  if (!status) return null;
  return (
    <span
      className={`eyebrow inline-block border-2 border-ink px-2 py-0.5 text-[0.6rem] text-ink ${
        TONES[status] ?? 'bg-paper'
      }`}
    >
      {LABELS[kind][status] ?? status.replace(/_/g, ' ').toLowerCase()}
    </span>
  );
}
