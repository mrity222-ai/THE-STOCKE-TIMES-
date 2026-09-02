import React, { useState, useMemo } from 'react';
import { StorageService } from '../services/storageService';
import { ArticleCard } from '../components/articles/ArticleCard';
import { AdSlot } from '../components/ads/AdSlot';
import { Search, SlidersHorizontal, ArrowUpDown, X, Tag } from 'lucide-react';
import { CategoryId } from '../types';

interface SearchPageProps {
  initialQuery?: string;
  onNavigate: (route: string, param?: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = '', onNavigate }) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'readTime'>('newest');

  const articles = StorageService.getArticles().filter(a => a.status === 'published');
  const categories = StorageService.getCategories();

  const searchResults = useMemo(() => {
    return articles.filter(art => {
      const q = query.toLowerCase().trim();
      const matchesQuery = !q || (
        art.title.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        art.content.toLowerCase().includes(q) ||
        art.tags.some(t => t.toLowerCase().includes(q)) ||
        (art.subCategory && art.subCategory.toLowerCase().includes(q))
      );

      const matchesCategory = selectedCategory === 'all' || art.categoryId === selectedCategory;

      return matchesQuery && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      }
      if (sortBy === 'popular') {
        return b.views - a.views;
      }
      if (sortBy === 'readTime') {
        return a.readTimeMinutes - b.readTimeMinutes;
      }
      return 0;
    });
  }, [articles, query, selectedCategory, sortBy]);

  const popularTags = ['Nifty 50', 'SIP', 'Tax', 'Credit Score', 'FD Rates', 'RBI', 'Mutual Funds', 'Budgeting'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[75vh] font-sans">
      
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-[#0B1F33] via-[#0B1F33] to-[#155EEF]/35 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl space-y-6">
        <div className="max-w-3xl space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#16A34A] block">SEARCH ARCHIVE</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif text-white">
            Search Financial Research & Articles
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-light">
            Search across market analyses, personal finance strategies, banking rates, and investment guides.
          </p>
        </div>

        {/* Input Bar */}
        <div className="relative max-w-2xl">
          <input
            type="text"
            placeholder="Type keywords (e.g. Nifty 50, SIP Calculator, Tax FY25)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-400 rounded-2xl pl-11 pr-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#155EEF] font-medium"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Popular Trending Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-[#16A34A]" /> Trending Searches:
          </span>
          {popularTags.map(tag => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-full border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#0B1F33] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Categories ({articles.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#155EEF] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-100 border border-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
          >
            <option value="newest">Sort by Newest</option>
            <option value="oldest">Sort by Oldest</option>
            <option value="popular">Sort by Most Popular</option>
            <option value="readTime">Sort by Read Time</option>
          </select>
        </div>
      </div>

      {/* Ad Placement */}
      <AdSlot placement="global_top" />

      {/* Search Results Summary */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-lg font-extrabold text-[#0B1F33] font-serif">
          {query ? `Search Results for "${query}"` : 'All Research Publications'}
        </h2>
        <span className="text-xs text-slate-500 font-bold font-mono">
          Found {searchResults.length} articles
        </span>
      </div>

      {/* Results Grid or Empty State */}
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {searchResults.map(art => (
            <div key={art.id} className="h-full">
              <ArticleCard article={art} onNavigate={onNavigate} layout="standard" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E2E8F0] shadow-sm space-y-4 max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-[#0B1F33] font-serif">No Matching Articles Found</h3>
          <p className="text-xs text-slate-500 font-light leading-relaxed font-sans">
            We couldn't find any financial articles matching "{query}". Try checking your spelling or search for broader keywords like "SIP", "Tax", or "Market".
          </p>
          <button
            onClick={() => setQuery('')}
            className="bg-[#155EEF] hover:bg-[#155EEF]/90 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Clear Search Filter
          </button>
        </div>
      )}

    </div>
  );
};
