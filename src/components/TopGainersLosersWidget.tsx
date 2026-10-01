import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Coins, ArrowUpRight, ArrowDownRight, RefreshCw, Zap } from 'lucide-react';

export interface MarketMover {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: number;
  volume: string;
  market: 'IN' | 'US' | 'CRYPTO';
  isGain: boolean;
}

const TOP_GAINERS: MarketMover[] = [
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: '₹984.50', change: '+₹38.20', changePercent: 4.04, volume: '14.2M', market: 'IN', isGain: true },
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: '₹3,025.10', change: '+₹72.40', changePercent: 2.45, volume: '8.7M', market: 'IN', isGain: true },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: '₹1,682.00', change: '+₹31.50', changePercent: 1.91, volume: '18.4M', market: 'IN', isGain: true },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', price: '₹7,210.00', change: '+₹185.00', changePercent: 2.63, volume: '3.1M', market: 'IN', isGain: true },
  { symbol: 'NVDA', name: 'Nvidia Corp', price: '$128.50', change: '+$4.80', changePercent: 3.88, volume: '45.2M', market: 'US', isGain: true }
];

const TOP_LOSERS: MarketMover[] = [
  { symbol: 'WIPRO', name: 'Wipro Limited', price: '₹518.20', change: '-₹14.30', changePercent: -2.69, volume: '7.8M', market: 'IN', isGain: false },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd', price: '₹1,440.00', change: '-₹29.10', changePercent: -1.98, volume: '4.2M', market: 'IN', isGain: false },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', price: '₹5,310.00', change: '-₹88.00', changePercent: -1.63, volume: '1.9M', market: 'IN', isGain: false },
  { symbol: 'ADANIENT', name: 'Adani Enterprises', price: '₹3,080.00', change: '-₹42.50', changePercent: -1.36, volume: '5.1M', market: 'IN', isGain: false },
  { symbol: 'TSLA', name: 'Tesla Inc', price: '$210.40', change: '-$6.20', changePercent: -2.86, volume: '32.1M', market: 'US', isGain: false }
];

const CRYPTO_MOVERS: MarketMover[] = [
  { symbol: 'BTC/USD', name: 'Bitcoin', price: '$64,250.00', change: '+$1,850.00', changePercent: 2.96, volume: '$28.4B', market: 'CRYPTO', isGain: true },
  { symbol: 'ETH/USD', name: 'Ethereum', price: '$3,480.00', change: '+$112.00', changePercent: 3.32, volume: '$14.1B', market: 'CRYPTO', isGain: true },
  { symbol: 'GOLD/INR', name: 'Gold 24K (10g)', price: '₹74,850', change: '+₹420', changePercent: 0.56, volume: 'MCX', market: 'IN', isGain: true },
  { symbol: 'SILVER/INR', name: 'Silver (1kg)', price: '₹88,400', change: '-₹350', changePercent: -0.39, volume: 'MCX', market: 'IN', isGain: false }
];

interface TopGainersLosersWidgetProps {
  onSelectStockNews?: (symbol: string, name: string) => void;
  compact?: boolean;
}

export const TopGainersLosersWidget: React.FC<TopGainersLosersWidgetProps> = ({ onSelectStockNews, compact = false }) => {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers' | 'crypto'>('gainers');

  const currentList = activeTab === 'gainers' ? TOP_GAINERS : activeTab === 'losers' ? TOP_LOSERS : CRYPTO_MOVERS;

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          <h3 className="font-extrabold text-sm tracking-wide text-white">Live Market Movers Desk</h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          REAL-TIME PULSE
        </span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('gainers')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'gainers'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Top Gainers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('losers')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'losers'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Top Losers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('crypto')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'crypto'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Crypto & Gold</span>
        </button>
      </div>

      {/* Stock Cards List */}
      <div className="divide-y divide-slate-800/80">
        {currentList.map((item, idx) => (
          <div
            key={idx}
            className="py-3 flex items-center justify-between gap-3 hover:bg-slate-800/40 px-2 rounded-xl transition-all group"
          >
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-white group-hover:text-emerald-400 transition-colors">
                  {item.symbol}
                </span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {item.market}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[140px] sm:max-w-[180px]">
                {item.name}
              </p>
            </div>

            <div className="text-right space-y-0.5">
              <span className="font-mono font-bold text-xs text-white block">
                {item.price}
              </span>
              <span
                className={`text-[10px] font-mono font-bold flex items-center justify-end gap-0.5 ${
                  item.isGain ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {item.isGain ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {item.change} ({item.changePercent > 0 ? '+' : ''}{item.changePercent}%)
              </span>
            </div>

            {onSelectStockNews && (
              <button
                type="button"
                onClick={() => onSelectStockNews(item.symbol, item.name)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-emerald-400 hover:underline shrink-0"
              >
                News & Report
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
