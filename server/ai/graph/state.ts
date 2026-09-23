import { Annotation } from '@langchain/langgraph';

export interface ResearchClaim {
  id: string;
  claim: string;
  value?: string;
  unit?: string;
  sourceUrl: string;
  sourceTitle?: string;
  country: 'US' | 'UK';
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'DISPUTED';
  publishedAt?: string;
  retrievedAt?: string;
}

export interface ArticleFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SeoMetadataPayload {
  seoTitle: string;
  seoDescription: string;
  slug: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  jsonLdSchema: any;
}

export interface GraphicsAssetPayload {
  featuredImagePrompt: string;
  featuredImageUrl?: string;
  chartSvg?: string;
  chartTitle?: string;
}

export interface FactCheckReport {
  status: 'PASS' | 'FAIL' | 'HUMAN_REVIEW_REQUIRED';
  verificationScore: number;
  verifiedClaimsCount: number;
  issues: Array<{
    claim: string;
    issue: string;
    suggestedCorrection?: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  requiresHumanReview: boolean;
}

/**
 * Annotation-based state for LangGraph pipeline orchestration
 */
export const AiArticleAnnotation = Annotation.Root({
  jobId: Annotation<string>,
  topicId: Annotation<string | undefined>,
  topic: Annotation<string>,
  category: Annotation<string>,
  country: Annotation<'US' | 'UK'>,
  
  keywords: Annotation<Array<{ keyword: string; intent: string; relevanceScore: number }>>,
  researchPack: Annotation<{
    summary: string;
    claims: ResearchClaim[];
    authoritativeSources: string[];
  }>,
  
  articleContent: Annotation<{
    h1Title: string;
    excerpt: string;
    introduction: string;
    keyTakeaways: string[];
    comparisonTableHtml?: string;
    calculationExampleHtml?: string;
    prosAndConsHtml?: string;
    suitableForHtml?: string;
    fullBodyHtml: string;
    faqs: ArticleFaqItem[];
    disclaimer: string;
  }>,
  
  seoMetadata: Annotation<SeoMetadataPayload>,
  graphics: Annotation<GraphicsAssetPayload>,
  factCheckResult: Annotation<FactCheckReport>,

  currentAgent: Annotation<string>,
  status: Annotation<'queued' | 'researching' | 'writing' | 'seo_optimizing' | 'fact_checking' | 'approval_required' | 'published' | 'failed' | 'human_review_required'>,
  retryCount: Annotation<number>,
  errorMessage: Annotation<string | undefined>
});

export type AiArticleState = typeof AiArticleAnnotation.State;
