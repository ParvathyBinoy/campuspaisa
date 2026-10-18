import { CurrencyConfig } from '../types';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', locale: 'en-GB' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)', locale: 'en-AU' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (SGD)', locale: 'en-SG' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)', locale: 'ar-AE' },
];

export const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES[0];

/**
 * Formats a number into a currency string with proper locale and symbol.
 * Example for INR: 125000 -> ₹1,25,000
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyConfig = DEFAULT_CURRENCY,
  showDecimals: boolean = false
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${currency.symbol}0`;
  }

  try {
    const isInteger = Number.isInteger(amount);
    const fractionDigits = showDecimals ? 2 : isInteger ? 0 : 2;

    const formatted = new Intl.NumberFormat(currency.locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(Math.abs(amount));

    const sign = amount < 0 ? '-' : '';
    return `${sign}${currency.symbol}${formatted}`;
  } catch (err) {
    // Fallback if locale is not supported
    const val = showDecimals ? amount.toFixed(2) : Math.round(amount).toString();
    return `${currency.symbol}${val}`;
  }
}

/**
 * Cleanly format raw numbers with Indian or locale separators without currency symbol
 */
export function formatNumber(
  amount: number,
  locale: string = 'en-IN',
  decimals: number = 0
): string {
  if (isNaN(amount)) return '0';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}
