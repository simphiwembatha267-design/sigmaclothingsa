const zar = new Intl.NumberFormat('en-ZA', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Formats a ZAR amount, e.g. 1200 -> "R1 200" */
export function formatPrice(amount: number) {
  return `R${zar.format(amount)}`;
}
