import { z } from 'zod';
import { GeminiService } from '../services/geminiService';
import { pool } from '../../config/db';

export const OptimizationRecommendationSchema = z.object({
  articleId: z.string(),
  needsUpdate: z.boolean(),
  urgency: z.enum(['HIGH', 'MEDIUM', 'LOW', 'NONE']),
  decayReasons: z.array(z.string()).describe('Reasons why this content is outdated or requires refresh'),
  suggestedTitleUpdate: z.string().optional(),
  suggestedSectionUpdates: z.array(z.object({
    sectionHeading: z.string(),
    reason: z.string(),
    recommendedAction: z.string()
  }))
});

export type OptimizationRecommendation = z.infer<typeof OptimizationRecommendationSchema>;

export async function runOptimizationAgent(articleId: string, title: string, content: string): Promise<OptimizationRecommendation> {
  console.log(`[OptimizationAgent] 🔍 Auditing article content for decay: "${title}" (${articleId})`);

  const prompt = `You are the Content Decoupled Optimization Agent for a financial publication.
Analyze the following financial article content for rate staleness, outdated years, or missing regulatory disclaimers:

Title: ${title}
Content snippet: ${content.slice(0, 3000)}

Audit the content against current 2026 financial realities:
1. Check if interest rates, Fed/BoE rate references, or year numbers (e.g. 2024/2025) are outdated.
2. Check if regulatory or bank product numbers are accurate.
3. Recommend specific title or section updates.`;

  const result = await GeminiService.generateStructuredJson(
    prompt,
    OptimizationRecommendationSchema,
    'Content Optimization Agent'
  );

  if (result.data.needsUpdate) {
    const revisionId = `rev-${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    try {
      await pool.query(
        `INSERT INTO article_revisions (id, article_id, revised_by, title, content, changelog) VALUES (?, ?, 'AI_ENGINE', ?, ?, ?)`,
        [revisionId, articleId, result.data.suggestedTitleUpdate || title, content, JSON.stringify(result.data.decayReasons)]
      );
    } catch (e: any) {
      console.warn(`[OptimizationAgent] DB Save note: ${e.message}`);
    }
  }

  return result.data;
}
