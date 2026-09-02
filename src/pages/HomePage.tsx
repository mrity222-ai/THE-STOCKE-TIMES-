import React from 'react';
import { StorageService } from '../services/storageService';
import { Article } from '../types';
import { FeaturedArticleHero } from '../components/articles/FeaturedArticleHero';
import { LatestNewsFeed } from '../components/articles/LatestNewsFeed';
import { ArticleCard } from '../components/articles/ArticleCard';
import { MarketSnapshotWidget } from '../components/widgets/MarketSnapshotWidget';
import { SipCalculatorWidget } from '../components/widgets/SipCalculatorWidget';
import { NewsletterBox } from '../components/widgets/NewsletterBox';
import { AdSlot } from '../components/ads/AdSlot';
import { TrendingUp, Wallet, Building2, PieChart, Newspaper, ArrowRight, Flame, Calculator, Sparkles, Clock, Layers } from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [articles, setArticles] = React.useState<Article[]>(() => StorageService.getArticles());

  React.useEffect(() => {
    const handleStorageChange = () => {
      setArticles(StorageService.getArticles());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Strictly sort all published articles by publishedAt date descending (NEWEST ARTICLES FIRST!)
  const publishedArticles = articles
    .filter(a => a.status === 'published')
    .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());

  const categories = StorageService.getCategories();

  // Hero Lead Section strictly gets publishedArticles starting with the #1 newest article at TOP
  const heroArticles = publishedArticles;

  const stockMarketArticles = publishedArticles.filter(a => a.categoryId === 'stock-market').slice(0, 3);
  const personalFinanceArticles = publishedArticles.filter(a => a.categoryId === 'personal-finance').slice(0, 3);
  const bankingArticles = publishedArticles.filter(a => a.categoryId === 'banking').slice(0, 3);
  const investmentArticles = publishedArticles.filter(a => a.categoryId === 'investment').slice(0, 3);
  const financeNewsArticles = publishedArticles.filter(a => a.categoryId === 'finance-news').slice(0, 3);

  const popularArticles = [...publishedArticles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 font-sans bg-[#F8FAFC]">

      {/* Top Lead Hero Section (Newest Article strictly placed at the TOP) */}
      <FeaturedArticleHero articles={heroArticles} onNavigate={onNavigate} />

      {/* Top Banner Ad Below Hero (global_top) */}
      <AdSlot placement="global_top" />

      {/* Market Snapshot & Mood Gauge Terminal */}
      <MarketSnapshotWidget />

      {/* Main Content Layout (12-Column Editorial Grid: Left 8 Cols Main Content ~67%, Right 4 Cols Sidebar ~33%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

        {/* Left Primary Feed (8 Cols - Dominant Main Content) */}
        <div className="lg:col-span-8 space-y-14">

          {/* Section 0: Real-Time Latest News Stream with Load More */}
          <LatestNewsFeed onNavigate={onNavigate} initialCount={5} step={4} />

          {/* Section 1: Stock Market Updates */}
          <section className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#155EEF] flex items-center gap-1.5 font-sans">
                  <TrendingUp className="w-3.5 h-3.5 text-[#155EEF]" /> MARKETS & EQUITIES
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F33] tracking-tight font-serif">
                  Stock Market & Equities
                </h2>
              </div>
              <button
                onClick={() => onNavigate('stock-market')}
                className="text-xs font-bold text-[#155EEF] hover:text-[#0B1F33] flex items-center gap-1 group cursor-pointer"
              >
                <span>View All Stock Articles</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 items-stretch">
              {stockMarketArticles.map((art) => (
                <div key={art.id} className="h-full">
                  <ArticleCard article={art} onNavigate={onNavigate} layout="standard" />
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Personal Finance Tactics */}
          <section className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#16A34A] flex items-center gap-1.5 font-sans">
                  <Wallet className="w-3.5 h-3.5 text-[#16A34A]" /> WEALTH MANAGEMENT
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F33] tracking-tight font-serif">
                  Personal Finance & Money
                </h2>
              </div>
              <button
                onClick={() => onNavigate('personal-finance')}
                className="text-xs font-bold text-[#16A34A] hover:text-[#0B1F33] flex items-center gap-1 group cursor-pointer"
              >
                <span>View All Personal Finance</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 items-stretch">
              {personalFinanceArticles.map((art) => (
                <div key={art.id} className="h-full">
                  <ArticleCard article={art} onNavigate={onNavigate} layout="standard" />
                </div>
              ))}
            </div>
          </section>

          {/* Homepage In-Feed Mid Ad (homepage_mid) */}
          <AdSlot placement="homepage_mid" />

          {/* Section 3: Banking & Yield Rates */}
          <section className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-600 flex items-center gap-1.5 font-sans">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" /> BANKING YIELDS
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F33] tracking-tight font-serif">
                  Banking & FD Rates
                </h2>
              </div>
              <button
                onClick={() => onNavigate('banking')}
                className="text-xs font-bold text-purple-600 hover:text-[#0B1F33] flex items-center gap-1 group cursor-pointer"
              >
                <span>View All Banking Guides</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 items-stretch">
              {bankingArticles.map((art) => (
                <div key={art.id} className="h-full">
                  <ArticleCard article={art} onNavigate={onNavigate} layout="standard" />
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Investment & SIP Strategies */}
          <section className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 flex items-center gap-1.5 font-sans">
                  <PieChart className="w-3.5 h-3.5 text-amber-600" /> PORTFOLIO ALLOCATION
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F33] tracking-tight font-serif">
                  Investment & Mutual Funds
                </h2>
              </div>
              <button
                onClick={() => onNavigate('investment')}
                className="text-xs font-bold text-amber-600 hover:text-[#0B1F33] flex items-center gap-1 group cursor-pointer"
              >
                <span>View All Investment Guides</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 items-stretch">
              {investmentArticles.map((art) => (
                <div key={art.id} className="h-full">
                  <ArticleCard article={art} onNavigate={onNavigate} layout="standard" />
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Macroeconomic News */}
          <section className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-600 flex items-center gap-1.5 font-sans">
                  <Newspaper className="w-3.5 h-3.5 text-rose-600" /> GLOBAL BREAKING
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F33] tracking-tight font-serif">
                  Finance News & Macro Alerts
                </h2>
              </div>
              <button
                onClick={() => onNavigate('finance-news')}
                className="text-xs font-bold text-rose-600 hover:text-[#0B1F33] flex items-center gap-1 group cursor-pointer"
              >
                <span>View All News Updates</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 items-stretch">
              {financeNewsArticles.map((art) => (
                <div key={art.id} className="h-full">
                  <ArticleCard article={art} onNavigate={onNavigate} layout="standard" />
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Sidebar (4 Cols - Supporting Module Stack) */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 self-start">

          {/* Module 1: MOST READ STORIES (Spacious layout, optional thumbnails, font readability) */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <Flame className="w-4.5 h-4.5 text-rose-500 fill-rose-500" />
                <h3 className="text-base sm:text-lg font-extrabold text-[#0B1F33] tracking-tight font-serif">Most Read Stories</h3>
              </div>
              <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                TOP 5
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {popularArticles.map((art, idx) => (
                <div
                  key={art.id}
                  onClick={() => onNavigate(art.categoryId, art.slug)}
                  className="py-4 first:pt-1 last:pb-1 flex items-center gap-3.5 group cursor-pointer hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-all"
                >
                  {/* Ranking Number */}
                  <span className="text-xl font-black text-slate-300 font-mono group-hover:text-[#155EEF] transition-colors shrink-0 w-6">
                    0{idx + 1}
                  </span>

                  {/* Optional Thumbnail Image */}
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-sm">
                    <img
                      src={art.featuredImage}
                      alt={art.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                    />
                  </div>

                  {/* Title & Views Info */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="text-sm sm:text-[15px] font-extrabold text-[#0B1F33] group-hover:text-[#155EEF] transition-colors line-clamp-2 leading-[1.5] font-serif">
                      {art.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono pt-0.5">
                      <span>{(art.views ?? 0).toLocaleString()} readers</span>
                      <span>•</span>
                      <span>{art.readTimeMinutes}m read</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module 2: FINANCIAL CALCULATOR SIDEBAR CARD */}
          <SipCalculatorWidget />

          {/* Module 3: HOMEPAGE SIDEBAR AD */}
          <AdSlot placement="homepage-sidebar" />

          {/* Module 4: NEWSLETTER CARD */}
          <NewsletterBox />

        </aside>

      </div>

      {/* Pre-Footer Global Ad Slot (footer_global) */}
      <AdSlot placement="footer_global" />

    </div>
  );
};
