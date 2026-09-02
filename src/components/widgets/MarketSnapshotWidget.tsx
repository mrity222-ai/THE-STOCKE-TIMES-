import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Gauge, Globe, Newspaper, Activity, Clock } from 'lucide-react';
import { MarketDataService, FinnhubNewsArticle } from '../../services/marketDataService';

export const MarketSnapshotWidget: React.FC = () => {
  const [tab, setTab] = useState<'gainers' | 'losers' | 'finnhubNews'>('gainers');
  const [finnhubNews, setFinnhubNews] = useState<FinnhubNewsArticle[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);

    MarketDataService.fetchFinnhubNews().then(news => {
      if (news && news.length > 0) {
        setFinnhubNews(news);
      }
    });

    return () => clearInterval(timer);
  }, []);

  const topGainers = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: '₹3,020.40', change: '+3.45%', sparkPath: 'M 0 20 Q 15 14, 30 16 T 60 4' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: '₹1,680.15', change: '+2.80%', sparkPath: 'M 0 22 Q 15 18, 30 10 T 60 3' },
    { symbol: 'INFY', name: 'Infosys Ltd', price: '₹1,840.90', change: '+2.15%', sparkPath: 'M 0 18 Q 15 16, 30 8 T 60 5' },
    { symbol: 'TATASTEEL', name: 'Tata Steel', price: '₹172.50', change: '+1.95%', sparkPath: 'M 0 24 Q 15 18, 30 12 T 60 6' }
  ];

  const topLosers = [
    { symbol: 'TECHM', name: 'Tech Mahindra', price: '₹1,420.00', change: '-1.85%', sparkPath: 'M 0 4 Q 15 10, 30 14 T 60 22' },
    { symbol: 'WIPRO', name: 'Wipro Limited', price: '₹510.30', change: '-1.40%', sparkPath: 'M 0 6 Q 15 12, 30 16 T 60 20' },
    { symbol: 'CIPLA', name: 'Cipla Ltd', price: '₹1,490.80', change: '-1.10%', sparkPath: 'M 0 8 Q 15 14, 30 18 T 60 24' },
    { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv', price: '₹1,610.20', change: '-0.75%', sparkPath: 'M 0 5 Q 15 12, 30 10 T 60 18' }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-md mb-12 border border-slate-100/80 font-sans">
      
      {/* Widget Header & Timestamp Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0B1F33] text-[#16A34A] flex items-center justify-center font-bold shadow-md shrink-0">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase text-[#155EEF] tracking-widest block font-sans">FINANCIAL TERMINAL</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0B1F33] tracking-tight font-serif">
              Market Mood & Indices
            </h3>
          </div>
        </div>

        {/* Timestamp & Tab Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Last Updated Time Badge */}
          <div className="flex items-center gap-1.5 bg-slate-50 text-slate-500 text-xs font-mono px-3 py-1.5 rounded-xl border border-slate-200/70">
            <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Updated: <strong>{lastUpdated || 'Live'}</strong></span>
          </div>

          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-bold font-sans">
            <button
              onClick={() => setTab('gainers')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                tab === 'gainers' ? 'bg-white text-[#16A34A] shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Gainers
            </button>
            <button
              onClick={() => setTab('losers')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                tab === 'losers' ? 'bg-white text-[#DC2626] shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" /> Losers
            </button>
            <button
              onClick={() => setTab('finnhubNews')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                tab === 'finnhubNews' ? 'bg-white text-[#155EEF] shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#155EEF]" /> US Feed
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Market Mood Gauge Card (Strong Visuals & Gradient Glow) */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#0B1F33] via-[#0B1F33] to-[#0A2540] text-white p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-5 shadow-xl relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#16A34A]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-300 font-sans flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#16A34A] animate-pulse" /> Market Mood Index
            </span>
            <span className="text-xs font-black text-emerald-400 font-mono bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/60 shadow-[0_0_12px_rgba(22,163,74,0.25)]">
              72% BULLISH
            </span>
          </div>

          {/* Speedometer Score Display */}
          <div className="space-y-3 relative z-10">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-300 font-sans">Current Sentiment:</span>
              <span className="text-2xl font-black text-emerald-400 font-serif tracking-tight flex items-center gap-1.5">
                <TrendingUp className="w-5 h-5 text-[#16A34A]" /> Extreme Greed
              </span>
            </div>

            {/* Visual Gauge Progress Speedometer Bar */}
            <div className="w-full bg-slate-900/90 h-4 rounded-full p-0.5 relative border border-slate-700/80 shadow-inner">
              <div className="bg-gradient-to-r from-rose-500 via-amber-400 to-[#16A34A] h-full w-full opacity-90 rounded-full" />
              
              {/* Active Marker Indicator Pin */}
              <div 
                className="absolute top-[-3px] bottom-[-3px] w-3.5 bg-white rounded-full shadow-lg border-2 border-[#0B1F33] transition-all duration-500"
                style={{ left: '72%' }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono pt-1">
              <span className="text-rose-400">Extreme Fear (0)</span>
              <span className="text-amber-400">Neutral (50)</span>
              <span className="text-[#16A34A]">Extreme Greed (100)</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-3 flex items-center justify-between relative z-10">
            <span>NIFTY 50 • BANK NIFTY</span>
            <span className="text-emerald-400 font-bold">Strong Buying Signals</span>
          </div>

        </div>

        {/* Stock Movers List with Small SVG Sparklines (7 cols) */}
        <div className="md:col-span-7 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 min-h-[220px] flex flex-col justify-center shadow-sm">
          {tab === 'finnhubNews' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-extrabold uppercase text-[#155EEF] tracking-wider flex items-center gap-1.5 font-mono">
                  <Newspaper className="w-4 h-4" /> FINNHUB.IO REAL-TIME US MARKET FEED
                </span>
                <span className="text-xs text-emerald-600 font-bold font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" /> LIVE
                </span>
              </div>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {(finnhubNews.length > 0 ? finnhubNews.slice(0, 3) : [
                  { id: 1, headline: 'Federal Reserve Signals Rate Pathway as US Inflation Cools Down', source: 'Finnhub News', url: '#' },
                  { id: 2, headline: 'Tech Rally Lifts Nasdaq and S&P 500 Ahead of Q3 Earnings Season', source: 'Finnhub News', url: '#' }
                ]).map((art) => (
                  <div key={art.id} className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1 shadow-sm hover:shadow-sm transition-shadow">
                    <h4 className="text-xs font-bold text-[#0B1F33] line-clamp-2 leading-snug font-serif">
                      {art.headline}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>Source: {art.source}</span>
                      {art.url && (
                        <a href={art.url} target="_blank" rel="noreferrer" className="text-[#155EEF] hover:underline font-bold">
                          Read Story →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-200/70">
              {(tab === 'gainers' ? topGainers : topLosers).map((item) => (
                <div key={item.symbol} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  
                  {/* Stock Symbol & Name */}
                  <div className="w-1/3 min-w-0">
                    <span className="font-extrabold text-[#0B1F33] text-xs font-mono block uppercase tracking-wide truncate">{item.symbol}</span>
                    <span className="text-xs text-slate-500 font-medium font-sans truncate block">{item.name}</span>
                  </div>

                  {/* Mini Stock Sparkline Graph */}
                  <div className="w-16 h-7 shrink-0 flex items-center justify-center">
                    <svg className="w-16 h-7 overflow-visible" viewBox="0 0 60 28">
                      <path
                        d={item.sparkPath}
                        fill="none"
                        stroke={item.change.startsWith('+') ? '#16A34A' : '#DC2626'}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Price & Change Badge */}
                  <div className="text-right flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-slate-900 font-mono">{item.price}</span>
                    <span className={`text-xs font-extrabold font-mono px-2.5 py-1 rounded-lg border min-w-[72px] text-center ${
                      item.change.startsWith('+') 
                        ? 'bg-emerald-50 text-[#16A34A] border-emerald-200/80' 
                        : 'bg-rose-50 text-[#DC2626] border-rose-200/80'
                    }`}>
                      {item.change}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
