import { StateGraph, END, START } from '@langchain/langgraph';
import { AiArticleAnnotation, AiArticleState } from './state';
import { researchAgent } from '../agents/research.agent';
import { writerAgent } from '../agents/writer.agent';
import { seoAgent } from '../agents/seo.agent';
import { graphicsAgent } from '../agents/graphics.agent';
import { factCheckAgent } from '../agents/factcheck.agent';
import { runPublisherAgent } from '../agents/publisher.agent';

// Node wrapper for Publisher Agent
async function publisherNode(state: AiArticleState): Promise<Partial<AiArticleState>> {
  console.log(`[LangGraph Node] Executing Publisher Agent for Job ${state.jobId}`);
  const result = await runPublisherAgent(state);
  return {
    status: result.status === 'published' ? 'published' : 'human_review_required',
    currentAgent: 'publisher'
  };
}

// Create StateGraph with Root Annotation
const workflow = new StateGraph(AiArticleAnnotation)
  .addNode('researchAgent', researchAgent)
  .addNode('writerAgent', writerAgent)
  .addNode('seoAgent', seoAgent)
  .addNode('graphicsAgent', graphicsAgent)
  .addNode('factCheckAgent', factCheckAgent)
  .addNode('publisherNode', publisherNode)
  
  // Pipeline Transitions
  .addEdge(START, 'researchAgent')
  .addEdge('researchAgent', 'writerAgent')
  .addEdge('writerAgent', 'seoAgent')
  .addEdge('seoAgent', 'graphicsAgent')
  .addEdge('graphicsAgent', 'factCheckAgent')
  
  // Fact-Check Failure Correction Loop Edge
  .addConditionalEdges(
    'factCheckAgent',
    (state: AiArticleState) => {
      if (state.status === 'researching' && (state.retryCount || 0) < 2) {
        console.log(`🔁 [LangGraph Workflow Loopback] Fact-check FAIL. Retrying pipeline via Research Agent (Attempt ${state.retryCount}).`);
        return 'researchAgent';
      }
      console.log(`✅ [LangGraph Workflow] Fact check completed (${state.factCheckResult?.status}). Proceeding to Publisher.`);
      return 'publisherNode';
    },
    {
      researchAgent: 'researchAgent',
      publisherNode: 'publisherNode'
    }
  )
  .addEdge('publisherNode', END);

// Compile Graph Workflow
export const articlePipelineGraph = workflow.compile();

/**
 * Helper to run the LangGraph pipeline for a specific topic
 */
export async function executeArticlePipeline(
  jobId: string,
  topic: string,
  category: string = 'personal-finance',
  country: 'US' | 'UK' = 'US'
): Promise<AiArticleState> {
  console.log(`⚡ [LangGraph Executor] Running Pipeline for Job #${jobId}: "${topic}" (${country})`);

  const initialState: Partial<AiArticleState> = {
    jobId,
    topic,
    category,
    country,
    keywords: [],
    researchPack: { summary: '', claims: [], authoritativeSources: [] },
    articleContent: {
      h1Title: topic,
      excerpt: '',
      introduction: '',
      keyTakeaways: [],
      fullBodyHtml: '',
      faqs: [],
      disclaimer: ''
    },
    seoMetadata: {
      seoTitle: topic,
      seoDescription: '',
      slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      primaryKeyword: topic,
      secondaryKeywords: [],
      jsonLdSchema: {}
    },
    graphics: {
      featuredImagePrompt: '',
      featuredImageUrl: ''
    },
    factCheckResult: {
      status: 'PASS',
      verificationScore: 100,
      verifiedClaimsCount: 0,
      issues: [],
      requiresHumanReview: false
    },
    currentAgent: 'research',
    status: 'researching',
    retryCount: 0
  };

  const finalState = await articlePipelineGraph.invoke(initialState as any);
  return finalState as AiArticleState;
}
