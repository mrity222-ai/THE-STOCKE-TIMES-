import { Article, Category, Author } from '../types';
import { StorageService } from './storageService';
import { AdService } from './adService';
import { adminApiFetch, apiFetch } from './apiConfig';

export class ApiService {
  private static normalizeArticle(art: any): Article {
    return {
      ...art,
      id: art.id,
      categoryId: art.category_id || art.categoryId,
      subCategory: art.sub_category || art.subCategory || '',
      featuredImage: art.featured_image || art.featuredImage || '',
      imageCaption: art.image_caption || art.imageCaption || '',
      readTimeMinutes: art.read_time_minutes || art.readTimeMinutes || 5,
      publishedAt: art.published_at || art.publishedAt || new Date().toISOString(),
      showPublishedDate: art.show_published_date !== undefined ? Boolean(art.show_published_date) : art.showPublishedDate ?? true,
      updatedAt: art.updated_at || art.updatedAt,
      scheduledDate: art.scheduled_date || art.scheduledDate || '',
      isFeatured: Boolean(art.is_featured ?? art.isFeatured),
      isTrending: Boolean(art.is_trending ?? art.isTrending),
      isPopular: Boolean(art.is_popular ?? art.isPopular),
      status: art.status || 'published',
      tags: typeof art.tags === 'string' ? JSON.parse(art.tags || '[]') : art.tags || [],
      highlights: typeof art.highlights === 'string' ? JSON.parse(art.highlights || '[]') : art.highlights || [],
      focusKeywords: typeof art.focus_keywords === 'string' ? JSON.parse(art.focus_keywords || '[]') : art.focusKeywords || [],
      seoTitle: art.seo_title || art.seoTitle || art.title,
      seoDescription: art.seo_description || art.seoDescription || art.excerpt,
      canonicalUrl: art.canonical_url || art.canonicalUrl || '',
      ogTitle: art.og_title || art.ogTitle || art.title,
      ogDescription: art.og_description || art.ogDescription || art.excerpt,
      socialShareImage: art.social_share_image || art.socialShareImage || art.featured_image || art.featuredImage || ''
    };
  }

  // Check if MySQL Backend server is running & connected
  public static async checkBackendStatus(): Promise<{ connected: boolean; dbName?: string }> {
    try {
      const response = await apiFetch('/health', { signal: AbortSignal.timeout(2000) });
      if (response.ok) {
        const data = await response.json();
        return { connected: data.database?.connected || false, dbName: data.database?.name };
      }
    } catch (err) {
      // Backend server offline - use local storage fallback
    }
    return { connected: false };
  }

  // Articles Sync
  public static async fetchArticles(): Promise<Article[]> {
    try {
      const response = await apiFetch('/articles', { signal: AbortSignal.timeout(2500) });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const articles = data.map((art: any) => this.normalizeArticle(art));
          StorageService.setArticles(articles);
          return articles;
        }
      }
    } catch (err) {
      console.warn('Backend unavailable, utilizing local storage cache.');
    }
    return StorageService.getArticles();
  }

  public static async fetchArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const response = await apiFetch(`/articles/${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(2500) });
      if (response.ok) {
        return this.normalizeArticle(await response.json());
      }
    } catch (err) {
      console.warn('Backend unavailable, using local article cache.');
    }
    return StorageService.getArticleBySlug(slug) || null;
  }

  public static async saveArticle(article: Article): Promise<void> {
    // 1. Always update local storage first for zero-latency UI reactivity
    StorageService.saveArticle(article);

    // 2. Sync to MySQL database if backend is live
    try {
      await adminApiFetch('/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article)
      });
    } catch (err) {
      console.warn('Backend offline. Saved to local browser cache.');
    }
  }

  public static async deleteArticle(id: string): Promise<void> {
    StorageService.deleteArticle(id);
    try {
      await adminApiFetch(`/articles/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend offline. Deleted from local cache.');
    }
  }

  // Financial Rules MySQL Sync
  public static async updateFinancialRule(ruleKey: string, value: number, updatedBy: string, sourceRef: string): Promise<void> {
    try {
      await adminApiFetch(`/financial-rules/${ruleKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, updatedBy, sourceReference: sourceRef })
      });
    } catch (err) {
      console.warn('Backend offline. Rule saved to local storage.');
    }
  }


  // Social Media Settings - MySQL Sync
  public static async fetchSocialMedia(): Promise<any> {
    try {
      const response = await apiFetch('/social-media');

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Backend unavailable. Using local social media settings.');
    }

    return null;
  }

  public static async updateSocialMedia(settings: any): Promise<void> {
    try {
      await adminApiFetch('/social-media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch (err) {
      console.warn('Backend offline. Social media settings were not synced.');
    }
  }
}
