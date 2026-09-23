import { z } from 'zod';
import { GeminiService } from '../services/geminiService';
import { pool } from '../../config/db';

export const TrendTopicSchema = z.object({
  topic: z.string().describe('Target financial topic title'),
  category: z.string().describe('Financial subcategory (e.g. personal-finance, credit-cards, mortgages, investing, taxes, central-bank)'),
  country: z.enum(['US', 'UK']).describe('Target country market'),
  targetAudience: z.string().describe('Intended reader persona'),
  rationale: z.string().describe('Why this topic is high search intent and relevant right now'),
  urgency: z.enum(['HIGH', 'MEDIUM', 'LOW'])
});

export const TrendResponseSchema = z.object({
  trendingTopics: z.array(TrendTopicSchema)
});

export type TrendTopic = z.infer<typeof TrendTopicSchema>;

export async function runTrendAgent(country: 'US' | 'UK' = 'US', count: number = 3): Promise<TrendTopic[]> {
  console.log(`[TrendAgent] 📈 Discovering ${count} financial topics for ${country}...`);

  const prompt = `You are the Trend Discovery Agent for a premier financial publication targeting ${country}.
Generate ${count} high-intent consumer financial topics relevant for readers in ${country} right now.
Focus on topics like: high-yield savings accounts, mortgage rates/refinancing, tax filing strategies, ISA/401(k)/IRA savings, credit card comparison, central bank interest rate decisions.

Return a JSON object with "trendingTopics" array adhering strictly to the schema.`;

  const result = await GeminiService.generateStructuredJson(
    prompt,
    TrendResponseSchema,
    'Trend Discovery Agent'
  );

  const savedTopics: TrendTopic[] = [];

  for (const item of result.data.trendingTopics) {
    const topicId = `top-${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    try {
      await pool.query(
        `INSERT INTO ai_topics (id, title, country, category, trend_reason, status) VALUES (?, ?, ?, ?, ?, 'DISCOVERED')`,
        [topicId, item.topic, item.country || country, item.category || 'personal-finance', item.rationale || 'AI trend discovery']
      );
    } catch (e: any) {
      console.warn(`[TrendAgent] DB save note: ${e.message}`);
    }
    savedTopics.push(item);
  }

  return savedTopics;
}
