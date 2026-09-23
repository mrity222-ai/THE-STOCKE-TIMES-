import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { executeArticlePipeline } from '../graph/workflow';

const REDIS_URL = process.env.REDIS_URL;

let redisClient: Redis | null = null;
let articleQueue: Queue | null = null;
let worker: Worker | null = null;
let isRedisAvailable = false;

if (REDIS_URL) {
  try {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      retryStrategy(times) {
        if (times > 3) return null; // Stop retrying
        return Math.min(times * 200, 1000);
      }
    });

    redisClient.on('connect', () => {
      console.log('✅ Connected to Redis instance for BullMQ background queue.');
      isRedisAvailable = true;
    });

    redisClient.on('error', (err) => {
      if (isRedisAvailable) {
        console.warn('⚠️ Redis connection error:', err.message);
      }
      isRedisAvailable = false;
    });

    articleQueue = new Queue('ai-content-queue', { connection: redisClient });
    articleQueue.on('error', (err) => {
      isRedisAvailable = false;
    });

    worker = new Worker('ai-content-queue', async (job: Job) => {
      console.log(`[BullMQ Worker] ⚡ Processing AI Content Job #${job.id}: "${job.data.topic}"`);
      const result = await executeArticlePipeline(
        job.data.jobId || `job-${Date.now()}`,
        job.data.topic,
        job.data.category || 'personal-finance',
        job.data.country || 'US'
      );
      return result;
    }, { connection: redisClient });

    worker.on('error', (err) => {
      isRedisAvailable = false;
    });

  } catch (err: any) {
    console.warn('⚠️ BullMQ Queue initialized in direct execution mode:', err.message);
  }
} else {
  console.log('ℹ️ REDIS_URL not set. Running AI Content Engine in direct execution mode (no Redis required).');
}

export async function addArticleJobToQueue(jobId: string, topic: string, category: string = 'personal-finance', country: 'US' | 'UK' = 'US') {
  if (isRedisAvailable && articleQueue) {
    try {
      const queuedJob = await articleQueue.add('generate-article', { jobId, topic, category, country });
      console.log(`[QueueService] 📥 Job #${jobId} queued in Redis BullMQ (Queue ID: ${queuedJob.id})`);
      return { queued: true, queueId: queuedJob.id };
    } catch (err: any) {
      console.warn('[QueueService] Failed to push to BullMQ, falling back to direct execution:', err.message);
    }
  }

  // Fallback: Direct async execution
  console.log(`[QueueService] 🔄 Direct execution fallback for Job #${jobId}: "${topic}"`);
  executeArticlePipeline(jobId, topic, category, country).catch(err => {
    console.error(`[QueueService] Direct execution error for Job #${jobId}:`, err);
  });

  return { queued: false, direct: true };
}

export function getQueueStatus() {
  return {
    redisConnected: isRedisAvailable,
    queueName: 'ai-content-queue'
  };
}
