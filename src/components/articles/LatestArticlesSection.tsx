import React, { useMemo } from 'react';
import { StorageService } from '../../services/storageService';
import { Article } from '../../types';
import { Clock, Eye, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';

interface LatestArticlesSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  excludeId?: string;
  categoryId?: string;
  layout?: 'grid' | 'sidebar';
  onNavigate: (route: string, param?: string) => void;
  className?: string;
}

export const LatestArticlesSection: React.FC<LatestArticlesSectionProps> = ({
  title = "Latest Financial Articles & Market Insights",
  subtitle = "Stay updated with expert analysis, stock market news, and personal finance strategies.",
  limit = 4,
  excludeId,
  categoryId,
  layout = 'grid',
  onNavigate,
  className = ''
}) => {
  const articles = useMemo(() => {
    let all = StorageService.getArticles().filter(a => a.status === 'published');
    if (excludeId) {
      all = all.filter(a => a.id !== excludeId);
    }
    if (categoryId) {
      const categoryMatches = all.filter(a => a.categoryId === categoryId);
      if (categoryMatches.length >= limit) {
        return categoryMatches.slice(0, limit);
      }
    }
    return all.slice(0, limit);
  }, [excludeId, categoryId, limit]);

  if (articles.length === 0) return null;

  if (layout === 'sidebar') {
    return (
      <div className={`bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm space-y-4 ${className}`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-sm font-serif flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#16A34A]" />
            <span>{title}</span>
          </h3>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            NEW
          </span>
        </div>

        <div className="space-y-4">
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => onNavigate('article', art.slug)}
              className="flex items-center gap-3 group cursor-pointer border-b border-slate-50 pb-3 last:border-b-0 last:pb-0"
            >
              <img
                src={art.featuredImage}
                alt={art.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 group-hover:scale-105 transition-transform"
              />
              <div className="space-y-1 flex-1 min-w-0">
                <span className="text-[10px] font-extrabold uppercase text-[#16A34A] tracking-wider block font-sans">
                  {art.subCategory || art.categoryId.replace('-', ' ')}
                </span>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#155EEF] line-clamp-2 leading-snug font-serif transition-colors">
                  {art.title}
                </h4>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {art.readTimeMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-400" /> {art.views || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid Layout (Bottom Section for Pages)
  return (
    <section className={`bg-gradient-to-br from-slate-900 via-[#0B1F33] to-slate-950 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl space-y-8 my-8 font-sans ${className}`}>
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommended Reading</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-slate-300 text-xs sm:text-sm font-light">
              {subtitle}
            </p>
          )}
        </div>

        <button
          onClick={() => onNavigate('stock-market')}
          className="self-start sm:self-center bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 shadow-sm flex items-center gap-2 cursor-pointer transition-colors shrink-0"
        >
          <span>View All Articles</span>
          <ArrowRight className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {articles.map((art) => (
          <div
            key={art.id}
            onClick={() => onNavigate('article', art.slug)}
            className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-[#16A34A] rounded-2xl p-4 flex flex-col justify-between space-y-4 cursor-pointer transition-all group shadow-md"
          >
            <div className="space-y-3">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-slate-700">
                <img
                  src={art.featuredImage}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-[#0B1F33]/90 backdrop-blur-xs text-[#16A34A] border border-[#16A34A]/40 text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                  {art.subCategory || art.categoryId.replace('-', ' ')}
                </span>
              </div>

              <h3 className="font-extrabold text-[15px] sm:text-base text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-[1.5] font-serif">
                {art.title}
              </h3>

              <p className="text-sm text-slate-300 font-normal line-clamp-2 leading-[1.55]">
                {art.excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-3 border-t border-slate-700/60">
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-[#16A34A]" /> {art.readTimeMinutes} min read
              </span>
              <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Read Article →
              </span>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};
