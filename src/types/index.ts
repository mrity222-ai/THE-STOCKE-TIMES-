export type CategoryId = 'stock-market' | 'personal-finance' | 'banking' | 'investment' | 'finance-news' | string;

export interface Category {
  id: CategoryId;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image?: string;
  subcategories: string[];
  articleCount?: number;
  totalViews?: number;
  status?: 'active' | 'archived';
  growth?: string;
}

export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  credentials: string; // e.g. CFA, CFP, MBA Finance
  articleCount?: number;
  totalViews?: number;
  twitter?: string;
  linkedin?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  categoryId: CategoryId;
  subCategory?: string;
  featuredImage: string;
  imageCaption?: string;
  imageSource?: string;
  excerpt: string;
  content: string; // HTML formatted content
  highlights: string[]; // Important points / AI Summary key points
  aiSummary?: string[];
  galleryImages?: ArticleImage[];
  faqs?: { id: string; question: string; answer: string }[];
  sources?: string[];
  authorId: string;
  publishedAt: string; // ISO date string
  showPublishedDate?: boolean;
  updatedAt?: string;
  scheduledDate?: string;
  readTimeMinutes: number;
  isFeatured?: boolean; // Hero featured
  isTrending?: boolean; // Sidebar/Trending list
  isPopular?: boolean;
  status: 'published' | 'draft' | 'scheduled' | 'pending';
  tags: string[];
  views: number;

  // Advanced SEO Fields
  seoTitle?: string;
  seoDescription?: string;
  focusKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  socialShareImage?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size?: string;
  uploadedAt: string;
  dimensions?: string;
  altText?: string;
  type?: 'image' | 'video' | 'document';
}

export interface TagItem {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
}

export interface CommentItem {
  id: string;
  articleId: string;
  articleTitle: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'spam';
}

export interface SiteSettings {
  websiteName: string;
  logoUrl: string;
  faviconUrl: string;
  description: string;
  contactEmail: string;
  timezone: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  googleAnalyticsId: string;
  googleSearchConsole: string;
  enableComments: boolean;
  notifyOnNewComment: boolean;
  twitterHandle: string;
  linkedinUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  enableYahooFinanceApi?: boolean; // ON / OFF Toggle for Yahoo Finance API Live Streaming

  // SMTP Mail Server Configuration
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  smtpFromName?: string;
  smtpSecure?: boolean;
}

export interface AnalyticsSummary {
  totalVisitors: string;
  pageViews: string;
  avgReadingTime: string;
  bounceRate: string;
  trafficOverTime: { date: string; views: number; visitors: number }[];
  topSources: { source: string; percentage: number }[];
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}

export interface FilterOptions {
  categoryId?: CategoryId | 'all';
  searchQuery?: string;
  tag?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'readTime';
}

export interface UserAccount {
  id: string; // e.g. "usr-1741234567"
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: 'admin' | 'author';
  status: 'active' | 'inactive';
  bio?: string;
  credentials?: string;
  createdAt: string;
}

export interface LegalPageRevision {
  id: string;
  updatedAt: string;
  updatedBy: string;
  title: string;
  content: string;
}

export interface LegalPageItem {
  id: string; // 'privacy' | 'terms' | 'disclaimer' | 'cookies' | 'editorial' | 'corrections' | 'refund' | 'guidelines' | 'about' | 'contact'
  slug: string;
  title: string;
  content: string; // HTML format
  seoTitle?: string;
  seoDescription?: string;
  status: 'published' | 'draft';
  updatedAt: string;
  revisions?: LegalPageRevision[];
}

export interface ArticleImage {
  id: string;
  url: string;
  title?: string;
  caption?: string;
  altText?: string;
  sourceCredit?: string;
  order: number;
}

export interface Subscriber {
  id: string; // e.g. "sub-987654"
  email: string;
  subscriptionDate: string;
  verificationStatus: 'Verified' | 'Pending';
  status: 'Active' | 'Unsubscribed';
  lastEmailSentDate?: string;
}
