import { Article, Category, Author } from '../types';
import { StorageService } from './storageService';
import { AdService } from './adService';

const API_BASE_URL = 'http://localhost:5000/api';

export class ApiService {

  // Check if MySQL Backend server is running & connected
  public static async checkBackendStatus(): Promise<{ connected: boolean; dbName?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
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
      const response = await fetch(`${API_BASE_URL}/articles`, { signal: AbortSignal.timeout(2500) });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((art: any) => ({
            ...art,
            categoryId: art.category_id || art.categoryId,
            featuredImage: art.featured_image || art.featuredImage,
            readTimeMinutes: art.read_time_minutes || art.readTimeMinutes || 5,
            publishedAt: art.published_at || art.publishedAt,
            tags: typeof art.tags === 'string' ? JSON.parse(art.tags) : art.tags || [],
            highlights: typeof art.highlights === 'string' ? JSON.parse(art.highlights) : art.highlights || []
          }));
        }
      }
    } catch (err) {
      console.warn('Backend unavailable, utilizing local storage cache.');
    }
    return StorageService.getArticles();
  }

  public static async saveArticle(article: Article): Promise<void> {
    // 1. Always update local storage first for zero-latency UI reactivity
    StorageService.saveArticle(article);

    // 2. Sync to MySQL database if backend is live
    try {
      await fetch(`${API_BASE_URL}/articles`, {
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
      await fetch(`${API_BASE_URL}/articles/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend offline. Deleted from local cache.');
    }
  }

  // Financial Rules MySQL Sync
  public static async updateFinancialRule(ruleKey: string, value: number, updatedBy: string, sourceRef: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/financial-rules/${ruleKey}`, {
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
      const response = await fetch(`${API_BASE_URL}/social-media`);

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
      await fetch(`${API_BASE_URL}/social-media`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch (err) {
      console.warn('Backend offline. Social media settings were not synced.');
    }
  }
}
