import React from 'react';
import { COMPARISONS_REGISTRY } from '../data/comparisonsMeta';
import { AdSlot } from '../components/ads/AdSlot';
import { 
  Scale, 
  TrendingUp, 
  PieChart, 
  Home, 
  CreditCard, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  Globe2,
  MessageCircleQuestion
} from 'lucide-react';

interface ComparisonToolsLandingPageProps {
  onNavigate: (route: string, param?: string) => void;
}

const iconMap: Record<string, any> = {
  TrendingUp,
  PieChart,
  Home,
  Scale,
  CreditCard,
  BarChart3
};

export const ComparisonToolsLandingPage: React.FC<ComparisonToolsLandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-sans animate-in fade-in duration-200">
      
      {/* Page Hero Header */}
      <div className="bg-gradient-to-r from-[#0B1F33] via-[#0B1F33] to-[#155EEF]/35 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl space-y-6">
        <div className="inline-flex items-center gap-2 bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest">
          <Scale className="w-4 h-4 text-[#16A34A]" />
          <span>TheStockTimes.online Decision Engine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-serif">
          6 Financial Comparison Tools Suite
        </h1>

        <p className="text-slate-300 text-sm sm:text-base font-light max-w-3xl leading-relaxed font-sans">
          Compare tax regimes, mutual fund modes, investment options, deposit returns, real estate, and tax-saving avenues side-by-side with transparent mathematical calculations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl">
          {[
            { label: 'SEO', value: 'Dedicated comparison URLs', icon: Globe2 },
            { label: 'AEO', value: 'Question-led comparison answers', icon: MessageCircleQuestion },
            { label: 'GEO', value: 'India finance decision terms', icon: Sparkles }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <Icon className="w-4 h-4 text-[#16A34A] mb-2" />
                <span className="block text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">{item.label}</span>
                <span className="text-xs font-bold text-white">{item.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AD 1: Top Banner Ad Slot */}
      <AdSlot placement="comparison_top" />

      {/* AD 2: Comparison suite companion ad */}
      <AdSlot placement="comparison_sidebar" />

      {/* Comparison Grid Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#155EEF]">SIDE-BY-SIDE ANALYSIS</span>
          <h2 className="text-2xl font-extrabold text-[#0B1F33] font-serif">
            All 6 Comparison Suites
          </h2>
        </div>
      </div>

      {/* 6 Comparison Tool Cards Grid (First 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMPARISONS_REGISTRY.slice(0, 3).map((tool) => {
          const IconComp = iconMap[tool.iconName] || Scale;
          return (
            <div
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className="bg-white border border-[#E2E8F0] hover:border-[#155EEF]/40 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#155EEF] flex items-center justify-center font-bold">
                    <IconComp className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-50 text-[#16A34A] border border-emerald-200">
                    {tool.category}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-[#0B1F33] group-hover:text-[#155EEF] transition-colors font-serif leading-snug">
                  {tool.name}
                </h3>

                <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed font-light font-sans">
                  {tool.shortDescription}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#155EEF] group-hover:underline">
                <span>Compare Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* AD 3: Middle In-Feed Ad Slot */}
      <AdSlot placement="comparison_after_result" />

      {/* 6 Comparison Tool Cards Grid (Remaining 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMPARISONS_REGISTRY.slice(3).map((tool) => {
          const IconComp = iconMap[tool.iconName] || Scale;
          return (
            <div
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className="bg-white border border-[#E2E8F0] hover:border-[#155EEF]/40 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#155EEF] flex items-center justify-center font-bold">
                    <IconComp className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-50 text-[#16A34A] border border-emerald-200">
                    {tool.category}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-[#0B1F33] group-hover:text-[#155EEF] transition-colors font-serif leading-snug">
                  {tool.name}
                </h3>

                <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed font-light font-sans">
                  {tool.shortDescription}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#155EEF] group-hover:underline">
                <span>Compare Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* AD 4: Mid-page comparison ad */}
      <AdSlot placement="comparison_mid" />

      {/* AD 5: Bottom Banner Ad Slot */}
      <AdSlot placement="comparison_bottom" />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#16A34A]">SEO AEO GEO COVERAGE</span>
          <h2 className="mt-1 text-2xl font-extrabold text-[#0B1F33] font-serif">Comparison pages optimized for decision-intent searches</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <h3 className="font-extrabold text-[#0B1F33]">Search Intent</h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">Each comparison targets high-intent queries like SIP vs FD, rent vs buy, loan comparison, and mutual fund comparison.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <h3 className="font-extrabold text-[#0B1F33]">Answer Format</h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">Tools summarize trade-offs, winners, calculations, FAQs, and methodology for answer engines.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <h3 className="font-extrabold text-[#0B1F33]">Regional Relevance</h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">India-specific language covers tax, FD, debt funds, credit cards, loans, property, and mutual funds.</p>
          </div>
        </div>
      </section>

    </div>
  );
};
