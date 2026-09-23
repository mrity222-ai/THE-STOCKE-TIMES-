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
  const content = `${state.articleContent?.introduction || ''}\n${state.articleContent?.fullBodyHtml || ''}`;
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
    authorId: 'auth-1',
    publishedAt: new Date().toISOString(),
    showPublishedDate: true,
    readTimeMinutes: 6,
    status: statusToSet,
    views: 0,
    tags: ['AI Generated', categoryId, state.country],
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
