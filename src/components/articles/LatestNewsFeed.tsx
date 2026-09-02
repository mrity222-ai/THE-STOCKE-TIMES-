import React, { useState, useMemo } from 'react';
import { StorageService } from '../../services/storageService';
import { Article, Author } from '../../types';
import { Newspaper, Calendar, Clock, ArrowRight, ChevronDown, Flame, Sparkles } from 'lucide-react';

interface LatestNewsFeedProps {
  onNavigate: (route: string, param?: string) => void;
  initialCount?: number;
  step?: number;
  className?: string;
}

export const LatestNewsFeed: React.FC<LatestNewsFeedProps> = ({
  onNavigate,
  initialCount = 6,
  step = 4,
  className = ''
}) => {
  const [displayCount, setDisplayCount] = useState<number>(initialCount);

  const [articlesList, setArticlesList] = useState<Article[]>(() => StorageService.getArticles());

  React.useEffect(() => {
    const handleStorageChange = () => {
      setArticlesList(StorageService.getArticles());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch all published articles sorted strictly newest first
  const allArticles = useMemo(() => {
    return articlesList
      .filter(a => a.status === 'published')
      .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
  }, [articlesList]);

  const visibleArticles = useMemo(() => {
    return allArticles.slice(0, displayCount);
  }, [allArticles, displayCount]);

  const hasMore = displayCount < allArticles.length;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + step);
  };

  const categoryNameMap: Record<string, string> = {
    'stock-market': 'Stock Market',
    'personal-finance': 'Personal Finance',
    'banking': 'Banking',
    'investment': 'Investment',
    'finance-news': 'Finance News'
  };

  const categoryBadgeColors: Record<string, string> = {
    'stock-market': 'bg-blue-50 text-[#155EEF] border-blue-200',
    'personal-finance': 'bg-emerald-50 text-[#16A34A] border-emerald-200',
    'banking': 'bg-purple-50 text-purple-700 border-purple-200',
    'investment': 'bg-amber-50 text-amber-700 border-amber-200',
    'finance-news': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <section className={`space-y-6 font-sans ${className}`}>
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-[#155EEF]/10 text-[#155EEF] border border-[#155EEF]/20 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest">
            <Newspaper className="w-3.5 h-3.5" />
            <span>REAL-TIME EDITORIAL STREAM</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F33] tracking-tight font-serif">
            Latest News & Market Updates
          </h2>
        </div>
        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-center">
          Showing {visibleArticles.length} of {allArticles.length} Stories
        </span>
      </div>

      {/* Feed Cards List (Horizontal Row Layouts) */}
      <div className="space-y-4">
        {visibleArticles.map((art) => {
          const author: Author | undefined = StorageService.getAuthorById(art.authorId);
          const publishedDate = new Date(art.publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <article
              key={art.id}
              onClick={() => onNavigate(art.categoryId, art.slug)}
              className="group bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 hover:border-[#155EEF]/40 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col md:flex-row gap-5 items-stretch"
            >
              {/* Thumbnail Image */}
              <div className="md:w-1/3 aspect-[16/9] md:aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 relative shrink-0 border border-slate-100">
                <img
                  src={art.featuredImage}
                  alt={art.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-3 left-3 text-xs font-extrabold uppercase px-2.5 py-1 rounded-md backdrop-blur-xs shadow-sm border ${categoryBadgeColors[art.categoryId] || 'bg-slate-100 text-slate-700'}`}>
                  {categoryNameMap[art.categoryId] || art.categoryId}
                </span>
                {art.isTrending && (
                  <span className="absolute top-3 right-3 bg-[#0B1F33]/90 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" /> Hot
                  </span>
                )}
              </div>

              {/* Card Details Column */}
              <div className="flex flex-col justify-between flex-1 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#155EEF]">
                    <span>{art.subCategory || categoryNameMap[art.categoryId]}</span>
                  </div>

                  <h3 className="text-base sm:text-xl font-extrabold text-[#0B1F33] group-hover:text-[#155EEF] transition-colors leading-[1.5] font-serif">
                    {art.title}
                  </h3>

                  <p className="text-slate-600 text-sm line-clamp-2 leading-[1.55] font-sans font-normal">
                    {art.excerpt}
                  </p>
                </div>

                {/* Metadata Footer Row */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    {author && (
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-5 h-5 rounded-full object-cover border border-slate-200"
                      />
                    )}
                    <span className="font-semibold text-slate-700">{author?.name.split(',')[0] || 'Editorial Desk'}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {publishedDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {art.readTimeMinutes} min read
                    </span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="pt-4 text-center">
          <button
            onClick={handleLoadMore}
            className="bg-white hover:bg-slate-50 text-[#0B1F33] border-2 border-[#0B1F33] hover:border-[#155EEF] hover:text-[#155EEF] font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer inline-flex items-center gap-2.5"
          >
            <span>Load More Latest Stories</span>
            <ChevronDown className="w-4 h-4 text-[#16A34A] animate-bounce" />
          </button>
        </div>
      )}

    </section>
  );
};
