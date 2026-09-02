import React, { useEffect, useState, useMemo } from 'react';
import { StorageService } from '../services/storageService';
import { SeoService } from '../services/seoService';
import { AdService } from '../services/adService';
import { ApiService } from '../services/apiService';
import { TableOfContents } from '../components/articles/TableOfContents';
import { ArticleCard } from '../components/articles/ArticleCard';
import { AdSlot } from '../components/ads/AdSlot';
import { CommentsSection } from '../components/articles/CommentsSection';
import { LatestArticlesSection } from '../components/articles/LatestArticlesSection';
import { SidebarRecommendedArticles } from '../components/articles/SidebarRecommendedArticles';
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
  ShieldAlert,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Eye,
  CheckCircle2,
  Sun,
  Moon,
  Type,
  ArrowLeft,
  UserPlus,
  UserCheck,
  ArrowRight,
  ExternalLink,
  Flame
} from 'lucide-react';
import { Article } from '../types';

interface ArticleDetailPageProps {
  slug: string;
  onNavigate: (route: string, param?: string) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({ slug, onNavigate }) => {
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [readingTheme, setReadingTheme] = useState<'light' | 'dark'>('light');
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [followingAuthor, setFollowingAuthor] = useState(false);
  const [faqs, setFaqs] = useState<{ id: string; question: string; answer: string }[]>([]);

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

  const article = useMemo(() => {
    return StorageService.getArticleBySlug(slug) || StorageService.getArticles()[0];
  }, [slug]);

  const [currentViews, setCurrentViews] = useState<number>(article?.views || 0);

  // Author dynamic lookup state for instant avatar sync
  const [author, setAuthor] = useState(() => StorageService.getAuthorById(article.authorId) || StorageService.getAuthors()[0]);

  useEffect(() => {
    if (article?.id) {
      const liveViews = StorageService.incrementArticleViews(article.id);
      setCurrentViews(liveViews);
    }
  }, [article.id]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      if (article?.authorId) {
        const freshAuthor = StorageService.getAuthorById(article.authorId) || StorageService.getAuthors()[0];
        setAuthor(freshAuthor);
      }
    };
    window.addEventListener('user-profile-updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, [article.authorId]);

  useEffect(() => {
    const loadArticleFaqs = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/articles/${article.id}/faqs`);
        if (response.ok) {
          const data = await response.json();
          setFaqs(data);
        }
      } catch (error) {
        setFaqs([]);
      }
    };
    loadArticleFaqs();
  }, [article.id]);

  const allArticles = useMemo(() => {
    return StorageService.getArticles().filter(a => a.status === 'published');
  }, []);

  const trendingArticles = useMemo(() => {
    return [...allArticles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  }, [allArticles]);

  const relatedArticles = useMemo(() => {
    return allArticles
      .filter(a => a.id !== article.id && a.categoryId === article.categoryId)
      .slice(0, 3);
  }, [allArticles, article]);

  const currentIndex = allArticles.findIndex(a => a.id === article.id);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : undefined;
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);

    if (article) {
      const domain = window.location.origin;
      const canonicalUrl = article.canonicalUrl || `${domain}/article/${article.slug}`;

      SeoService.updateMetaTags(
        article.seoTitle || `${article.title} | The Stoce Times`,
        article.seoDescription || article.excerpt,
        article.featuredImage,
        `${domain}/article/${article.slug}`,
        canonicalUrl
      );

      SeoService.injectJsonLd([
        SeoService.generateArticleSchema(article, author),
        ...(SeoService.generateFaqSchema(faqs) ? [SeoService.generateFaqSchema(faqs)!] : []),
        SeoService.generateBreadcrumbSchema([
          { name: article.categoryId.replace('-', ' ').toUpperCase(), url: `/${article.categoryId}` },
          { name: article.title, url: `/article/${article.slug}` }
        ])
      ]);
    }
  }, [slug, article, author, faqs]);

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
  }, [slug, article.content]);

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
    normal: 'text-[#111827] text-base sm:text-lg leading-[1.85]',
    large: 'text-[#111827] text-lg sm:text-xl leading-[1.9]',
    xlarge: 'text-[#111827] text-xl sm:text-2xl leading-[1.95]'
  };

  return (
    <article className={`min-h-screen pb-20 transition-colors duration-300 ${
      readingTheme === 'dark' ? 'bg-[#0B1220] text-[#E5E7EB]' : 'bg-[#F8FAFC] text-[#111827]'
    }`}>

      {/* Top Reading Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200/40 z-50 pointer-events-none">
        <div
          style={{ width: `${scrollProgress}%` }}
          className="h-full bg-[#16A34A] transition-all duration-75 shadow-sm"
        ></div>
      </div>

      {/* Sticky Compact Reading Toolbar */}
      <div className={`sticky top-20 z-30 border-b py-2.5 px-4 sm:px-8 transition-colors duration-300 backdrop-blur-md ${
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

      {/* Header Container - #071f33 Deep Navy Editorial Header */}
      <header className="bg-[#071f33] text-white py-10 border-b border-slate-800/90 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 mb-4 font-sans flex-wrap">
            <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer font-bold">HOME</button>
            <span className="text-slate-500">/</span>
            <button onClick={() => onNavigate(article.categoryId)} className="hover:text-[#16A34A] uppercase transition-colors cursor-pointer font-bold">
              {article.categoryId.replace('-', ' ')}
            </button>
            <span className="text-slate-500">/</span>
            <span className="text-slate-200 truncate max-w-[200px] sm:max-w-md font-medium">{article.title}</span>
          </div>

          {/* Category Tag & Research Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 font-extrabold text-xs uppercase tracking-widest px-3 py-1 rounded-full shadow-sm font-sans">
              [{article.subCategory || article.categoryId.replace('-', ' ')}]
            </span>
            {article.isTrending && (
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full font-sans">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Featured Research
              </span>
            )}
          </div>

          {/* Article Title */}
          <h1 
            style={{ textWrap: 'balance' }}
            className="text-[30px] sm:text-[40px] lg:text-[48px] font-extrabold tracking-tight text-white leading-[1.1] my-3.5 font-serif max-w-4xl"
          >
            {article.title}
          </h1>

          {/* Article Subheading / Excerpt Box */}
          <div className="max-w-4xl my-4 p-4 border-l-4 border-[#16A34A] bg-white/[0.03] rounded-r-xl font-sans">
            <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Author & Article Metadata Row with Follow Button */}
          <div className="max-w-4xl flex flex-wrap items-center justify-between gap-4 pt-4 mt-6 border-t border-white/10 text-xs sm:text-sm font-sans">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => author && onNavigate('author', author.id)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                {author && (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#16A34A] shadow-sm shrink-0"
                  />
                )}
                {author && (
                  <div>
                    <span className="font-bold text-white group-hover:text-[#16A34A] transition-colors block text-sm sm:text-base">
                      {author.name} {author.credentials ? `(${author.credentials})` : ''}
                    </span>
                    <span className="text-slate-400 text-xs font-mono block">{author.role}</span>
                  </div>
                )}
              </div>

              {/* Follow Author Button */}
              <button
                onClick={() => setFollowingAuthor(!followingAuthor)}
                className={`ml-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                  followingAuthor
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
              >
                {followingAuthor ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-slate-950" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Follow Author</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-300 font-medium font-mono text-xs sm:text-sm">
              {article.showPublishedDate !== false && (
                <span>Published {formattedDate}</span>
              )}
              <span>·</span>
              <span>{article.readTimeMinutes} min read</span>
              <span>·</span>
              <span>{currentViews.toLocaleString()} views</span>
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

      {/* Main Publication Reading Container (70% Content / 30% Sidebar Grid) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* 1. MAIN CONTENT COLUMN (~70% width = 8 cols) */}
          <main className="lg:col-span-8 space-y-8">

            {/* AD 1: Top Article Ad Placement */}
            <AdSlot placement="article_top" />

            {/* Featured Image Box */}
            <div className={`rounded-2xl overflow-hidden shadow-md border ${
              readingTheme === 'dark' ? 'bg-[#111827] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
            }`}>
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full aspect-[16/9] object-cover"
              />
              {(article.imageCaption || article.imageSource) && (
                <div className={`p-3 text-center text-xs font-medium border-t italic font-sans flex flex-col sm:flex-row items-center justify-between gap-2 ${
                  readingTheme === 'dark' ? 'bg-[#111827] border-[#1E293B] text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
                }`}>
                  <span>{article.imageCaption || article.title}</span>
                  {article.imageSource && (
                    <span className="font-mono text-[11px] not-italic text-slate-400">
                      Source / Credit: {article.imageSource}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* AD 2: Ad Below Featured Image */}
            <AdSlot placement="article-after-intro" />

            {/* AI-Powered Summary Box */}
            <div className={`p-6 rounded-3xl border shadow-md space-y-4 font-sans ${
              readingTheme === 'dark' ? 'bg-emerald-950/40 border-emerald-800/60 text-white' : 'bg-emerald-50/60 border-emerald-200 text-[#0B1F33]'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#16A34A] text-white flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4 fill-white" />
                  </div>
                  <h3 className="text-base font-extrabold font-serif">AI-Powered Summary</h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#16A34A] bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
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
                    <span className="w-5 h-5 rounded-full bg-[#16A34A]/20 text-[#16A34A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="leading-relaxed text-slate-800 dark:text-slate-200">{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-emerald-200/50 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                <button
                  onClick={() => {
                    const el = document.querySelector('.article-body');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 font-bold text-[#155EEF] hover:underline cursor-pointer"
                >
                  <span>Read Full Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-slate-500 italic">
                  Disclaimer: This summary is AI-generated and reviewed for accuracy.
                </span>
              </div>
            </div>

            {/* AD 3: Ad After AI Summary */}
            <AdSlot placement="article-after-content" />

            {/* Horizontal Social Share Bar */}
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

            {/* Rich Article HTML Body Render */}
            <div
              className={`article-body max-w-none space-y-6 font-sans p-1 ${fontSizeClassMap[fontSizeLevel]} ${
                readingTheme === 'dark' ? 'text-[#E5E7EB]' : 'text-[#111827]'
              }`}
              dangerouslySetInnerHTML={{ __html: AdService.insertInArticleAds(article.content) }}
            />

            {/* AD 4: Middle Paragraph In-Feed Ad */}
            <AdSlot placement="article_mid" />

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

            {/* Financial & Regulatory Disclaimer */}
            <div className={`border rounded-2xl p-6 text-xs space-y-2.5 my-6 shadow-sm font-sans ${
              readingTheme === 'dark' ? 'bg-amber-950/40 border-amber-800/60 text-amber-200' : 'bg-[#FFFBEB] border-[#F59E0B] text-amber-950'
            }`}>
              <div className="flex items-center gap-2 font-bold text-amber-600 text-sm">
                <ShieldAlert className="w-4.5 h-4.5 text-[#F59E0B] shrink-0" />
                <span>Financial & Regulatory Disclaimer</span>
              </div>
              <p className="leading-relaxed font-normal">
                Disclaimer: Information provided on TheStoceTimes.com is strictly for educational and news reporting purposes only. Content does not constitute personal financial, tax, or investment advice. Always consult a certified financial planner before making major investment decisions.
              </p>
            </div>

            {/* Author Information Card */}
            {author && (
              <div className={`rounded-3xl p-6 sm:p-8 border shadow-sm flex flex-col sm:flex-row items-start gap-6 font-sans ${
                readingTheme === 'dark' ? 'bg-[#111827] border-[#1E293B] text-white' : 'bg-white border-[#E2E8F0] text-[#0B1F33]'
              }`}>
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#16A34A] shadow-sm shrink-0"
                />
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-extrabold font-serif">{author.name}</h3>
                      <span className="text-xs font-mono text-slate-400">{author.credentials || 'Senior Writer'}</span>
                    </div>

                    <button
                      onClick={() => setFollowingAuthor(!followingAuthor)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                        followingAuthor
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                      }`}
                    >
                      {followingAuthor ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-slate-950" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Follow Author</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">{author.bio}</p>
                </div>
              </div>
            )}

            {/* Prev / Next Article Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200 font-sans">
              {prevArticle ? (
                <div
                  onClick={() => onNavigate(prevArticle.categoryId, prevArticle.slug)}
                  className={`p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-1 ${
                    readingTheme === 'dark' ? 'bg-[#111827] border-[#1E293B] hover:border-[#155EEF]' : 'bg-white border-[#E2E8F0] hover:border-[#155EEF]'
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
                    readingTheme === 'dark' ? 'bg-[#111827] border-[#1E293B] hover:border-[#155EEF]' : 'bg-white border-[#E2E8F0] hover:border-[#155EEF]'
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

            {/* AD 5: Bottom Article Ad Placement */}
            <AdSlot placement="article_bottom" />

            {/* Comments Moderation Section */}
            <CommentsSection
              articleId={article.id}
              readingTheme={readingTheme}
            />

            {/* Article FAQs Accordion */}
            {faqs.length > 0 && (
              <section className={`rounded-3xl border p-6 sm:p-8 shadow-sm font-sans ${
                readingTheme === 'dark' ? 'bg-[#111827] border-[#1E293B] text-white' : 'bg-white border-[#E2E8F0] text-[#0B1F33]'
              }`}>
                <div className="mb-6">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#16A34A]">
                    FAQ ACCORDION
                  </span>
                  <h2 className="text-2xl font-extrabold font-serif mt-1">
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <details
                      key={faq.id}
                      className={`group rounded-xl border p-4 ${
                        readingTheme === 'dark' ? 'border-[#334155] bg-[#0F172A]' : 'border-slate-200 bg-slate-50'
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

          {/* 2. RIGHT SIDEBAR (~30% width = 4 cols - Sticky) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 self-start font-sans">

            {/* Table of Contents Widget */}
            <TableOfContents contentHtml={article.content} />

            {/* Managed Sidebar Ad */}
            <AdSlot placement="article_sidebar" />

            {/* Trending Articles Widget (Numbered 1 to 5) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h3 className="font-extrabold text-base text-[#0B1F33] font-serif">Trending Articles</h3>
              </div>

              <div className="space-y-3">
                {trendingArticles.map((art, idx) => (
                  <div
                    key={art.id}
                    onClick={() => onNavigate(art.categoryId, art.slug)}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-extrabold text-xs flex items-center justify-center shrink-0 group-hover:bg-[#155EEF] group-hover:text-white transition-colors">
                      {idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-[#0B1F33] group-hover:text-[#155EEF] transition-colors line-clamp-2 font-serif leading-snug">
                        {art.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">{(art.views || 0).toLocaleString()} reads</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Subscription Box */}
            <NewsletterBox onNavigate={onNavigate} />

            {/* Recommended Sidebar Articles Widget */}
            <SidebarRecommendedArticles
              currentArticle={article}
              onNavigate={onNavigate}
              limit={5}
            />

          </aside>

        </div>

        {/* 3. RELATED ARTICLES (3-Column Grid) */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200 space-y-8 font-sans">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#155EEF] block">RECOMMENDED READS</span>
                <h3 className={`text-2xl font-extrabold tracking-tight font-serif ${
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

        {/* 4. LATEST ARTICLES RECOMMENDATIONS */}
        <LatestArticlesSection
          title="More Latest Financial News & Market Insights"
          subtitle="Explore recent market breakdowns, personal finance strategies, and research."
          limit={4}
          excludeId={article.id}
          onNavigate={onNavigate}
        />

      </div>

    </article>
  );
};
