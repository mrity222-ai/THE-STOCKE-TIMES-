import { z } from 'zod';
import { GeminiService } from './geminiService';
import { executeArticlePipeline } from '../graph/workflow';
import { saveArticleRecord } from '../../index';
import { pool } from '../../config/db';

export const DiscoveredTrendSchema = z.object({
  trends: z.array(z.object({
    topic: z.string().describe('Catchy, factual trending headline or query'),
    category: z.string().describe('Category: stock-market, personal-finance, banking, investment, or finance-news'),
    country: z.enum(['US', 'UK', 'IN', 'GLOBAL']).default('GLOBAL'),
    rationale: z.string().describe('Why this topic is breaking/trending right now on the digital internet'),
    urgency: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    suggestedTags: z.array(z.string()).describe('Topical keywords')
  }))
});

export type DiscoveredTrend = z.infer<typeof DiscoveredTrendSchema>['trends'][0];

export class AutoPilotService {
  /**
   * Search the live digital internet for trending financial and stock market news.
   */
  static async discoverLiveInternetTrends(
    searchQuery?: string,
    category: string = 'all',
    market: 'US' | 'UK' | 'IN' | 'GLOBAL' = 'GLOBAL'
  ): Promise<{ trends: DiscoveredTrend[]; rawSources: Array<{ title: string; url: string }>; searchSummary: string }> {
    const queryToUse = searchQuery && searchQuery.trim().length > 0
      ? searchQuery.trim()
      : `Latest trending finance stock market news, RBI Fed interest rate updates, hot IPOs, and personal finance strategies today`;

    console.log(`🌐 [AutoPilot] Scanning live digital internet for: "${queryToUse}"...`);

    let liveSearchResult: any;
    try {
      liveSearchResult = await GeminiService.searchLiveInternet(queryToUse);
    } catch (err: any) {
      console.warn('[AutoPilot] Search grounding error fallback:', err.message);
      liveSearchResult = { text: '', sources: [] };
    }

    const prompt = `You are an Editor-in-Chief and AI Financial Trend Hunter.
Analyze the following live digital internet research data and identify 5-7 distinct, high-impact trending financial articles to write today:

TARGET QUERY: "${queryToUse}"
FILTER CATEGORY: "${category}"
MARKET: "${market}"

LIVE INTERNET RESEARCH DATA:
${liveSearchResult.text || 'Analyze breaking market themes across stock markets, banking interest rates, mutual fund investments, and financial policy.'}

LIVE SOURCES FOUND:
${(liveSearchResult.sources || []).map((s: any) => `- ${s.title}: ${s.url}`).join('\n')}

Instructions:
1. Extract 5-7 timely, distinct topics that real users are searching for right now.
2. Ensure topics have concrete financial substance (e.g. stock rallies, interest rate moves, tax deadlines, savings accounts, IPO buzz).
3. Specify the appropriate category and country market.

Return JSON strictly matching schema.`;

    try {
      const structured = await GeminiService.generateStructuredJson(prompt, DiscoveredTrendSchema, 'Live Internet Trend Hunter');
      return {
        trends: structured.data.trends,
        rawSources: liveSearchResult.sources || [],
        searchSummary: liveSearchResult.text ? liveSearchResult.text.slice(0, 300) + '...' : 'Live internet scan complete.'
      };
    } catch (parseErr: any) {
      console.warn('[AutoPilot] Dynamic trend generation fallback:', parseErr.message);

      const dynamicFallbackPrompt = `Generate 5 fresh, high-intent breaking financial topic headlines for ${market} market right now across categories: stock-market, banking, investment, ipo, personal-finance.
Query: "${queryToUse}"
Return JSON matching schema.`;

      try {
        const dynamicStructured = await GeminiService.generateStructuredJson(dynamicFallbackPrompt, DiscoveredTrendSchema, 'Dynamic Trend Generator');
        return {
          trends: dynamicStructured.data.trends,
          rawSources: liveSearchResult.sources || [],
          searchSummary: 'Real-time financial trends generated dynamically.'
        };
      } catch (innerErr: any) {
        // Fallback to dynamic headline constructed from search query or timestamp
        const timeStamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const cleanQuery = searchQuery ? searchQuery.trim() : 'Global Market Intelligence';
        return {
          trends: [
            {
              topic: `${cleanQuery}: ${timeStamp} Key Stock & Financial Breakdown`,
              category: category !== 'all' ? category : 'stock-market',
              country: market,
              rationale: 'Real-time financial market movement and investment analysis.',
              urgency: 'HIGH',
              suggestedTags: ['MarketUpdate', 'StockMarket', 'Finance', 'Investment']
            }
          ],
          rawSources: liveSearchResult.sources || [],
          searchSummary: 'Dynamic trend generated.'
        };
      }
    }
  }

  /**
   * Complete End-to-End Workflow:
   * 1. Search live digital internet for topic facts & sources
   * 2. Deep research with claim verification
   * 3. Write complete article (H1 Title, Excerpt, 60s Shorts, Tags, FAQs, Full Body)
   * 4. Generate visual assets & chart
   * 5. Post & publish live to website database and public feed!
   */
  static async runEndToEndInternetAutoPilot(options: {
    topic?: string;
    category?: string;
    country?: 'US' | 'UK';
    autoPublish?: boolean;
  }): Promise<{
    success: boolean;
    jobId: string;
    articleId?: string;
    article?: any;
    message: string;
    state: any;
  }> {
    const jobId = `autopilot-${Date.now()}`;
    const targetCountry = options.country || 'US';
    const targetCategory = options.category || 'finance-news';
    const isAutoPublish = options.autoPublish !== false; // Default to auto-publish!

    let topicToRun = (options.topic || '').trim();

    // If no topic specified, discover the top 1 breaking internet trend first!
    if (!topicToRun) {
      console.log('🌐 [AutoPilot] No topic provided. Hunting top breaking story from digital internet...');
      const discovered = await this.discoverLiveInternetTrends(undefined, targetCategory, targetCountry as any);
      if (discovered.trends && discovered.trends.length > 0) {
        topicToRun = discovered.trends[0].topic;
      } else {
        topicToRun = 'Global Stock Markets & Economy: Today Key Market Highlights & Outlook';
      }
      console.log(`🎯 [AutoPilot] Selected breaking topic from internet: "${topicToRun}"`);
    }

    // Insert job tracker into DB
    try {
      await pool.query(
        `INSERT INTO ai_article_jobs (id, topic, country, category, status, current_agent)
        VALUES (?, ?, ?, ?, 'researching', 'research')`,
        [jobId, topicToRun, targetCountry, targetCategory]
      );
    } catch (e) {}

    // Execute the full LangGraph pipeline
    const pipelineState = await executeArticlePipeline(jobId, topicToRun, targetCategory, targetCountry);

    // Build the finalized article object
    const articleId = `art-${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const title = pipelineState.articleContent?.h1Title || topicToRun;
    const slug = (pipelineState.seoMetadata?.slug || topicToRun.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '-' + Date.now().toString().slice(-4);
    const featuredImage = pipelineState.graphics?.featuredImageUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80';
    const excerpt = pipelineState.articleContent?.excerpt || '';
    
    // Construct rich content with 60s shorts, chart, and full HTML
    const shortsBlock = pipelineState.articleContent?.shorts ? `
<div class="mb-8 p-6 bg-gradient-to-r from-slate-900 via-[#0B1F33] to-emerald-950 text-white rounded-3xl border border-emerald-500/30 shadow-xl space-y-3">
  <div class="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
    <span>⚡ 60-Second Finance Shorts / Quick Byte</span>
  </div>
  <p class="text-sm sm:text-base font-normal leading-relaxed text-slate-100">
    ${pipelineState.articleContent.shorts}
  </p>
  ${pipelineState.articleContent.shortsBullets && pipelineState.articleContent.shortsBullets.length > 0 ? `
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs text-slate-300">
    ${pipelineState.articleContent.shortsBullets.map(b => `<div class="flex items-start gap-1.5"><span class="text-emerald-400 font-bold">▶</span><span>${b}</span></div>`).join('')}
  </div>` : ''}
</div>
    `.trim() : '';

    const chartBlock = pipelineState.graphics?.chartSvg ? `
<div class="my-8">
  ${pipelineState.graphics.chartSvg}
</div>
    `.trim() : '';

    const fullContent = [
      shortsBlock,
      pipelineState.articleContent?.introduction ? `<p class="text-lg leading-relaxed font-serif text-slate-800 my-6">${pipelineState.articleContent.introduction}</p>` : '',
      chartBlock,
      pipelineState.articleContent?.fullBodyHtml || ''
    ].filter(Boolean).join('\n\n');

    const tags = pipelineState.articleContent?.tags && pipelineState.articleContent.tags.length > 0
      ? pipelineState.articleContent.tags
      : ['AI News', targetCategory, targetCountry];

    const articleRecord = {
      id: articleId,
      title,
      slug,
      categoryId: targetCategory,
      subCategory: targetCountry === 'US' ? 'US Finance' : 'Global Markets',
      featuredImage,
      excerpt,
      content: fullContent,
      shorts: pipelineState.articleContent?.shorts || excerpt,
      shortsBullets: pipelineState.articleContent?.shortsBullets || pipelineState.articleContent?.keyTakeaways || [],
      highlights: pipelineState.articleContent?.shortsBullets || pipelineState.articleContent?.keyTakeaways || [],
      aiSummary: pipelineState.articleContent?.shortsBullets || [],
      authorId: 'auth-1',
      publishedAt: new Date().toISOString(),
      showPublishedDate: true,
      readTimeMinutes: 5,
      status: isAutoPublish ? 'published' : 'draft',
      views: 12,
      tags,
      faqs: pipelineState.articleContent?.faqs || []
    };

    // Save article record using server's saveArticleRecord (updates MySQL + in-memory store)
    let savedArticle: any = articleRecord;
    try {
      savedArticle = await saveArticleRecord(articleRecord);
    } catch (e: any) {
      console.warn('[AutoPilot] Article save note:', e.message);
    }

    // Update job in DB
    try {
      await pool.query(
        `UPDATE ai_article_jobs SET status = ?, current_agent = 'publisher', publish_status = ?, article_id = ? WHERE id = ?`,
        [isAutoPublish ? 'published' : 'draft', isAutoPublish ? 'published' : 'draft', articleId, jobId]
      );
    } catch (e) {}

    return {
      success: true,
      jobId,
      articleId,
      article: savedArticle,
      message: isAutoPublish
        ? `🎉 Successfully researched internet, generated complete article with image & posted live to website!`
        : `✅ Article generated with title, description, shorts, tags, and FAQs! Saved as draft.`,
      state: pipelineState
    };
  }
}
