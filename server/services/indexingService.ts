import http from 'http';
import https from 'https';

export class IndexingService {
  /**
   * Automatically pings Google Search Console and Bing IndexNow when a new article is published.
   */
  static async notifySearchEnginesOfNewContent(articleUrl: string, hostDomain: string = 'https://thestocktimes.online'): Promise<{ success: boolean; googlePing: boolean; bingIndexNow: boolean }> {
    console.log(`🌐 [Instant Auto-Indexing Protocol] Notifying Google & Bing for: ${articleUrl}`);

    let googlePing = false;
    let bingIndexNow = false;

    // 1. Google Sitemap Ping Protocol
    try {
      const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${hostDomain}/sitemap.xml`)}`;
      https.get(googlePingUrl, (res) => {
        if (res.statusCode === 200 || res.statusCode === 204) {
          console.log(`✅ [Instant Auto-Indexing] Successfully pinged Google Search Console sitemap!`);
        }
      }).on('error', (err) => console.warn('⚠️ Google Sitemap ping note:', err.message));
      googlePing = true;
    } catch (err: any) {
      console.warn('⚠️ Google Indexing Ping Warning:', err.message);
    }

    // 2. Bing & Yandex IndexNow Protocol
    try {
      const payload = JSON.stringify({
        host: 'thestocktimes.online',
        key: 'dav1e0pr01qrjdu8j23g',
        keyLocation: `${hostDomain}/dav1e0pr01qrjdu8j23g.txt`,
        urlList: [articleUrl]
      });

      const options = {
        hostname: 'api.indexnow.org',
        port: 443,
        path: '/indexnow',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log(`✅ [Instant Auto-Indexing] Successfully submitted URL to Bing IndexNow API!`);
        }
      });
      req.on('error', (err) => console.warn('⚠️ Bing IndexNow note:', err.message));
      req.write(payload);
      req.end();
      bingIndexNow = true;
    } catch (err: any) {
      console.warn('⚠️ IndexNow Submission Warning:', err.message);
    }

    return {
      success: true,
      googlePing,
      bingIndexNow
    };
  }
}
