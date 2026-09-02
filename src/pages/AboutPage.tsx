import React from 'react';
import { StorageService } from '../services/storageService';
import { AdSlot } from '../components/ads/AdSlot';
import { ShieldCheck, BookOpen, Award, Users, CheckCircle2, TrendingUp, CheckCircle, Calculator, Info } from 'lucide-react';

interface AboutPageProps {
  onNavigate?: (route: string, param?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const authors = StorageService.getAuthors();
  const dynamicAbout = StorageService.getLegalPageById('about');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0B1F33] via-[#0B1F33] to-[#155EEF]/35 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span>Independent Financial Journalism</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold font-serif tracking-tight leading-tight">
          {dynamicAbout?.title || 'About The Stoce Times'}
        </h1>

        <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
          Independent financial information and editorial platform focused on helping readers understand financial markets, investing, personal finance and important developments across the financial world.
        </p>
      </div>

      {/* Main Narrative Dynamic Content */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6 text-sm text-slate-800 leading-relaxed font-sans">
        {dynamicAbout?.content ? (
          <div
            className="prose max-w-none text-slate-800 text-sm leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: dynamicAbout.content }}
          />
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold text-[#0B1F33] font-serif border-b border-slate-100 pb-3">
              Our Mission & Aim
            </h2>
            <p className="text-base text-slate-700 font-medium leading-relaxed">
              Our aim is simple: <strong className="text-[#0B1F33] font-bold">to make financial information easier to understand, research and follow.</strong>
            </p>
            <p className="text-slate-600 font-normal">
              We cover market developments, stock market trends, investment topics, banking, personal finance, financial tools and other topics that matter to everyday investors and readers who want clear, neutral and straightforward analysis.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#155EEF] flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-[#0B1F33]">Market Developments</h3>
            <p className="text-xs text-slate-600">Daily coverage of Nifty 50, Sensex, equity trends, sector analysis, and macro policy moves.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#16A34A] flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-[#0B1F33]">Financial Tools & Engines</h3>
            <p className="text-xs text-slate-600">Interactive SIP, EMI, Income Tax, and FD calculators paired with 6 side-by-side comparison suites.</p>
          </div>
        </div>
      </div>

      {/* Editorial Principles Grid */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-2xl font-extrabold text-[#0B1F33] font-serif border-b border-slate-100 pb-3">
          Our Core Editorial Principles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#16A34A] flex items-center justify-center font-black">
              1
            </div>
            <h3 className="font-extrabold text-[#0B1F33] text-sm">Clarity Over Complexity</h3>
            <p className="text-xs text-slate-500 font-medium">We break down complex market jargon into clear, digestible, and practical financial guidance.</p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#155EEF] flex items-center justify-center font-black">
              2
            </div>
            <h3 className="font-extrabold text-[#0B1F33] text-sm">Strict Independence</h3>
            <p className="text-xs text-slate-500 font-medium">Our editorial coverage is independent. We do not accept paid stock promotions or biased commentary.</p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
              3
            </div>
            <h3 className="font-extrabold text-[#0B1F33] text-sm">Data & Accuracy</h3>
            <p className="text-xs text-slate-500 font-medium">All statistics, interest rates, and financial figures are verified against official exchange data and regulatory guidelines.</p>
          </div>
        </div>
      </div>

      {/* Research & Editorial Team */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#155EEF] block font-mono">EDITORIAL DESK</span>
            <h2 className="text-2xl font-extrabold text-[#0B1F33] font-serif">Research & Editorial Team</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">{authors.length} Financial Analysts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {authors.map((author) => (
            <div 
              key={author.id} 
              onClick={() => onNavigate?.('author', author.id)}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex gap-4 items-start cursor-pointer hover:border-[#155EEF] hover:shadow-md transition-all group"
            >
              <img
                src={author.avatar}
                alt={author.name}
                className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-[#0B1F33] text-base group-hover:text-[#155EEF] transition-colors">{author.name}</h3>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {author.credentials}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#155EEF]">{author.role}</p>
                <p className="text-xs text-slate-500 line-clamp-2">{author.bio}</p>
                <span className="inline-block text-[11px] font-bold text-[#155EEF] pt-1 group-hover:underline">
                  View Author Profile & Articles →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdSlot placement="article_bottom" className="my-6" />

    </div>
  );
};
