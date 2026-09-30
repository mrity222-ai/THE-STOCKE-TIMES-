import React, { useEffect, useState, useMemo } from 'react';
import { StorageService } from '../services/storageService';
import { SeoService } from '../services/seoService';
import { AdService } from '../services/adService';
import { ApiService } from '../services/apiService';
import { TableOfContents } from '../components/articles/TableOfContents';
import { ArticleCard } from '../components/articles/ArticleCard';
import { AdSlot } from '../components/ads/AdSlot';
import { ResponsiveAdContainer } from '../components/ads/ResponsiveAdContainer';
import { LatestArticlesSection } from '../components/articles/LatestArticlesSection';
import { SidebarRecommendedArticles } from '../components/articles/SidebarRecommendedArticles';
import { TrendingArticles } from '../components/articles/TrendingArticles';
import { NewsletterBox } from '../components/widgets/NewsletterBox';
import {
  Calendar,
  Clock,
  User,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  MessageCircle,
  Copy,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Eye,
  Sun,
  Moon,
  Type,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Flame,
  BookOpen,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Article } from '../types';
import { apiFetch } from '../services/apiConfig';

interface ArticleDetailPageProps {
  slug: string;
  onNavigate: (route: string, param?: string) => void;
  isReadingMode?: boolean;
  onToggleReadingMode?: (active?: boolean) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({
  slug,
  onNavigate,
  isReadingMode = false,
  onToggleReadingMode
}) => {
  const [internalReadingMode, setInternalReadingMode] = useState(false);
  const isReadingModeActive = typeof isReadingMode === 'boolean' && onToggleReadingMode ? isReadingMode : internalReadingMode;

  const toggleReadingMode = (nextState?: boolean) => {
    const nextVal = typeof nextState === 'boolean' ? nextState : !isReadingModeActive;
    if (onToggleReadingMode) {
      onToggleReadingMode(nextVal);
    } else {
      setInternalReadingMode(nextVal);
    }
  };

  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [faqs, setFaqs] = useState<{ id: string; question: string; answer: string }[]>([]);

  // Keyboard shortcut: Press Escape to exit reading mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isReadingModeActive) {
        toggleReadingMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReadingModeActive]);

  const [socialMedia, setSocialMedia] = useState({
    twitter_url: '',
    linkedin_url: '',
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    reddit_url: ''
  });

  useEffect(() => {
    const loadSocialMedia = async () => {
      const data = await ApiService.fetchSocialMedia();
      if (data) {
        setSocialMedia({
          twitter_url: data.twitter_url || '',
          linkedin_url: data.linkedin_url || '',
          facebook_url: data.facebook_url || '',
          instagram_url: data.instagram_url || '',
          youtube_url: data.youtube_url || '',
          reddit_url: data.reddit_url || ''
        });
      }
    };
    loadSocialMedia();
  }, []);

  const fallbackArticle = useMemo(() => {
    return StorageService.getArticleBySlug(slug) || StorageService.getArticles()[0] || null;
  }, [slug]);

  const [article, setArticle] = useState<Article | null>(fallbackArticle);
  const [isArticleLoading, setIsArticleLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsArticleLoading(true);
    setArticle(fallbackArticle);
    ApiService.fetchArticleBySlug(slug)
      .then((freshArticle) => {
        if (isMounted) {
          setArticle(freshArticle || fallbackArticle);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsArticleLoading(false);
        }
      }
    );
    return () => {
      isMounted = false;
    };
  }, [fallbackArticle, slug]);

  const [currentViews, setCurrentViews] = useState<number>(article?.views || 0);

  useEffect(() => {
    if (article?.id) {
      const liveViews = StorageService.incrementArticleViews(article.id);
      setCurrentViews(liveViews);
    }
  }, [article?.id]);

  useEffect(() => {
    if (!article) {
      setFaqs([]);
      return;
    }
    if (Array.isArray(article?.faqs) && article.faqs.length > 0) {
      setFaqs(article.faqs);
    } else {
      const loadArticleFaqs = async () => {
        try {
          const response = await apiFetch(`/articles/${article.id}/faqs`);
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              setFaqs(data);
            }
          }
        } catch (error) {
          setFaqs([]);
        }
      };
      loadArticleFaqs();
    }
  }, [article]);

  const allArticles = useMemo(() => {
    return StorageService.getArticles().filter(a => a.status === 'published');
  }, []);

  const trendingArticles = useMemo(() => {
    return [...allArticles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  }, [allArticles]);

  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return allArticles
      .filter(a => a.id !== article.id && a.categoryId === article.categoryId)
      .slice(0, 3);
  }, [allArticles, article]);

  const currentIndex = article ? allArticles.findIndex(a => a.id === article.id) : -1;
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : undefined;
  const nextArticle = currentIndex >= 0 && currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);

    if (article) {
      const domain = window.location.origin;
      const canonicalUrl = article.canonicalUrl || `${domain}/article/${article.slug}`;

      SeoService.updateMetaTags(
        article.seoTitle || `${article.title} | The Stock Times`,
        article.seoDescription || article.excerpt,
        article.featuredImage,
        `${domain}/article/${article.slug}`,
        canonicalUrl
      );

      SeoService.injectJsonLd([
        SeoService.generateArticleSchema(article),
        ...(SeoService.generateFaqSchema(faqs) ? [SeoService.generateFaqSchema(faqs)!] : []),
        SeoService.generateBreadcrumbSchema([
          { name: article.categoryId.replace('-', ' ').toUpperCase(), url: `/${article.categoryId}` },
          { name: article.title, url: `/article/${article.slug}` }
        ])
      ]);
    }
  }, [slug, article, faqs]);

  useEffect(() => {
    const container = document.querySelector('.article-body');
    if (container) {
      const headings = container.querySelectorAll('h2, h3');
      headings.forEach((el, index) => {
        const text = el.textContent || `section-${index + 1}`;
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        el.id = id;
      });
    }

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug, article?.content]);

  const estimatedReadTime = useMemo(() => {
    if (!article?.content) return '4 min read';
    const text = article.content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).length;
    const mins = Math.max(1, Math.round(words / 200));
    return `${mins} min read`;
  }, [article?.content]);

  const containerThemeClasses = useMemo(() => {
    if (readingTheme === 'dark') {
      return {
        pageBg: 'bg-[#0B1220] text-[#E5E7EB]',
        cardBg: 'bg-[#0F172A] border-[#1E293B]',
        toolbarBg: 'bg-[#0B1220]/95 border-[#1E293B] text-[#E5E7EB]',
        textClass: 'text-[#E5E7EB]',
        leadTextClass: 'text-slate-300',
        metaTextClass: 'text-slate-400',
        pillBg: 'bg-[#111827] border-[#1E293B] text-slate-300'
      };
    }
    if (readingTheme === 'sepia') {
      return {
        pageBg: 'bg-[#F7F2E7] text-[#2C2216]',
        cardBg: 'bg-[#FFFDF7] border-[#E8DEC9]',
        toolbarBg: 'bg-[#F2ECE0]/95 border-[#E2D5BE] text-[#2C2216]',
        textClass: 'text-[#2C2216]',
        leadTextClass: 'text-[#4A3B2C]',
        metaTextClass: 'text-[#6E5843]',
        pillBg: 'bg-[#EFE7D8] border-[#DFD3BF] text-[#2C2216]'
      };
    }
    return {
      pageBg: 'bg-[#F8FAFC] text-[#111827]',
      cardBg: 'bg-white border-[#E2E8F0]',
      toolbarBg: 'bg-white/95 border-[#E2E8F0] text-[#0B1F33]',
      textClass: 'text-[#1E293B]',
      leadTextClass: 'text-slate-600',
      metaTextClass: 'text-slate-500',
      pillBg: 'bg-slate-100 border-slate-200 text-slate-700'
    };
  }, [readingTheme]);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-3">
          <h1 className="text-2xl font-extrabold text-[#0B1F33] font-serif">
            {isArticleLoading ? 'Loading article...' : 'Article not found'}
          </h1>
          <p className="text-sm text-slate-500">
            {isArticleLoading ? 'Please wait while we fetch the latest published version.' : 'This article may be unpublished, deleted, or the URL may be incorrect.'}
          </p>
          {!isArticleLoading && (
            <button
              onClick={() => onNavigate('home')}
              className="mt-3 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-500 transition-colors"
            >
              Back to Home
            </button>
          )}
        </div>
      </div>
    );
  }

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedUpdatedDate = article.updatedAt ? new Date(article.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : undefined;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareTitle = encodeURIComponent(article.title);
  const shareUrl = encodeURIComponent(window.location.href);

  const fontSizeClassMap = {
    normal: isReadingModeActive
      ? 'text-[17px] sm:text-[19px] leading-[1.88] tracking-normal'
      : 'text-[#111827] text-[15px] sm:text-base leading-[1.78]',
    large: isReadingModeActive
      ? 'text-[19px] sm:text-[21px] leading-[1.92] tracking-normal'
      : 'text-[#111827] text-base sm:text-lg leading-[1.82]',
    xlarge: isReadingModeActive
      ? 'text-[21px] sm:text-[24px] leading-[1.98] tracking-normal'
      : 'text-[#111827] text-lg sm:text-xl leading-[1.88]'
  };

  return (
    <article className={`min-h-screen pb-20 transition-colors duration-300 ${
      isReadingModeActive ? containerThemeClasses.pageBg : (readingTheme === 'dark' ? 'bg-[#0B1220] text-[#E5E7EB]' : 'bg-[#F8FAFC] text-[#111827]')
    }`}>

      {/* Top Reading Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200/40 z-50 pointer-events-none">
        <div
          style={{ width: `${scrollProgress}%` }}
          className="h-full bg-[#16A34A] transition-all duration-75 shadow-sm"
        ></div>
      </div>

      {/* Sticky Compact Reading Toolbar */}
      {isReadingModeActive ? (
        /* Reading Mode Sticky Toolbar */
        <div className={`sticky top-0 z-[50] border-b py-2.5 px-4 sm:px-8 transition-colors duration-300 backdrop-blur-md shadow-sm ${containerThemeClasses.toolbarBg}`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 text-xs font-sans">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => toggleReadingMode(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                title="Exit Reading Mode (Press Escape)"
              >
                <X className="w-4 h-4" />
                <span>Exit Reading Mode</span>
                <span className="hidden sm:inline font-mono opacity-80 text-[10px] ml-1 bg-red-700/60 px-1.5 py-0.5 rounded">ESC</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold opacity-75">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Focus View · {estimatedReadTime}</span>
              </div>
            </div>

            <div className="hidden md:block font-serif font-bold text-xs truncate max-w-xs lg:max-w-sm opacity-80">
              {article.title}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Font Size Selector */}
              <div className={`flex items-center p-1 rounded-lg border text-[11px] font-bold ${containerThemeClasses.pillBg}`}>
                <Type className="w-3.5 h-3.5 mr-1 opacity-60" />
                <button
                  onClick={() => setFontSizeLevel('normal')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${fontSizeLevel === 'normal' ? 'bg-[#155EEF] text-white' : 'opacity-60 hover:opacity-100'}`}
                >
                  1X
                </button>
                <button
                  onClick={() => setFontSizeLevel('large')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${fontSizeLevel === 'large' ? 'bg-[#155EEF] text-white' : 'opacity-60 hover:opacity-100'}`}
                >
                  1.2X
                </button>
                <button
                  onClick={() => setFontSizeLevel('xlarge')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${fontSizeLevel === 'xlarge' ? 'bg-[#155EEF] text-white' : 'opacity-60 hover:opacity-100'}`}
                >
                  1.5X
                </button>
              </div>

              {/* Themes: Light, Sepia, Dark */}
              <div className={`flex items-center p-1 rounded-lg border text-[11px] font-bold ${containerThemeClasses.pillBg}`}>
                <button
                  onClick={() => setReadingTheme('light')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${readingTheme === 'light' ? 'bg-[#155EEF] text-white shadow-xs' : 'opacity-70 hover:opacity-100'}`}
                  title="Light Theme"
                >
                  Light
                </button>
                <button
                  onClick={() => setReadingTheme('sepia')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${readingTheme === 'sepia' ? 'bg-[#926027] text-white shadow-xs' : 'opacity-70 hover:opacity-100 text-amber-800'}`}
                  title="Sepia Paper Theme (Easy on eyes)"
                >
                  Sepia
                </button>
                <button
                  onClick={() => setReadingTheme('dark')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${readingTheme === 'dark' ? 'bg-[#155EEF] text-white shadow-xs' : 'opacity-70 hover:opacity-100'}`}
                  title="Dark Theme"
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Sticky Toolbar with Reading Mode Button */
        <div className={`sticky top-[116px] lg:top-[142px] z-[40] border-b py-2 px-4 sm:px-8 transition-colors duration-300 backdrop-blur-md ${
          readingTheme === 'dark' ? 'bg-[#0B1220]/90 border-[#1E293B] text-[#E5E7EB]' : 'bg-white/90 border-[#E2E8F0] text-[#0B1F33]'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs font-sans">
            
            <button
              onClick={() => onNavigate(article.categoryId)}
              className="flex items-center gap-1.5 font-bold hover:text-[#16A34A] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to {article.categoryId.replace('-', ' ')}</span>
              <span className="sm:hidden">Back</span>
            </button>

            {/* Reading Controls */}
            <div className="flex items-center gap-3">
              {/* Reading Mode Button */}
              <button
                onClick={() => toggleReadingMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer hover:shadow"
                title="Enter Reading Mode (Hides sidebars, ads, and navigation for distraction-free reading)"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Reading Mode</span>
              </button>

              <div className={`flex items-center p-1 rounded-lg border text-[11px] font-bold ${
                readingTheme === 'dark' ? 'bg-[#111827] border-[#1E293B]' : 'bg-slate-100 border-slate-200'
              }`}>
                <Type className="w-3.5 h-3.5 mr-1 text-slate-400" />
                <button
                  onClick={() => setFontSizeLevel('normal')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${fontSizeLevel === 'normal' ? 'bg-[#155EEF] text-white' : 'text-slate-500'}`}
                >
                  1X
                </button>
                <button
                  onClick={() => setFontSizeLevel('large')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${fontSizeLevel === 'large' ? 'bg-[#155EEF] text-white' : 'text-slate-500'}`}
                >
                  1.2X
                </button>
                <button
                  onClick={() => setFontSizeLevel('xlarge')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${fontSizeLevel === 'xlarge' ? 'bg-[#155EEF] text-white' : 'text-slate-500'}`}
                >
                  1.5X
                </button>
              </div>

              <button
                onClick={() => setReadingTheme(readingTheme === 'light' ? 'dark' : 'light')}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 font-bold ${
                  readingTheme === 'dark' ? 'bg-[#111827] border-[#1E293B] text-amber-300' : 'bg-slate-100 border-slate-200 text-[#0B1F33]'
                }`}
                title="Toggle Light / Dark Reading Mode"
              >
                {readingTheme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-300" />
                    <span className="text-[10px] hidden sm:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-[#0B1F33]" />
                    <span className="text-[10px] hidden sm:inline">Dark</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Header Container - #071f33 Deep Navy Editorial Header */}
      <header className="bg-[#071f33] text-white py-8 border-b border-slate-800/90 shadow-xl">
        <div className={`${isReadingModeActive ? 'max-w-4xl' : 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8 font-sans`}>

          {/* Breadcrumb Navigation (Hidden in Reading Mode to Eliminate Navigation Clutter) */}
          {!isReadingModeActive && (
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 mb-4 font-sans flex-wrap">
              <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer font-bold">HOME</button>
              <span className="text-slate-500">/</span>
              <button onClick={() => onNavigate(article.categoryId)} className="hover:text-[#16A34A] uppercase transition-colors cursor-pointer font-bold">
                {article.categoryId.replace('-', ' ')}
              </button>
              <span className="text-slate-500">/</span>
              <span className="text-slate-200 truncate max-w-[200px] sm:max-w-md font-medium">{article.title}</span>
            </div>
          )}

          {/* Category Tag & Research Badge */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-block bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 font-extrabold text-xs uppercase tracking-widest px-3 py-1 rounded-full shadow-sm font-sans">
              [{article.subCategory || article.categoryId.replace('-', ' ')}]
            </span>
            {article.isTrending && (
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full font-sans">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Featured Research
              </span>
            )}
            {/* Reading Mode Button in Editorial Header */}
            {!isReadingModeActive ? (
              <button
                onClick={() => toggleReadingMode(true)}
                className="inline-flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500 hover:text-white text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full font-sans transition-all cursor-pointer"
                title="Switch to Distraction-Free Reading Mode"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reading Mode</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full font-sans">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Focus Reading Mode Active</span>
              </span>
            )}
          </div>

          {/* Article Title */}
          <h1 
            style={{ textWrap: 'balance' }}
            className="text-[24px] sm:text-[32px] lg:text-[38px] font-extrabold tracking-tight text-white leading-[1.12] my-3 font-serif max-w-4xl"
          >
            {article.title}
          </h1>

          {/* Article Subheading / Excerpt Box */}
          <div className="max-w-4xl my-4 p-4 border-l-4 border-[#16A34A] bg-white/[0.03] rounded-r-xl font-sans">
            <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Publication Metadata Row */}
          <div className="max-w-4xl flex flex-wrap items-center justify-between gap-4 pt-4 mt-6 border-t border-white/10 text-xs sm:text-sm font-sans">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#16A34A] bg-white/10 text-[#16A34A] flex items-center justify-center shadow-sm shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white block text-sm sm:text-base">
                  The Stock Times
                </span>
                <span className="text-slate-400 text-xs font-mono block">Editorial Desk</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-300 font-medium font-mono text-xs sm:text-sm">
              {article.showPublishedDate !== false && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Published {formattedDate}</span>
                </span>
              )}
              {formattedUpdatedDate && (
                <>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">
                    Updated {formattedUpdatedDate}
                  </span>
                </>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Main Publication Reading Container */}
      <div className={`${isReadingModeActive ? 'max-w-4xl' : 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 font-sans`}>
        <div className={isReadingModeActive ? 'max-w-3xl mx-auto space-y-8' : 'grid grid-cols-1 lg:grid-cols-12 gap-10 items-start'}>

          {/* 1. MAIN CONTENT COLUMN (Expanded to 100% centered in Reading Mode, 70% width in standard view) */}
          <main className={`${isReadingModeActive ? 'w-full space-y-8' : 'lg:col-span-8 space-y-7'} min-w-0`}>

            {/* AD 1: Top Article Responsive Unit in Fixed-Height Wrapper (Hidden in Reading Mode) */}
            {!isReadingModeActive && (
              <ResponsiveAdContainer placement="article_top" format="leaderboard" label="ADVERTISEMENT" />
            )}

            {/* Featured Image Box */}
            <div className={`rounded-2xl overflow-hidden shadow-sm border ${
              isReadingModeActive ? containerThemeClasses.cardBg : (readingTheme === 'dark' ? 'bg-[#111827] border-[#1E293B]' : 'bg-white border-[#E2E8F0]')
            }`}>
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full aspect-[16/9] object-cover"
              />
              {(article.imageCaption || article.imageSource) && (
                <div className={`p-3 text-center text-xs font-medium border-t italic font-sans flex flex-col sm:flex-row items-center justify-between gap-2 ${
                  isReadingModeActive ? containerThemeClasses.leadTextClass : (readingTheme === 'dark' ? 'bg-[#111827] border-[#1E293B] text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500')
                }`}>
                  <span>{article.imageCaption || article.title}</span>
                  {article.imageSource && (
                    <span className="font-mono text-[11px] not-italic opacity-80">
                      Source / Credit: {article.imageSource}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* AD 2: Responsive Unit Below Featured Image in Fixed-Height Wrapper (Hidden in Reading Mode) */}
            {!isReadingModeActive && (
              <ResponsiveAdContainer placement="article-after-intro" format="in-feed" label="ADVERTISEMENT" />
            )}

            {/* ⚡ 60-Second Finance Shorts / Quick Byte */}
            {article.shorts && (
              <div className="p-6 rounded-3xl border shadow-lg space-y-3 font-sans bg-gradient-to-br from-[#0B1F33] via-slate-900 to-emerald-950 text-white border-emerald-500/30">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h3 className="text-sm font-extrabold tracking-wide uppercase text-emerald-400 font-sans">
                      ⚡ 60-Second Shorts / Quick Byte
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                    Fast Read Mode
                  </span>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-normal">
                  {article.shorts}
                </p>
                {Array.isArray(article.shortsBullets) && article.shortsBullets.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs text-slate-300">
                    {article.shortsBullets.map((b, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">▶</span>
                        <span className="leading-snug">{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AI-Powered Summary Box */}
            <div className="p-6 rounded-3xl border shadow-md space-y-4 font-sans bg-[#064E3B] border-[#065F46] text-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/15 text-white flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4 fill-white" />
                  </div>
                  <h3 className="text-sm font-extrabold font-serif text-white">AI-Powered Summary</h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/25">
                  Verified Key Takeaways
                </span>
              </div>

              {/* 3 to 5 Key Points */}
              <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                {(article.highlights && article.highlights.length > 0 ? article.highlights : [
                  'Institutional stock breakdowns and central bank policy updates analyzed in depth.',
                  'Comprehensive financial projections with risk factors and yield considerations.',
                  'Key market benchmarks, sector rotation trends, and regulatory updates summarized for investors.'
                ]).slice(0, 5).map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white/15 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="leading-relaxed text-white">{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                <button
                  onClick={() => {
                    const el = document.querySelector('.article-body');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 font-bold text-white hover:text-emerald-100 hover:underline cursor-pointer"
                >
                  <span>Read Full Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* AD 3: Responsive Rectangle Unit in Fixed-Height Wrapper After AI Summary (Hidden in Reading Mode) */}
            {!isReadingModeActive && (
              <ResponsiveAdContainer placement="article-after-content" format="rectangle" label="ADVERTISEMENT" />
            )}

            {/* Horizontal Social Share Bar (Hidden in Reading Mode to Maintain Pure Focus) */}
            {!isReadingModeActive && (
              <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border shadow-sm text-xs font-sans ${
                readingTheme === 'dark' ? 'bg-[#111827] border-[#1E293B] text-white' : 'bg-white border-[#E2E8F0] text-[#0B1F33]'
              }`}>
                <span className="font-bold flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#16A34A]" /> Share this publication:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200 hover:bg-emerald-100 transition-all font-bold flex items-center gap-1.5 cursor-pointer"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`https://facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-[#155EEF] hover:bg-blue-50 transition-all cursor-pointer"
                    title="Share on Twitter/X"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-all cursor-pointer"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:text-[#16A34A] hover:bg-emerald-50 transition-all cursor-pointer flex items-center gap-1 font-bold"
                    title="Copy link"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Rich Article HTML Body Render (Pure text without in-article injected ads in Reading Mode) */}
            <div className={`p-6 sm:p-10 md:p-12 rounded-3xl border shadow-xs transition-colors ${
              isReadingModeActive ? containerThemeClasses.cardBg : (readingTheme === 'dark' ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]')
            }`}>
              <div
                className={`article-body max-w-none space-y-6 font-sans ${fontSizeClassMap[fontSizeLevel]} ${
                  isReadingModeActive ? containerThemeClasses.textClass : (readingTheme === 'dark' ? 'text-[#E5E7EB]' : 'text-[#1E293B]')
                }`}
                dangerouslySetInnerHTML={{
                  __html: isReadingModeActive ? article.content : AdService.insertInArticleAds(article.content)
                }}
              />
            </div>

            {/* AD 4: Middle Paragraph Responsive Unit in Fixed-Height Wrapper (Hidden in Reading Mode) */}
            {!isReadingModeActive && (
              <ResponsiveAdContainer placement="article_mid" format="rectangle" label="ADVERTISEMENT" />
            )}

            {/* Reading Mode Completion Card */}
            {isReadingModeActive && (
              <div className={`p-8 rounded-3xl border text-center space-y-4 shadow-sm ${containerThemeClasses.cardBg}`}>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center font-bold">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif">You have finished this article</h3>
                  <p className={`text-xs sm:text-sm mt-1 max-w-md mx-auto ${containerThemeClasses.leadTextClass}`}>
                    You read "{article.title}" in distraction-free Reading Mode.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <button
                    onClick={() => toggleReadingMode(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Exit Reading Mode
                  </button>
                  {nextArticle && (
                    <button
                      onClick={() => onNavigate(nextArticle.categoryId, nextArticle.slug)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 font-extrabold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Read Next: {nextArticle.title.slice(0, 35)}...</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Back to Top
                  </button>
                </div>
              </div>
            )}

            {/* Article Tags Pills */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-400 mr-1">Tags:</span>
                {article.tags.map(t => (
                  <button
                    key={t}
                    onClick={() => onNavigate('search', t)}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    #{t}
                  </button>
                ))}
              </div>
            )}

            {/* Prev / Next Article Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200 font-sans">
              {prevArticle ? (
                <div
                  onClick={() => onNavigate(prevArticle.categoryId, prevArticle.slug)}
                  className={`p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-1 ${
                    isReadingModeActive ? containerThemeClasses.cardBg : (readingTheme === 'dark' ? 'bg-[#111827] border-[#1E293B] hover:border-[#155EEF]' : 'bg-white border-[#E2E8F0] hover:border-[#155EEF]')
                  }`}
                >
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous Article
                  </span>
                  <h4 className="text-xs font-bold group-hover:text-[#155EEF] transition-colors line-clamp-1 font-serif">
                    {prevArticle.title}
                  </h4>
                </div>
              ) : <div />}

              {nextArticle && (
                <div
                  onClick={() => onNavigate(nextArticle.categoryId, nextArticle.slug)}
                  className={`p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-1 text-right ${
                    isReadingModeActive ? containerThemeClasses.cardBg : (readingTheme === 'dark' ? 'bg-[#111827] border-[#1E293B] hover:border-[#155EEF]' : 'bg-white border-[#E2E8F0] hover:border-[#155EEF]')
                  }`}
                >
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center justify-end gap-1">
                    Next Article <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-bold group-hover:text-[#155EEF] transition-colors line-clamp-1 font-serif">
                    {nextArticle.title}
                  </h4>
                </div>
              )}
            </div>

            {/* AD 5: Bottom Article Responsive Unit in Fixed-Height Wrapper (Hidden in Reading Mode) */}
            {!isReadingModeActive && (
              <ResponsiveAdContainer placement="article_bottom" format="leaderboard" label="ADVERTISEMENT" />
            )}

            {/* High-Engagement Trending Stories (Hidden in Reading Mode) */}
            {!isReadingModeActive && (
              <TrendingArticles
                currentArticleId={article.id}
                onNavigate={onNavigate}
                limit={6}
                layout="inline"
                title="Trending Finance & Market Stories"
                subtitle="High-engagement articles curated to keep you ahead in the market"
              />
            )}

            {/* Article FAQs Accordion */}
            {faqs.length > 0 && (
              <section className={`rounded-3xl border p-6 sm:p-8 shadow-sm font-sans ${
                isReadingModeActive ? containerThemeClasses.cardBg : (readingTheme === 'dark' ? 'bg-[#111827] border-[#1E293B] text-white' : 'bg-white border-[#E2E8F0] text-[#0B1F33]')
              }`}>
                <div className="mb-6">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#16A34A]">
                    FAQ ACCORDION
                  </span>
                  <h2 className="text-xl font-extrabold font-serif mt-1">
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <details
                      key={faq.id || `${faq.question}-${index}`}
                      className={`group rounded-xl border p-4 ${
                        isReadingModeActive
                          ? (readingTheme === 'dark' ? 'border-[#334155] bg-[#0F172A]' : 'border-slate-200 bg-slate-50/50')
                          : (readingTheme === 'dark' ? 'border-[#334155] bg-[#0F172A]' : 'border-slate-200 bg-slate-50')
                      }`}
                    >
                      <summary className="cursor-pointer list-none font-bold text-sm flex items-center justify-between gap-4">
                        <span>{faq.question}</span>
                        <span className="text-[#16A34A] text-lg group-open:rotate-45 transition-transform">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-xs leading-relaxed text-slate-500">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}

          </main>

          {/* 2. RIGHT SIDEBAR (~30% width = 4 cols - Sticky) (Hidden in Reading Mode to Ensure Pure Focus) */}
          {!isReadingModeActive && (
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-[120px] self-start font-sans min-w-0">

              {/* Top Sidebar Responsive Ad Unit in Fixed-Height Wrapper */}
              <ResponsiveAdContainer placement="article_sidebar" format="sidebar" label="ADVERTISEMENT" />

              {/* Trending Articles Component (Positioned Directly Beneath Sidebar Ad Placement) */}
              <TrendingArticles
                currentArticleId={article.id}
                onNavigate={onNavigate}
                limit={5}
                layout="sidebar"
                title="Trending Articles"
              />

              {/* Newsletter Subscription Box */}
              <NewsletterBox onNavigate={onNavigate} />

              {/* Recommended Sidebar Articles Widget */}
              <SidebarRecommendedArticles
                currentArticle={article}
                onNavigate={onNavigate}
                limit={5}
              />

            </aside>
          )}

        </div>

        {/* 3. RELATED ARTICLES (3-Column Grid) (Hidden in Reading Mode) */}
        {!isReadingModeActive && relatedArticles.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200 space-y-8 font-sans">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#155EEF] block">RECOMMENDED READS</span>
                <h3 className={`text-xl font-extrabold tracking-tight font-serif ${
                  readingTheme === 'dark' ? 'text-white' : 'text-[#0B1F33]'
                }`}>
                  Related Finance Articles
                </h3>
              </div>
              <button
                onClick={() => onNavigate(article.categoryId)}
                className="text-xs font-bold text-[#155EEF] hover:underline cursor-pointer"
              >
                View Category Hub →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {relatedArticles.map(art => (
                <div key={art.id} className="h-full">
                  <ArticleCard article={art} onNavigate={onNavigate} layout="standard" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. LATEST ARTICLES RECOMMENDATIONS (Hidden in Reading Mode) */}
        {!isReadingModeActive && (
          <LatestArticlesSection
            title="More Latest Financial News & Market Insights"
            subtitle="Explore recent market breakdowns, personal finance strategies, and research."
            limit={4}
            excludeId={article.id}
            onNavigate={onNavigate}
          />
        )}

      </div>

    </article>
  );
};
