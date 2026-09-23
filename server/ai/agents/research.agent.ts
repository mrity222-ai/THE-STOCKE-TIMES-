import { z } from 'zod';
import { GeminiService } from '../services/geminiService';
import { AiArticleState, ResearchClaim } from '../graph/state';
import { pool } from '../../config/db';

const ResearchSchema = z.object({
  summary: z.string(),
  claims: z.array(z.object({
    claim: z.string(),
    value: z.string().optional(),
    unit: z.string().optional(),
    sourceUrl: z.string(),
    sourceTitle: z.string().optional(),
    verificationStatus: z.enum(['VERIFIED', 'UNVERIFIED', 'DISPUTED'])
  })),
  authoritativeSources: z.array(z.string())
});

export async function researchAgent(state: AiArticleState): Promise<Partial<AiArticleState>> {
  console.log(`🔍 [Research Agent] Starting research for topic: "${state.topic}" (${state.country})`);

  const isUs = state.country === 'US';
  const hierarchyInfo = isUs
    ? 'US Authoritative Hierarchy: FDIC (fdic.gov), CFPB (consumerfinance.gov), Federal Reserve (federalreserve.gov), IRS (irs.gov), and verified Bank Provider domains.'
    : 'UK Authoritative Hierarchy: FCA (fca.org.uk), Bank of England (bankofengland.co.uk), HMRC (gov.uk/hmrc), and official UK Provider domains.';

  const prompt = `You are a Senior Financial Research Analyst. Perform structured financial research for the following article topic:

Topic: "${state.topic}"
Category: "${state.category}"
Target Country: "${state.country}"

${hierarchyInfo}

Instructions:
1. Extract at least 3-6 exact numerical or verifiable financial claims (e.g. current average APY/APR, fee amounts, deposit limits, interest rates, tax brackets).
2. For each claim, provide a realistic, authoritative source URL from official government/regulatory or provider domains.
3. Provide a concise executive summary of the research background.

Return JSON format strictly conforming to:
{
  "summary": "Executive summary of financial rates and facts...",
  "claims": [
    {
      "claim": "High Yield Savings APY average range in 2026",
      "value": "4.50 - 5.15",
      "unit": "% APY",
      "sourceUrl": "${isUs ? 'https://www.fdic.gov/resources/bankers/national-rates/' : 'https://www.bankofengland.co.uk/statistics/visual-summaries'}",
      "sourceTitle": "${isUs ? 'FDIC National Rates & Rate Caps' : 'Bank of England Official Statistics'}",
      "verificationStatus": "VERIFIED"
    }
  ],
  "authoritativeSources": [
    "${isUs ? 'https://www.fdic.gov' : 'https://www.fca.org.uk'}"
  ]
}`;

  try {
    const result = await GeminiService.generateStructuredJson(prompt, ResearchSchema, 'Financial Data Researcher');
    
    const claims: ResearchClaim[] = result.data.claims.map((c, idx) => ({
      id: `claim-${Date.now()}-${idx}`,
      claim: c.claim,
      value: c.value,
      unit: c.unit,
      sourceUrl: c.sourceUrl,
      sourceTitle: c.sourceTitle || (isUs ? 'FDIC / CFPB Verified Source' : 'FCA / BoE Verified Source'),
      country: state.country,
      verificationStatus: c.verificationStatus,
      publishedAt: new Date().toISOString(),
      retrievedAt: new Date().toISOString()
    }));

    // Persist research claims to MySQL ai_research_sources table
    if (state.jobId) {
      for (const claim of claims) {
        try {
          await pool.query(
            `INSERT INTO ai_research_sources 
            (id, job_id, claim, value, unit, source_url, source_title, country, verification_status, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              claim.id,
              state.jobId,
              claim.claim,
              claim.value || '',
              claim.unit || '',
              claim.sourceUrl,
              claim.sourceTitle,
              state.country,
              claim.verificationStatus,
              claim.publishedAt
            ]
          );
        } catch (dbErr) {
          console.warn('MySQL research source log fallback:', dbErr);
        }
      }
    }

    return {
      researchPack: {
        summary: result.data.summary,
        claims,
        authoritativeSources: result.data.authoritativeSources
      },
      currentAgent: 'writer',
      status: 'writing'
    };
  } catch (err: any) {
    console.error('❌ [Research Agent] Failed:', err.message);
    return {
      errorMessage: `Research Agent error: ${err.message}`,
      status: 'failed'
    };
  }
}
