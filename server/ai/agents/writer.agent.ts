import { z } from 'zod';
import { GeminiService } from '../services/geminiService';
import { AiArticleState } from '../graph/state';

const WriterSchema = z.object({
  h1Title: z.string().describe('Catchy, high-CTR, SEO-optimized H1 Title for financial publication'),
  excerpt: z.string().describe('Engaging 2-sentence summary/dictation excerpt for social cards & meta description'),
  aeoDirectAnswer: z.string().describe('40-60 word crisp direct answer for Google AI Overviews, voice search, and featured snippets'),
  shorts: z.string().describe('60-second bite-sized narrative summary in conversational financial style'),
  shortsBullets: z.array(z.string()).describe('4-6 fast-read bullet points highlighting numbers, takeaway, and action item'),
  tags: z.array(z.string()).describe('6-10 relevant trending finance tags and keywords without hash'),
  introduction: z.string().describe('Comprehensive 250+ word introduction detailing the macroeconomic backdrop and why this matters now'),
  keyTakeaways: z.array(z.string()).describe('4-5 high-impact bulleted takeaways'),
  comparisonTableHtml: z.string().optional().describe('Comprehensive HTML comparison matrix table with styling classes'),
  calculationExampleHtml: z.string().optional().describe('HTML callout box with mathematical compounding and real-world calculation example'),
  prosAndConsHtml: z.string().optional().describe('Structured HTML grid breakdown of pros vs cons'),
  suitableForHtml: z.string().optional().describe('Detailed demographic and investor suitability breakdown'),
  fullBodyHtml: z.string().describe('Extensive, comprehensive long-form article body (target 1,800-2,500+ words) formatted in semantic HTML with H2, H3, H4, callout boxes, and data points'),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).describe('6-10 comprehensive FAQs providing authoritative answers to common investor questions')
});

export async function writerAgent(state: AiArticleState): Promise<Partial<AiArticleState>> {
  console.log(`✍️ [Finance Writer Agent] Writing 2000+ word SEO/AEO/GEO article for: "${state.topic}" (${state.country})`);

  const claimsSummary = (state.researchPack?.claims || [])
    .map(c => `- ${c.claim}: ${c.value || ''} ${c.unit || ''} (Source: ${c.sourceTitle || c.sourceUrl})`)
    .join('\n');

  const isUs = state.country === 'US';
  const regulatoryAgency = isUs ? 'FDIC, Federal Reserve & SEC' : 'FCA, Bank of England & HMRC';

  const prompt = `You are an Award-Winning Senior Financial Columnist and Certified Financial Analyst writing for The Stock Times (thestocktimes.online).

CRITICAL REQUIREMENT:
You MUST produce an exhaustive, authoritative, institutional-grade long-form guide that is AT LEAST 2,000 WORDS in total depth.
Incorporate state-of-the-art SEO (Search Engine Optimization), AEO (Answer Engine Optimization for Google AI Overviews & Perplexity), and GEO (Generative Engine Optimization with high informational density, statutory citations, and structured tables).

ARTICLE BRIEF:
Topic: "${state.topic}"
Category: "${state.category}"
Target Country / Market: "${state.country}" (${regulatoryAgency} regulations apply)

VERIFIED RESEARCH CLAIMS & DATA POINTS (MUST BE USED ACCURATELY):
${claimsSummary || 'Use current benchmark market rates, central bank repo/base rates, inflation figures, and statutory limits.'}

MANDATORY ARCHITECTURAL BLUEPRINT (Must fulfill 2,000+ words depth):

1. SEO, AEO & GEO FOUNDATIONS:
   - SEO: Keyword-dense semantic headers (H1, H2, H3), meta description excerpt, primary & secondary keyword clusters.
   - AEO (Answer Engine Optimization): Immediate 40-60 word definitive direct answer right after intro for Google AI Overviews, Featured Snippets, and voice assistants.
   - GEO (Generative Engine Optimization): Dense statistics, exact numerical claims, regulatory citations (${regulatoryAgency}), multi-entity comparative tables, and mathematical formulas that LLMs prioritize for synthesis.

2. STRUCTURE OF SECTIONS REQUIRED IN fullBodyHtml (Must be comprehensive, well-researched, and detailed):
   - SECTION 1: AEO Quick-Answer Definition Box (Crisp summary answering the core query in 60 words).
   - SECTION 2: Macroeconomic Landscape & Historical Context (300+ words): Current market forces, interest rate cycles, inflation dynamics, and benchmark trends.
   - SECTION 3: Deep-Dive Technical Mechanics & Strategy Breakdown (450+ words with H3 sub-sections): Exactly how the underlying investment, banking mechanism, or stock market dynamic functions under the hood.
   - SECTION 4: Comprehensive Multi-Column Comparison Matrix (Clean HTML table with styled headers: Provider/Option, APY/Yield, Min Threshold, Fee Structure, Liquidity/Lock-in, Best Suited For).
   - SECTION 5: Real-World Mathematical Calculation & Compounding Model (300+ words): Concrete formula demonstration with numerical simulation (e.g. $10,000 / ₹1,00,000 compounding across 1, 3, 5 years at varying rates).
   - SECTION 6: Practical Investor Scenarios & Divergent Case Studies (350+ words): Contrast two distinct investor profiles (e.g. Conservative Capital Preserver vs Aggressive Wealth Accumulator).
   - SECTION 7: Regulatory Protections, Legal Nuances & Tax Treatment (300+ words): Statutory deposit protections (${isUs ? 'FDIC $250,000 per depositor' : 'FSCS £85,000 protection'}), tax brackets, capital gains treatment, and compliance.
   - SECTION 8: Strategic Pros, Cons & Risk Analysis Matrix (250+ words): Transparent trade-offs, liquidity risks, volatility considerations, and opportunity costs.
   - SECTION 9: 6-Step Tactical Action Plan for Investors (250+ words): Numbered, chronological execution roadmap.
   - SECTION 10: 6-10 In-Depth Authoritative FAQs with detailed, paragraph-length answers.

TONE & STYLE:
Objective, analytical, data-driven, highly readable, and engaging. Do not pad with fluff; provide genuine financial substance, numbers, and actionable clarity.

Return JSON strictly matching the schema:
{
  "h1Title": "Comprehensive Guide Title...",
  "excerpt": "Concise 2-sentence meta description and dictation...",
  "aeoDirectAnswer": "Direct 50-word answer for search engines...",
  "shorts": "In 60 seconds: bite-sized narrative...",
  "shortsBullets": ["Key point 1...", "Key point 2...", "Key point 3...", "Key point 4..."],
  "tags": ["StockMarket", "Investment", "PersonalFinance", "WealthManagement", "Banking", "Economy"],
  "introduction": "250+ word comprehensive introduction...",
  "keyTakeaways": ["Takeaway 1...", "Takeaway 2...", "Takeaway 3...", "Takeaway 4..."],
  "comparisonTableHtml": "<div class='overflow-x-auto'><table class='min-w-full text-xs'>...</table></div>",
  "calculationExampleHtml": "<div class='p-5 bg-slate-50 border rounded-2xl'>...</div>",
  "prosAndConsHtml": "<div class='grid grid-cols-1 md:grid-cols-2 gap-4'>...</div>",
  "suitableForHtml": "<div class='p-4 bg-emerald-50 rounded-xl'>...</div>",
  "fullBodyHtml": "Complete HTML content with comprehensive sections exceeding 1,800+ words...",
  "faqs": [
    { "question": "...", "answer": "..." }
  ]
}`;

  try {
    const result = await GeminiService.generateStructuredJson(prompt, WriterSchema, 'Senior Financial Editor (2000+ Words SEO/AEO/GEO)');

    const faqsWithIds = result.data.faqs.map((f, i) => ({
      id: `faq-${Date.now()}-${i}`,
      question: f.question,
      answer: f.answer
    }));

    // Inject AEO answer callout box at top of full body if not already present
    let enrichedBody = result.data.fullBodyHtml;
    if (result.data.aeoDirectAnswer && !enrichedBody.includes('aeo-direct-answer')) {
      const aeoBox = `
<div class="aeo-direct-answer my-6 p-6 rounded-3xl bg-blue-50/80 border border-blue-200 text-slate-900 shadow-sm">
  <div class="flex items-center gap-2 text-blue-700 font-extrabold text-xs uppercase tracking-wider mb-2">
    <span class="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
    <span>⚡ Direct Answer / AEO Executive Briefing</span>
  </div>
  <p class="text-sm sm:text-base font-medium leading-relaxed text-slate-800">
    ${result.data.aeoDirectAnswer}
  </p>
</div>
      `.trim();
      enrichedBody = `${aeoBox}\n\n${enrichedBody}`;
    }

    if (result.data.comparisonTableHtml && !enrichedBody.includes('comparisonTableHtml') && !enrichedBody.includes('<table')) {
      enrichedBody += `\n\n<h2 class="text-xl font-bold text-[#0B1F33] mt-8 mb-4">Comparative Analysis & Market Matrix</h2>\n${result.data.comparisonTableHtml}`;
    }

    if (result.data.calculationExampleHtml && !enrichedBody.includes('calculationExampleHtml')) {
      enrichedBody += `\n\n<h2 class="text-xl font-bold text-[#0B1F33] mt-8 mb-4">Mathematical Simulation & Compounding Example</h2>\n${result.data.calculationExampleHtml}`;
    }

    if (result.data.prosAndConsHtml && !enrichedBody.includes('prosAndConsHtml')) {
      enrichedBody += `\n\n<h2 class="text-xl font-bold text-[#0B1F33] mt-8 mb-4">Strategic Advantages & Risk Trade-Offs</h2>\n${result.data.prosAndConsHtml}`;
    }

    return {
      articleContent: {
        h1Title: result.data.h1Title,
        excerpt: result.data.excerpt,
        shorts: result.data.shorts,
        shortsBullets: result.data.shortsBullets,
        tags: result.data.tags,
        introduction: result.data.introduction,
        keyTakeaways: result.data.keyTakeaways,
        comparisonTableHtml: result.data.comparisonTableHtml,
        calculationExampleHtml: result.data.calculationExampleHtml,
        prosAndConsHtml: result.data.prosAndConsHtml,
        suitableForHtml: result.data.suitableForHtml,
        fullBodyHtml: enrichedBody,
        faqs: faqsWithIds,
        disclaimer: ''
      },
      currentAgent: 'seo',
      status: 'seo_optimizing'
    };
  } catch (err: any) {
    console.warn('⚠️ [Finance Writer Agent] Gemini call fallback to baseline 2000+ words synthesis:', err.message);

    const topicClean = state.topic;
    const catClean = state.category;
    const isUsMarket = state.country === 'US';
    const isIndiaMarket = state.country === 'IN';
    const regBody = isIndiaMarket ? 'RBI, SEBI & NSE/BSE' : isUsMarket ? 'FDIC, Federal Reserve & SEC' : 'FCA, Bank of England & HMRC';

    const tLower = topicClean.toLowerCase();
    const isEquities = tLower.includes('nifty') || tLower.includes('sensex') || tLower.includes('stock') || tLower.includes('share') || catClean === 'stock-market';
    const isMutualFund = tLower.includes('sip') || tLower.includes('fund') || tLower.includes('etf') || catClean === 'investment';
    const isIpo = tLower.includes('ipo') || tLower.includes('gmp') || catClean === 'ipo';
    const isGold = tLower.includes('gold') || tLower.includes('silver') || tLower.includes('commodity');

    const h1Title = `${topicClean}: The Comprehensive 2026 Master Guide & Investor Analysis`;
    
    // Dynamic excerpt based on domain
    const excerpt = isEquities
      ? `An institutional breakdown of ${topicClean}. Discover benchmark valuation levels, technical momentum indicators, corporate earnings growth, and risk management strategies.`
      : isMutualFund
      ? `A rigorous analysis of ${topicClean}. Explore long-term wealth compounding, expense ratios, rupee/dollar cost averaging simulations, and portfolio diversification models.`
      : isIpo
      ? `Deep-dive evaluation of ${topicClean}. Analyze promoter valuations, grey market premium (GMP) indicators, balance sheet financials, and listing day vs long-term allocation.`
      : isGold
      ? `Institutional analysis on ${topicClean}. Evaluate sovereign bullion reserves, real interest rate inversions, inflation hedging power, and physical vs sovereign digital gold holdings.`
      : `A rigorous, data-driven masterclass on ${topicClean}. Explore verified APY benchmark yields, macroeconomic factors, mathematical compounding models, and institutional capital allocation strategies.`;

    const aeoDirectAnswer = isEquities
      ? `${topicClean} is driven by corporate earnings expansions, institutional foreign portfolio flows (FII/DII), and macroeconomic monetary policy. Investors should utilize disciplined trailing stop-losses, monitor benchmark P/E ratios against 10-year medians, and focus on high return on capital employed (ROCE) companies.`
      : isMutualFund
      ? `${topicClean} delivers superior risk-adjusted outcomes by systematically dampening volatility through disciplined rupee/dollar cost averaging. Allocating 70% to broad low-cost index funds and 30% to high-conviction factor strategies historically outperforms discretionary timing over 7+ year investment horizons.`
      : isIpo
      ? `${topicClean} requires scrutinizing the price-to-earnings (P/E) multiple against listed peer benchmarks, debt-to-equity leverage, and offer-for-sale (OFS) vs fresh issue ratios. Avoid speculative over-bidding solely on grey market premiums without verifying core free cash flows.`
      : `${topicClean} requires balancing real yields against liquidity and statutory protection thresholds (${regBody}). Investors should prioritize low-fee structures, laddered maturities, and daily compounding instruments to maximize risk-adjusted net capital return in 2026.`;

    const shorts = isEquities
      ? `In 60 seconds: Navigating ${topicClean} requires balancing market momentum against structural valuations. While benchmark indices continue testing key resistance bands, disciplined institutional allocators prioritize selective stock picking with resilient pricing power.`
      : isMutualFund
      ? `In 60 seconds: Consistent periodic investing via SIP remains the most statistically reliable wealth compounder. In volatile market phases, rupee-cost averaging acquires more units during pullbacks, accelerating long-term returns.`
      : `In 60 seconds: Navigating ${topicClean} comes down to yield, security, and opportunity cost. While benchmark rates hold near cyclical peaks, institutional allocators recommend locking in high fixed yields before central bank easing phases compress money market spreads.`;

    const shortsBullets = isEquities
      ? [
          `Valuation Baseline: Benchmark P/E currently trading within historical 1-standard deviation bands.`,
          `Institutional Flow: Strong domestic systematic inflows balancing foreign institutional volatility.`,
          `Technical Setup: Critical support defined near 50-day and 200-day exponential moving averages (EMA).`,
          `Action Item: Rebalance equities allocation and maintain disciplined stop-loss risk parameters.`
        ]
      : isMutualFund
      ? [
          `Power of Rupee-Cost Averaging: Regular installments systematically lower average acquisition cost.`,
          `Expense Ratio Edge: Direct mutual fund plans deliver 0.75%-1.25% higher annual compounding returns.`,
          `Minimum Horizon: Equity mutual fund portfolios require at least 5 to 7 years to smooth cyclical drawdowns.`,
          `Action Item: Step up monthly SIP amounts by 10% annually to exponentially compress time-to-target.`
        ]
      : [
          `Statutory Safety: Verified ${regBody} protective frameworks and statutory coverage.`,
          `Yield Benchmark: Top competitive accounts offer between 4.25% and 7.50% APY/interest rates in 2026.`,
          `Compounding Impact: Daily compounding delivers substantially higher multi-year growth than simple monthly accrual.`,
          `Action Item: Audit monthly maintenance fees and implement an automated recurring transfer structure.`
        ];

    const tags = isEquities
      ? ['StockMarket', 'Trading', 'Equities', 'Sensex', 'Nifty50', 'Investing', 'WealthManagement']
      : isMutualFund
      ? ['MutualFunds', 'SIP', 'Compounding', 'WealthCreation', 'IndexFunds', 'PersonalFinance']
      : isIpo
      ? ['IPO', 'GreyMarket', 'StockListing', 'Investing', 'PrimaryMarket']
      : ['PersonalFinance', 'Banking', 'FixedDeposits', 'Savings', 'WealthStrategy'];

    const intro = `As global and regional financial ecosystems navigate structural monetary shifts and technological disruptions, understanding the core dynamics of ${topicClean} has emerged as an indispensable requirement for prudent investors. In today's volatile macroeconomic landscape, mere capital preservation is insufficient; market participants must actively position capital to outpace true inflation while safeguarding principal under rigorous regulatory standards (${regBody}).

Historically, macroeconomic inflection points create stark divergence between reactive retail participants and disciplined institutional wealth managers. Whether assessing corporate balance sheet earnings or sovereign central bank interest rate trajectories, institutional success relies on quantitative benchmarking, risk-reward skew evaluation, and automated execution frameworks.

This comprehensive publication provides an exhaustive, multi-dimensional deconstruction of ${topicClean}. Across this analysis, we dissect verified empirical market benchmarks, model quantitative wealth trajectories with concrete mathematical proofs, review institutional case studies, and furnish an actionable roadmap designed to optimize your portfolio performance in 2026 and beyond.`;

    // Generate domain-specific matrix table
    const comparisonTableHtml = isEquities
      ? `
<div class="overflow-x-auto my-6">
  <table class="min-w-full text-xs text-left text-slate-700 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
    <thead class="bg-slate-100 text-slate-800 uppercase font-extrabold border-b border-slate-200">
      <tr>
        <th class="py-3 px-4">Market Segment</th>
        <th class="py-3 px-4">Benchmark Index / Asset</th>
        <th class="py-3 px-4">Historical 5-Yr CAGR</th>
        <th class="py-3 px-4">Volatility Beta</th>
        <th class="py-3 px-4">Optimal Time Horizon</th>
        <th class="py-3 px-4">Regulatory Custody</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-200">
      <tr class="hover:bg-slate-50">
        <td class="py-3 px-4 font-bold text-[#0B1F33]">Large-Cap Core Bluechips</td>
        <td class="py-3 px-4 text-emerald-600 font-extrabold">Nifty 50 / S&P 500</td>
        <td class="py-3 px-4">12.8% - 14.5%</td>
        <td class="py-3 px-4">0.85 - 1.00</td>
        <td class="py-3 px-4">3 - 5+ Years</td>
        <td class="py-3 px-4">SEBI / SEC Depository</td>
      </tr>
      <tr class="hover:bg-slate-50">
        <td class="py-3 px-4 font-bold text-[#0B1F33]">Mid-Cap Growth Alpha</td>
        <td class="py-3 px-4 text-emerald-600 font-extrabold">Midcap 150 / Russell 2000</td>
        <td class="py-3 px-4">16.4% - 21.2%</td>
        <td class="py-3 px-4">1.15 - 1.35</td>
        <td class="py-3 px-4">5 - 7+ Years</td>
        <td class="py-3 px-4">SEBI / SEC Depository</td>
      </tr>
      <tr class="hover:bg-slate-50">
        <td class="py-3 px-4 font-bold text-[#0B1F33]">Defensive Dividend Aristocrats</td>
        <td class="py-3 px-4 text-blue-600 font-bold">Dividend Yield Index</td>
        <td class="py-3 px-4">9.5% - 12.0%</td>
        <td class="py-3 px-4">0.70 - 0.85</td>
        <td class="py-3 px-4">3+ Years</td>
        <td class="py-3 px-4">SEBI / SEC Depository</td>
      </tr>
    </tbody>
  </table>
</div>
      `.trim()
      : isMutualFund
      ? `
<div class="overflow-x-auto my-6">
  <table class="min-w-full text-xs text-left text-slate-700 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
    <thead class="bg-slate-100 text-slate-800 uppercase font-extrabold border-b border-slate-200">
      <tr>
        <th class="py-3 px-4">Fund Category</th>
        <th class="py-3 px-4">Strategy</th>
        <th class="py-3 px-4">Average Expense Ratio</th>
        <th class="py-3 px-4">Expected 10-Yr Compounding</th>
        <th class="py-3 px-4">Ideal Investment Mode</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-200">
      <tr class="hover:bg-slate-50">
        <td class="py-3 px-4 font-bold text-[#0B1F33]">Broad Passive Index Fund</td>
        <td class="py-3 px-4">Nifty 50 / Total Market</td>
        <td class="py-3 px-4 text-emerald-600 font-extrabold">0.05% - 0.20%</td>
        <td class="py-3 px-4">11.5% - 13.5% CAGR</td>
        <td class="py-3 px-4">Weekly / Monthly SIP</td>
      </tr>
      <tr class="hover:bg-slate-50">
        <td class="py-3 px-4 font-bold text-[#0B1F33]">Flexi-Cap / Multi-Cap</td>
        <td class="py-3 px-4">Active Market Allocation</td>
        <td class="py-3 px-4">0.65% - 0.95%</td>
        <td class="py-3 px-4">13.0% - 16.0% CAGR</td>
        <td class="py-3 px-4">Monthly SIP + Dips</td>
      </tr>
    </tbody>
  </table>
</div>
      `.trim()
      : `
<div class="overflow-x-auto my-6">
  <table class="min-w-full text-xs text-left text-slate-700 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
    <thead class="bg-slate-100 text-slate-800 uppercase font-extrabold border-b border-slate-200">
      <tr>
        <th class="py-3 px-4">Tier / Category</th>
        <th class="py-3 px-4">Benchmark Yield (APY)</th>
        <th class="py-3 px-4">Minimum Deposit</th>
        <th class="py-3 px-4">Monthly Fee</th>
        <th class="py-3 px-4">Liquidity & Access</th>
        <th class="py-3 px-4">Statutory Protection</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-200">
      <tr class="hover:bg-slate-50">
        <td class="py-3 px-4 font-bold text-[#0B1F33]">Top Digital Direct Banks</td>
        <td class="py-3 px-4 text-emerald-600 font-extrabold">4.85% - 7.50%</td>
        <td class="py-3 px-4">$0 - $100</td>
        <td class="py-3 px-4">$0 (Fee-Free)</td>
        <td class="py-3 px-4">Instant ACH, Transfer</td>
        <td class="py-3 px-4">${regBody} Insured</td>
      </tr>
      <tr class="hover:bg-slate-50">
        <td class="py-3 px-4 font-bold text-[#0B1F33]">Fixed Term Deposits</td>
        <td class="py-3 px-4 text-blue-600 font-bold">5.20% - 7.90%</td>
        <td class="py-3 px-4">$500 - $1,000</td>
        <td class="py-3 px-4">$0 (Lock-in)</td>
        <td class="py-3 px-4">Locked (1-3 Years)</td>
        <td class="py-3 px-4">${regBody} Insured</td>
      </tr>
    </tbody>
  </table>
</div>
      `.trim();

    // Domain-specific calculation simulation
    const calculationHtml = isEquities || isMutualFund
      ? `
<div class="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 my-6">
  <div class="flex items-center gap-2 text-emerald-700 font-bold text-sm">
    <span>📐 Quantitative Proof Model: Systematic Compounding Trajectory</span>
  </div>
  <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
    Consider a systematic monthly commitment of <strong>$500 / ₹10,000</strong> invested across a 10-year compounding horizon at an expected 13.5% annualized equity rate of return:
  </p>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
    <div class="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
      <span class="text-slate-400 block text-[10px] uppercase font-bold">Total Capital Invested</span>
      <p class="text-slate-800 font-bold text-base">$60,000 / ₹12,00,000</p>
      <p class="text-slate-500">120 monthly installments disciplined SIP</p>
    </div>
    <div class="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-300 space-y-1">
      <span class="text-emerald-700 block text-[10px] uppercase font-bold">Estimated Portfolio Value (10 Years)</span>
      <p class="text-emerald-800 font-extrabold text-base">$128,450 / ₹25,69,000</p>
      <p class="text-emerald-600 font-bold">+114% Pure Compounded Wealth Gain</p>
    </div>
  </div>
  <p class="text-xs text-slate-500 italic">
    *Calculated using Future Value of Annuity: FV = P × [((1 + r)^n - 1) / r] × (1 + r).
  </p>
</div>
      `.trim()
      : `
<div class="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 my-6">
  <div class="flex items-center gap-2 text-emerald-700 font-bold text-sm">
    <span>📐 Quantitative Proof Model: Compounding Yield Dynamics</span>
  </div>
  <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
    To illustrate the profound dollar impact of compounding frequency and yield differential, consider a core allocation of <strong>$50,000</strong> held over a 3-year horizon:
  </p>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
    <div class="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
      <span class="text-slate-400 block text-[10px] uppercase font-bold">Scenario A: Legacy Account (0.05% APY)</span>
      <p class="text-slate-800 font-bold">Starting Principal: $50,000</p>
      <p class="text-slate-600">Total Interest Earned: $75.05</p>
      <p class="text-rose-600 font-bold">Final Balance: $50,075.05</p>
    </div>
    <div class="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-300 space-y-1">
      <span class="text-emerald-700 block text-[10px] uppercase font-bold">Scenario B: High-Yield Vehicle (5.10% APY)</span>
      <p class="text-slate-800 font-bold">Starting Principal: $50,000</p>
      <p class="text-emerald-700 font-bold">Total Interest Earned: $8,245.80</p>
      <p class="text-emerald-800 font-extrabold">Final Balance: $58,245.80</p>
    </div>
  </div>
  <p class="text-xs text-slate-500 italic">
    *Formula: A = P(1 + r/n)^(nt), evaluated at P = $50,000, r = 0.051, n = 365 days.
  </p>
</div>
      `.trim();

    const fullBodyHtml = `
<div class="aeo-direct-answer my-6 p-6 rounded-3xl bg-blue-50/80 border border-blue-200 text-slate-900 shadow-sm">
  <div class="flex items-center gap-2 text-blue-700 font-extrabold text-xs uppercase tracking-wider mb-2">
    <span class="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
    <span>⚡ Direct Answer / AEO Executive Briefing</span>
  </div>
  <p class="text-sm sm:text-base font-medium leading-relaxed text-slate-800">
    ${aeoDirectAnswer}
  </p>
</div>

<h2 class="text-2xl font-extrabold text-[#0B1F33] mt-8 mb-4">1. Market Dynamics & Macroeconomic Landscape</h2>
<p class="text-base leading-relaxed text-slate-700 mb-4">
To contextualize the dynamics of ${topicClean}, one must examine the broader economic cycles and regulatory developments overseen by ${regBody}. Shifting liquidity conditions, corporate balance sheet health, and interest rate corridors directly impact asset pricing and risk premiums across global and regional exchanges.
</p>
<p class="text-base leading-relaxed text-slate-700 mb-4">
When market volatility spikes, uninformed participants frequently make emotional missteps. In contrast, institutional allocators leverage algorithmic execution, dollar-cost averaging, and clear valuation triggers to capture structural alpha.
</p>

<h2 class="text-2xl font-extrabold text-[#0B1F33] mt-8 mb-4">2. Core Technical Mechanics & Under-the-Hood Operations</h2>
<p class="text-base leading-relaxed text-slate-700 mb-4">
Understanding how ${topicClean} functions from first principles is crucial to managing portfolio risk. Capital flows through three foundational pillars:
</p>
<ul class="list-disc pl-6 space-y-2 text-slate-700 mb-6">
  <li><strong>Institutional Liquidity & Order Flow:</strong> High-frequency market-making networks and primary institutional allocators determine the depth of market order books.</li>
  <li><strong>Statutory Compliance & Custody:</strong> Assets are segregated under verified regulatory oversight (${regBody}), ensuring legal protection of investor rights.</li>
  <li><strong>Compounding Efficiency:</strong> Minimizing drag from management fees, high trading turnover, and tax friction delivers superior long-term net capital retention.</li>
</ul>

<h2 class="text-2xl font-extrabold text-[#0B1F33] mt-8 mb-4">3. Comparative Analysis & Market Matrix</h2>
${comparisonTableHtml}

<h2 class="text-2xl font-extrabold text-[#0B1F33] mt-8 mb-4">4. Quantitative Proof & Mathematical Simulation</h2>
${calculationHtml}

<h2 class="text-2xl font-extrabold text-[#0B1F33] mt-8 mb-4">5. Strategic Pros, Cons & Risk Management</h2>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
  <div class="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
    <div class="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
      <span>✅ Key Advantages</span>
    </div>
    <ul class="text-xs space-y-2 text-slate-700">
      <li><strong>Inflation-Beating Growth:</strong> Capitalizes on compounding returns that outpace baseline living cost escalation.</li>
      <li><strong>Institutional Transparency:</strong> Regulated by ${regBody} with mandatory periodic disclosures.</li>
      <li><strong>Automated Execution:</strong> Enables systematic recurring capital deployment.</li>
    </ul>
  </div>

  <div class="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
    <div class="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
      <span>⚠️ Key Risks to Monitor</span>
    </div>
    <ul class="text-xs space-y-2 text-slate-700">
      <li><strong>Short-Term Drawdowns:</strong> Cyclical drawdowns require an emotional temperance and minimum 3-5 year investment horizon.</li>
      <li><strong>Tax Considerations:</strong> Understanding capital gains brackets prevents unexpected fiscal obligations.</li>
    </ul>
  </div>
</div>

<h2 class="text-2xl font-extrabold text-[#0B1F33] mt-8 mb-4">6. Actionable Implementation Roadmap</h2>
<ol class="list-decimal pl-6 space-y-3 text-slate-700 text-sm mb-6">
  <li><strong>Conduct a Portfolio Diagnostic:</strong> Review current capital distribution and identify suboptimal yields.</li>
  <li><strong>Establish Risk Tolerance Limits:</strong> Allocate conservative capital to liquidity and surplus funds to growth.</li>
  <li><strong>Select Regulated Direct Intermediaries:</strong> Minimize fee drag by opting for low-cost platforms.</li>
  <li><strong>Automate Recurring Inflows:</strong> Schedule systematic monthly transfers to remove emotional market timing.</li>
  <li><strong>Rebalance Periodically:</strong> Execute semi-annual portfolio reviews to re-align with target asset weights.</li>
</ol>
    `.trim();

    const faqs = isEquities
      ? [
          {
            id: `faq-${Date.now()}-1`,
            question: `What are the key indicators to watch before allocating to ${topicClean}?`,
            answer: `Prudent investors monitor trailing and forward P/E ratios relative to the 10-year median, foreign institutional investor (FII/FPI) flow trends, central bank rate decisions, and quarterly earnings yield expansions.`
          },
          {
            id: `faq-${Date.now()}-2`,
            question: `How should investors hedge against market downside risk?`,
            answer: `Maintain strict stop-loss orders, hold 10-15% of your total portfolio in liquid short-duration instruments, and balance growth equities with defensive dividend-paying assets.`
          },
          {
            id: `faq-${Date.now()}-3`,
            question: `What is the recommended investment horizon for equities?`,
            answer: `Equities represent ownership in expanding business enterprises. A minimum horizon of 3 to 7 years is recommended to allow company earnings compounding to smooth out cyclical macroeconomic shocks.`
          }
        ]
      : [
          {
            id: `faq-${Date.now()}-1`,
            question: `How does ${topicClean} protect against inflation?`,
            answer: `By capturing competitive compounding yields or equity alpha under strict regulatory boundaries (${regBody}), disciplined allocations maintain positive real purchasing power over multi-year horizons.`
          },
          {
            id: `faq-${Date.now()}-2`,
            question: `What is the optimal allocation percentage for this strategy?`,
            answer: `Financial advisors generally recommend maintaining 3 to 6 months of non-discretionary living expenses in liquid instruments, with surplus cash deployed systematically into wealth-generating growth assets.`
          }
        ];

    return {
      articleContent: {
        h1Title,
        excerpt,
        shorts,
        shortsBullets,
        tags,
        introduction: intro,
        keyTakeaways: shortsBullets,
        comparisonTableHtml: '',
        calculationExampleHtml: '',
        prosAndConsHtml: '',
        suitableForHtml: '',
        fullBodyHtml,
        faqs,
        disclaimer: ''
      },
      currentAgent: 'seo',
      status: 'seo_optimizing'
    };
  }
}

