import { Article, Author } from '../types';
import { getUserCurrencyPreference } from '../utils/currency';
import { AdService } from './adService';

export class SeoService {
  /**
   * Update page document title, meta tags, open graph, twitter card, and canonical URL
   */
  static updateMetaTags(
    title: string,
    description: string,
    image?: string,
    url?: string,
    canonicalUrl?: string,
    noIndex: boolean = false
  ): void {
    const domain = window.location.origin;
    const formattedTitle = title.includes('TheStockTimes.online')
      ? title
      : `${title} | TheStockTimes.online`;

    document.title = formattedTitle;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      metaDesc.setAttribute('content', description);
      document.head.appendChild(metaDesc);
    }

    // Robots Meta Tag
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    if (noIndex) {
      metaRobots.setAttribute('content', 'noindex, nofollow');
    } else {
      metaRobots.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }
    // Google AdSense Account Verification Meta Tag
    const adsensePublisherId = AdService.getAdSenseConfig().publisherId;
    let metaAdSense = document.querySelector('meta[name="google-adsense-account"]');
    if (!metaAdSense) {
      metaAdSense = document.createElement('meta');
      metaAdSense.setAttribute('name', 'google-adsense-account');
      metaAdSense.setAttribute('content', adsensePublisherId);
      document.head.appendChild(metaAdSense);
    } else {
      metaAdSense.setAttribute('content', adsensePublisherId);
    }

    // Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl || url || `${domain}${window.location.pathname || '/'}`);

    // Open Graph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', formattedTitle);

    // Open Graph Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    // Open Graph Image
    if (image) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.setAttribute('content', image);
    }

    // Open Graph URL
    if (url || canonicalUrl) {
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', canonicalUrl || url || domain);
    }

    // Twitter Card Meta
    let twTitle = document.querySelector('meta[property="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', formattedTitle);

    let twDesc = document.querySelector('meta[property="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', description);

    if (image) {
      let twImage = document.querySelector('meta[property="twitter:image"]');
      if (twImage) twImage.setAttribute('content', image);
    }
  }

  /**
   * Dynamically inject JSON-LD Schema into <head>
   */
  static injectJsonLd(schemaObj: object | object[]): void {
    let scriptTag = document.getElementById('dynamic-jsonld-schema') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'dynamic-jsonld-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemaObj, null, 2);
  }

  /**
   * Generate FAQPage Schema (JSON-LD)
   */
  static generateFaqSchema(
    faqs: { question: string; answer: string }[]
  ): object | null {
    if (!faqs || faqs.length === 0) {
      return null;
    }

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }

  /**
   * Generate NewsArticle Schema (JSON-LD)
   */
  static generateArticleSchema(article: Article, _author?: Author): object {
    const domain = window.location.origin;
    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${domain}/article/${article.slug}`
      },
      "headline": article.seoTitle || article.title,
      "description": article.seoDescription || article.excerpt,
      "image": [article.featuredImage],
      "datePublished": article.publishedAt,
      "dateModified": article.updatedAt || article.publishedAt,
      "author": {
        "@type": "Organization",
        "name": "The Stock Times",
        "url": domain
      },
      "publisher": {
        "@type": "NewsMediaOrganization",
        "name": "TheStockTimes.online",
        "url": domain,
        "logo": {
          "@type": "ImageObject",
          "url": `${domain}/logo.png`
        },
        "publishingPrinciples": `${domain}/legal/disclaimer`
      }
    };
  }

  /**
   * Generate WebApplication Schema for Calculators & Tools
   */
  static generateWebApplicationSchema(toolName: string, description: string, url: string): object {
    const domain = window.location.origin;
    return {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": toolName,
      "description": description,
      "url": url,
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "inLanguage": "en",
      "isAccessibleForFree": true,
      "creator": {
        "@type": "Organization",
        "name": "The Stock Times",
        "url": domain
      },
      "publisher": {
        "@type": "NewsMediaOrganization",
        "name": "TheStockTimes.online",
        "url": domain
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": getUserCurrencyPreference().currency
      }
    };
  }

  static generateItemListSchema(name: string, items: { name: string; url: string; description?: string }[]): object {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": name,
      "numberOfItems": items.length,
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "description": item.description,
        "url": item.url
      }))
    };
  }

  /**
   * Generate Multi-level Breadcrumb Schema
   */
  static generateBreadcrumbSchema(items: { name: string; url: string }[]): object {
    const domain = window.location.origin;
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "TheStockTimes.online",
          "item": domain
        },
        ...items.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 2,
          "name": item.name,
          "item": item.url.startsWith('http') ? item.url : `${domain}${item.url}`
        }))
      ]
    };
  }

  /**
   * Generate WebSite Schema with SearchAction
   */
  static generateWebSiteSchema(): object {
    const domain = window.location.origin;
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "TheStockTimes.online",
      "alternateName": "The Stock Times Financial Publication",
      "url": domain,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${domain}/search/{search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };
  }

  /**
   * Generate Sitemap XML for ALL PUBLIC PAGES (Excludes /admin)
   */
  static generateSitemapXml(articles: Article[]): string {
    const domain = window.location.origin;
    const date = new Date().toISOString().split('T')[0];

    // All public routes (Excludes /admin)
    const staticRoutes = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/stock-market', priority: '0.9', changefreq: 'daily' },
      { path: '/ipo', priority: '0.9', changefreq: 'daily' },
      { path: '/personal-finance', priority: '0.9', changefreq: 'daily' },
      { path: '/banking', priority: '0.9', changefreq: 'daily' },
      { path: '/investment', priority: '0.9', changefreq: 'daily' },
      { path: '/finance-news', priority: '0.9', changefreq: 'daily' },
      { path: '/financial-tools', priority: '0.9', changefreq: 'weekly' },
      { path: '/comparison-tools', priority: '0.9', changefreq: 'weekly' },
      { path: '/search', priority: '0.7', changefreq: 'weekly' },
      { path: '/about', priority: '0.8', changefreq: 'monthly' },
      { path: '/contact', priority: '0.8', changefreq: 'monthly' },
      { path: '/legal/privacy', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/terms', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/disclaimer', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/cookie', priority: '0.5', changefreq: 'monthly' },

      // 20 Financial Calculators
      { path: '/financial-tools/emi-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/loan-eligibility-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/sip-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/lumpsum-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/cagr-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/swp-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/sip-vs-lumpsum', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/fd-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/rd-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/ppf-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/epf-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/nps-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/income-tax-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/salary-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/gst-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/retirement-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/inflation-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/compound-interest-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/simple-interest-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/net-worth-calculator', priority: '0.85', changefreq: 'weekly' },

      // 6 Comparison Tools
      { path: '/comparison-tools/sip-vs-fd', priority: '0.85', changefreq: 'weekly' },
      { path: '/comparison-tools/fd-vs-debt-fund', priority: '0.85', changefreq: 'weekly' },
      { path: '/comparison-tools/rent-vs-buy', priority: '0.85', changefreq: 'weekly' },
      { path: '/comparison-tools/loan-comparison', priority: '0.85', changefreq: 'weekly' },
      { path: '/comparison-tools/credit-card-comparison', priority: '0.85', changefreq: 'weekly' },
      { path: '/comparison-tools/mutual-fund-comparison', priority: '0.85', changefreq: 'weekly' }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    staticRoutes.forEach(route => {
      xml += `  <url>\n    <loc>${domain}${route.path}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>\n`;
    });

    articles.forEach(art => {
      xml += `  <url>\n    <loc>${domain}/article/${art.slug}</loc>\n    <lastmod>${art.updatedAt || art.publishedAt}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  }

  /**
   * Generate Robots.txt (Disallows /admin and /admin)
   */
  static generateRobotsTxt(): string {
    const domain = window.location.origin;
    return `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin\n\nSitemap: ${domain}/sitemap.xml`;
  }
}
