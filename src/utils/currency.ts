export interface CurrencyItem {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyItem[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', locale: 'en-US' },
  { code: 'USDT', symbol: '₮', name: 'Tether (USDT Crypto)', flag: '🪙', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', locale: 'en-GB' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪', locale: 'ar-AE' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', locale: 'en-AU' }
];

const CURRENCY_STORAGE_KEY = 'thestocetimes_user_currency_preference';
const DEFAULT_CURRENCY_CODE = 'USD';

export const getSelectedCurrency = (): CurrencyItem => {
  try {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved) {
      const match = SUPPORTED_CURRENCIES.find(c => c.code.toUpperCase() === saved.toUpperCase());
      if (match) return match;
    }
  } catch (e) {}

  // Fallback to INR for India, otherwise USD.
  try {
    const userLanguage = navigator.language || '';
    if (userLanguage.includes('IN') || userLanguage.includes('in')) {
      return SUPPORTED_CURRENCIES[0]; // INR
    }
  } catch (e) {}

  return SUPPORTED_CURRENCIES.find(c => c.code === DEFAULT_CURRENCY_CODE) || SUPPORTED_CURRENCIES[1];
};

export const setSelectedCurrency = (code: string): void => {
  try {
    const valid = SUPPORTED_CURRENCIES.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (valid) {
      localStorage.setItem(CURRENCY_STORAGE_KEY, valid.code);
      window.dispatchEvent(new CustomEvent('currency_change', { detail: valid }));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (e) {
    console.warn('Failed to save currency preference:', e);
  }
};

export const getUserCurrencyPreference = () => {
  const current = getSelectedCurrency();
  return {
    locale: current.locale,
    currency: current.code,
    symbol: current.symbol
  };
};

export const formatCurrency = (
  value: number,
  currencyCode?: string,
  options: Intl.NumberFormatOptions = {}
): string => {
  const selected = currencyCode 
    ? (SUPPORTED_CURRENCIES.find(c => c.code.toUpperCase() === currencyCode.toUpperCase()) || getSelectedCurrency())
    : getSelectedCurrency();

  const num = Number.isFinite(value) ? value : 0;

  // Custom formatting for USDT crypto token
  if (selected.code === 'USDT') {
    return `₮ ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, ...options }).format(num)}`;
  }

  try {
    return new Intl.NumberFormat(selected.locale, {
      style: 'currency',
      currency: selected.code,
      maximumFractionDigits: 0,
      ...options
    }).format(num);
  } catch (e) {
    return `${selected.symbol} ${num.toLocaleString()}`;
  }
};

export const getCurrencySymbol = (currencyCode?: string): string => {
  if (currencyCode) {
    const found = SUPPORTED_CURRENCIES.find(c => c.code.toUpperCase() === currencyCode.toUpperCase());
    if (found) return found.symbol;
  }
  return getSelectedCurrency().symbol;
};

export const getCurrencyLabel = (currencyCode?: string): string => {
  if (currencyCode) {
    const found = SUPPORTED_CURRENCIES.find(c => c.code.toUpperCase() === currencyCode.toUpperCase());
    if (found) return found.code;
  }
  return getSelectedCurrency().code;
};
