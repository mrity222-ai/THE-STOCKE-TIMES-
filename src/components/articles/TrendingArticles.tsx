import React, { useEffect, useState, useMemo } from 'react';
import { Article } from '../../types';
import { StorageService } from '../../services/storageService';
import { ApiService } from '../../services/apiService';
import { Flame, Clock, TrendingUp, Sparkles, ChevronRight, Eye, ArrowUpRight } from 'lucide-react';

interface TrendingArticlesProps {
  currentArticleId?: string;
  onNavigate: (route: string, param?: string) => void;
  limit?: number;
  layout?: 'sidebar' | 'inline' | 'grid';
  title?: string;
  subtitle?: string;
  className?: string;
}

export const TrendingArticles: React.FC<TrendingArticlesProps> = ({
  currentArticleId,
  onNavigate,
  limit = 5,
  layout = 'sidebar',
  title = 'Trending Finance Stories',
  subtitle = 'High-engagement market analysis & breaking financial insights',
  className = ''
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadTrending = async () => {
      try {
        setLoading(true);
        // 1. Fetch fresh articles from API
        const apiArticles = await ApiService.fetchArticles();
        const basePool = (apiArticles && apiArticles.length > 0)
          ? apiArticles
          : StorageService.getArticles();

        // 2. Filter published and exclude current viewing article
        const published = basePool.filter(
          (a: Article) => (a.status === 'published' || !a.status) && a.id !== currentArticleId
        );

        // 3. High-engagement ranking algorithm:
        // Priority: Explicitly flagged isTrending/isPopular, then sorted by views/reads
        const ranked = [...published].sort((a, b) => {
          const aScore = (a.isTrending ? 10000 : 0) + (a.isPopular ? 5000 : 0) + (a.views || 0);
          const bScore = (b.isTrending ? 10000 : 0) + (b.isPopular ? 5000 : 0) + (b.views || 0);
          return bScore - aScore;
        });

        if (isMounted) {
          setArticles(ranked.slice(0, limit));
        }
      } catch (err) {
        console.warn('TrendingArticles load warning:', err);
        const fallback = StorageService.getArticles()
          .filter(a => a.status === 'published' && a.id !== currentArticleId)
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, limit);
        if (isMounted) setArticles(fallback);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTrending();
    return () => {
      isMounted = false;
    };
  }, [currentArticleId, limit]);

  if (!loading && articles.length === 0) {
    return null;
  }

  // --- GRID / INLINE VIEW (Beneath in-content or bottom article ad slots) ---
  if (layout === 'inline' || layout === 'grid') {
    return (
      <section
        aria-label="Trending Finance Stories"
        className={`bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 font-sans ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-600">
                HIGH ENGAGEMENT
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-[#0B1F33] font-serif tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <TrendingUp className="w-3 h-3 text-amber-600" /> Most Read Now
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((art, idx) => (
              <article
                key={art.id}
                onClick={() => onNavigate(art.categoryId, art.slug)}
                className="group flex flex-col justify-between bg-slate-50 hover:bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-[#155EEF] hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-extrabold uppercase text-[#16A34A] tracking-wider">
                      {art.categoryId.replace('-', ' ')}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-slate-200/70 text-slate-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 group-hover:bg-[#155EEF] group-hover:text-white transition-colors">
                      #{idx + 1}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#0B1F33] group-hover:text-[#155EEF] transition-colors line-clamp-2 font-serif leading-snug">
                    {art.title}
                  </h4>

                  {art.excerpt && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-3 mt-3 border-t border-slate-200/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {art.readTimeMinutes || 4} min read
                  </span>
                  <span className="text-[#155EEF] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-xs">
                    Read Story <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  // --- SIDEBAR VIEW (Beneath sidebar ad units) ---
  return (
    <aside
      aria-label="Trending Articles"
      className={`bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 font-sans ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#0B1F33] font-serif">
              {title}
            </h3>
            <span className="text-[10px] text-slate-400 block font-sans">
              Curated for market readers
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold border border-rose-100 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Live
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((art, idx) => (
            <div
              key={art.id}
              onClick={() => onNavigate(art.categoryId, art.slug)}
              className="flex items-start gap-3 cursor-pointer group p-1.5 -mx-1.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-extrabold text-xs flex items-center justify-center shrink-0 group-hover:bg-[#155EEF] group-hover:text-white transition-colors">
                {idx + 1}
              </span>
              <div className="space-y-0.5 min-w-0 flex-1">
                <h4 className="text-xs font-bold text-[#0B1F33] group-hover:text-[#155EEF] transition-colors line-clamp-2 font-serif leading-snug">
                  {art.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span className="text-[#16A34A] font-bold font-sans uppercase">
                    {art.categoryId.replace('-', ' ')}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(art.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  {art.readTimeMinutes ? (
                    <>
                      <span>•</span>
                      <span>{art.readTimeMinutes}m</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};
