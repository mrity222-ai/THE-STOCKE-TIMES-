import { pool } from './db';
import { INITIAL_CATEGORIES, INITIAL_ARTICLES } from '../../src/data/initialData';
import { EXTRA_DATABASE_ARTICLES } from '../seeds/extraDatabaseArticles';

export async function initializeDatabaseTablesAndSeeds(): Promise<boolean> {
  console.log('⚙️ [Auto-Database System] Checking MySQL tables & auto-initialization...');

  try {
    const conn = await pool.getConnection();
    try {
      await conn.query('SET FOREIGN_KEY_CHECKS=0');

      // 1. Authors Table
      await conn.query(`
        CREATE TABLE IF NOT EXISTS authors (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(255) NOT NULL,
          avatar TEXT NOT NULL,
          bio TEXT NOT NULL,
          credentials VARCHAR(255) NOT NULL,
          article_count INT DEFAULT 0,
          total_views INT DEFAULT 0,
          twitter VARCHAR(255),
          linkedin VARCHAR(255)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 2. Categories Table
      await conn.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          description TEXT NOT NULL,
          icon VARCHAR(64) NOT NULL,
          image TEXT,
          subcategories TEXT NOT NULL,
          article_count INT DEFAULT 0,
          total_views INT DEFAULT 0,
          status VARCHAR(32) DEFAULT 'active',
          growth VARCHAR(64)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 3. Articles Table
      await conn.query(`
        CREATE TABLE IF NOT EXISTS articles (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          slug VARCHAR(500) NOT NULL UNIQUE,
          category_id VARCHAR(64) NOT NULL,
          sub_category VARCHAR(255),
          featured_image TEXT NOT NULL,
          image_caption TEXT,
          image_source TEXT,
          excerpt TEXT NOT NULL,
          content LONGTEXT NOT NULL,
          highlights TEXT,
          author_id VARCHAR(64) NOT NULL,
          published_at VARCHAR(64) NOT NULL,
          show_published_date BOOLEAN DEFAULT TRUE,
          updated_at VARCHAR(64),
          scheduled_date VARCHAR(64),
          read_time_minutes INT DEFAULT 5,
          is_featured BOOLEAN DEFAULT FALSE,
          is_trending BOOLEAN DEFAULT FALSE,
          is_popular BOOLEAN DEFAULT FALSE,
          status VARCHAR(32) DEFAULT 'published',
          tags TEXT,
          views INT DEFAULT 0,
          seo_title VARCHAR(500),
          seo_description TEXT,
          focus_keywords TEXT,
          canonical_url TEXT,
          og_title VARCHAR(500),
          og_description TEXT,
          social_share_image TEXT,
          gallery_images TEXT,
          faqs TEXT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 4. Financial Rules Table
      await conn.query(`
        CREATE TABLE IF NOT EXISTS financial_rules (
          rule_key VARCHAR(128) PRIMARY KEY,
          label VARCHAR(255) NOT NULL,
          category VARCHAR(128) NOT NULL,
          value DECIMAL(15, 4) NOT NULL,
          unit VARCHAR(32) NOT NULL,
          description TEXT NOT NULL,
          last_updated VARCHAR(64) NOT NULL,
          updated_by VARCHAR(128) NOT NULL,
          previous_value DECIMAL(15, 4),
          source_reference VARCHAR(255)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 5. Comments Table
      await conn.query(`
        CREATE TABLE IF NOT EXISTS comments (
          id VARCHAR(64) PRIMARY KEY,
          article_id VARCHAR(64) NOT NULL,
          author_name VARCHAR(255) NOT NULL,
          author_email VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          status VARCHAR(32) DEFAULT 'pending',
          created_at VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 6. Subscribers Table
      await conn.query(`
        CREATE TABLE IF NOT EXISTS subscribers (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          subscribed_at VARCHAR(64) NOT NULL,
          status VARCHAR(32) DEFAULT 'active'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 7. AI Article Jobs Table
      await conn.query(`
        CREATE TABLE IF NOT EXISTS ai_article_jobs (
          id VARCHAR(64) PRIMARY KEY,
          topic VARCHAR(500) NOT NULL,
          country VARCHAR(32) DEFAULT 'IN',
          category VARCHAR(128) DEFAULT 'stock-market',
          status VARCHAR(32) DEFAULT 'pending',
          current_agent VARCHAR(64) DEFAULT 'research',
          verification_status VARCHAR(32) DEFAULT 'PASS',
          publish_status VARCHAR(32) DEFAULT 'published',
          article_id VARCHAR(64),
          created_at VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 8. Admin Users Table
      await conn.query(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(64) DEFAULT 'super_admin',
          status VARCHAR(32) DEFAULT 'active',
          created_at VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await conn.query('SET FOREIGN_KEY_CHECKS=1');

      // Auto-Seed 1: Authors
      const [authorRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM authors');
      if (authorRows[0]?.cnt === 0) {
        console.log('🌱 Seeding Default Research Author Profile...');
        await conn.query(`
          INSERT INTO authors (id, name, role, avatar, bio, credentials, article_count, total_views, twitter, linkedin)
          VALUES (
            'auth-1',
            'The Stock Times Desk',
            'Senior Equity & Financial Research Desk',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            'Analytical team specializing in macroeconomics, stock market trends, banking rates, and personal finance strategies.',
            'CFA, SEBI Registered Analyst Team',
            24, 158400, 'https://twitter.com/TheStockTimes', 'https://linkedin.com/company/thestocktimes'
          )
        `);
      }

      // Auto-Seed 2: Categories
      const [catRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM categories');
      if (catRows[0]?.cnt === 0) {
        console.log('🌱 Seeding Default Categories...');
        for (const cat of INITIAL_CATEGORIES) {
          await conn.query(`
            INSERT INTO categories (id, name, slug, description, icon, image, subcategories, article_count, total_views, status, growth)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', '+18% MoM')
            ON DUPLICATE KEY UPDATE name=VALUES(name)
          `, [
            cat.id,
            cat.name,
            cat.slug,
            cat.description,
            cat.icon,
            cat.image || '',
            JSON.stringify(cat.subcategories || []),
            cat.articleCount || 10,
            cat.totalViews || 50000
          ]);
        }
      }

      // Auto-Seed 3: Seed Articles
      const [artRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM articles');
      if (artRows[0]?.cnt === 0) {
        console.log('🌱 Seeding Initial Financial Articles...');
        const seeds = [...INITIAL_ARTICLES, ...EXTRA_DATABASE_ARTICLES];
        for (const art of seeds) {
          await conn.query(`
            INSERT INTO articles (
              id, title, slug, category_id, sub_category, featured_image, image_caption, image_source,
              excerpt, content, highlights, author_id, published_at, show_published_date, read_time_minutes,
              is_featured, is_trending, is_popular, status, tags, views, faqs
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)
            ON DUPLICATE KEY UPDATE title=VALUES(title)
          `, [
            art.id,
            art.title,
            art.slug,
            art.categoryId || 'stock-market',
            art.subCategory || 'Markets',
            art.featuredImage || '',
            art.imageCaption || '',
            art.imageSource || '',
            art.excerpt || '',
            art.content || '',
            JSON.stringify(art.highlights || []),
            art.authorId || 'auth-1',
            art.publishedAt || new Date().toISOString(),
            art.showPublishedDate !== false ? 1 : 0,
            art.readTimeMinutes || 5,
            art.isFeatured ? 1 : 0,
            art.isTrending ? 1 : 0,
            art.isPopular ? 1 : 0,
            JSON.stringify(art.tags || []),
            art.views || 100,
            JSON.stringify(art.faqs || [])
          ]);
        }
      }

      // Auto-Seed 4: Default Admin User
      const [adminRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM admin_users');
      if (adminRows[0]?.cnt === 0) {
        console.log('🌱 Seeding Default Admin Credentials (info@avedatechnologies.com)...');
        await conn.query(`
          INSERT INTO admin_users (id, email, password_hash, name, role, status, created_at)
          VALUES ('admin-1', 'info@avedatechnologies.com', 'Admin@123456', 'The Stock Times Editor', 'super_admin', 'active', ?)
        `, [new Date().toISOString()]);
      }

      console.log('✅ [Auto-Database System] MySQL tables & seeds initialized cleanly!');
      return true;
    } finally {
      conn.release();
    }
  } catch (err: any) {
    console.warn('ℹ️ [Auto-Database System] MySQL note (in-memory mode active):', err.message);
    return false;
  }
}
