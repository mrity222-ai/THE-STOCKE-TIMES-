import React, { useState } from 'react';
import { CALCULATORS_REGISTRY } from '../data/calculatorsMeta';
import { AdSlot } from '../components/ads/AdSlot';
import { 
  Calculator, 
  Search, 
  TrendingUp, 
  Wallet, 
  Building2, 
  PieChart, 
  Newspaper, 
  ArrowRight,
  Sparkles,
  Percent
} from 'lucide-react';

interface FinancialToolsLandingPageProps {
  onNavigate: (route: string, param?: string) => void;
}

export const FinancialToolsLandingPage: React.FC<FinancialToolsLandingPageProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Loans & EMI', 'Investment', 'Savings', 'Tax & Salary', 'Financial Planning'];

  const filteredCalculators = CALCULATORS_REGISTRY.filter((calc) => {
    const matchesCategory = selectedCategory === 'All' || calc.category === selectedCategory;
    const matchesSearch = calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          calc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          calc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-sans animate-in fade-in duration-200">
      
      {/* Page Hero Header */}
      <div className="bg-gradient-to-r from-[#0B1F33] via-[#0B1F33] to-[#155EEF]/35 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl space-y-6">
        <div className="inline-flex items-center gap-2 bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest">
          <Calculator className="w-4 h-4 text-[#16A34A]" />
          <span>TheStoceTimes.com Financial Engine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-serif">
          20 Financial Tools & Calculators Suite
        </h1>

        <p className="text-slate-300 text-sm sm:text-base font-light max-w-3xl leading-relaxed font-sans">
          Accurate, responsive, and policy-compliant financial calculators. Compute home loan EMIs, mutual fund SIP returns, income tax liability, EPF, PPF, NPS, and wealth growth instantly.
        </p>

        {/* Search Bar & Category Filter Pills */}
        <div className="pt-2 space-y-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search 20 financial calculators (e.g., SIP, EMI, Tax)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 text-xs rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#155EEF] font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#16A34A] text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AD 1: Top Banner Ad Slot */}
      <AdSlot placement="calculator_top" />

      {/* Calculator Grid Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#155EEF]">INTERACTIVE CALCULATORS</span>
          <h2 className="text-2xl font-extrabold text-[#0B1F33] font-serif">
            {selectedCategory === 'All' ? 'All 20 Financial Tools' : `${selectedCategory} Calculators`} ({filteredCalculators.length})
          </h2>
        </div>
      </div>

      {/* Calculator Cards Grid (First 9) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {filteredCalculators.slice(0, 9).map((calc) => (
          <div
            key={calc.id}
            onClick={() => onNavigate(calc.id)}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:border-[#155EEF]/40 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-[#155EEF] border border-blue-200">
                  {calc.category}
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">Verified Tool</span>
              </div>

              <h3 className="text-lg font-extrabold text-[#0B1F33] group-hover:text-[#155EEF] transition-colors font-serif leading-snug">
                {calc.name}
              </h3>

              <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed font-light font-sans">
                {calc.description}
              </p>
            </div>

            <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#155EEF] group-hover:underline">
              <span>Open Interactive Tool</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* AD 2: Middle In-Feed Ad Slot */}
      <AdSlot placement="calculator_after_result" />

      {/* Calculator Cards Grid (Remaining) */}
      {filteredCalculators.length > 9 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredCalculators.slice(9).map((calc) => (
            <div
              key={calc.id}
              onClick={() => onNavigate(calc.id)}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:border-[#155EEF]/40 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-[#155EEF] border border-blue-200">
                    {calc.category}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">Verified Tool</span>
                </div>

                <h3 className="text-lg font-extrabold text-[#0B1F33] group-hover:text-[#155EEF] transition-colors font-serif leading-snug">
                  {calc.name}
                </h3>

                <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed font-light font-sans">
                  {calc.description}
                </p>
              </div>

              <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#155EEF] group-hover:underline">
                <span>Open Interactive Tool</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AD 3: Bottom Banner Ad Slot */}
      <AdSlot placement="calculator_bottom" />

    </div>
  );
};
