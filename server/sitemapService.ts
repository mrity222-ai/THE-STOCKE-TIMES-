import { Request, Response } from 'express';
import { pool } from './config/db';
import { CALCULATORS_REGISTRY } from '../src/data/calculatorsMeta.ts';
import { COMPARISONS_REGISTRY } from '../src/data/comparisonsMeta.ts';
import { INITIAL_CATEGORIES } from '../src/data/initialData.ts';

export interface SitemapUrlEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

export interface SitemapSummary {
  totalUrls: number;
  domain: string;
  generatedAt: string;
  categoriesCount: number;
  articlesCount: number;
  calculatorsCount: number;
  comparisonsCount: number;
  staticPagesCount: number;
  urls: SitemapUrlEntry[];
}

export class SitemapService {
  /**
   * Resolve current production or canonical base site URL
   */
  static getSiteUrl(req?: Request): string {
    if (process.env.SITE_URL) {
      return process.env.SITE_URL.replace(/\/$/, '');
    }
    if (process.env.ADMIN_URL) {
      return process.env.ADMIN_URL.replace(/\/$/, '');
    }
    if (req) {
      const host = req.get('host');
      if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
        const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
        return `${proto}://${host}`.replace(/\/$/, '');
      }
    }
    return 'https://thestocktimes.online';
  }

  /**
   * Escape XML entities
   */
  private static escapeXml(unsafe: string): string {
    return String(unsafe || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Collect all public routes dynamically from DB + memory + registries
   */
  static async collectAllUrls(
    req?: Request,
    inMemoryArticlesStore: any[] = []
  ): Promise<{ entries: SitemapUrlEntry[]; summary: Omit<SitemapSummary, 'urls'> }> {
    const domain = this.getSiteUrl(req);
    const today = new Date().toISOString().split('T')[0];

    const entriesMap = new Map<string, SitemapUrlEntry>();

    // 1. Core Primary Pages
    const staticPages: { path: string; priority: string; changefreq: SitemapUrlEntry['changefreq'] }[] = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/financial-tools', priority: '0.9', changefreq: 'weekly' },
      { path: '/comparison-tools', priority: '0.9', changefreq: 'weekly' },
      { path: '/search', priority: '0.7', changefreq: 'weekly' },
      { path: '/about', priority: '0.8', changefreq: 'monthly' },
      { path: '/contact', priority: '0.8', changefreq: 'monthly' },
      { path: '/legal/privacy', priority: '0.6', changefreq: 'monthly' },
      { path: '/legal/terms', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/disclaimer', priority: '0.6', changefreq: 'monthly' },
      { path: '/disclaimer', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/cookies', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/editorial', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/corrections', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/guidelines', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/refund', priority: '0.5', changefreq: 'monthly' }
    ];

    staticPages.forEach((p) => {
      entriesMap.set(`${domain}${p.path}`, {
        loc: `${domain}${p.path}`,
        lastmod: today,
        changefreq: p.changefreq,
        priority: p.priority
      });
    });

    // 2. Primary News Categories Hubs
    INITIAL_CATEGORIES.forEach((cat) => {
      const catUrl = `${domain}/${cat.slug}`;
      entriesMap.set(catUrl, {
        loc: catUrl,
        lastmod: today,
        changefreq: 'daily',
        priority: '0.9'
      });
    });

    // 3. 20 Financial Calculators
    CALCULATORS_REGISTRY.forEach((calc) => {
      const calcUrl = `${domain}${calc.url.startsWith('/') ? calc.url : `/${calc.url}`}`;
      entriesMap.set(calcUrl, {
        loc: calcUrl,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.85'
      });
    });

    // 4. 6 Comparison Tools
    COMPARISONS_REGISTRY.forEach((comp) => {
      const compUrl = `${domain}${comp.url.startsWith('/') ? comp.url : `/${comp.url}`}`;
      entriesMap.set(compUrl, {
        loc: compUrl,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.85'
      });
    });

    // 5. Dynamic Articles (from MySQL DB + In-Memory Fallback)
    const articlesMap = new Map<string, { slug: string; lastmod: string; category?: string }>();

    // In-memory published articles
    (inMemoryArticlesStore || []).forEach((art) => {
      if (!art || !art.slug) return;
      if (art.status && art.status !== 'published') return;
      const mod = art.updatedAt || art.publishedAt || art.updated_at || art.published_at || today;
      articlesMap.set(art.slug, {
        slug: art.slug,
        lastmod: String(mod).substring(0, 10),
        category: art.categoryId || art.category_id
      });
    });

    // Database published articles
    try {
      const [rows]: any = await pool.query(
        "SELECT slug, category_id, status, published_at, updated_at FROM articles WHERE status = 'published' AND slug IS NOT NULL"
      );
      if (Array.isArray(rows)) {
        rows.forEach((r: any) => {
          if (!r.slug) return;
          const mod = r.updated_at || r.published_at || today;
          articlesMap.set(r.slug, {
            slug: r.slug,
            lastmod: String(mod).substring(0, 10),
            category: r.category_id
          });
        });
      }
    } catch (err: any) {
      console.warn('SitemapService: DB query fallback:', err?.message || err);
    }

    // Add article URLs
    articlesMap.forEach((art) => {
      // 1. Canonical /article/:slug
      const canonicalArticleUrl = `${domain}/article/${art.slug}`;
      entriesMap.set(canonicalArticleUrl, {
        loc: canonicalArticleUrl,
        lastmod: art.lastmod,
        changefreq: 'weekly',
        priority: '0.8'
      });

      // 2. Category-based URL if category is defined (e.g., /stock-market/:slug)
      if (art.category) {
        const catArticleUrl = `${domain}/${art.category}/${art.slug}`;
        if (!entriesMap.has(catArticleUrl)) {
          entriesMap.set(catArticleUrl, {
            loc: catArticleUrl,
            lastmod: art.lastmod,
            changefreq: 'weekly',
            priority: '0.8'
          });
        }
      }
    });

    const entries = Array.from(entriesMap.values());

    return {
      entries,
      summary: {
        totalUrls: entries.length,
        domain,
        generatedAt: new Date().toISOString(),
        categoriesCount: INITIAL_CATEGORIES.length,
        articlesCount: articlesMap.size,
        calculatorsCount: CALCULATORS_REGISTRY.length,
        comparisonsCount: COMPARISONS_REGISTRY.length,
        staticPagesCount: staticPages.length
      }
    };
  }

  /**
   * Generate valid standard XML Sitemap (xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
   */
  static async generateXml(req?: Request, inMemoryArticlesStore: any[] = []): Promise<string> {
    const { entries } = await this.collectAllUrls(req, inMemoryArticlesStore);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
    xml += `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n`;
    xml += `        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;

    entries.forEach((e) => {
      xml += `  <url>\n`;
      xml += `    <loc>${this.escapeXml(e.loc)}</loc>\n`;
      xml += `    <lastmod>${this.escapeXml(e.lastmod)}</lastmod>\n`;
      xml += `    <changefreq>${e.changefreq}</changefreq>\n`;
      xml += `    <priority>${e.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  }

  /**
   * Ping search engines (Google & Bing) to notify them of sitemap updates
   */
  static async pingSearchEngines(req?: Request): Promise<{ google: boolean; bing: boolean }> {
    const domain = this.getSiteUrl(req);
    const sitemapUrl = encodeURIComponent(`${domain}/sitemap.xml`);

    const results = { google: false, bing: false };

    try {
      const googlePing = `https://www.google.com/ping?sitemap=${sitemapUrl}`;
      const gRes = await fetch(googlePing);
      results.google = gRes.ok || gRes.status === 200 || gRes.status === 404; // Google ping endpoint returns 200 or 404
    } catch {
      results.google = false;
    }

    try {
      const bingPing = `https://www.bing.com/ping?sitemap=${sitemapUrl}`;
      const bRes = await fetch(bingPing);
      results.bing = bRes.ok;
    } catch {
      results.bing = false;
    }

    return results;
  }
}
