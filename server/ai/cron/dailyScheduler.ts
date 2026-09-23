import cron from 'node-cron';
import { runTrendAgent } from '../agents/trend.agent';
import { addArticleJobToQueue } from '../services/queueService';

export function startDailyAiScheduler() {
  const articlesPerDay = Number(process.env.AI_ARTICLES_PER_DAY || 3);
  const rawTargetCountries = process.env.AI_TARGET_COUNTRIES || 'US,UK';
  const targetCountries = rawTargetCountries.split(',').map(c => c.trim().toUpperCase() as 'US' | 'UK');

  console.log(`⏰ [DailyAiScheduler] Initializing AI Cron (Articles/Day: ${articlesPerDay}, Target Countries: ${targetCountries.join(', ')})`);

  // Run daily at 02:00 AM (server local time)
  cron.schedule('0 2 * * *', async () => {
    console.log('🌅 [DailyAiScheduler] Starting daily autonomous financial content generation...');
    
    for (const country of targetCountries) {
      try {
        const topics = await runTrendAgent(country, Math.max(1, Math.floor(articlesPerDay / targetCountries.length)));
        
        for (const item of topics) {
          const jobId = `job-${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          await addArticleJobToQueue(jobId, item.topic, item.category, country);
        }
      } catch (err: any) {
        console.error(`[DailyAiScheduler] Error processing country ${country}:`, err.message);
      }
    }
  });
}
