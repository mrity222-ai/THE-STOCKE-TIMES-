import React, { useState } from 'react';
import { CalculatorMeta } from '../../types/calculators';
import { StorageService } from '../../services/storageService';
import { ArticleCard } from '../articles/ArticleCard';
import { LatestArticlesSection } from '../articles/LatestArticlesSection';
import { AdSlot } from '../ads/AdSlot';
import { 
  Calculator, 
  Share2, 
  Printer, 
  RotateCcw, 
  Check, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Sparkles,
  Info,
  Calendar,
  ChevronRight
} from 'lucide-react';

interface CalculatorWrapperProps {
  meta: CalculatorMeta;
  onNavigate: (route: string, param?: string) => void;
  onReset: () => void;
  ruleUsedBadge?: string;
  formulaText?: string;
  exampleText?: string;
  aboutText?: string;
  faqs?: { q: string; a: string }[];
  children: React.ReactNode;
}

export const CalculatorWrapper: React.FC<CalculatorWrapperProps> = ({
  meta,
  onNavigate,
  onReset,
  ruleUsedBadge,
  formulaText,
  exampleText,
  aboutText,
  faqs = [],
  children
}) => {
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const articles = StorageService.getArticles().filter(a => a.status === 'published');
  
  // Match related articles by category keywords
  const categoryKey = meta.category === 'Loans & EMI' ? 'banking' :
                      meta.category === 'Investment' ? 'investment' :
                      meta.category === 'Savings' ? 'personal-finance' :
                      meta.category === 'Tax & Salary' ? 'finance-news' : 'personal-finance';

  const relatedArticles = articles
    .filter(a => a.categoryId === categoryKey || a.categoryId === 'personal-finance')
    .slice(0, 3);

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 font-sans">
        <button onClick={() => onNavigate('home')} className="hover:text-slate-900 cursor-pointer">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button onClick={() => onNavigate('financial-tools')} className="hover:text-[#155EEF] font-bold cursor-pointer">Financial Tools</button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[#0B1F33] font-extrabold">{meta.name}</span>
      </div>

      {/* Page Header - #0B1F33 Primary Navy Theme */}
      <div className="bg-gradient-to-r from-[#0B1F33] via-[#0B1F33] to-[#155EEF]/35 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest">
            <Calculator className="w-4 h-4 text-[#16A34A]" />
            <span>{meta.category} Tool</span>
          </div>

          {ruleUsedBadge && (
            <div className="bg-slate-900/90 text-emerald-400 border border-emerald-800/60 px-3.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{ruleUsedBadge}</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-serif leading-tight">
          {meta.name}
        </h1>

        <p className="text-slate-300 text-sm sm:text-base font-light max-w-3xl leading-relaxed font-sans">
          {meta.description}
        </p>

        {/* Toolbar Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyShare}
              className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Share Calculator'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold border border-slate-700 hidden sm:flex"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Results</span>
            </button>
          </div>

          <button
            onClick={onReset}
            className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Reset Inputs</span>
          </button>
        </div>
      </div>

      {/* Top Banner Ad Slot */}
      <AdSlot placement="global_top" />

      {/* Main Interactive Calculator Canvas (Passed from children) */}
      <div>
        {children}
      </div>

      {/* Calculator Educational & FAQ Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-6">
        
        {/* Left Column: About & Formula (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* About & Formula Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-5 h-5 text-[#155EEF]" />
              <h3 className="text-xl font-extrabold text-[#0B1F33] font-serif">How {meta.name} Works</h3>
            </div>

            {aboutText && (
              <p className="text-slate-700 text-sm leading-relaxed font-light font-sans">
                {aboutText}
              </p>
            )}

            {formulaText && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                <span className="text-[11px] font-extrabold uppercase text-[#155EEF] tracking-wider block font-sans">MATHEMATICAL FORMULA</span>
                <code className="text-xs font-mono font-bold text-[#0B1F33] block bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  {formulaText}
                </code>
              </div>
            )}

            {exampleText && (
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase text-[#16A34A] tracking-wider block font-sans">PRACTICAL EXAMPLE</span>
                <p className="text-slate-600 text-xs leading-relaxed font-sans bg-emerald-50/60 border border-emerald-200/60 p-4 rounded-2xl">
                  {exampleText}
                </p>
              </div>
            )}
          </div>

          {/* FAQs Section */}
          {faqs.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Info className="w-5 h-5 text-[#155EEF]" />
                <h3 className="text-xl font-extrabold text-[#0B1F33] font-serif">Frequently Asked Questions</h3>
              </div>

              <div className="divide-y divide-slate-100">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full text-left font-bold text-[#0B1F33] text-sm flex items-center justify-between gap-4 cursor-pointer group"
                    >
                      <span className="group-hover:text-[#155EEF] transition-colors">{faq.q}</span>
                      {openFaq === idx ? (
                        <ChevronUp className="w-4 h-4 text-[#155EEF] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {openFaq === idx && (
                      <p className="text-xs text-slate-600 leading-relaxed font-light mt-2.5 pt-1 animate-in fade-in duration-150">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Related Articles & Disclaimer (5 Cols) */}
        <aside className="lg:col-span-5 space-y-6">
          
          {/* Disclaimer Box */}
          <div className="bg-[#FFFBEB] border border-[#F59E0B] rounded-3xl p-6 text-xs text-amber-950 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span>Financial Disclaimer</span>
            </div>
            <p className="leading-relaxed font-normal text-amber-900">
              Disclaimer: Outputs generated by this calculator are for estimation and illustrative purposes only. Actual interest rates, tax liabilities, and maturity returns may vary depending on official bank policies and SEBI regulations.
            </p>
          </div>

          {/* Related Finance Articles */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-[#155EEF]" />
              <h4 className="text-base font-extrabold text-[#0B1F33] font-serif">Related Financial Guides</h4>
            </div>

            <div className="space-y-4">
              {relatedArticles.map(art => (
                <ArticleCard key={art.id} article={art} onNavigate={onNavigate} layout="compact" />
              ))}
            </div>
          </div>

        </aside>

      </div>

      {/* Bottom Related / New Articles Section */}
      <LatestArticlesSection
        title="More Financial Articles & Market Research"
        subtitle="Explore expert analysis, stock market strategies, and wealth creation guides."
        limit={4}
        onNavigate={onNavigate}
      />

    </div>
  );
};
