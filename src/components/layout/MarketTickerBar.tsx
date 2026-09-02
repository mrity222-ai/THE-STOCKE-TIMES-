import React from 'react';
import { MarketIndex } from '../../types';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketTickerBarProps {
  indices: MarketIndex[];
}

export const MarketTickerBar: React.FC<MarketTickerBarProps> = ({ indices }) => {
  // Duplicate for seamless marquee loop
  const tickerItems = [...indices, ...indices, ...indices];

  return (
    <div className="bg-[#0B1F33] text-slate-200 text-xs py-2 border-b border-slate-800/80 select-none font-sans shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center px-4">
        
        {/* Terminal Live Badge */}
        <div className="shrink-0 flex items-center gap-2 pr-3.5 font-extrabold text-[#16A34A] uppercase tracking-widest text-[10px] border-r border-slate-800 z-10 bg-[#0B1F33]">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
          <Activity className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>MARKETS LIVE</span>
        </div>

        {/* Horizontally Scrollable Strip on Mobile / Animated Marquee on Desktop */}
        <div className="overflow-x-auto sm:overflow-hidden relative w-full scrollbar-none flex items-center">
          <div className="flex sm:animate-ticker items-center gap-6 sm:gap-8 pl-3.5 min-w-max">
            {tickerItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 shrink-0 hover:bg-slate-800/60 px-2.5 py-1 rounded-lg transition-colors cursor-default min-h-[36px]">
                <span className="font-bold text-white uppercase text-[11px] tracking-wide">{item.symbol}</span>
                <span className="text-slate-300 font-mono text-[11px] font-semibold">{item.value}</span>
                <span className={`flex items-center text-[11px] font-bold font-mono px-1.5 py-0.5 rounded-md ${
                  item.isPositive 
                    ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50' 
                    : 'text-rose-400 bg-rose-950/60 border border-rose-800/50'
                }`}>
                  {item.isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-0.5 stroke-[2.5]" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5 stroke-[2.5]" />
                  )}
                  {item.changePercent}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
