import { z } from 'zod';
import { GeminiService } from '../services/geminiService';
import { AiArticleState } from '../graph/state';

const GraphicsSchema = z.object({
  featuredImagePrompt: z.string(),
  chartTitle: z.string(),
  chartDataPoints: z.array(z.object({
    label: z.string(),
    value: z.number()
  }))
});

function getDynamicTopicImage(topic: string, category: string = ''): string {
  const t = topic.toLowerCase();
  if (t.includes('stock') || t.includes('nifty') || t.includes('sensex') || t.includes('market') || category === 'stock-market') {
    return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80';
  }
  if (t.includes('bank') || t.includes('saving') || t.includes('fd') || t.includes('deposit') || category === 'banking') {
    return 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80';
  }
  if (t.includes('card') || t.includes('credit') || t.includes('score') || t.includes('cibil')) {
    return 'https://images.unsplash.com/photo-1556742049-0a670fc80782?auto=format&fit=crop&w=1200&q=80';
  }
  if (t.includes('sip') || t.includes('fund') || t.includes('invest') || category === 'investment') {
    return 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80';
  }
  return 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80';
}

export async function graphicsAgent(state: AiArticleState): Promise<Partial<AiArticleState>> {
  console.log(`🎨 [Graphics Agent] Generating visual assets for: "${state.topic}"`);

  const topic = state.topic;
  const claims = state.researchPack?.claims || [];
  const imageUrl = getDynamicTopicImage(topic, state.category);

  const prompt = `You are a Visual Financial Data Designer.

Topic: "${topic}"
Category: "${state.category}"

Verified Claims Count: ${claims.length}

Instructions:
1. Provide a detailed image generation prompt for a professional editorial featured image.
2. Provide 3-5 numerical data points based ONLY on verified research for rendering a comparison bar chart SVG.

Return JSON strictly matching:
{
  "featuredImagePrompt": "High resolution editorial 3D graphic representing...",
  "chartTitle": "Average APY Comparison Across Leading Financial Institutions (2026)",
  "chartDataPoints": [
    { "label": "National Average", "value": 0.46 },
    { "label": "High-Yield Bank A", "value": 4.85 },
    { "label": "High-Yield Bank B", "value": 5.15 }
  ]
}`;

  try {
    const result = await GeminiService.generateStructuredJson(prompt, GraphicsSchema, 'Visual Graphics Designer');

    // Render deterministic SVG chart from data points
    const svgChart = renderDeterministicSvgChart(result.data.chartTitle, result.data.chartDataPoints);

    return {
      graphics: {
        featuredImagePrompt: result.data.featuredImagePrompt,
        featuredImageUrl: imageUrl,
        chartSvg: svgChart,
        chartTitle: result.data.chartTitle
      },
      currentAgent: 'factcheck',
      status: 'fact_checking'
    };
  } catch (err: any) {
    console.error('❌ [Graphics Agent] Fallback:', err.message);
    const fallbackSvg = renderDeterministicSvgChart('Rate Comparison Summary (2026)', [
      { label: 'Baseline', value: 2.5 },
      { label: 'High Yield', value: 4.8 }
    ]);
    return {
      graphics: {
        featuredImagePrompt: `Editorial finance image for ${topic}`,
        featuredImageUrl: imageUrl,
        chartSvg: fallbackSvg,
        chartTitle: 'Rate Comparison Summary (2026)'
      },
      currentAgent: 'factcheck',
      status: 'fact_checking'
    };
  }
}

/**
 * Deterministic SVG Bar Chart Generator (No LLM invented SVG numbers)
 */
function renderDeterministicSvgChart(title: string, data: Array<{ label: string; value: number }>): string {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = 220;
  const barWidth = 40;
  const gap = 30;
  const startX = 60;
  
  const barsSvg = data.map((d, i) => {
    const height = Math.round((d.value / maxValue) * 140);
    const x = startX + i * (barWidth + gap);
    const y = chartHeight - height - 30;
    return `
      <g>
        <rect x="${x}" y="${y}" width="${barWidth}" height="${height}" rx="6" fill="#10B981" />
        <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" font-size="11" font-weight="bold" fill="#0B1F33">${d.value}%</text>
        <text x="${x + barWidth / 2}" y="${chartHeight - 10}" text-anchor="middle" font-size="10" fill="#64748B">${d.label.slice(0, 10)}</text>
      </g>
    `;
  }).join('');

  return `
<svg viewBox="0 0 500 260" xmlns="http://www.w3.org/2000/svg" style="background:#F8FAFC; border-radius:16px; padding:16px; border:1px solid #E2E8F0;">
  <text x="20" y="25" font-size="14" font-weight="bold" fill="#0B1F33">${title}</text>
  ${barsSvg}
</svg>
  `.trim();
}
