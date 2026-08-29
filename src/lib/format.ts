import { Currency, DEFAULT_CURRENCY, useCurrency } from './currency';

/**
 * Formats a ZAR base amount in the given currency.
 * Defaults to ZAR, e.g. 1200 -> "R1 200".
 */
export function formatPrice(amount: number, currency: Currency = DEFAULT_CURRENCY) {
  const converted = amount * currency.rate;
  const fractionDigits = converted < 100 && currency.rate !== 1 ? 2 : 0;
  const formatted = new Intl.NumberFormat(currency.locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(converted);
  return `${currency.symbol}${formatted}`;
}

/** Reactive price formatter that follows the selected currency. */
export function useFormatPrice() {
  const currency = useCurrency();
  return (amount: number) => formatPrice(amount, currency);
}
