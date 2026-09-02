import React from 'react';
import { Article, Author } from '../../types';
import { StorageService } from '../../services/storageService';
import { Clock, Calendar, User, ArrowRight, Flame } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onNavigate: (route: string, param?: string) => void;
  layout?: 'standard' | 'horizontal' | 'compact';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onNavigate, layout = 'standard' }) => {
  const [author, setAuthor] = React.useState<Author | undefined>(() => StorageService.getAuthorById(article.authorId));

  React.useEffect(() => {
    const handleUpdate = () => {
      setAuthor(StorageService.getAuthorById(article.authorId));
    };
    window.addEventListener('user-profile-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('user-profile-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [article.authorId]);

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

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

  if (layout === 'horizontal') {
    return (
      <div
       onClick={() => onNavigate(article.categoryId, article.slug)}
        className="group bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 hover:border-[#155EEF]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row gap-5"
      >
        <div className="sm:w-2/5 aspect-[16/9] overflow-hidden rounded-xl bg-slate-100 relative shrink-0 border border-slate-100">
          <img
            src={article.featuredImage}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {article.isTrending && (
            <span className="absolute top-2.5 left-2.5 bg-[#0B1F33]/90 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-amber-400" /> Hot
            </span>
          )}
        </div>

        <div className="flex flex-col justify-between flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-md border ${categoryBadgeColors[article.categoryId] || 'bg-slate-100 text-slate-700'}`}>
                {categoryNameMap[article.categoryId] || article.categoryId}
              </span>
              {article.subCategory && (
                <span className="text-xs text-slate-400 font-medium font-sans">
                  • {article.subCategory}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-[#0B1F33] group-hover:text-[#155EEF] transition-colors line-clamp-2 leading-[1.5] font-serif">
              {article.title}
            </h3>

            <p className="text-slate-600 text-sm line-clamp-2 mt-2 leading-[1.55] font-sans font-normal">
              {article.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 font-sans">
            <div className="flex items-center gap-2">
              {author && (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-5 h-5 rounded-full object-cover border border-slate-200"
                />
              )}
              <span className="font-semibold text-slate-700 text-xs">{author?.name.split(',')[0] || 'Editorial Desk'}</span>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
              {article.showPublishedDate !== false && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readTimeMinutes} min read
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'compact') {
    return (
      <div
       onClick={() => onNavigate(article.categoryId, article.slug)}
        className="group flex gap-3.5 p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer"
      >
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-100">
          <img
            src={article.featuredImage}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="flex flex-col justify-center min-w-0">
          <span className="text-xs font-extrabold uppercase text-[#155EEF] tracking-wider">
            {categoryNameMap[article.categoryId] || article.categoryId}
          </span>
          <h4 className="text-[15px] font-bold text-[#0B1F33] group-hover:text-[#155EEF] transition-colors line-clamp-2 leading-[1.5] mt-0.5 font-serif">
            {article.title}
          </h4>
          <span className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3" /> {article.readTimeMinutes} min read
          </span>
        </div>
      </div>
    );
  }

  // Standard vertical Editorial Card
  return (
    <div
     onClick={() => onNavigate(article.categoryId, article.slug)}
      className="group bg-white rounded-xl border border-[#E2E8F0] overflow-hidden hover:border-[#155EEF]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {/* Image Container (aspect 16/9) */}
      <div className="aspect-[16/9] h-36 sm:h-40 md:h-44 w-full overflow-hidden bg-slate-100 relative border-b border-slate-100">
        <img
          src={article.featuredImage}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
          <span className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-md backdrop-blur-xs shadow-sm border ${categoryBadgeColors[article.categoryId] || 'bg-[#0B1F33] text-white'}`}>
            {categoryNameMap[article.categoryId] || article.categoryId}
          </span>
        </div>
        {article.isTrending && (
          <span className="absolute top-2.5 right-2.5 bg-[#0B1F33]/90 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
            <Flame className="w-3.5 h-3.5 fill-amber-400" /> Hot
          </span>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between space-y-3">
        <div>
          <h3 className="text-[16px] sm:text-lg font-extrabold text-[#0B1F33] group-hover:text-[#155EEF] transition-colors line-clamp-2 leading-[1.5] font-serif">
            {article.title}
          </h3>
          <p className="text-slate-600 text-sm line-clamp-2 mt-2 leading-[1.55] font-sans font-normal">
            {article.excerpt}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-sans">
          <div className="flex items-center gap-2">
            {author ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-5 h-5 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <User className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="font-semibold text-slate-700 text-xs">{author?.name.split(',')[0] || 'Editorial Desk'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{article.readTimeMinutes}m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
