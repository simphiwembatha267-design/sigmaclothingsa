import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Currency {
  code: string;
  symbol: string;
  country: string;
  /** Multiplier applied to the ZAR base price. */
  rate: number;
  locale: string;
}

/** Indicative conversion rates from ZAR. Prices are charged in ZAR. */
export const CURRENCIES: Currency[] = [
  { code: 'ZAR', symbol: 'R', country: 'South Africa', rate: 1, locale: 'en-ZA' },
  { code: 'USD', symbol: '$', country: 'United States', rate: 0.055, locale: 'en-US' },
  { code: 'EUR', symbol: '€', country: 'Europe', rate: 0.05, locale: 'de-DE' },
  { code: 'GBP', symbol: '£', country: 'United Kingdom', rate: 0.043, locale: 'en-GB' },
  { code: 'AED', symbol: 'AED ', country: 'United Arab Emirates', rate: 0.2, locale: 'en-AE' },
  { code: 'AUD', symbol: 'A$', country: 'Australia', rate: 0.084, locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', country: 'Canada', rate: 0.076, locale: 'en-CA' },
  { code: 'NGN', symbol: '₦', country: 'Nigeria', rate: 82, locale: 'en-NG' },
  { code: 'KES', symbol: 'KSh ', country: 'Kenya', rate: 7.1, locale: 'en-KE' },
  { code: 'BWP', symbol: 'P', country: 'Botswana', rate: 0.74, locale: 'en-BW' },
  { code: 'NAD', symbol: 'N$', country: 'Namibia', rate: 1, locale: 'en-NA' },
];

export const DEFAULT_CURRENCY = CURRENCIES[0];

interface CurrencyState {
  code: string;
  setCurrency: (code: string) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      code: DEFAULT_CURRENCY.code,
      setCurrency: (code) => set({ code }),
    }),
    {
      name: 'sigma-currency',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.sessionStorage : (undefined as never),
      ),
    },
  ),
);

export function getCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? DEFAULT_CURRENCY;
}

/** Reactive currency for the current session. */
export function useCurrency(): Currency {
  return getCurrency(useCurrencyStore((s) => s.code));
}
