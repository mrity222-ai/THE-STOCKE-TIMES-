import React, { useState, useEffect } from 'react';
import { 
  SUPPORTED_CURRENCIES, 
  getSelectedCurrency, 
  setSelectedCurrency, 
  CurrencyItem 
} from '../../utils/currency';
import { Coins, ChevronDown } from 'lucide-react';

interface CurrencySelectorProps {
  className?: string;
  variant?: 'compact' | 'full' | 'pill';
  showLabel?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ 
  className = '', 
  variant = 'pill',
  showLabel = true 
}) => {
  const [current, setCurrent] = useState<CurrencyItem>(() => getSelectedCurrency());

  useEffect(() => {
    const handleCurrencyChange = (e: any) => {
      if (e.detail) {
        setCurrent(e.detail);
      } else {
        setCurrent(getSelectedCurrency());
      }
    };

    window.addEventListener('currency_change', handleCurrencyChange);
    window.addEventListener('storage', handleCurrencyChange);

    return () => {
      window.removeEventListener('currency_change', handleCurrencyChange);
      window.removeEventListener('storage', handleCurrencyChange);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setSelectedCurrency(newCode);
  };

  if (variant === 'compact') {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <select
          value={current.code}
          onChange={handleChange}
          aria-label="Select Currency"
          className="appearance-none bg-slate-900/90 hover:bg-slate-800 text-white text-[10px] sm:text-xs font-bold py-1 sm:py-1.5 pl-2 sm:pl-3 pr-6 sm:pr-7 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm transition-all max-w-[92px] sm:max-w-none"
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code} className="bg-slate-900 text-white font-medium">
              {c.flag} {c.code} ({c.symbol})
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 bg-slate-900/90 text-white border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${className}`}>
      {showLabel && (
        <span className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
          <Coins className="w-3.5 h-3.5 text-emerald-400" />
          <span>Currency:</span>
        </span>
      )}
      <div className="relative inline-flex items-center">
        <select
          value={current.code}
          onChange={handleChange}
          aria-label="Select Currency"
          className="appearance-none bg-slate-800 hover:bg-slate-700/90 text-white text-xs font-extrabold py-1 pl-2.5 pr-6 rounded-lg border border-slate-600 focus:outline-none focus:border-emerald-400 cursor-pointer transition-all"
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code} className="bg-slate-900 text-white font-medium">
              {c.flag} {c.code} ({c.symbol}) - {c.name}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
      </div>
    </div>
  );
};
