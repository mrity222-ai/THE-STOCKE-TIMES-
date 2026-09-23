import { z } from 'zod';
import { GeminiService } from '../services/geminiService';
import { AiArticleState } from '../graph/state';

const WriterSchema = z.object({
  h1Title: z.string(),
  excerpt: z.string(),
  introduction: z.string(),
  keyTakeaways: z.array(z.string()),
  comparisonTableHtml: z.string().optional(),
  calculationExampleHtml: z.string().optional(),
  prosAndConsHtml: z.string().optional(),
  suitableForHtml: z.string().optional(),
  fullBodyHtml: z.string(),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string()
  }))
});

export async function writerAgent(state: AiArticleState): Promise<Partial<AiArticleState>> {
  console.log(`✍️ [Finance Writer Agent] Writing article for: "${state.topic}" (${state.country})`);

  const claimsSummary = (state.researchPack?.claims || [])
    .map(c => `- ${c.claim}: ${c.value || ''} ${c.unit || ''} (Source: ${c.sourceTitle || c.sourceUrl})`)
    .join('\n');

  const prompt = `You are an Expert Financial Journalist and Certified Financial Analyst writing for The Stock Times.

Topic: "${state.topic}"
Category: "${state.category}"
Target Country: "${state.country}"

Verified Research Pack Claims (MUST BE USED ACCURATELY - DO NOT INVENT NEW APY/APR RATES):
${claimsSummary || 'Use standard regulatory limits and verified bank rates.'}

Writing Structure Instructions:
1. Write a compelling H1 title and 2-sentence summary excerpt.
2. Provide 3-4 Key Takeaways in bullet points.
3. Write an engaging Introduction explaining why this topic matters right now.
4. Include an HTML Comparison Table for top options/banks with columns: Institution / APY / Minimum Deposit / Monthly Fee.
5. Include an HTML Calculation Example demonstrating compounding/savings over 1-3 years.
6. Provide a Pros & Cons breakdown HTML.
7. Include 3-5 comprehensive FAQs.
8. Do not include a disclaimer block in the article body. The site has a dedicated legal page for that.

Return JSON strictly matching the schema:
{
  "h1Title": "...",
  "excerpt": "...",
  "introduction": "...",
  "keyTakeaways": ["...", "..."],
  "comparisonTableHtml": "<table class='min-w-full text-xs'>...</table>",
  "calculationExampleHtml": "<div class='p-4 bg-slate-50 border rounded-xl'>...</div>",
  "prosAndConsHtml": "<div class='grid grid-cols-2 gap-4'>...</div>",
  "suitableForHtml": "<p>Best suited for...</p>",
  "fullBodyHtml": "Complete HTML content containing H2/H3 tags...",
  "faqs": [
    { "question": "...", "answer": "..." }
  ]
}`;

  try {
    const result = await GeminiService.generateStructuredJson(prompt, WriterSchema, 'Senior Financial Editor');

    const faqsWithIds = result.data.faqs.map((f, i) => ({
      id: `faq-${Date.now()}-${i}`,
      question: f.question,
      answer: f.answer
    }));

    return {
      articleContent: {
        h1Title: result.data.h1Title,
        excerpt: result.data.excerpt,
        introduction: result.data.introduction,
        keyTakeaways: result.data.keyTakeaways,
        comparisonTableHtml: result.data.comparisonTableHtml,
        calculationExampleHtml: result.data.calculationExampleHtml,
        prosAndConsHtml: result.data.prosAndConsHtml,
        suitableForHtml: result.data.suitableForHtml,
        fullBodyHtml: result.data.fullBodyHtml,
        faqs: faqsWithIds,
        disclaimer: ''
      },
      currentAgent: 'seo',
      status: 'seo_optimizing'
    };
  } catch (err: any) {
    console.error('❌ [Finance Writer Agent] Failed:', err.message);
    return {
      errorMessage: `Writer Agent error: ${err.message}`,
      status: 'failed'
    };
  }
}
