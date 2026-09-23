import React from 'react';
import { Article } from '../../types';
import { Clock, Calendar, Sparkles, ArrowRight, Newspaper, Eye } from 'lucide-react';

interface FeaturedArticleHeroProps {
  articles: Article[];
  onNavigate: (route: string, param?: string) => void;
}

export const FeaturedArticleHero: React.FC<FeaturedArticleHeroProps> = ({ articles, onNavigate }) => {
  if (!articles || articles.length === 0) return null;

  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 4);

  const formattedDate = new Date(mainArticle.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <section className="mb-12 space-y-8">

      {/* Hero Grid Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <Newspaper className="w-5 h-5 text-[#155EEF]" />
          <span className="text-xs font-bold text-[#155EEF] uppercase tracking-widest">LEAD EDITORIAL</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1F33] tracking-tight font-serif">Featured & Trending Stories</h2>
        </div>
        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Handpicked Daily Financial Briefs</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* Main Hero Card (7 Cols) */}
        <div
          onClick={() => onNavigate(mainArticle.categoryId, mainArticle.slug)}
          className="lg:col-span-7 bg-[#0B1F33] rounded-3xl overflow-hidden shadow-xl group cursor-pointer relative border border-slate-800 flex flex-col justify-end min-h-[420px] lg:min-h-[500px]"
        >
          {/* Background Image with Gradient Overlay */}
          <img
            src={mainArticle.featuredImage}
            alt={mainArticle.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33] via-[#0B1F33]/70 to-transparent"></div>

          {/* Hero Content Overlay */}
          <div className="relative z-10 p-6 sm:p-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#16A34A] text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-white" /> Latest Top Story
              </span>
              <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-[11px] font-bold px-3 py-1 rounded-full border border-slate-700 uppercase">
                {mainArticle.subCategory || mainArticle.categoryId}
              </span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-extrabold text-white group-hover:text-emerald-400 transition-colors leading-snug tracking-tight font-serif">
              {mainArticle.title}
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 font-normal leading-relaxed font-sans">
              {mainArticle.excerpt}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 text-xs text-slate-300 font-medium border-t border-slate-800">
              <div className="flex items-center gap-2.5">
                <Newspaper className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-bold">The Stock Times</span>
              </div>

              <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                {mainArticle.showPublishedDate !== false && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    {formattedDate}
                  </span>
                )}
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-emerald-400" /> {(mainArticle.views || 0).toLocaleString()} views</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-400" /> {mainArticle.readTimeMinutes} min read</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Stack Stories (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {sideArticles.map((art) => (
            <div
              key={art.id}
            onClick={() => onNavigate(art.categoryId, art.slug)}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-[#155EEF]/40 hover:shadow-lg transition-all duration-300 group cursor-pointer flex gap-4 items-center flex-1"
            >
              <img
                src={art.featuredImage}
                alt={art.title}
                className="w-24 h-24 rounded-xl object-cover group-hover:scale-105 transition-transform duration-300 shrink-0 border border-slate-100"
              />

              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <span className="text-[#155EEF]">{art.subCategory || art.categoryId}</span>
                  <span className="font-mono inline-flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {(art.views || 0).toLocaleString()}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-[#0B1F33] group-hover:text-[#155EEF] transition-colors line-clamp-2 leading-snug font-serif">
                  {art.title}
                </h4>

                <div className="flex items-center gap-1 text-[11px] text-[#155EEF] font-bold group-hover:underline pt-0.5">
                  <span>Read Story</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
