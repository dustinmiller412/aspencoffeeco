export function formatProductPrice(amount) {
  if (amount == null || amount === '') return '';

  const rawAmount = String(amount).trim();
  const numericAmount = Number(rawAmount);

  if (!Number.isFinite(numericAmount)) {
    return rawAmount;
  }

  const fractionalPart = rawAmount.split('.')[1] || '';
  const hasMeaningfulDecimals = /[1-9]/.test(fractionalPart);

  return hasMeaningfulDecimals
    ? numericAmount.toFixed(2)
    : numericAmount.toFixed(0);
}
