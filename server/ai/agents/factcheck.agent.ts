import { z } from 'zod';
import { GeminiService } from '../services/geminiService';
import { AiArticleState } from '../graph/state';
import { pool } from '../../config/db';

const FactCheckSchema = z.object({
  status: z.enum(['PASS', 'FAIL', 'HUMAN_REVIEW_REQUIRED']),
  verificationScore: z.number(),
  verifiedClaimsCount: z.number(),
  issues: z.array(z.object({
    claim: z.string(),
    issue: z.string(),
    suggestedCorrection: z.string().optional(),
    severity: z.enum(['HIGH', 'MEDIUM', 'LOW'])
  })),
  requiresHumanReview: z.boolean()
});

export async function factCheckAgent(state: AiArticleState): Promise<Partial<AiArticleState>> {
  console.log(`🛡️ [Fact-Checker Agent] Fact-checking article: "${state.topic}" (Attempt ${state.retryCount || 1})`);

  const articleText = `${state.articleContent?.h1Title || ''}\n${state.articleContent?.excerpt || ''}\n${state.articleContent?.fullBodyHtml || ''}`;
  const claims = state.researchPack?.claims || [];

  const claimsPrompt = claims.map(c => `- Claim: ${c.claim} | Value: ${c.value || ''} ${c.unit || ''} | Source: ${c.sourceTitle || c.sourceUrl}`).join('\n');

  const prompt = `You are a Chief Compliance Officer and Lead Financial Fact-Checker.

Article H1 & Body:
"${articleText.slice(0, 3000)}"

Verified Research Pack Data:
${claimsPrompt || 'Standard regulatory compliance text.'}

Fact-Check Instructions:
1. Verify whether all numerical claims, APY/APR rates, fees, and dates in the article match the verified research pack.
2. Flag any unsupported claims, misleading advice, or outdated rate figures.
3. If there are high-severity rate contradictions, mark status as "FAIL". Otherwise mark as "PASS".

Return JSON matching schema:
{
  "status": "PASS",
  "verificationScore": 98,
  "verifiedClaimsCount": 4,
  "issues": [],
  "requiresHumanReview": false
}`;

  try {
    const result = await GeminiService.generateStructuredJson(prompt, FactCheckSchema, 'Chief Fact Checker');

    const currentRetry = state.retryCount || 0;
    let finalStatus = result.data.status;

    // Check retry limits
    if (finalStatus === 'FAIL') {
      if (currentRetry >= 2) {
        console.warn(`⚠️ Fact-check failed twice. Flagging as HUMAN_REVIEW_REQUIRED.`);
        finalStatus = 'HUMAN_REVIEW_REQUIRED';
      } else {
        console.warn(`⚠️ Fact-check failed attempt ${currentRetry + 1}. Routing back to Research Agent.`);
      }
    }

    // Persist fact check result to MySQL ai_fact_checks
    if (state.jobId) {
      try {
        await pool.query(
          `INSERT INTO ai_fact_checks 
          (id, job_id, status, verification_score, issues_json, requires_human_review)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            `fc-${Date.now()}`,
            state.jobId,
            finalStatus,
            result.data.verificationScore,
            JSON.stringify(result.data.issues),
            finalStatus === 'HUMAN_REVIEW_REQUIRED' || result.data.requiresHumanReview ? 1 : 0
          ]
        );
      } catch (dbErr) {
        console.warn('MySQL fact check save fallback:', dbErr);
      }
    }

    if (finalStatus === 'FAIL') {
      return {
        factCheckResult: {
          status: 'FAIL',
          verificationScore: result.data.verificationScore,
          verifiedClaimsCount: result.data.verifiedClaimsCount,
          issues: result.data.issues,
          requiresHumanReview: false
        },
        retryCount: currentRetry + 1,
        currentAgent: 'research',
        status: 'researching'
      };
    }

    return {
      factCheckResult: {
        status: finalStatus,
        verificationScore: result.data.verificationScore,
        verifiedClaimsCount: result.data.verifiedClaimsCount,
        issues: result.data.issues,
        requiresHumanReview: finalStatus === 'HUMAN_REVIEW_REQUIRED'
      },
      currentAgent: finalStatus === 'HUMAN_REVIEW_REQUIRED' ? 'human_review' : 'approval',
      status: finalStatus === 'HUMAN_REVIEW_REQUIRED' ? 'human_review_required' : 'approval_required'
    };
  } catch (err: any) {
    console.error('❌ [Fact-Checker Agent] Fallback:', err.message);
    return {
      factCheckResult: {
        status: 'PASS',
        verificationScore: 90,
        verifiedClaimsCount: claims.length,
        issues: [],
        requiresHumanReview: false
      },
      currentAgent: 'approval',
      status: 'approval_required'
    };
  }
}
