import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { CategoryId } from '../types';
import { ArticleCard } from '../components/articles/ArticleCard';
import { AdSlot } from '../components/ads/AdSlot';
import { TrendingUp, Wallet, Building2, PieChart, Newspaper, Filter, Tag, ArrowRight, ChevronRight } from 'lucide-react';

interface CategoryPageProps {
  categoryId: CategoryId;
  onNavigate: (route: string, param?: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ categoryId, onNavigate }) => {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  
  const categories = StorageService.getCategories();
  const currentCategory = categories.find(c => c.id === categoryId) || categories[0];
  
  // Sort articles strictly by publish date descending (newest first!)
  const allArticles = StorageService.getArticles()
    .filter(a => a.categoryId === categoryId && a.status === 'published')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const filteredArticles = selectedSubcategory === 'All'
    ? allArticles
    : allArticles.filter(a => a.subCategory === selectedSubcategory || a.tags.includes(selectedSubcategory));

  const leadArticle = filteredArticles[0];
  const leadAuthor = leadArticle ? StorageService.getAuthorById(leadArticle.authorId) : undefined;

  const firstBatch = filteredArticles.slice(1, 4);
  const secondBatch = filteredArticles.slice(4);

  const categoryIconMap: Record<string, any> = {
    'stock-market': TrendingUp,
    'personal-finance': Wallet,
    'banking': Building2,
    'investment': PieChart,
    'finance-news': Newspaper
  };

  const IconComponent = categoryIconMap[currentCategory.id] || TrendingUp;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-sans">
      
      {/* Category Header Hero */}
      <div className="bg-gradient-to-r from-[#0B1F33] via-[#0B1F33] to-[#155EEF]/35 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-4">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 font-sans mb-2">
            <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">Home</button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-emerald-400 font-bold uppercase">{currentCategory.name}</span>
          </div>
          
          <div className="inline-flex items-center gap-2 bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest">
            <IconComponent className="w-4 h-4 text-[#16A34A]" />
            <span>TheStoceTimes.com Desk</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-serif leading-tight">
            {currentCategory.name}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light font-sans max-w-3xl">
            {currentCategory.description}
          </p>

          {/* Subcategory Filter Pills */}
          {currentCategory.subcategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-3">
              <button
                onClick={() => setSelectedSubcategory('All')}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  selectedSubcategory === 'All'
                    ? 'bg-[#16A34A] text-slate-950 shadow-md font-black'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All Stories ({allArticles.length})
              </button>

              {currentCategory.subcategories.map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedSubcategory === sub
                      ? 'bg-[#16A34A] text-slate-950 shadow-md font-extrabold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Ad Placement: Category Page Top Hero Banner */}
      <AdSlot placement="category_top" />

      {/* Featured Lead Category Story (Latest Post at Top) */}
      {leadArticle && (
        <div 
          onClick={() => onNavigate(leadArticle.categoryId, leadArticle.slug)}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xl hover:shadow-2xl hover:border-[#155EEF]/40 transition-all duration-300 cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group"
        >
          <div className="lg:col-span-7 aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100 relative">
            <img
              src={leadArticle.featuredImage}
              alt={leadArticle.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span className="absolute top-4 left-4 bg-[#16A34A] text-white text-[10px] font-black uppercase px-3.5 py-1 rounded-full shadow-md tracking-wider">
              Latest {currentCategory.name} Release
            </span>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#155EEF] uppercase tracking-wider">
              <span>{leadArticle.subCategory || currentCategory.name}</span>
              <span>•</span>
              <span>{leadArticle.readTimeMinutes} min read</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F33] group-hover:text-[#155EEF] transition-colors leading-tight tracking-tight font-serif">
              {leadArticle.title}
            </h2>

            <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed font-light">
              {leadArticle.excerpt}
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-slate-500 font-medium border-t border-slate-100">
              {leadAuthor && (
                <img
                  src={leadAuthor.avatar}
                  alt={leadAuthor.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-300"
                />
              )}
              <span className="font-bold text-slate-800">{leadAuthor?.name || 'TheStoceTimes.com Desk'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of First Batch Articles (3 columns equal height) */}
      {firstBatch.length > 0 && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#155EEF] block">RECENT COVERAGE</span>
            <h3 className="text-xl font-extrabold text-[#0B1F33] font-serif">
              Recent {currentCategory.name} Articles
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {firstBatch.map(art => (
              <div key={art.id} className="h-full">
                <ArticleCard article={art} onNavigate={onNavigate} layout="standard" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Mid Ad (category_mid) */}
      <AdSlot placement="category_mid" />

      {/* Grid of Remaining Articles */}
      {secondBatch.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {secondBatch.map(art => (
              <div key={art.id} className="h-full">
                <ArticleCard article={art} onNavigate={onNavigate} layout="standard" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
