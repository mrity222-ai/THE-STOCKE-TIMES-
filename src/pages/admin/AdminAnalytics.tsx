import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { AdSlot } from '../../components/ads/AdSlot';
import { BarChart3, TrendingUp, Users, Eye, Clock, ArrowUpRight, ShieldCheck, Globe } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '12m'>('30d');
  const analytics = StorageService.getAnalyticsSummary();
  const articles = StorageService.getArticles();

  const topArticles = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Dedicated Analytics Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track traffic sources, readership engagement, and content performance.</p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold border border-slate-200">
          {(['7d', '30d', '90d', '12m'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                timeframe === t ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Total Unique Visitors</span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 font-mono">{analytics.totalVisitors}</span>
            <span className="text-xs font-bold text-emerald-600 block mt-1 flex items-center font-mono">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +14.8% vs previous period
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Page Views</span>
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 font-mono">{analytics.pageViews}</span>
            <span className="text-xs font-bold text-emerald-600 block mt-1 flex items-center font-mono">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +18.2% vs previous period
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Avg Reading Time</span>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 font-mono">{analytics.avgReadingTime}</span>
            <span className="text-xs font-bold text-emerald-600 block mt-1 flex items-center font-mono">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +45s longer engagement
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Bounce Rate</span>
            <BarChart3 className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 font-mono">{analytics.bounceRate}</span>
            <span className="text-xs font-bold text-emerald-600 block mt-1 flex items-center font-mono">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> -4.2% lower (better)
            </span>
          </div>
        </div>

      </div>

      {/* Traffic Breakdown & Sources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Traffic Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">Traffic Growth Over Time</h3>
          
          <div className="space-y-4">
            <div className="h-60 w-full flex items-end justify-between gap-3 pt-6 px-4 bg-slate-50/80 rounded-2xl border border-slate-100">
              {analytics.trafficOverTime.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div 
                    style={{ height: `${(d.views / 90000) * 100}%` }}
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl group-hover:bg-emerald-500 transition-all duration-300 relative"
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap z-10">
                      {d.views.toLocaleString()} views
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{d.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic Sources (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">Traffic Acquisition Sources</h3>

          <div className="space-y-4">
            {analytics.topSources.map((src) => (
              <div key={src.source} className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{src.source}</span>
                  <span className="font-mono text-emerald-600">{src.percentage}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: `${src.percentage}%` }} className="h-full bg-emerald-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
