import { z } from 'zod';
import { GeminiService } from '../services/geminiService';
import { pool } from '../../config/db';

export const KeywordAnalysisSchema = z.object({
  topic: z.string().describe('Target financial topic'),
  primaryKeyword: z.string().describe('Target primary SEO keyword string'),
  secondaryKeywords: z.array(z.string()).describe('List of 3-5 LSI/secondary keyword variations'),
  searchIntent: z.enum(['informational', 'commercial', 'transactional']).describe('User search intent type'),
  targetAudienceIntent: z.string().describe('What the searcher is specifically looking to calculate, compare, or understand'),
  recommendedSlug: z.string().describe('SEO URL slug'),
  difficultyScore: z.number().min(0).max(100).describe('Estimated keyword difficulty score out of 100')
});

export const KeywordResponseSchema = z.object({
  analyzedKeywords: z.array(KeywordAnalysisSchema)
});

export type KeywordAnalysis = z.infer<typeof KeywordAnalysisSchema>;

export async function runKeywordAgent(topics: string[], country: 'US' | 'UK' = 'US'): Promise<KeywordAnalysis[]> {
  console.log(`[KeywordAgent] 🔑 Analyzing search intent for ${topics.length} topics in ${country}...`);

  const prompt = `You are the Keyword & Search Intent Agent for a financial media platform.
Analyze the following topics for target country ${country}:
${topics.map((t, idx) => `${idx + 1}. ${t}`).join('\n')}

For each topic:
1. Identify the high-performing primary keyword.
2. Identify 3-5 secondary LSI keywords.
3. Classify search intent as informational, commercial, or transactional.
4. Provide a recommended SEO URL slug.
5. Provide an estimated difficulty score (0-100).

DO NOT invent numerical search volume numbers (search volume will remain NULL until API hookup).`;

  const result = await GeminiService.generateStructuredJson(
    prompt,
    KeywordResponseSchema,
    'Keyword & Intent Agent'
  );

  for (const item of result.data.analyzedKeywords) {
    const kwId = `kw-${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const topicId = item.recommendedSlug || item.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    try {
      await pool.query(
        `INSERT INTO ai_keywords (id, topic_id, keyword, intent, relevance_score) VALUES (?, ?, ?, ?, ?)`,
        [kwId, topicId || country.toLowerCase(), item.primaryKeyword, item.searchIntent, Math.max(0, 100 - item.difficultyScore)]
      );
    } catch (e: any) {
      console.warn(`[KeywordAgent] DB save note: ${e.message}`);
    }
  }

  return result.data.analyzedKeywords;
}
