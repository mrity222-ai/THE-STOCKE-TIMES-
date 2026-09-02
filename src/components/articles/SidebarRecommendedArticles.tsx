import React, { useMemo } from 'react';
import { StorageService } from '../../services/storageService';
import { Article } from '../../types';
import { Sparkles, Clock, Calendar, ChevronRight, TrendingUp } from 'lucide-react';

interface SidebarRecommendedArticlesProps {
  currentArticle: Article;
  onNavigate: (route: string, param?: string) => void;
  limit?: number;
  className?: string;
}

export const SidebarRecommendedArticles: React.FC<SidebarRecommendedArticlesProps> = ({
  currentArticle,
  onNavigate,
  limit = 5,
  className = ''
}) => {
  const recommendedArticles = useMemo(() => {
    const allPublished = StorageService.getArticles().filter(
      a => a.status === 'published' && a.id !== currentArticle.id
    );

    // 1. Same Category / Tags Priority
    const sameCategory = allPublished.filter(
      a => a.categoryId === currentArticle.categoryId || 
           (a.tags && currentArticle.tags && a.tags.some(t => currentArticle.tags?.includes(t)))
    );

    // 2. Fallback / Fillers: Trending, Featured, or Popular Articles
    const fillers = allPublished.filter(
      a => !sameCategory.some(sc => sc.id === a.id)
    ).sort((a, b) => (b.views || 0) - (a.views || 0));

    // Combine prioritized list
    const combined = [...sameCategory, ...fillers];

    // Deduplicate and slice to required limit
    const unique = Array.from(new Set(combined.map(a => a.id)))
      .map(id => combined.find(a => a.id === id)!)
      .filter(Boolean);

    return unique.slice(0, limit);
  }, [currentArticle, limit]);

  if (recommendedArticles.length === 0) return null;

  return (
    <div className={`bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-4 font-sans ${className}`}>
      
      {/* Header Bar - Matching Table of Contents Styling */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-[#0B1F33]">
          <Sparkles className="w-4 h-4 text-[#16A34A]" />
          <span className="font-extrabold text-xs tracking-wider uppercase">RECOMMENDED READS</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-[#16A34A]" /> Related
        </span>
      </div>

      {/* Recommended Article Cards List (4-5 Cards) */}
      <div className="space-y-3.5">
        {recommendedArticles.map((art) => {
          const publishedDate = art.publishedAt
            ? new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Recent';

          return (
            <div
              key={art.id}
              onClick={() => onNavigate(art.categoryId, art.slug)}
              className="flex gap-3 group cursor-pointer border-b border-slate-100/70 pb-3.5 last:border-b-0 last:pb-0 items-start hover:bg-slate-50/80 p-2 rounded-xl transition-all"
            >
              {/* Thumbnail Image */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={art.featuredImage}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                />
              </div>

              {/* Details Column */}
              <div className="space-y-1 flex-1 min-w-0">
                {/* Category Pill Tag */}
                <span className="inline-block bg-slate-100 text-[#16A34A] text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded font-sans">
                  {art.subCategory || art.categoryId.replace('-', ' ')}
                </span>

                {/* Article Title */}
                <h4 className="text-[15px] font-bold text-slate-900 group-hover:text-[#155EEF] line-clamp-2 leading-[1.5] font-serif transition-colors">
                  {art.title}
                </h4>

                {/* Date & Reading Time Metadata Row */}
                <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono pt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {publishedDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {art.readTimeMinutes || 5}m read
                  </span>
                </div>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#155EEF] group-hover:translate-x-0.5 transition-all self-center shrink-0" />
            </div>
          );
        })}
      </div>

    </div>
  );
};
