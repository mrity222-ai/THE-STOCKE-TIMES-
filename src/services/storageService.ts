import { Article, Author, Category, MediaItem, TagItem, MarketIndex, CommentItem, SiteSettings, AnalyticsSummary, UserAccount, Subscriber, LegalPageItem } from '../types';
import { INITIAL_ARTICLES, INITIAL_AUTHORS, INITIAL_CATEGORIES, INITIAL_MARKET_INDICES } from '../data/initialData';

const ARTICLES_STORAGE_KEY = 'finance_pulse_articles_v3';
const AUTHORS_STORAGE_KEY = 'finance_pulse_authors_v3';
const CATEGORIES_STORAGE_KEY = 'finance_pulse_categories_v3';
const MEDIA_STORAGE_KEY = 'finance_pulse_media_v3';
const TAGS_STORAGE_KEY = 'finance_pulse_tags_v3';
const COMMENTS_STORAGE_KEY = 'finance_pulse_comments_v3';
const SETTINGS_STORAGE_KEY = 'finance_pulse_settings_v3';
const SUBSCRIBERS_STORAGE_KEY = 'finance_pulse_subscribers_v4';
const USERS_STORAGE_KEY = 'finance_pulse_users_v4';
const CURRENT_USER_KEY = 'finance_pulse_current_user_v1';
const ADMIN_AUTH_KEY = 'finance_pulse_admin_auth_v1';

const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  { id: 'med-1', name: 'Stock Market Chart Bull Run', url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80', size: '1.2 MB', uploadedAt: '2026-08-01', dimensions: '1200x800', altText: 'Equity chart graph', type: 'image' },
  { id: 'med-2', name: 'Personal Finance & Calculator', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80', size: '850 KB', uploadedAt: '2026-08-02', dimensions: '1200x800', altText: 'Financial planning desk', type: 'image' },
  { id: 'med-3', name: 'Mutual Funds & Compounding', url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80', size: '1.4 MB', uploadedAt: '2026-08-03', dimensions: '1200x800', altText: 'Wealth growth graph', type: 'image' },
  { id: 'med-4', name: 'Commercial Banking Building', url: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=1200&q=80', size: '980 KB', uploadedAt: '2026-08-04', dimensions: '1200x800', altText: 'Bank architecture', type: 'image' },
  { id: 'med-5', name: 'Reserve Bank & Money Policy', url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80', size: '1.1 MB', uploadedAt: '2026-08-05', dimensions: '1200x800', altText: 'Central bank building', type: 'image' },
  { id: 'med-6', name: 'Credit Health & Cards', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80', size: '920 KB', uploadedAt: '2026-08-06', dimensions: '1200x800', altText: 'Credit Card and statement', type: 'image' }
];

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
  websiteName: 'TheStoceTimes.com',
  logoUrl: '',
  faviconUrl: '',
  description: 'TheStoceTimes.com provides stock market news, equity analysis, banking updates, personal finance guides, 20 financial calculators and 6 comparison tools.',
  contactEmail: 'editor@thestocetimes.com',
  timezone: 'UTC+05:30 (India Standard Time)',
  defaultMetaTitle: 'TheStoceTimes.com — Smarter Market Insights & Financial Tools',
  defaultMetaDescription: 'TheStoceTimes.com provides stock market news, equity analysis, banking updates, personal finance guides, 20 financial calculators and 6 comparison tools.',
  googleAnalyticsId: 'G-RX15ZXY6JE',
  googleSearchConsole: 'sc-domain:thestocetimes.com',
  enableComments: true,
  notifyOnNewComment: true,
  twitterHandle: '@TheStoceTimes',
  linkedinUrl: 'https://linkedin.com/company/thestocetimes',
  facebookUrl: 'https://facebook.com/thestocetimes',
  youtubeUrl: 'https://youtube.com/c/thestocetimes',
  enableYahooFinanceApi: true,
  smtpHost: 'smtp.hostinger.com',
  smtpPort: 465,
  smtpUsername: 'info@avedatechnologies.com',
  smtpPassword: 'Jaymatadi@122',
  smtpFromEmail: 'info@avedatechnologies.com',
  smtpFromName: 'The Stoce Times Editors',
  smtpSecure: true
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
            email: parsed.email || 'dhoniy423@gmail.com',
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

    if ((user === 'dhoniy423@gmail.com' || user === 'admin@thestocetimes.com' || user === 'admin') && (pass === 'Jaymatadi@122' || pass === 'admin123')) {
      const session = {
        isLoggedIn: true,
        username: 'Chief Editor',
        email: 'dhoniy423@gmail.com',
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
      return { success: true, message: 'Authentication successful.' };
    }

    return { success: false, message: 'Invalid admin username or password.' };
  }

  static logoutAdmin(): void {
    localStorage.removeItem(ADMIN_AUTH_KEY);
  }

  // ARTICLES STORAGE
  static getArticles(): Article[] {
    try {
      const data = localStorage.getItem(ARTICLES_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(INITIAL_ARTICLES));
        return INITIAL_ARTICLES;
      }
      return JSON.parse(data).map((article: Article) => ({
        ...article,
        showPublishedDate: article.showPublishedDate ?? true
      }));
    } catch (e) {
      return INITIAL_ARTICLES;
    }
  }

  static saveArticle(article: Article): Article {
    const articles = this.getArticles();
    const existingIndex = articles.findIndex(a => (article.id && a.id === article.id) || (article.slug && a.slug === article.slug));

    let updatedArticle = {
      ...article,
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

    localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));

    try {
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    try {
      fetch('http://localhost:5000/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedArticle)
      }).catch(() => { });
    } catch (err) { }

    return updatedArticle;
  }

  static deleteArticle(id: string): boolean {
    try {
      const articles = this.getArticles().filter(a => a.id !== id);
      localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
      fetch(`http://localhost:5000/api/articles/${id}`, { method: 'DELETE' }).catch(() => { });
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
          fetch(`http://localhost:5000/api/articles/${target.id}/view`, { method: 'POST' }).catch(() => {});
        } catch (e) {}

        return target.views;
      }
    } catch (e) {}
    return 0;
  }

  // AUTHORS
  static getAuthors(): Author[] {
    try {
      const data = localStorage.getItem(AUTHORS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(INITIAL_AUTHORS));
        return INITIAL_AUTHORS;
      }
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_AUTHORS;
    }
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
    const currentUser = this.getCurrentUser();
    const authors = this.getAuthors();
    const found = authors.find(a => a.id === id);

    if ((currentUser.role === 'admin' && (id === currentUser.id || id === 'usr-admin-1' || id === 'author-1')) || !found) {
      return {
        id: currentUser.id,
        name: currentUser.name || 'Primary Admin',
        role: 'Editor-in-Chief & Primary Admin',
        avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        bio: currentUser.bio || 'Editor-in-Chief & Financial Market Analyst',
        credentials: currentUser.credentials || 'Primary Admin'
      };
    }

    return found;
  }

  // CATEGORIES
  static getCategories(): Category[] {
    try {
      const data = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
        return INITIAL_CATEGORIES;
      }
      return JSON.parse(data);
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

  // MEDIA
  static getMediaItems(): MediaItem[] {
    try {
      const data = localStorage.getItem(MEDIA_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(INITIAL_MEDIA_ITEMS));
        return INITIAL_MEDIA_ITEMS;
      }
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_MEDIA_ITEMS;
    }
  }

  static addMediaItem(item: Omit<MediaItem, 'id' | 'uploadedAt'>): MediaItem {
    const items = this.getMediaItems();
    const newItem: MediaItem = {
      ...item,
      id: `med-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    items.unshift(newItem);
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
    return newItem;
  }

  static deleteMediaItem(id: string): void {
    const items = this.getMediaItems().filter(m => m.id !== id);
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
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
            email: 'dhoniy423@gmail.com',
            password: 'Jaymatadi@122',
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
            email: 'vikramaditya@thestocetimes.com',
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
            email: 'priya@thestocetimes.com',
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
      fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      }).catch(() => {});
    } catch (e) {}

    return updatedUser;
  }

  static deleteUser(id: string): boolean {
    try {
      const users = this.getUsers().filter(u => u.id !== id);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' }).catch(() => {});
      return true;
    } catch (e) {
      return false;
    }
  }

  static getCurrentUser(): UserAccount {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    // Default fallback to Admin
    return {
      id: 'usr-admin-1',
      name: 'Primary Admin',
      email: 'dhoniy423@gmail.com',
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

  // NEWSLETTER SUBSCRIBERS MANAGEMENT
  static getSubscribers(): Subscriber[] {
    try {
      const data = localStorage.getItem(SUBSCRIBERS_STORAGE_KEY);
      if (!data) {
        const initialSubs: Subscriber[] = [
          {
            id: 'sub-1001',
            email: 'dhoniy423@gmail.com',
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

    try {
      fetch('http://localhost:5000/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub)
      }).catch(() => {});
    } catch (e) {}

    return newSub;
  }

  static updateSubscriberStatus(id: string, status: 'Active' | 'Unsubscribed'): boolean {
    try {
      const subs = this.getSubscribers().map(s => s.id === id ? { ...s, status } : s);
      localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(subs));
      return true;
    } catch (e) {
      return false;
    }
  }

  static deleteSubscriber(id: string): boolean {
    try {
      const subs = this.getSubscribers().filter(s => s.id !== id);
      localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(subs));
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
    } catch (e) {}

    const defaults: LegalPageItem[] = [
      {
        id: 'privacy',
        slug: 'privacy',
        title: 'Privacy Policy',
        content: '<h2>Privacy Policy for The Stoce Times</h2><p>Your privacy is important to us. This Privacy Policy document contains types of information that is collected and recorded by The Stoce Times and how we use it.</p>',
        seoTitle: 'Privacy Policy | The Stoce Times',
        seoDescription: 'Read the official Privacy Policy of The Stoce Times.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'terms',
        slug: 'terms',
        title: 'Terms and Conditions',
        content: '<h2>Terms & Conditions</h2><p>By accessing and using The Stoce Times website, you accept and agree to be bound by the terms and provision of this agreement.</p>',
        seoTitle: 'Terms & Conditions | The Stoce Times',
        seoDescription: 'Read the Terms and Conditions for accessing The Stoce Times.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'disclaimer',
        slug: 'disclaimer',
        title: 'Financial & Investment Disclaimer',
        content: '<h2>Financial Disclaimer</h2><p>All information provided on The Stoce Times is strictly for educational and informational purposes only. It should not be considered as personal financial advice.</p>',
        seoTitle: 'Financial Disclaimer | The Stoce Times',
        seoDescription: 'Financial and investment disclaimer for readers of The Stoce Times.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'cookies',
        slug: 'cookies',
        title: 'Cookie Policy',
        content: '<h2>Cookie Policy</h2><p>This Cookie Policy explains how The Stoce Times uses cookies and similar technologies to recognize you when you visit our website.</p>',
        seoTitle: 'Cookie Policy | The Stoce Times',
        seoDescription: 'Cookie policy and consent usage guidelines.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'editorial',
        slug: 'editorial',
        title: 'Editorial Policy',
        content: '<h2>Editorial Guidelines & Independence</h2><p>The Stoce Times adheres to strict journalistic standards of integrity, transparency, and accuracy across all financial news reports.</p>',
        seoTitle: 'Editorial Policy | The Stoce Times',
        seoDescription: 'Editorial independence and publishing standards.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'corrections',
        slug: 'corrections',
        title: 'Corrections Policy',
        content: '<h2>Corrections & Fact-Checking Policy</h2><p>We are committed to correcting errors promptly and transparently. If you notice a factual error, please contact our editorial room.</p>',
        seoTitle: 'Corrections Policy | The Stoce Times',
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
        seoTitle: 'Refund Policy | The Stoce Times',
        seoDescription: 'Refund policy for paid services and digital subscriptions.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'guidelines',
        slug: 'guidelines',
        title: 'Community Guidelines',
        content: '<h2>Community Guidelines</h2><p>We encourage respectful discourse in our comments and reader forums. Harassment, spam, and financial scams are strictly prohibited.</p>',
        seoTitle: 'Community Guidelines | The Stoce Times',
        seoDescription: 'Rules of conduct for comments and reader participation.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'about',
        slug: 'about',
        title: 'About Us',
        content: '<h2>About The Stoce Times</h2><p>The Stoce Times is a leading independent financial news publication dedicated to delivering institutional market breakdowns, personal finance strategies, and financial tools.</p>',
        seoTitle: 'About Us | The Stoce Times Editorial Room',
        seoDescription: 'Learn about The Stoce Times mission, editorial team, and values.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      },
      {
        id: 'contact',
        slug: 'contact',
        title: 'Contact Us',
        content: '<h2>Get In Touch</h2><p>Have news tips, editorial inquiries, or support requests? Contact our newsroom team at editor@thestocetimes.com.</p>',
        seoTitle: 'Contact Us | The Stoce Times Desk',
        seoDescription: 'Contact info for editorial and support inquiries.',
        status: 'published',
        updatedAt: new Date().toISOString(),
        revisions: []
      }
    ];

    try {
      localStorage.setItem('finance_pulse_legal_pages_v1', JSON.stringify(defaults));
    } catch (e) {}

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
    } catch (e) {}

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
    } catch (e) {}

    return target;
  }

  // RESET ALL DATA TO FACTORY INITIAL
  static resetToDefaults(): void {
    localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(INITIAL_ARTICLES));
    localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(INITIAL_AUTHORS));
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(INITIAL_MEDIA_ITEMS));
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(INITIAL_TAGS));
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(INITIAL_COMMENTS));
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(INITIAL_SETTINGS));
    localStorage.removeItem(SUBSCRIBERS_STORAGE_KEY);
    localStorage.removeItem(USERS_STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(ADMIN_AUTH_KEY);
  }
}
