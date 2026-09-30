import cron from 'node-cron';
import { pool } from '../../config/db';
import { AutoPilotService } from '../services/autoPilotService';

export interface AiSchedulerConfig {
  enabled: boolean;
  articlesPerDay: number;
  postingIntervalHours: number;
  minWordCount: number;
  targetMarkets: ('US' | 'UK' | 'IN' | 'GLOBAL')[];
  targetCategories: string[];
  autoPublish: boolean;
  seoOptimization: boolean;
  aeoOptimization: boolean;
  geoOptimization: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  totalAutonomousPublished: number;
  recentLogs: Array<{
    timestamp: string;
    topic: string;
    category: string;
    country: string;
    status: 'success' | 'failed';
    articleId?: string;
    slug?: string;
    wordCount?: number;
    message: string;
  }>;
}

const DEFAULT_CONFIG: AiSchedulerConfig = {
  enabled: true,
  articlesPerDay: 4,
  postingIntervalHours: 6,
  minWordCount: 2000,
  targetMarkets: ['US', 'UK', 'IN', 'GLOBAL'],
  targetCategories: ['stock-market', 'banking', 'personal-finance', 'investment', 'finance-news', 'ipo'],
  autoPublish: true,
  seoOptimization: true,
  aeoOptimization: true,
  geoOptimization: true,
  lastRunAt: undefined,
  nextRunAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // First run 15 mins after boot or scheduled
  totalAutonomousPublished: 0,
  recentLogs: []
};

let inMemoryConfig: AiSchedulerConfig = { ...DEFAULT_CONFIG };
let isJobRunning = false;

function countWords(htmlOrText: string): number {
  if (!htmlOrText) return 0;
  const clean = htmlOrText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return clean ? clean.split(/\s+/).length : 0;
}

function calculateNextRun(intervalHours: number): string {
  const safeHours = Math.max(0.5, Math.min(24, intervalHours || 6));
  const nextTime = new Date(Date.now() + safeHours * 60 * 60 * 1000);
  return nextTime.toISOString();
}

/**
 * Load settings from DB or in-memory fallback
 */
export async function getSchedulerSettings(): Promise<AiSchedulerConfig> {
  try {
    const [rows]: any = await pool.query('SELECT * FROM ai_scheduler_settings WHERE id = 1 LIMIT 1');
    if (Array.isArray(rows) && rows.length > 0) {
      const r = rows[0];
      const parsedLogs = r.recent_logs_json ? JSON.parse(r.recent_logs_json) : inMemoryConfig.recentLogs;
      const parsedMarkets = r.target_markets ? r.target_markets.split(',') : inMemoryConfig.targetMarkets;
      const parsedCategories = r.target_categories ? JSON.parse(r.target_categories) : inMemoryConfig.targetCategories;

      inMemoryConfig = {
        enabled: Boolean(r.enabled),
        articlesPerDay: Number(r.articles_per_day) || 4,
        postingIntervalHours: Number(r.posting_interval_hours) || 6,
        minWordCount: Number(r.min_word_count) || 2000,
        targetMarkets: parsedMarkets,
        targetCategories: parsedCategories,
        autoPublish: Boolean(r.auto_publish),
        seoOptimization: Boolean(r.seo_optimization ?? true),
        aeoOptimization: Boolean(r.aeo_optimization ?? true),
        geoOptimization: Boolean(r.geo_optimization ?? true),
        lastRunAt: r.last_run_at || inMemoryConfig.lastRunAt,
        nextRunAt: r.next_run_at || inMemoryConfig.nextRunAt,
        totalAutonomousPublished: Number(r.total_autonomous_published) || inMemoryConfig.totalAutonomousPublished,
        recentLogs: parsedLogs
      };
    }
  } catch (err: any) {
    // MySQL table not ready yet or fallback mode
  }
  return inMemoryConfig;
}

/**
 * Update scheduler settings from Admin Panel
 */
export async function updateSchedulerSettings(partial: Partial<AiSchedulerConfig>): Promise<AiSchedulerConfig> {
  const current = await getSchedulerSettings();

  const articlesPerDay = Math.max(1, Math.min(24, partial.articlesPerDay ?? current.articlesPerDay));
  const derivedInterval = Number((24 / articlesPerDay).toFixed(1));
  const postingIntervalHours = partial.postingIntervalHours ?? derivedInterval;

  const updated: AiSchedulerConfig = {
    ...current,
    ...partial,
    articlesPerDay,
    postingIntervalHours,
    minWordCount: Math.max(1500, partial.minWordCount ?? current.minWordCount ?? 2000)
  };

  // Recalculate next run if interval changed or enabled toggled
  if (partial.enabled !== undefined || partial.articlesPerDay !== undefined || !updated.nextRunAt) {
    updated.nextRunAt = calculateNextRun(postingIntervalHours);
  }

  inMemoryConfig = updated;

  try {
    await pool.query(
      `INSERT INTO ai_scheduler_settings (
        id, enabled, articles_per_day, posting_interval_hours, min_word_count,
        target_markets, target_categories, auto_publish, seo_optimization,
        aeo_optimization, geo_optimization, last_run_at, next_run_at,
        total_autonomous_published, recent_logs_json
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        enabled = VALUES(enabled),
        articles_per_day = VALUES(articles_per_day),
        posting_interval_hours = VALUES(posting_interval_hours),
        min_word_count = VALUES(min_word_count),
        target_markets = VALUES(target_markets),
        target_categories = VALUES(target_categories),
        auto_publish = VALUES(auto_publish),
        seo_optimization = VALUES(seo_optimization),
        aeo_optimization = VALUES(aeo_optimization),
        geo_optimization = VALUES(geo_optimization),
        last_run_at = VALUES(last_run_at),
        next_run_at = VALUES(next_run_at),
        total_autonomous_published = VALUES(total_autonomous_published),
        recent_logs_json = VALUES(recent_logs_json)`,
      [
        updated.enabled ? 1 : 0,
        updated.articlesPerDay,
        updated.postingIntervalHours,
        updated.minWordCount,
        updated.targetMarkets.join(','),
        JSON.stringify(updated.targetCategories),
        updated.autoPublish ? 1 : 0,
        updated.seoOptimization ? 1 : 0,
        updated.aeoOptimization ? 1 : 0,
        updated.geoOptimization ? 1 : 0,
        updated.lastRunAt || null,
        updated.nextRunAt || null,
        updated.totalAutonomousPublished,
        JSON.stringify(updated.recentLogs.slice(0, 30))
      ]
    );
  } catch (err: any) {
    console.warn('⚠️ Unable to persist ai_scheduler_settings to DB:', err.message);
  }

  return updated;
}

/**
 * Execute 1 full autonomous cycle:
 * 1. Scan live internet
 * 2. Deep research with claim verification
 * 3. Write 2000+ words article with SEO, AEO, and GEO
 * 4. Generate visual asset and chart
 * 5. Publish live to site
 */
export async function triggerAutonomousCycle(topicOverride?: string): Promise<{ success: boolean; message: string; article?: any }> {
  if (isJobRunning) {
    return { success: false, message: 'An autonomous AI cycle is currently in progress. Please wait.' };
  }

  isJobRunning = true;
  const config = await getSchedulerSettings();
  const startTime = new Date().toISOString();

  // Rotate or pick random market and category from targets
  const marketPool = config.targetMarkets && config.targetMarkets.length > 0 ? config.targetMarkets : ['GLOBAL'];
  const categoryPool = config.targetCategories && config.targetCategories.length > 0 ? config.targetCategories : ['stock-market', 'banking', 'personal-finance'];
  
  const selectedMarket = marketPool[Math.floor(Math.random() * marketPool.length)] as any;
  const selectedCategory = categoryPool[Math.floor(Math.random() * categoryPool.length)];

  console.log(`🤖 [Autonomous Scheduler] Triggering Auto-Pilot Run (${config.articlesPerDay} articles/day target)...`);
  console.log(`🎯 Market: ${selectedMarket}, Category: ${selectedCategory}, Min Target Words: ${config.minWordCount}`);

  try {
    const result = await AutoPilotService.runEndToEndInternetAutoPilot({
      topic: topicOverride,
      category: selectedCategory,
      country: selectedMarket === 'UK' ? 'UK' : 'US',
      autoPublish: config.autoPublish
    });

    const publishedArticle = result.article;
    const words = publishedArticle ? countWords(publishedArticle.content) : 0;
    const nowIso = new Date().toISOString();

    const logEntry = {
      timestamp: nowIso,
      topic: publishedArticle?.title || result.jobId,
      category: selectedCategory,
      country: selectedMarket,
      status: result.success ? 'success' as const : 'failed' as const,
      articleId: result.articleId,
      slug: publishedArticle?.slug,
      wordCount: words,
      message: result.message
    };

    const nextRun = calculateNextRun(config.postingIntervalHours);
    const updatedTotal = config.totalAutonomousPublished + (result.success ? 1 : 0);

    const newLogs = [logEntry, ...(config.recentLogs || [])].slice(0, 30);

    await updateSchedulerSettings({
      lastRunAt: nowIso,
      nextRunAt: nextRun,
      totalAutonomousPublished: updatedTotal,
      recentLogs: newLogs
    });

    console.log(`🎉 [Autonomous Scheduler] Run finished! Words: ${words}, Article: "${publishedArticle?.title}". Next run: ${nextRun}`);
    return {
      success: true,
      message: `Autonomous article published! Word count: ${words}. Next auto-run in ${config.postingIntervalHours} hours.`,
      article: publishedArticle
    };
  } catch (err: any) {
    console.error('❌ [Autonomous Scheduler] Execution failed:', err);
    const failEntry = {
      timestamp: new Date().toISOString(),
      topic: topicOverride || 'Live Internet Scan',
      category: selectedCategory,
      country: selectedMarket,
      status: 'failed' as const,
      wordCount: 0,
      message: err.message
    };
    await updateSchedulerSettings({
      lastRunAt: startTime,
      nextRunAt: calculateNextRun(config.postingIntervalHours),
      recentLogs: [failEntry, ...(config.recentLogs || [])].slice(0, 30)
    });
    return { success: false, message: `Autonomous cycle error: ${err.message}` };
  } finally {
    isJobRunning = false;
  }
}

/**
 * Starts the background autonomous scheduler ticker
 */
export function startDailyAiScheduler() {
  console.log(`⏰ [Autonomous Scheduler] Initializing background continuous engine...`);

  // Run a lightweight tick every 60 seconds to check if next_run_at has arrived
  cron.schedule('* * * * *', async () => {
    try {
      const config = await getSchedulerSettings();
      if (!config.enabled) return;

      const now = Date.now();
      const nextRunTime = config.nextRunAt ? new Date(config.nextRunAt).getTime() : 0;

      // If scheduled time has arrived and no job is running
      if (nextRunTime > 0 && now >= nextRunTime && !isJobRunning) {
        console.log(`🔔 [Autonomous Scheduler] Scheduled time reached (${new Date().toLocaleTimeString()}). Executing cycle...`);
        await triggerAutonomousCycle();
      }
    } catch (err: any) {
      console.warn('Scheduler tick warning:', err.message);
    }
  });

  // Also ensure settings table is populated
  getSchedulerSettings().catch(() => {});
}
