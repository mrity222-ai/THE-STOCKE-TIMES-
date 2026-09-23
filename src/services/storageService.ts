import { Article, Author, Category, TagItem, MarketIndex, CommentItem, SiteSettings, AnalyticsSummary, UserAccount, Subscriber, LegalPageItem, PopupNotificationSettings } from '../types';
import { INITIAL_ARTICLES, INITIAL_AUTHORS, INITIAL_CATEGORIES, INITIAL_MARKET_INDICES } from '../data/initialData';
import { adminApiFetch, apiFetch } from './apiConfig';

const ARTICLES_STORAGE_KEY = 'finance_pulse_articles_v3';
const AUTHORS_STORAGE_KEY = 'finance_pulse_authors_v3';
const CATEGORIES_STORAGE_KEY = 'finance_pulse_categories_v3';
const TAGS_STORAGE_KEY = 'finance_pulse_tags_v3';
const COMMENTS_STORAGE_KEY = 'finance_pulse_comments_v3';
const SETTINGS_STORAGE_KEY = 'finance_pulse_settings_v3';
const SUBSCRIBERS_STORAGE_KEY = 'finance_pulse_subscribers_v4';
const POPUP_NOTIFICATION_STORAGE_KEY = 'finance_pulse_popup_notification_v1';
const USERS_STORAGE_KEY = 'finance_pulse_users_v4';
const CURRENT_USER_KEY = 'finance_pulse_current_user_v1';
const ADMIN_AUTH_KEY = 'finance_pulse_admin_auth_v1';

const LEGACY_AUTHOR_ID_MAP: Record<string, string> = {
  'author-1': 'auth-1',
  'author-2': 'auth-2',
  'author-3': 'usr-admin-1',
  'author-4': 'auth-1',
  'admin-1': 'usr-admin-1'
};

const normalizeArticleAuthorId = (authorId?: string): string => {
  const id = String(authorId || '').trim();
  return LEGACY_AUTHOR_ID_MAP[id] || id || 'usr-admin-1';
};

const userToAuthor = (user: UserAccount): Author => ({
  id: user.id,
  name: user.name,
  role: user.role === 'admin' ? 'Editor-in-Chief & Primary Admin' : user.bio || 'Senior Author',
  avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  bio: user.bio || (user.role === 'admin' ? 'Chief Executive Editor & Platform Administrator' : 'Staff Writer & Financial Analyst'),
  credentials: user.credentials || (user.role === 'admin' ? 'Admin' : 'Author')
});

const INITIAL_TAGS: TagItem[] = [
  { id: 'tag-1', name: 'Stock Market', slug: 'stock-market', articleCount: 4 },
  { id: 'tag-2', name: 'Nifty 50', slug: 'nifty-50', articleCount: 3 },
  { id: 'tag-3', name: 'Sensex', slug: 'sensex', articleCount: 2 },
  { id: 'tag-4', name: 'SIP', slug: 'sip', articleCount: 3 },
  { id: 'tag-5', name: 'Mutual Funds', slug: 'mutual-funds', articleCount: 3 },
  { id: 'tag-6', name: 'Budgeting', slug: 'budgeting', articleCount: 2 },
  { id: 'tag-7', name: 'Credit Score', slug: 'credit-score', articleCount: 2 },
  { id: 'tag-8', name: 'FD Rates', slug: 'fd-rates', articleCount: 2 },
  { id: 'tag-9', name: 'RBI', slug: 'rbi', articleCount: 2 },
  { id: 'tag-10', name: 'Tax Planning', slug: 'tax-planning', articleCount: 1 }
];

const INITIAL_COMMENTS: CommentItem[] = [
  { id: 'com-1', articleId: 'art-1', articleTitle: 'Nifty 50 Hits All-Time High', authorName: 'Rajesh Malhotra', authorEmail: 'rajesh@example.com', content: 'Great analysis on the IT sector rally. Do you expect Nifty to breach 25,500 by Diwali?', createdAt: '2026-08-07T11:20:00Z', status: 'approved' },
  { id: 'com-2', articleId: 'art-2', articleTitle: 'The 50/30/20 Budgeting Rule', authorName: 'Ananya Roy', authorEmail: 'ananya@example.com', content: 'This simple framework helped me save $800/month consistently. Highly recommend automating investments!', createdAt: '2026-08-06T16:45:00Z', status: 'approved' },
  { id: 'com-3', articleId: 'art-3', articleTitle: 'SIP vs Lumpsum Mutual Fund', authorName: 'Vikram Singh', authorEmail: 'vikram@example.com', content: 'Would you recommend STP for a lump sum bonus of $15,000 in current high market valuations?', createdAt: '2026-08-05T14:10:00Z', status: 'pending' }
];

const INITIAL_SETTINGS: SiteSettings = {
  websiteName: 'TheStockTimes.online',
  logoUrl: '',
  faviconUrl: '',
  description: 'TheStockTimes.online provides stock market news, equity analysis, banking updates, personal finance guides, 20 financial calculators and 6 comparison tools.',
  contactEmail: 'editor@thestocktimes.online',
  timezone: 'UTC+05:30 (India Standard Time)',
  defaultMetaTitle: 'TheStockTimes.online — Smarter Market Insights & Financial Tools',
  defaultMetaDescription: 'TheStockTimes.online provides stock market news, equity analysis, banking updates, personal finance guides, 20 financial calculators and 6 comparison tools.',
  googleAnalyticsId: 'G-S7YVPD4ZW1',
  googleSearchConsole: 'sc-domain:thestocktimes.online',
  enableComments: true,
  notifyOnNewComment: true,
  twitterHandle: '@TheStockTimes',
  linkedinUrl: 'https://linkedin.com/company/thestocktimes',
  facebookUrl: 'https://facebook.com/thestocktimes',
  youtubeUrl: 'https://youtube.com/c/thestocktimes',
  enableYahooFinanceApi: true,
  smtpHost: '',
  smtpPort: 465,
  smtpUsername: '',
  smtpPassword: '',
  smtpFromEmail: '',
  smtpFromName: 'The Stock Times Editors',
  smtpSecure: true
};

const INITIAL_POPUP_NOTIFICATION: PopupNotificationSettings = {
  enabled: false,
  title: 'Market Update',
  message: 'Read the latest market insight from The Stock Times.',
  imageUrl: '',
  linkUrl: '',
  linkLabel: 'Open Update',
  delaySeconds: 10,
  updatedAt: new Date().toISOString()
};

export class StorageService {

  // ADMIN AUTHENTICATION
  static isAdminAuthenticated(): boolean {
    try {
      const auth = localStorage.getItem(ADMIN_AUTH_KEY);
      if (auth) {
        const parsed = JSON.parse(auth);
        return parsed.isLoggedIn === true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  static getAdminUser(): { name: string; email: string; role: string; avatar?: string } | null {
    try {
      const auth = localStorage.getItem(ADMIN_AUTH_KEY);
      if (auth) {
        const parsed = JSON.parse(auth);
        if (parsed.isLoggedIn) {
          return {
            name: parsed.username || 'Chief Editor',
            email: parsed.email || 'admin@thestocktimes.online',
            role: 'Super Admin',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
          };
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  static loginAdmin(usernameInput: string, passwordInput: string): { success: boolean; message: string } {
    const user = usernameInput.trim().toLowerCase();
    const pass = passwordInput.trim();
    const fallbackEnabled = import.meta.env.VITE_ENABLE_LOCAL_ADMIN_FALLBACK === 'true';
    const fallbackEmail = String(import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();
    const fallbackPassword = String(import.meta.env.VITE_ADMIN_PASSWORD || '');

    if (fallbackEnabled && fallbackEmail && fallbackPassword && user === fallbackEmail && pass === fallbackPassword) {
      const session = {
        isLoggedIn: true,
        username: 'Chief Editor',
        email: fallbackEmail,
        token: '',
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
      return { success: true, message: 'Authentication successful.' };
    }

    return { success: false, message: 'Invalid admin username or password.' };
  }

  static saveAdminSession(user: { name?: string; email?: string; role?: string }, token: string): void {
    const session = {
      isLoggedIn: true,
      username: user.name || 'Chief Editor',
      email: user.email || 'admin@thestocktimes.online',
      role: user.role || 'admin',
      token,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
  }

  static getAdminAuthToken(): string {
    try {
      const auth = localStorage.getItem(ADMIN_AUTH_KEY);
      return auth ? JSON.parse(auth).token || '' : '';
    } catch {
      return '';
    }
  }

  static logoutAdmin(): void {
    localStorage.removeItem(ADMIN_AUTH_KEY);
  }

  // ARTICLES STORAGE
  static getArticles(): Article[] {
    try {
      const data = localStorage.getItem(ARTICLES_STORAGE_KEY);
      if (!data) {
        const initialArticles = INITIAL_ARTICLES.map(article => ({
          ...article,
          authorId: normalizeArticleAuthorId(article.authorId)
        }));
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(initialArticles));
        return initialArticles;
      }
      let changed = false;
      const now = Date.now();
      const articles = JSON.parse(data).map((article: Article) => {
        const normalizedAuthorId = normalizeArticleAuthorId(article.authorId);
        if (normalizedAuthorId !== article.authorId) changed = true;
        const scheduledTime = article.scheduledDate ? new Date(article.scheduledDate).getTime() : NaN;
        if (article.status === 'scheduled' && Number.isFinite(scheduledTime) && scheduledTime <= now) {
          changed = true;
          return {
            ...article,
            authorId: normalizedAuthorId,
            status: 'published',
            publishedAt: article.scheduledDate || article.publishedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            showPublishedDate: article.showPublishedDate ?? true
          };
        }
        return {
          ...article,
          authorId: normalizedAuthorId,
          showPublishedDate: article.showPublishedDate ?? true
        };
      });
      if (changed) {
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
      }
      return articles;
    } catch (e) {
      return INITIAL_ARTICLES.map(article => ({
        ...article,
        authorId: normalizeArticleAuthorId(article.authorId)
      }));
    }
  }

  static setArticles(articles: Article[]): void {
    try {
      const normalizedArticles = articles.map(article => ({
        ...article,
        authorId: normalizeArticleAuthorId(article.authorId)
      }));
      localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(normalizedArticles));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.warn('Unable to cache articles locally:', error);
    }
  }

  static saveArticle(article: Article): Article {
    const articles = this.getArticles();
    const existingIndex = articles.findIndex(a => (article.id && a.id === article.id) || (article.slug && a.slug === article.slug));

    let updatedArticle = {
      ...article,
      authorId: normalizeArticleAuthorId(article.authorId),
      publishedAt: article.status === 'published' && (!article.publishedAt || article.publishedAt.trim() === '')
        ? new Date().toISOString()
        : (article.publishedAt || new Date().toISOString())
    };

    if (existingIndex >= 0) {
      articles.splice(existingIndex, 1);
    }

    if (!updatedArticle.id) {
      updatedArticle.id = `art-${Date.now()}`;
    }

    // Always unshift newly published or updated article to TOP of array
    articles.unshift(updatedArticle);

    try {
      localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
    } catch (error) {
      console.warn('LocalStorage quota exceeded; pruning gallery cache for local storage while preserving core article.', error);
      try {
        const lightweightArticles = articles.map(a => ({
          ...a,
          galleryImages: (a.galleryImages || []).slice(0, 2).map(g => ({ ...g, url: g.url.length > 50000 ? g.url.substring(0, 200) + '...' : g.url }))
        }));
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(lightweightArticles));
      } catch (innerErr) {
        console.error('Critical localStorage write failure:', innerErr);
      }
    }

    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('articles-updated', { detail: updatedArticle }));
    } catch (e) { }

    try {
      adminApiFetch('/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedArticle)
      }).catch((err) => {
        console.error('Article MySQL save failed:', err);
      });
    } catch (err) { }

    return updatedArticle;
  }

  static deleteArticle(id: string): boolean {
    try {
      const articles = this.getArticles().filter(a => a.id !== id);
      localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
      adminApiFetch(`/articles/${id}`, { method: 'DELETE' }).catch(() => { });
      return true;
    } catch (e) {
      return false;
    }
  }

  static bulkDeleteArticles(ids: string[]): void {
    const articles = this.getArticles().filter(a => !ids.includes(a.id));
    localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
  }

  static bulkUpdateStatus(ids: string[], status: 'published' | 'draft' | 'scheduled'): void {
    const articles = this.getArticles().map(a => ids.includes(a.id) ? { ...a, status } : a);
    localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
  }

  static togglePublishStatus(id: string): void {
    const articles = this.getArticles().map(a => a.id === id ? { ...a, status: (a.status === 'published' ? 'draft' : 'published') as any } : a);
    localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
  }

  static getArticleBySlug(slug: string): Article | undefined {
    return this.getArticles().find(a => a.slug === slug);
  }

  static getArticleById(id: string): Article | undefined {
    return this.getArticles().find(a => a.id === id);
  }

  static incrementArticleViews(idOrSlug: string): number {
    try {
      const articles = this.getArticles();
      const target = articles.find(a => a.id === idOrSlug || a.slug === idOrSlug);
      if (target) {
        target.views = (target.views || 0) + 1;
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('article-views-updated', { detail: { id: target.id, views: target.views } }));
        }

        try {
          apiFetch(`/articles/${target.id}/view`, { method: 'POST' })
            .then(async (response) => {
              if (!response.ok) return;
              const data = await response.json();
              if (typeof data?.views !== 'number') return;

              const syncedArticles = this.getArticles();
              const syncedTarget = syncedArticles.find(a => a.id === target.id || a.slug === target.slug);
              if (!syncedTarget) return;
              syncedTarget.views = data.views;
              localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(syncedArticles));

              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('article-views-updated', { detail: { id: syncedTarget.id, views: syncedTarget.views } }));
              }
            })
            .catch(() => { });
        } catch (e) { }

        return target.views;
      }
    } catch (e) { }
    return 0;
  }

  // AUTHORS
  static getAuthors(): Author[] {
    const users = this.getUsers()
      .filter(user => user.status === 'active' && (user.role === 'admin' || user.role === 'author'))
      .map(userToAuthor);

    const authors = users.length > 0 ? users : INITIAL_AUTHORS;
    try {
      localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(authors));
    } catch (e) { }
    return authors;
  }

  static saveAuthor(author: Author): Author {
    const authors = this.getAuthors();
    const idx = authors.findIndex(a => a.id === author.id);
    if (idx >= 0) authors[idx] = author;
    else authors.unshift(author);
    localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(authors));
    return author;
  }

  static deleteAuthor(id: string): void {
    const authors = this.getAuthors().filter(a => a.id !== id);
    localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(authors));
  }

  static getAuthorById(id: string): Author | undefined {
    const normalizedId = normalizeArticleAuthorId(id);
    const currentUser = this.getCurrentUser();
    const authors = this.getAuthors();
    const found = authors.find(a => a.id === normalizedId);

    if (found) return found;

    if (currentUser.role === 'admin' && (normalizedId === currentUser.id || normalizedId === 'usr-admin-1')) {
      return {
        id: currentUser.id,
        name: currentUser.name || 'Primary Admin',
        role: 'Editor-in-Chief & Primary Admin',
        avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        bio: currentUser.bio || 'Editor-in-Chief & Financial Market Analyst',
        credentials: currentUser.credentials || 'Primary Admin'
      };
    }

    return authors[0];
  }

  // CATEGORIES
  static getCategories(): Category[] {
    try {
      const data = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
        return INITIAL_CATEGORIES;
      }
      const categories = JSON.parse(data) as Category[];
      const missingCategories = INITIAL_CATEGORIES.filter(initial => !categories.some(category => category.id === initial.id));
      if (missingCategories.length > 0) {
        const mergedCategories = [...categories, ...missingCategories];
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(mergedCategories));
        return mergedCategories;
      }
      return categories;
    } catch (e) {
      return INITIAL_CATEGORIES;
    }
  }

  static saveCategory(category: Category): Category {
    const categories = this.getCategories();
    const idx = categories.findIndex(c => c.id === category.id);
    if (idx >= 0) categories[idx] = category;
    else categories.unshift(category);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    return category;
  }

  static deleteCategory(id: string): void {
    const categories = this.getCategories().filter(c => c.id !== id);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }

  static getCategoryBySlug(slug: string): Category | undefined {
    return this.getCategories().find(c => c.slug === slug || c.id === slug);
  }

  // TAGS
  static getTags(): TagItem[] {
    try {
      const data = localStorage.getItem(TAGS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(INITIAL_TAGS));
        return INITIAL_TAGS;
      }
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_TAGS;
    }
  }

  // COMMENTS
  static getComments(): CommentItem[] {
    try {
      const data = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(INITIAL_COMMENTS));
        return INITIAL_COMMENTS;
      }
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_COMMENTS;
    }
  }

  static updateCommentStatus(id: string, status: 'approved' | 'pending' | 'spam'): void {
    const comments = this.getComments().map(c => c.id === id ? { ...c, status } : c);
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
  }

  static deleteComment(id: string): void {
    const comments = this.getComments().filter(c => c.id !== id);
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
  }

  // SETTINGS
  static getSettings(): SiteSettings {
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(INITIAL_SETTINGS));
        return INITIAL_SETTINGS;
      }
      const parsed = JSON.parse(data);
      return { enableYahooFinanceApi: true, ...parsed };
    } catch (e) {
      return INITIAL_SETTINGS;
    }
  }

  static saveSettings(settings: Partial<SiteSettings>): SiteSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  static isYahooApiEnabled(): boolean {
    const settings = this.getSettings();
    return settings.enableYahooFinanceApi !== false;
  }

  static setYahooApiEnabled(enabled: boolean): void {
    this.saveSettings({ enableYahooFinanceApi: enabled });
  }

  // ANALYTICS DATA
  static getAnalyticsSummary(): AnalyticsSummary {
    const articles = this.getArticles();
    const totalViewsNum = articles.reduce((sum, a) => sum + (a.views || 0), 0);
    const avgMinutes = articles.length > 0
      ? Math.round(articles.reduce((sum, a) => sum + (a.readTimeMinutes || 5), 0) / articles.length)
      : 0;

    const approxVisitors = Math.round(totalViewsNum * 0.72);

    return {
      totalVisitors: approxVisitors.toLocaleString(),
      pageViews: totalViewsNum.toLocaleString(),
      avgReadingTime: `${avgMinutes}m 15s`,
      bounceRate: '32.1%',
      trafficOverTime: [
        { date: 'Mon', views: Math.round(totalViewsNum * 0.1), visitors: Math.round(totalViewsNum * 0.07) },
        { date: 'Tue', views: Math.round(totalViewsNum * 0.15), visitors: Math.round(totalViewsNum * 0.1) },
        { date: 'Wed', views: Math.round(totalViewsNum * 0.18), visitors: Math.round(totalViewsNum * 0.12) },
        { date: 'Thu', views: Math.round(totalViewsNum * 0.14), visitors: Math.round(totalViewsNum * 0.09) },
        { date: 'Fri', views: Math.round(totalViewsNum * 0.22), visitors: Math.round(totalViewsNum * 0.16) },
        { date: 'Sat', views: Math.round(totalViewsNum * 0.11), visitors: Math.round(totalViewsNum * 0.08) },
        { date: 'Sun', views: Math.round(totalViewsNum * 0.1), visitors: Math.round(totalViewsNum * 0.07) }
      ],
      topSources: [
        { source: 'Google Organic Search (SEO)', percentage: 65 },
        { source: 'Direct / Bookmarks', percentage: 20 },
        { source: 'Social Media (X, LinkedIn)', percentage: 10 },
        { source: 'Newsletter Subscribers', percentage: 5 }
      ]
    };
  }

  // MARKET INDICES
  static getMarketIndices(): MarketIndex[] {
    return INITIAL_MARKET_INDICES;
  }

  // USERS & AUTHORS MANAGEMENT
  static getUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (!data) {
        const initialUsers: UserAccount[] = [
          {
            id: 'usr-admin-1',
            name: 'Primary Admin',
            email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@thestocktimes.online',
            password: '',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            role: 'admin',
            status: 'active',
            bio: 'Chief Executive Editor & Platform Administrator',
            credentials: 'Admin',
            createdAt: '2026-01-01T00:00:00Z'
          },
          {
            id: 'auth-1',
            name: 'Vikramaditya Sharma',
            email: 'vikramaditya@thestocktimes.online',
            password: 'author@123',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            role: 'author',
            status: 'active',
            bio: 'Senior Equity Analyst & Derivatives Strategist',
            credentials: 'CFA, MBA Finance',
            createdAt: '2026-01-15T00:00:00Z'
          },
          {
            id: 'auth-2',
            name: 'Priya Mukherjee',
            email: 'priya@thestocktimes.online',
            password: 'author@123',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
            role: 'author',
            status: 'active',
            bio: 'Personal Finance Expert & Wealth Planner',
            credentials: 'CFP Certified',
            createdAt: '2026-02-01T00:00:00Z'
          }
        ];
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
        return initialUsers;
      }
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  static saveUser(user: UserAccount): UserAccount {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());

    let updatedUser = { ...user };
    if (!updatedUser.id) {
      updatedUser.id = `auth-${Date.now()}`;
    }

    if (existingIndex >= 0) {
      users[existingIndex] = updatedUser;
    } else {
      users.unshift(updatedUser);
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Also sync to Author list if role is author
    if (updatedUser.role === 'author') {
      const authors = this.getAuthors();
      const authIdx = authors.findIndex(a => a.id === updatedUser.id);
      const newAuthorObj: Author = {
        id: updatedUser.id,
        name: updatedUser.name,
        role: 'Senior Author',
        avatar: updatedUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        bio: updatedUser.bio || 'Staff Writer & Financial Analyst',
        credentials: updatedUser.credentials || 'Author'
      };

      if (authIdx >= 0) {
        authors[authIdx] = newAuthorObj;
      } else {
        authors.unshift(newAuthorObj);
      }
      localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(authors));
    }

    const current = this.getCurrentUser();
    if (current && current.id === updatedUser.id) {
      this.setCurrentUser(updatedUser);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: updatedUser }));
    }

    try {
      adminApiFetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      }).catch(() => { });
    } catch (e) { }

    return updatedUser;
  }

  static deleteUser(id: string): boolean {
    try {
      const users = this.getUsers().filter(u => u.id !== id);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      adminApiFetch(`/users/${id}`, { method: 'DELETE' }).catch(() => { });
      return true;
    } catch (e) {
      return false;
    }
  }

  static getCurrentUser(): UserAccount {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      if (data) return JSON.parse(data);
    } catch (e) { }
    // Default fallback to Admin
    return {
      id: 'usr-admin-1',
      name: 'Primary Admin',
      email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@thestocktimes.online',
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    };
  }

  static setCurrentUser(user: UserAccount): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: user }));
    }
  }

  // POPUP NOTIFICATION / BANNER MANAGEMENT
  static getPopupNotificationSettings(): PopupNotificationSettings {
    try {
      const data = localStorage.getItem(POPUP_NOTIFICATION_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(POPUP_NOTIFICATION_STORAGE_KEY, JSON.stringify(INITIAL_POPUP_NOTIFICATION));
        return INITIAL_POPUP_NOTIFICATION;
      }
      return {
        ...INITIAL_POPUP_NOTIFICATION,
        ...JSON.parse(data)
      };
    } catch (e) {
      return INITIAL_POPUP_NOTIFICATION;
    }
  }

  static setPopupNotificationSettings(settings: PopupNotificationSettings, syncToApi = true): PopupNotificationSettings {
    const sanitized: PopupNotificationSettings = {
      ...INITIAL_POPUP_NOTIFICATION,
      ...settings,
      delaySeconds: Math.max(1, Math.min(120, Number(settings.delaySeconds) || 10)),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(POPUP_NOTIFICATION_STORAGE_KEY, JSON.stringify(sanitized));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('popup-notification-updated', { detail: sanitized }));
    }

    if (syncToApi) {
      try {
        adminApiFetch('/admin/popup-notification', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sanitized)
        }).catch(() => { });
      } catch (e) { }
    }

    return sanitized;
  }

  static async fetchPopupNotificationSettings(): Promise<PopupNotificationSettings> {
    try {
      const response = await apiFetch('/popup-notification');
      if (!response.ok) throw new Error('Popup notification API failed');
      const payload = await response.json();
      const settings = {
        ...INITIAL_POPUP_NOTIFICATION,
        ...(payload.settings || payload)
      };
      return this.setPopupNotificationSettings(settings, false);
    } catch (e) {
      return this.getPopupNotificationSettings();
    }
  }

  // NEWSLETTER SUBSCRIBERS MANAGEMENT
  static getSubscribers(): Subscriber[] {
    try {
      const data = localStorage.getItem(SUBSCRIBERS_STORAGE_KEY);
      if (!data) {
        const initialSubs: Subscriber[] = [
          {
            id: 'sub-1001',
            email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@thestocktimes.online',
            subscriptionDate: '2026-08-10T10:00:00Z',
            verificationStatus: 'Verified',
            status: 'Active',
            lastEmailSentDate: '2026-08-25T14:30:00Z'
          },
          {
            id: 'sub-1002',
            email: 'investor.pro@example.com',
            subscriptionDate: '2026-08-14T15:20:00Z',
            verificationStatus: 'Verified',
            status: 'Active',
            lastEmailSentDate: '2026-08-25T14:30:00Z'
          },
          {
            id: 'sub-1003',
            email: 'trader.guru@example.com',
            subscriptionDate: '2026-08-20T09:12:00Z',
            verificationStatus: 'Pending',
            status: 'Active'
          }
        ];
        localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(initialSubs));
        return initialSubs;
      }
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  static addSubscriber(email: string): Subscriber {
    const cleanEmail = email.trim().toLowerCase();
    const subscribers = this.getSubscribers();
    const existing = subscribers.find(s => s.email.toLowerCase() === cleanEmail);

    if (existing) {
      if (existing.status === 'Unsubscribed') {
        existing.status = 'Active';
        localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(subscribers));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('subscribers-updated', { detail: subscribers }));
        }
      }
      return existing;
    }

    const newSub: Subscriber = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      subscriptionDate: new Date().toISOString(),
      verificationStatus: 'Verified',
      status: 'Active'
    };

    subscribers.unshift(newSub);
    localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(subscribers));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('subscribers-updated', { detail: subscribers }));
    }

    try {
      apiFetch('/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub)
      }).catch(() => { });
    } catch (e) { }

    return newSub;
  }

  static async fetchSubscribersFromServer(): Promise<Subscriber[]> {
    try {
      const response = await adminApiFetch('/admin/subscribers');
      if (!response.ok) throw new Error('Subscribers API failed');
      const payload = await response.json();
      const remoteSubscribers: Subscriber[] = Array.isArray(payload.subscribers) ? payload.subscribers : [];
      localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(remoteSubscribers));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('subscribers-updated', { detail: remoteSubscribers }));
      }
      return remoteSubscribers;
    } catch (e) {
      return this.getSubscribers();
    }
  }

  static updateSubscriberStatus(id: string, status: 'Active' | 'Unsubscribed'): boolean {
    try {
      const subs = this.getSubscribers().map(s => s.id === id ? { ...s, status } : s);
      localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(subs));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('subscribers-updated', { detail: subs }));
      }
      adminApiFetch(`/admin/subscribers/${encodeURIComponent(id)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).catch(() => { });
      return true;
    } catch (e) {
      return false;
    }
  }

  static deleteSubscriber(id: string): boolean {
    try {
      const subs = this.getSubscribers().filter(s => s.id !== id);
      localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(subs));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('subscribers-updated', { detail: subs }));
      }
      adminApiFetch(`/admin/subscribers/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      }).catch(() => { });
      return true;
    } catch (e) {
      return false;
    }
  }

  // LEGAL & POLICY PAGES STORAGE
  static getLegalPages(): LegalPageItem[] {
    try {
      const data = localStorage.getItem('finance_pulse_legal_pages_v1');
      if (data) return JSON.parse(data);
    } catch (e) { }

    const defaults: LegalPageItem[] = [
      {
        id: 'privacy',
        slug: 'privacy',
        title: 'Privacy Policy',
        content: '<h2>Privacy Policy for The Stock Times</h2><p>Your privacy is important to us. The Stock Times publishes financial news, market commentary, calculators, comparison tools, newsletters, and reader comment features. This policy explains what information we collect, how we use it, and how advertising partners may process data when you visit our website.</p><h3>Information We Collect</h3><p>We may collect information you voluntarily submit, such as your name, email address, newsletter subscription preferences, contact form messages, and public comments. We also collect standard technical information such as browser type, device type, approximate region, pages visited, referring URLs, and usage events to protect the site and improve content quality.</p><h3>Cookies, Analytics, and Advertising</h3><p>We use cookies and similar technologies for essential site functions, analytics, ad measurement, frequency controls, and personalization. Third-party advertising partners, including Google AdSense, may use cookies or device identifiers to serve and measure ads based on your visits to this and other websites. You can manage cookies in your browser settings and review Google ad personalization options in your Google account.</p><h3>How We Use Information</h3><p>We use collected information to operate the website, publish comments, respond to inquiries, send opted-in newsletters, improve financial tools, detect spam or abuse, comply with legal obligations, and provide relevant advertising where permitted.</p><h3>Data Sharing</h3><p>We do not sell personal information. We may share limited data with service providers that support hosting, analytics, email delivery, security, or advertising, and only as needed to operate the website. We may disclose information if required by law or to protect readers, our website, or our rights.</p><h3>Financial Content Notice</h3><p>Our content is educational and informational only. We do not collect information to provide individualized investment, tax, legal, or financial advice.</p><h3>Contact</h3><p>For privacy questions or data requests, contact us through the Contact page or email editor@thestocktimes.online.</p>',
        seoTitle: 'Privacy Policy | The Stock Times',
        seoDescription: 'Read the official Privacy Policy of The Stock Times.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'terms',
        slug: 'terms',
        title: 'Terms and Conditions',
        content: '<h2>Terms & Conditions</h2><p>By accessing The Stock Times, you agree to use this website lawfully and responsibly. The website provides financial news, market education, calculators, comparison tools, and editorial research for general information only.</p><h3>No Personalized Advice</h3><p>Nothing on this website is personal investment, financial, tax, legal, or accounting advice. You should verify information independently and consult a qualified professional before making financial decisions.</p><h3>Acceptable Use</h3><p>You may not misuse the website, attempt unauthorized access, scrape content at scale, post spam or fraudulent comments, impersonate others, or use the website to promote scams or unlawful activity.</p><h3>Intellectual Property</h3><p>Articles, designs, logos, graphics, calculators, and original research are protected by copyright and other intellectual property laws. You may link to our articles, but copying or republishing substantial content without permission is not allowed.</p><h3>Advertising and Sponsored Content</h3><p>The website may display advertising, sponsored placements, affiliate references, or house promotions. Advertising labels are provided to help readers distinguish ads from editorial content.</p><h3>Changes</h3><p>We may update these terms from time to time. Continued use of the website after changes means you accept the updated terms.</p>',
        seoTitle: 'Terms & Conditions | The Stock Times',
        seoDescription: 'Read the Terms and Conditions for accessing The Stock Times.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'disclaimer',
        slug: 'disclaimer',
        title: 'Financial & Investment Disclaimer',
        content: '<h2>Financial & Investment Disclaimer</h2><p>All information published on The Stock Times is for educational, informational, and news reporting purposes only. It is not personal financial advice, investment advice, tax advice, accounting advice, legal advice, or a recommendation to buy, sell, hold, borrow, lend, or invest in any product.</p><h3>Market Risk</h3><p>Financial markets involve risk. Stock prices, interest rates, yields, tax rules, loan terms, and regulatory requirements can change quickly. Past performance does not guarantee future returns.</p><h3>Accuracy and Sources</h3><p>We aim to use reliable public sources, official disclosures, and transparent methodology. However, errors, delays, or omissions may occur. Readers should verify rates, fees, eligibility, product terms, and regulatory information directly with official providers before acting.</p><h3>Editorial Independence</h3><p>Advertising does not determine our editorial conclusions. Sponsored or promoted content, when present, is labeled separately from editorial coverage.</p><h3>Professional Advice</h3><p>Always consult a qualified financial planner, tax advisor, legal professional, or regulated advisor for decisions based on your personal situation.</p>',
        seoTitle: 'Financial Disclaimer | The Stock Times',
        seoDescription: 'Financial and investment disclaimer for readers of The Stock Times.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'cookies',
        slug: 'cookies',
        title: 'Cookie Policy',
        content: '<h2>Cookie Policy</h2><p>This Cookie Policy explains how The Stock Times uses cookies and similar technologies. Cookies help us keep the site functional, remember consent choices, measure traffic, protect forms from abuse, and support advertising.</p><h3>Types of Cookies</h3><p>Essential cookies support basic website functions. Analytics cookies help us understand site performance and reader behavior. Advertising cookies may be used by ad partners such as Google AdSense to deliver, limit, and measure ads.</p><h3>Managing Cookies</h3><p>You can control or delete cookies through your browser settings. Blocking some cookies may affect features such as comments, newsletter preferences, personalization, or ad frequency controls.</p><h3>Third-Party Partners</h3><p>Third-party services may set cookies according to their own privacy policies. These partners may process data such as device information, page views, approximate location, and ad interaction signals.</p>',
        seoTitle: 'Cookie Policy | The Stock Times',
        seoDescription: 'Cookie policy and consent usage guidelines.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'editorial',
        slug: 'editorial',
        title: 'Editorial Policy',
        content: '<h2>Editorial Guidelines & Independence</h2><p>The Stock Times aims to publish useful, original, and reader-first financial content. Our editorial process prioritizes clarity, source transparency, timely updates, and separation between advertising and editorial judgment.</p><h3>Originality</h3><p>Articles should be independently written, fact-checked where practical, and provide context beyond copied headlines or scraped summaries. We avoid publishing thin, automatically generated, or duplicate pages that do not help readers.</p><h3>Sources and Updates</h3><p>Where rates, rules, market figures, or policies are mentioned, writers should use official sources or reputable financial data providers where possible and update outdated information promptly.</p><h3>Advertising Independence</h3><p>Ad placement, sponsorship, or affiliate relationships must not control article conclusions. Sponsored material should be identified clearly.</p>',
        seoTitle: 'Editorial Policy | The Stock Times',
        seoDescription: 'Editorial independence and publishing standards.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'corrections',
        slug: 'corrections',
        title: 'Corrections Policy',
        content: '<h2>Corrections & Fact-Checking Policy</h2><p>We are committed to correcting errors promptly and transparently. If you notice a factual error, outdated rate, broken link, incorrect calculation, or unclear financial explanation, please contact our editorial room.</p><h3>Review Process</h3><p>Correction requests are reviewed against available sources. If a correction is needed, we update the article and, when appropriate, clarify the change in the article body or metadata.</p><h3>Contact</h3><p>Send correction requests through the Contact page with the article URL, the disputed statement, and the source or explanation supporting the correction.</p>',
        seoTitle: 'Corrections Policy | The Stock Times',
        seoDescription: 'Fact checking and error correction policies.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'refund',
        slug: 'refund',
        title: 'Refund Policy',
        content: '<h2>Refund Policy</h2><p>Details regarding premium subscriptions, digital product purchases, and refund request processing terms.</p>',
        seoTitle: 'Refund Policy | The Stock Times',
        seoDescription: 'Refund policy for paid services and digital subscriptions.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'guidelines',
        slug: 'guidelines',
        title: 'Community Guidelines',
        content: '<h2>Community Guidelines</h2><p>We encourage respectful discussion in comments and reader submissions. Comments may be moderated before publication to protect readers and maintain compliance with advertising and publisher policies.</p><h3>Not Allowed</h3><p>Harassment, hate speech, threats, adult content, spam, misleading financial promotions, pump-and-dump schemes, impersonation, malware links, and requests for personal financial data are not allowed.</p><h3>Moderation</h3><p>We may edit, reject, hide, or remove comments that violate these guidelines or create legal, security, or policy risk.</p>',
        seoTitle: 'Community Guidelines | The Stock Times',
        seoDescription: 'Rules of conduct for comments and reader participation.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'about',
        slug: 'about',
        title: 'About Us',
        content: '<h2>About The Stock Times</h2><p>The Stock Times is a leading independent financial news publication dedicated to delivering institutional market breakdowns, personal finance strategies, and financial tools.</p>',
        seoTitle: 'About Us | The Stock Times Editorial Room',
        seoDescription: 'Learn about The Stock Times mission, editorial team, and values.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'contact',
        slug: 'contact',
        title: 'Contact Us',
        content: '<h2>Get In Touch</h2><p>Have news tips, editorial inquiries, correction requests, privacy questions, advertising questions, or support requests? Contact our newsroom team at editor@thestocktimes.online or use the Contact page form.</p><h3>Editorial and Corrections</h3><p>For corrections, include the article URL, the sentence or data point in question, and any official source that supports the update.</p><h3>Advertising</h3><p>For advertising or sponsored placement inquiries, contact us with campaign details. Sponsored content must be clearly identified and must comply with our editorial and advertising standards.</p>',
        seoTitle: 'Contact Us | The Stock Times Desk',
        seoDescription: 'Contact info for editorial and support inquiries.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      }
    ];

    try {
      localStorage.setItem('finance_pulse_legal_pages_v1', JSON.stringify(defaults));
    } catch (e) { }

    return defaults;
  }

  static getLegalPageById(id: string): LegalPageItem | undefined {
    return this.getLegalPages().find(p => p.id === id || p.slug === id);
  }

  static saveLegalPage(page: LegalPageItem, editorName: string = 'Admin'): LegalPageItem {
    const pages = this.getLegalPages();
    const idx = pages.findIndex(p => p.id === page.id);

    // Build revision history
    const existing = idx >= 0 ? pages[idx] : null;
    const revisions = existing?.revisions || [];
    if (existing) {
      revisions.unshift({
        id: `rev-${Date.now()}`,
        updatedAt: existing.updatedAt,
        updatedBy: editorName,
        title: existing.title,
        content: existing.content
      });
    }

    const updatedPage: LegalPageItem = {
      ...page,
      updatedAt: new Date().toISOString(),
      revisions: revisions.slice(0, 10) // Store last 10 revisions
    };

    if (idx >= 0) {
      pages[idx] = updatedPage;
    } else {
      pages.push(updatedPage);
    }

    try {
      localStorage.setItem('finance_pulse_legal_pages_v1', JSON.stringify(pages));
    } catch (e) { }

    return updatedPage;
  }

  static restoreLegalPageRevision(pageId: string, revisionId: string): LegalPageItem | null {
    const pages = this.getLegalPages();
    const target = pages.find(p => p.id === pageId);
    if (!target || !target.revisions) return null;

    const rev = target.revisions.find(r => r.id === revisionId);
    if (!rev) return null;

    target.title = rev.title;
    target.content = rev.content;
    target.updatedAt = new Date().toISOString();

    try {
      localStorage.setItem('finance_pulse_legal_pages_v1', JSON.stringify(pages));
    } catch (e) { }

    return target;
  }

  // RESET ALL DATA TO FACTORY INITIAL
  static resetToDefaults(): void {
    localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(INITIAL_ARTICLES));
    localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(INITIAL_AUTHORS));
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(INITIAL_TAGS));
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(INITIAL_COMMENTS));
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(INITIAL_SETTINGS));
    localStorage.removeItem(SUBSCRIBERS_STORAGE_KEY);
    localStorage.removeItem(USERS_STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(ADMIN_AUTH_KEY);
  }
}
