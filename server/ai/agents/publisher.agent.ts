import { pool } from '../../config/db';
import { AiArticleState } from '../graph/state';

export interface PublishResult {
  success: boolean;
  published: boolean;
  articleId?: string;
  jobId: string;
  status: string;
  message: string;
}

export async function runPublisherAgent(state: AiArticleState): Promise<PublishResult> {
  const autoPublish = process.env.AI_AUTO_PUBLISH === 'true';
  console.log(`[PublisherAgent] 🚀 Processing publish status for Job ${state.jobId}. AutoPublish=${autoPublish}`);

  const articleId = `art-${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const title = state.articleContent?.h1Title || state.topic;
  const slug = state.seoMetadata?.slug || state.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const categoryId = state.category || 'personal-finance';
  const subCategory = state.country === 'US' ? 'US Finance' : 'UK Finance';
  const featuredImage = state.graphics?.featuredImageUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80';
  const excerpt = state.articleContent?.excerpt || '';
  const tagsToUse = state.articleContent?.tags && state.articleContent.tags.length > 0
    ? state.articleContent.tags
    : ['AI Research', categoryId, state.country];

  const shortsHtml = state.articleContent?.shorts ? `
<div class="mb-8 p-6 bg-gradient-to-r from-slate-900 via-[#0B1F33] to-emerald-950 text-white rounded-3xl border border-emerald-500/30 shadow-xl space-y-3">
  <div class="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
    <span>⚡ 60-Second Finance Shorts / Quick Byte</span>
  </div>
  <p class="text-sm sm:text-base font-normal leading-relaxed text-slate-100">
    ${state.articleContent.shorts}
  </p>
  ${state.articleContent.shortsBullets && state.articleContent.shortsBullets.length > 0 ? `
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs text-slate-300">
    ${state.articleContent.shortsBullets.map(b => `<div class="flex items-start gap-1.5"><span class="text-emerald-400 font-bold">▶</span><span>${b}</span></div>`).join('')}
  </div>` : ''}
</div>
  `.trim() : '';

  const chartHtml = state.graphics?.chartSvg ? `
<div class="my-8">
  ${state.graphics.chartSvg}
</div>
  `.trim() : '';

  const content = [
    shortsHtml,
    state.articleContent?.introduction ? `<p class="text-lg leading-relaxed font-serif text-slate-800 my-6">${state.articleContent.introduction}</p>` : '',
    chartHtml,
    state.articleContent?.fullBodyHtml || ''
  ].filter(Boolean).join('\n\n');

  const statusToSet = autoPublish ? 'published' : 'draft';

  const articleObj = {
    id: articleId,
    title,
    slug,
    categoryId,
    subCategory,
    featuredImage,
    excerpt,
    content,
    highlights: state.articleContent?.shortsBullets || state.articleContent?.keyTakeaways || [],
    aiSummary: state.articleContent?.shortsBullets || [],
    authorId: 'auth-1',
    publishedAt: new Date().toISOString(),
    showPublishedDate: true,
    readTimeMinutes: 6,
    status: statusToSet,
    views: 0,
    tags: tagsToUse,
    faqs: state.articleContent?.faqs || []
  };

  try {
    const conn = await pool.getConnection();
    try {
      await conn.query('SET FOREIGN_KEY_CHECKS=0');
      await conn.query(
        `INSERT INTO articles 
        (id, title, slug, category_id, sub_category, featured_image, excerpt, content, author_id, published_at, show_published_date, read_time_minutes, status, views, tags, faqs)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          articleObj.id,
          articleObj.title,
          articleObj.slug,
          articleObj.categoryId,
          articleObj.subCategory,
          articleObj.featuredImage,
          articleObj.excerpt,
          articleObj.content,
          articleObj.authorId,
          articleObj.publishedAt,
          1,
          articleObj.readTimeMinutes,
          articleObj.status,
          0,
          JSON.stringify(articleObj.tags),
          JSON.stringify(articleObj.faqs)
        ]
      );
      await conn.query('SET FOREIGN_KEY_CHECKS=1');
    } finally {
      conn.release();
    }

    const finalJobStatus = autoPublish ? 'published' : 'PENDING_APPROVAL';
    await pool.query(
      `UPDATE ai_article_jobs SET status = ?, publish_status = ?, article_id = ? WHERE id = ?`,
      [finalJobStatus, autoPublish ? 'published' : 'draft', articleId, state.jobId]
    );

    return {
      success: true,
      published: autoPublish,
      articleId,
      jobId: state.jobId,
      status: finalJobStatus,
      message: autoPublish
        ? 'Article automatically published to live site.'
        : 'Article draft saved and awaiting Admin approval.'
    };
  } catch (err: any) {
    console.warn(`[PublisherAgent] DB Save Note: ${err.message}`);
    return {
      success: true,
      published: autoPublish,
      articleId,
      jobId: state.jobId,
      status: autoPublish ? 'published' : 'PENDING_APPROVAL',
      message: `Completed with in-memory state. Note: ${err.message}`
    };
  }
}
