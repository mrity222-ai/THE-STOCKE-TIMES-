import { z } from 'zod';
import { GeminiService } from '../services/geminiService';
import { AiArticleState } from '../graph/state';

const SeoSchema = z.object({
  seoTitle: z.string(),
  seoDescription: z.string(),
  slug: z.string(),
  primaryKeyword: z.string(),
  secondaryKeywords: z.array(z.string()),
  canonicalUrl: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  jsonLdSchema: z.object({
    type: z.string(),
    headline: z.string(),
    description: z.string(),
    authorName: z.string(),
    publisherName: z.string()
  })
});

export async function seoAgent(state: AiArticleState): Promise<Partial<AiArticleState>> {
  console.log(`🚀 [SEO & Schema Agent] Generating metadata for: "${state.topic}"`);

  const title = state.articleContent?.h1Title || state.topic;
  const excerpt = state.articleContent?.excerpt || '';

  const prompt = `You are a Lead Financial SEO Specialist & Technical Schema Architect.

Article H1: "${title}"
Excerpt: "${excerpt}"
Target Country: "${state.country}"

Generate optimized SEO metadata and JSON-LD schema payload.

Instructions:
1. SEO Title must be catchy, include target keywords, under 60 chars.
2. SEO Description must be compelling with CTA, under 155 chars.
3. Slug must be clean URL friendly string.
4. Provide Primary Keyword and 4 Secondary Keywords.
5. Provide Article Schema object.

Return JSON matching schema:
{
  "seoTitle": "...",
  "seoDescription": "...",
  "slug": "...",
  "primaryKeyword": "...",
  "secondaryKeywords": ["...", "..."],
  "canonicalUrl": "https://thestocktimes.online/article/...",
  "ogTitle": "...",
  "ogDescription": "...",
  "jsonLdSchema": {
    "type": "Article",
    "headline": "...",
    "description": "...",
    "authorName": "The Stock Times Editorial Team",
    "publisherName": "TheStockTimes.online"
  }
}`;

  try {
    const result = await GeminiService.generateStructuredJson(prompt, SeoSchema, 'SEO Specialist');

    return {
      seoMetadata: {
        seoTitle: result.data.seoTitle,
        seoDescription: result.data.seoDescription,
        slug: result.data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        primaryKeyword: result.data.primaryKeyword,
        secondaryKeywords: result.data.secondaryKeywords,
        canonicalUrl: `https://thestocktimes.online/article/${result.data.slug}`,
        ogTitle: result.data.ogTitle || result.data.seoTitle,
        ogDescription: result.data.ogDescription || result.data.seoDescription,
        jsonLdSchema: result.data.jsonLdSchema
      },
      currentAgent: 'graphics'
    };
  } catch (err: any) {
    console.error('❌ [SEO Agent] Failed:', err.message);
    return {
      seoMetadata: {
        seoTitle: title.slice(0, 60),
        seoDescription: excerpt.slice(0, 150),
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        primaryKeyword: state.topic,
        secondaryKeywords: [state.category],
        jsonLdSchema: { type: 'Article', headline: title, description: excerpt, authorName: 'The Stock Times', publisherName: 'TheStockTimes.online' }
      },
      currentAgent: 'graphics'
    };
  }
}
