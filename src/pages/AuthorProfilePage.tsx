import React, { useEffect, useMemo } from 'react';
import { StorageService } from '../services/storageService';
import { ArticleCard } from '../components/articles/ArticleCard';
import { SeoService } from '../services/seoService';
import { BookOpen, Eye, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { AdSlot } from '../components/ads/AdSlot';

interface AuthorProfilePageProps {
  authorId: string;
  onNavigate: (route: string, param?: string) => void;
}

export const AuthorProfilePage: React.FC<AuthorProfilePageProps> = ({ authorId, onNavigate }) => {
  const authorArticles = useMemo(() => {
    return StorageService.getArticles().filter(a => a.status === 'published');
  }, [authorId]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const domain = window.location.origin;

    SeoService.updateMetaTags(
      'The Stock Times Editorial Desk | Financial Research & Analysis',
      'Read financial research, stock market analysis, calculators, comparison tools, and personal finance guides from The Stock Times Editorial Desk.',
      undefined,
      `${domain}/about`,
      `${domain}/about`
    );

    SeoService.injectJsonLd([
      {
        "@context": "https://schema.org",
        "@type": "NewsMediaOrganization",
        "name": "TheStockTimes.online",
        "url": domain,
        "knowsAbout": ["Financial Planning", "Stock Market", "Investment Analysis", "Personal Finance", "Banking"]
      },
      SeoService.generateBreadcrumbSchema([
        { name: "About Us", url: "/about" },
        { name: "Editorial Desk", url: "/about" }
      ])
    ]);
  }, [authorId]);

  const totalViews = authorArticles.reduce((acc, a) => acc + (a.views || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      
      {/* Back Navigation Bar */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <button onClick={() => onNavigate('home')} className="hover:text-slate-900 cursor-pointer">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('about')} className="hover:text-slate-900 cursor-pointer">Editorial Desk</button>
        <span>/</span>
        <span className="text-slate-900 font-bold">The Stock Times</span>
      </div>

      <AdSlot placement="page_top" />

      {/* Editorial Desk Header Card */}
      <div className="bg-gradient-to-r from-[#0B1F33] via-[#0B1F33] to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          
          <div className="shrink-0 relative">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl border-4 border-[#16A34A] bg-white/10 text-[#16A34A] shadow-2xl flex items-center justify-center">
              <ShieldCheck className="w-16 h-16" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#16A34A] text-white p-2 rounded-2xl shadow-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Publication Meta & Bio */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                Verified Publication Desk
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-serif">
              The Stock Times
            </h1>

            <p className="text-emerald-400 font-mono text-sm font-semibold">
              Editorial Desk • Financial Research & Market Coverage
            </p>

            <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed max-w-3xl">
              Public pages use one publication identity for clarity, trust, and consistent branding. Internal author and analyst assignments remain available only in the admin panel.
            </p>

            {/* Author Metrics & Social Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4 border-t border-slate-800 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-slate-300">
                <BookOpen className="w-4 h-4 text-[#16A34A]" />
                <span><strong className="text-white font-bold">{authorArticles.length}</strong> Articles Published</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <Eye className="w-4 h-4 text-[#16A34A]" />
                <span><strong className="text-white font-bold">{totalViews.toLocaleString()}</strong> Cumulative Views</span>
              </div>

            </div>

          </div>

        </div>
      </div>

      <AdSlot placement="page_mid" />

      {/* Author Publications Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[#0B1F33] font-serif">
              Articles & Market Research by The Stock Times
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Showing {authorArticles.length} published financial insights, stock analysis, and guides.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Peer Reviewed
          </span>
        </div>

        {authorArticles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No published articles available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>

      <AdSlot placement="page_sidebar" />
      <AdSlot placement="page_bottom" />

    </div>
  );
};
