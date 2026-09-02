import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { SeoService } from '../services/seoService';
import { ShieldCheck, FileText, AlertTriangle, Scale, Cookie, BookOpen, AlertCircle, RefreshCw, DollarSign, Users, Mail } from 'lucide-react';
import { LatestArticlesSection } from '../components/articles/LatestArticlesSection';
import { LegalPageItem } from '../types';

interface LegalPageProps {
  initialTab?: 'privacy' | 'disclaimer' | 'terms' | 'cookies' | 'editorial' | 'corrections' | 'refund' | 'guidelines' | 'about' | 'contact';
  defaultTab?: 'privacy' | 'disclaimer' | 'terms' | 'cookies' | 'editorial' | 'corrections' | 'refund' | 'guidelines' | 'about' | 'contact';
  onNavigate?: (route: string, param?: string) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ initialTab, defaultTab, onNavigate }) => {
  const activeTabKey = (initialTab || defaultTab || 'disclaimer') as string;
  const [tab, setTab] = useState<string>(activeTabKey);

  const [pageData, setPageData] = useState<LegalPageItem | undefined>(() => StorageService.getLegalPageById(tab));

  useEffect(() => {
    const liveData = StorageService.getLegalPageById(tab);
    setPageData(liveData);

    if (liveData) {
      SeoService.updateMetaTags(
        liveData.seoTitle || `${liveData.title} | The Stoce Times`,
        liveData.seoDescription || `Read ${liveData.title} on The Stoce Times.`
      );
    }
    window.scrollTo(0, 0);
  }, [tab]);

  const tabsConfig = [
    { key: 'disclaimer', label: 'Disclaimer', icon: AlertTriangle, color: 'text-amber-400' },
    { key: 'privacy', label: 'Privacy Policy', icon: ShieldCheck, color: 'text-[#16A34A]' },
    { key: 'terms', label: 'Terms & Conditions', icon: FileText, color: 'text-[#155EEF]' },
    { key: 'cookies', label: 'Cookie Policy', icon: Cookie, color: 'text-purple-400' },
    { key: 'editorial', label: 'Editorial Policy', icon: Scale, color: 'text-emerald-400' },
    { key: 'corrections', label: 'Corrections Policy', icon: RefreshCw, color: 'text-sky-400' },
    { key: 'refund', label: 'Refund Policy', icon: DollarSign, color: 'text-teal-400' },
    { key: 'guidelines', label: 'Community Guidelines', icon: BookOpen, color: 'text-rose-400' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B1F33] via-[#0B1F33] to-[#155EEF]/35 text-white p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-3">
        <div className="flex items-center gap-2 text-[#16A34A] font-bold text-xs uppercase tracking-wider">
          <Scale className="w-4 h-4" />
          <span>The Stoce Times Legal & Compliance</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight font-serif text-white">
          {pageData?.title || 'Legal Standards & Policies'}
        </h1>
        {pageData?.updatedAt && (
          <p className="text-slate-300 text-xs font-mono">
            Last updated: {new Date(pageData.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap bg-white p-1.5 rounded-2xl border border-[#E2E8F0] shadow-sm text-xs font-bold gap-2">
        {tabsConfig.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isActive ? 'bg-[#0B1F33] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${t.color}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Document Dynamic Content */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E2E8F0] shadow-sm text-slate-800 space-y-6 text-sm leading-relaxed font-light">
        {pageData ? (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-[#0B1F33] font-serif">{pageData.title}</h2>
              <span className="text-xs text-slate-400 font-mono">
                Updated {new Date(pageData.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <div
              className="prose max-w-none text-slate-800 text-sm leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: pageData.content }}
            />
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 italic">
            Document content is loading or unavailable.
          </div>
        )}
      </div>

      {/* Recommended Articles Section */}
      {onNavigate && (
        <LatestArticlesSection
          title="Explore Related Market Insights"
          subtitle="Stay updated with our latest financial coverage and editorial research."
          limit={3}
          onNavigate={onNavigate}
        />
      )}

    </div>
  );
};
