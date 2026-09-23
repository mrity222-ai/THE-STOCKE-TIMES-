import { useEffect, useState } from 'react';

export const useCurrencyPreference = (): number => {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handleCurrencyChange = () => setVersion(prev => prev + 1);

    window.addEventListener('currency_change', handleCurrencyChange);
    window.addEventListener('storage', handleCurrencyChange);

    return () => {
      window.removeEventListener('currency_change', handleCurrencyChange);
      window.removeEventListener('storage', handleCurrencyChange);
    };
  }, []);

  return version;
};
