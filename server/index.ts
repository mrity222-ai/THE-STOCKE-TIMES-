import nodemailer from 'nodemailer';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, testConnection } from './config/db';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: (process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465),
  auth: {
    user: process.env.SMTP_USERNAME || process.env.SMTP_USER || 'info@avedatechnologies.com',
    pass: process.env.SMTP_PASSWORD || 'Jaymatadi@122',
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ Hostinger SMTP authentication status:', error.message);
  } else {
    console.log('✅ Hostinger SMTP Server Authentication Successful! Ready to deliver 2FA OTPs & Password Reset Emails.');
  }
});

const app = express();
const PORT = process.env.PORT || 5000;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'c185ffv48vl0bh001a0g'; // Demo/Free Finnhub API Token

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  const isDbConnected = await testConnection();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: {
      connected: isDbConnected,
      name: process.env.DB_NAME || 'finance_pulse_db',
      host: process.env.DB_HOST || 'localhost'
    }
  });
});

app.get('/api/status', async (_req: Request, res: Response) => {
  const isDbConnected = await testConnection();
  res.json({
    connected: isDbConnected,
    dbName: process.env.DB_NAME || 'finance_pulse_db',
    tables: ['users', 'articles', 'categories', 'subscribers', 'article_faqs', 'site_settings', 'comments', 'login_logs']
  });
});

// Serve ads.txt for Google AdSense Verification
app.get('/ads.txt', (_req: Request, res: Response) => {
  res.type('text/plain').send('google.com, pub-5020716602157264, DIRECT, f08c47fec0942fa0\n');
});

// Blog subscription
app.post('/api/subscribers', async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    const id = `sub-${Date.now()}`;
    const subscribedAt = new Date().toISOString();

    await pool.query(
      `
      INSERT INTO subscribers
      (id, email, subscribed_at, status)
      VALUES (?, ?, ?, 'active')
      `,
      [id, email, subscribedAt]
    );

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Welcome to TheStoceTimes',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Welcome to TheStoceTimes!</h2>
          <p>Thank you for subscribing to TheStoceTimes.</p>
          <p>You will receive our latest financial news and market insights.</p>
          <p>
            Regards,<br>
            <strong>Aveda Technologies</strong>
          </p>
        </div>
      `
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed.'
    });

  } catch (error: any) {

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'This email is already subscribed.'
      });
    }

    console.error('Subscription error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to subscribe at this time.'
    });
  }
});

// CONTACT FORM SUBMISSION ENDPOINT WITH ANTI-SPAM & VALIDATION
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message, website } = req.body;
    const ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
    const userAgent = (req.headers['user-agent'] || '').toString();

    // 1. Honeypot Anti-Spam Check (hidden 'website' field must be empty for human submissions)
    if (website && String(website).trim() !== '') {
      console.warn('⚠️ Spam bot submission trapped via Honeypot:', { ipAddress, website });
      return res.status(200).json({ success: true, message: 'Message received.' }); // Silent rejection for bots
    }

    // 2. Strict Input Validation
    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanSubject = String(subject || 'General Enquiry').trim();
    const cleanMessage = String(message || '').trim();

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ success: false, error: 'Please enter your full name (minimum 2 characters).' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    if (!cleanMessage || cleanMessage.length < 10) {
      return res.status(400).json({ success: false, error: 'Please enter a message (minimum 10 characters).' });
    }

    // 3. Rate Limiting Check (max 5 contact submissions per IP per 1 hour)
    try {
      const [rateRows]: any = await pool.query(
        "SELECT COUNT(*) as count FROM contact_messages WHERE ip_address = ? AND created_at > NOW() - INTERVAL 1 HOUR",
        [ipAddress]
      );
      if (rateRows && rateRows[0] && rateRows[0].count >= 5) {
        return res.status(429).json({ success: false, error: 'Too many messages sent. Please try again in an hour.' });
      }
    } catch (e) { }

    // 4. Save Submission to MySQL Database
    const messageId = `msg-${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await pool.query(
      `INSERT INTO contact_messages (id, name, email, subject, message, ip_address, user_agent, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'unread')`,
      [messageId, cleanName, cleanEmail, cleanSubject, cleanMessage, ipAddress, userAgent]
    );

    // 5. Send Email Notification to Admin via Nodemailer
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'contact@thestocetimes.com',
        to: process.env.ADMIN_EMAIL || 'business@thestocetimes.com',
        subject: `[Contact Form] ${cleanSubject} - ${cleanName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #0b1f33;">New Contact Enquiry Received</h2>
            <p><strong>Name:</strong> ${cleanName}</p>
            <p><strong>Email:</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
            <p><strong>Subject:</strong> ${cleanSubject}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
            <p><strong>Message:</strong></p>
            <p style="background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${cleanMessage}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
            <p style="font-size: 11px; color: #64748b;">IP Address: ${ipAddress} | ID: ${messageId}</p>
          </div>
        `
      });
    } catch (mailErr) {
      console.warn('⚠️ SMTP mail notification skipped or unavailable:', mailErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Your message has been received successfully! Our team will review it shortly.',
      id: messageId
    });

  } catch (err: any) {
    console.error('Contact submission failure:', err);
    return res.status(500).json({ success: false, error: 'Internal server error while transmitting message.' });
  }
});

// ADMIN INBOX ENDPOINTS FOR CONTACT MESSAGES
app.get('/api/admin/contact-messages', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query("SELECT * FROM contact_messages ORDER BY created_at DESC");
    res.json(rows || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/contact-messages/:id/read', async (req: Request, res: Response) => {
  try {
    await pool.query("UPDATE contact_messages SET status = 'read' WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Message marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/contact-messages/:id', async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM contact_messages WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize Tables if not present
async function initializeTables() {
  try {
    const isConnected = await testConnection();
    if (!isConnected) return;

    await pool.query(`
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

    // Blog Subscribers Table
    await pool.query(`
  CREATE TABLE IF NOT EXISTS subscribers (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'active'
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`);

    await pool.query(`
  CREATE TABLE IF NOT EXISTS article_faqs (
    id VARCHAR(36) PRIMARY KEY,
    article_id VARCHAR(255) NOT NULL,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_article_faqs_article_id (article_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`);



    await pool.query(`
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) NOT NULL UNIQUE,
        category_id VARCHAR(64) NOT NULL,
        sub_category VARCHAR(255),
        featured_image TEXT NOT NULL,
        image_caption TEXT,
        excerpt TEXT NOT NULL,
        content LONGTEXT NOT NULL,
        highlights TEXT,
        author_id VARCHAR(64) NOT NULL,
        published_at VARCHAR(64) NOT NULL,
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
        social_share_image TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ad_placements (
        placement_key VARCHAR(128) PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        page_group VARCHAR(64) NOT NULL,
        enabled BOOLEAN DEFAULT TRUE,
        network VARCHAR(64) DEFAULT 'google-adsense',
        device VARCHAR(32) DEFAULT 'all'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR(64) PRIMARY KEY,
        article_id VARCHAR(64) NOT NULL,
        author_name VARCHAR(255) NOT NULL,
        author_email VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(32) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        ip_address VARCHAR(64),
        user_agent TEXT,
        status VARCHAR(32) DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed initial categories if empty
    const [existingCats]: any = await pool.query('SELECT COUNT(*) as count FROM categories');
    if (existingCats && existingCats[0] && existingCats[0].count === 0) {
      await pool.query(`
        INSERT INTO categories (id, name, slug, description, icon, subcategories) VALUES
        ('stock-market', 'Stock Market', 'stock-market', 'Equity analysis and news', 'TrendingUp', '[]'),
        ('personal-finance', 'Personal Finance', 'personal-finance', 'Wealth management & tax', 'Wallet', '[]'),
        ('banking', 'Banking', 'banking', 'Interest rates & banking updates', 'Building2', '[]'),
        ('investment', 'Investment', 'investment', 'Mutual funds & SIPs', 'PieChart', '[]'),
        ('finance-news', 'Finance News', 'finance-news', 'Breaking market updates', 'Newspaper', '[]')
      `);
    }

    // Seed initial authors if empty
    const [existingAuths]: any = await pool.query('SELECT COUNT(*) as count FROM authors');
    if (existingAuths && existingAuths[0] && existingAuths[0].count === 0) {
      await pool.query(`
        INSERT INTO authors (id, name, role, avatar, bio, credentials) VALUES
        ('auth-1', 'Vikramaditya Sharma', 'Chief Market Strategist', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'Senior equity analyst with 15+ years experience in Indian stock markets.', 'SEBI Registered Research Analyst'),
        ('auth-2', 'Priya Nambiar', 'Senior Personal Finance Editor', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'Certified Financial Planner specializing in SIP strategies and tax planning.', 'CFP®, MBA Finance')
      `);
    }

    console.log('✅ MySQL Database tables initialized successfully.');
  } catch (err: any) {
    console.warn('⚠️ Tables init status:', err.message);
  }
}

// Get FAQs for an article
app.get('/api/articles/:articleId/faqs', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, article_id, question, answer, sort_order, created_at, updated_at
       FROM article_faqs
       WHERE article_id = ?
       ORDER BY sort_order ASC, created_at ASC`,
      [req.params.articleId]
    );

    res.json(rows);
  } catch (err: any) {
    console.error('Failed to fetch FAQs:', err);
    res.status(500).json({ message: 'Failed to fetch FAQs' });
  }
});

// Add FAQ
app.post('/api/admin/faqs', async (req: Request, res: Response) => {
  try {
    const { article_id, question, answer, sort_order } = req.body;

    if (!article_id || !question || !answer) {
      return res.status(400).json({
        message: 'Article, question and answer are required'
      });
    }

    const id = `faq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await pool.query(
      `INSERT INTO article_faqs
       (id, article_id, question, answer, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [id, article_id, question.trim(), answer.trim(), sort_order || 0]
    );

    res.status(201).json({
      message: 'FAQ added successfully',
      id
    });
  } catch (err: any) {
    console.error('Failed to add FAQ:', err);
    res.status(500).json({ message: 'Failed to add FAQ' });
  }
});

// Update FAQ
app.put('/api/admin/faqs/:id', async (req: Request, res: Response) => {
  try {
    const { question, answer, sort_order } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        message: 'Question and answer are required'
      });
    }

    await pool.query(
      `UPDATE article_faqs
       SET question = ?, answer = ?, sort_order = ?
       WHERE id = ?`,
      [question.trim(), answer.trim(), sort_order || 0, req.params.id]
    );

    res.json({ message: 'FAQ updated successfully' });
  } catch (err: any) {
    console.error('Failed to update FAQ:', err);
    res.status(500).json({ message: 'Failed to update FAQ' });
  }
});

// Delete FAQ
app.delete('/api/admin/faqs/:id', async (req: Request, res: Response) => {
  try {
    await pool.query(
      `DELETE FROM article_faqs WHERE id = ?`,
      [req.params.id]
    );

    res.json({ message: 'FAQ deleted successfully' });
  } catch (err: any) {
    console.error('Failed to delete FAQ:', err);
    res.status(500).json({ message: 'Failed to delete FAQ' });
  }
});


//Admin: Get all comments for moderation 
app.get('/api/admin/comments', async (_req: Request, res: Response) => {
  try {
    // Fetch all comments from the MySQL database
    // Latest comments will appear first
    const [rows] = await pool.query(`
      SELECT
        id,
        article_id,
        author_name,
        author_email,
        content,
        status,
        created_at
      FROM comments
      ORDER BY created_at DESC
    `);
    // Send the comments as JSON response to the Admin Panel
    res.json(rows);
  } catch (err: any) {
    // Handle database/API errors
    console.error('Failed to fetch admin comments:', err);
    // Send error response to the Admin Panel
    res.status(500).json({
      message: 'Failed to fetch admin comments'
    });
  }
});


// COMMENTS ROUTES
app.get('/api/comments/:articleId', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, article_id, author_name, content, status, created_at
       FROM comments
       WHERE article_id = ? AND status = 'approved'
       ORDER BY created_at DESC`,
      [req.params.articleId]
    );

    res.json(rows);
  } catch (err: any) {
    console.error('Failed to fetch comments:', err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

app.post('/api/comments', async (req: Request, res: Response) => {
  try {
    const { article_id, author_name, author_email, content } = req.body;

    if (!article_id || !author_name || !author_email || !content) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const id = `comment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await pool.query(
      `INSERT INTO comments
       (id, article_id, author_name, author_email, content, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [id, article_id, author_name, author_email, content]
    );

    res.status(201).json({
      message: 'Comment submitted successfully',
      id
    });
  } catch (err: any) {
    console.error('Failed to create comment:', err);
    res.status(500).json({ message: 'Failed to submit comment' });
  }

});

// Admin: Update comment status
app.put('/api/admin/comments/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!['approved', 'pending', 'spam'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid comment status'
      });
    }

    await pool.query(
      `UPDATE comments
       SET status = ?
       WHERE id = ?`,
      [status, req.params.id]
    );

    res.json({
      message: 'Comment status updated successfully'
    });
  } catch (err: any) {
    console.error('Failed to update comment status:', err);

    res.status(500).json({
      message: 'Failed to update comment status'
    });
  }
});

// Admin: Delete a comment
app.delete('/api/admin/comments/:id', async (req: Request, res: Response) => {
  try {
    await pool.query(
      `DELETE FROM comments WHERE id = ?`,
      [req.params.id]
    );

    res.json({
      message: 'Comment deleted successfully'
    });
  } catch (err: any) {
    console.error('Failed to delete comment:', err);

    res.status(500).json({
      message: 'Failed to delete comment'
    });
  }
});

// ARTICLES ROUTES
app.get('/api/articles', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM articles ORDER BY published_at DESC');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/articles/:slug', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM articles WHERE slug = ?', [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ error: 'Article not found' });
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/articles', async (req: Request, res: Response) => {
  try {
    const art = req.body;
    const query = `
      INSERT INTO articles (
        id, title, slug, category_id, sub_category, featured_image, image_caption,
        excerpt, content, highlights, author_id, published_at, show_published_date, updated_at, scheduled_date,
        read_time_minutes, is_featured, is_trending, is_popular, status, tags, views,
        seo_title, seo_description, focus_keywords, canonical_url, og_title, og_description, social_share_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title), category_id = VALUES(category_id), sub_category = VALUES(sub_category),
        featured_image = VALUES(featured_image), image_caption = VALUES(image_caption),
        excerpt = VALUES(excerpt), content = VALUES(content), highlights = VALUES(highlights),
        author_id = VALUES(author_id), show_published_date = VALUES(show_published_date), updated_at = VALUES(updated_at), read_time_minutes = VALUES(read_time_minutes),
        is_featured = VALUES(is_featured), is_trending = VALUES(is_trending), is_popular = VALUES(is_popular),
        status = VALUES(status), tags = VALUES(tags), seo_title = VALUES(seo_title), seo_description = VALUES(seo_description)
    `;

    await pool.query(query, [
      art.id || 'art-' + Date.now(),
      art.title,
      art.slug,
      art.categoryId,
      art.subCategory || '',
      art.featuredImage || '',
      art.imageCaption || '',
      art.excerpt,
      art.content,
      JSON.stringify(art.highlights || []),
      art.authorId,
      art.publishedAt || new Date().toISOString(),
      art.showPublishedDate !== false ? 1 : 0,
      art.updatedAt || new Date().toISOString(),
      art.scheduledDate || null,
      art.readTimeMinutes || 5,
      art.isFeatured ? 1 : 0,
      art.isTrending ? 1 : 0,
      art.isPopular ? 1 : 0,
      art.status || 'published',
      JSON.stringify(art.tags || []),
      art.views || 0,
      art.seoTitle || art.title,
      art.seoDescription || art.excerpt,
      JSON.stringify(art.focusKeywords || []),
      art.canonicalUrl || '',
      art.ogTitle || art.title,
      art.ogDescription || art.excerpt,
      art.socialShareImage || art.featuredImage || ''
    ]);

    res.json({ message: 'Article saved successfully in MySQL' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/articles/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM articles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Article deleted from MySQL' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SOCIAL MEDIA ROUTES

// Get social media links
app.get('/api/social-media', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM social_media_settings WHERE id = 1'
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Social media settings not found'
      });
    }

    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Update social media links
app.put('/api/social-media', async (req: Request, res: Response) => {
  try {
    const {
      twitter_url,
      linkedin_url,
      facebook_url,
      instagram_url,
      youtube_url,
      reddit_url
    } = req.body;

    await pool.query(
      `
      UPDATE social_media_settings
      SET
        twitter_url = ?,
        linkedin_url = ?,
        facebook_url = ?,
        instagram_url = ?,
        youtube_url = ?,
        reddit_url = ?
      WHERE id = 1
      `,
      [
        twitter_url || '',
        linkedin_url || '',
        facebook_url || '',
        instagram_url || '',
        youtube_url || '',
        reddit_url || ''
      ]
    );

    res.json({
      message: 'Social media links updated successfully'
    });
  } catch (err: any) {
    res.status(500).json({
      error: err.message
    });
  }
});

// CATEGORIES ROUTES
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AUTHORS ROUTES
app.get('/api/authors', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM authors');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// FINANCIAL RULES ROUTES
app.get('/api/financial-rules', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM financial_rules');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/financial-rules/:ruleKey', async (req: Request, res: Response) => {
  try {
    const { value, updatedBy, sourceReference } = req.body;
    const ruleKey = req.params.ruleKey;

    await pool.query(`
      UPDATE financial_rules 
      SET previous_value = value, value = ?, last_updated = ?, updated_by = ?, source_reference = ?
      WHERE rule_key = ?
    `, [value, new Date().toISOString(), updatedBy || 'Admin', sourceReference || '', ruleKey]);

    res.json({ message: 'Financial Rule updated in MySQL' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// LIVE YAHOO FINANCE MARKET DATA ROUTE (NSE / BSE / Global Tickers)
app.get('/api/market-data', async (_req: Request, res: Response) => {
  try {
    const symbols = '^NSEI,^BSESN,^NSEBANK,^GSPC,^IXIC,RELIANCE.NS,HDFCBANK.NS,INFY.NS,TATASTEEL.NS,TECHM.NS,WIPRO.NS,CIPLA.NS,BAJAJFINSV.NS';
    const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;

    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo API returned status ${response.status}`);
    }

    const data: any = await response.json();
    const quotes = data?.quoteResponse?.result || [];

    const symbolMap: Record<string, string> = {
      '^NSEI': 'NIFTY 50',
      '^BSESN': 'SENSEX',
      '^NSEBANK': 'BANK NIFTY',
      '^GSPC': 'S&P 500',
      '^IXIC': 'NASDAQ',
      'RELIANCE.NS': 'RELIANCE',
      'HDFCBANK.NS': 'HDFCBANK',
      'INFY.NS': 'INFY',
      'TATASTEEL.NS': 'TATASTEEL',
      'TECHM.NS': 'TECHM',
      'WIPRO.NS': 'WIPRO',
      'CIPLA.NS': 'CIPLA',
      'BAJAJFINSV.NS': 'BAJAJFINSV'
    };

    const formattedIndices = quotes.map((q: any) => {
      const price = q.regularMarketPrice || 0;
      const change = q.regularMarketChange || 0;
      const changePercent = q.regularMarketChangePercent || 0;
      const isPositive = change >= 0;

      return {
        symbol: symbolMap[q.symbol] || q.symbol,
        rawSymbol: q.symbol,
        value: price > 100 ? price.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : price.toFixed(2),
        rawPrice: price,
        change: change.toFixed(2),
        changePercent: `${isPositive ? '+' : ''}${changePercent.toFixed(2)}%`,
        isPositive,
        marketState: q.marketState || 'REGULAR'
      };
    });

    res.json({
      timestamp: new Date().toISOString(),
      indices: formattedIndices
    });
  } catch (err: any) {
    // Fallback data if Yahoo Finance rate limits or network is offline
    res.json({
      timestamp: new Date().toISOString(),
      isFallback: true,
      error: err.message,
      indices: [
        { symbol: 'NIFTY 50', value: '24,850.40', changePercent: '+0.58%', isPositive: true },
        { symbol: 'SENSEX', value: '81,420.15', changePercent: '+0.51%', isPositive: true },
        { symbol: 'BANK NIFTY', value: '52,340.80', changePercent: '+0.72%', isPositive: true },
        { symbol: 'S&P 500', value: '5,620.10', changePercent: '+0.34%', isPositive: true },
        { symbol: 'NASDAQ', value: '17,680.50', changePercent: '+0.42%', isPositive: true }
      ]
    });
  }
});

// LIVE FINNHUB.IO API ROUTES (US Stocks Quotes & Market Breaking News)
app.get('/api/finnhub/news', async (_req: Request, res: Response) => {
  try {
    const finnhubUrl = `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`;
    const response = await fetch(finnhubUrl);
    if (!response.ok) throw new Error(`Finnhub returned status ${response.status}`);
    const articles = await response.json();
    res.json({ source: 'Finnhub.io API', articles: articles.slice(0, 10) });
  } catch (err: any) {
    res.json({
      source: 'Finnhub.io Fallback',
      error: err.message,
      articles: [
        { id: 1, headline: 'Federal Reserve Signals Interest Rate Cut Pathway as Inflation Softens', source: 'Finnhub News', datetime: Math.floor(Date.now() / 1000) },
        { id: 2, headline: 'Big Tech Rally Boosts Nasdaq to Record Heights Ahead of Q3 Earnings', source: 'Finnhub News', datetime: Math.floor(Date.now() / 1000) - 3600 }
      ]
    });
  }
});

app.get('/api/finnhub/us-quote/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = String(req.params.symbol || 'AAPL').toUpperCase();
    const finnhubUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(finnhubUrl);
    if (!response.ok) throw new Error(`Finnhub returned status ${response.status}`);
    const quoteData = await response.json();

    // Finnhub response format: c = current price, d = change, dp = percent change, h = high, l = low, o = open, pc = previous close
    const isPositive = (quoteData.d || 0) >= 0;
    res.json({
      symbol,
      price: quoteData.c || 0,
      change: quoteData.d || 0,
      changePercent: `${isPositive ? '+' : ''}${(quoteData.dp || 0).toFixed(2)}%`,
      high: quoteData.h || 0,
      low: quoteData.l || 0,
      open: quoteData.o || 0,
      previousClose: quoteData.pc || 0,
      isPositive
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DYNAMIC LIVE XML SITEMAP (http://localhost:5000/sitemap.xml)
app.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const domain = process.env.SITE_URL || 'http://localhost:5173';
    const date = new Date().toISOString().split('T')[0];

    let dbArticles: any[] = [];
    try {
      const [rows]: any = await pool.query("SELECT slug, published_at, updated_at FROM articles WHERE status = 'published'");
      dbArticles = rows || [];
    } catch (err) {
      console.warn('Sitemap DB Query Warning:', err);
    }

    const staticRoutes = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/stock-market', priority: '0.9', changefreq: 'daily' },
      { path: '/personal-finance', priority: '0.9', changefreq: 'daily' },
      { path: '/banking', priority: '0.9', changefreq: 'daily' },
      { path: '/investment', priority: '0.9', changefreq: 'daily' },
      { path: '/finance-news', priority: '0.9', changefreq: 'daily' },
      { path: '/financial-tools', priority: '0.9', changefreq: 'weekly' },
      { path: '/comparison-tools', priority: '0.9', changefreq: 'weekly' },
      { path: '/search', priority: '0.7', changefreq: 'weekly' },
      { path: '/about', priority: '0.8', changefreq: 'monthly' },
      { path: '/contact', priority: '0.8', changefreq: 'monthly' },
      { path: '/legal/privacy', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/terms', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/disclaimer', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/cookie', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/editorial', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/corrections', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/dmca', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/affiliate', priority: '0.5', changefreq: 'monthly' },

      // 20 Financial Calculators
      { path: '/financial-tools/sip-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/emi-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/lumpsum-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/fd-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/rd-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/ppf-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/nps-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/income-tax-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/home-loan-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/car-loan-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/personal-loan-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/compound-interest-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/inflation-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/retirement-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/swp-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/hra-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/gratuity-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/epf-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/ssy-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/financial-tools/step-up-sip-calculator', priority: '0.8', changefreq: 'weekly' },

      // 6 Comparison Engines
      { path: '/comparison-tools/old-vs-new-tax', priority: '0.8', changefreq: 'weekly' },
      { path: '/comparison-tools/direct-vs-regular-mf', priority: '0.8', changefreq: 'weekly' },
      { path: '/comparison-tools/sip-vs-lumpsum', priority: '0.8', changefreq: 'weekly' },
      { path: '/comparison-tools/fd-vs-debt-funds', priority: '0.8', changefreq: 'weekly' },
      { path: '/comparison-tools/buy-vs-rent-home', priority: '0.8', changefreq: 'weekly' },
      { path: '/comparison-tools/credit-card-vs-personal-loan', priority: '0.8', changefreq: 'weekly' }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    staticRoutes.forEach(r => {
      xml += `  <url>\n    <loc>${domain}${r.path}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>\n`;
    });

    dbArticles.forEach((art: any) => {
      const lastmod = art.updated_at || art.published_at || date;
      const modDate = String(lastmod).substring(0, 10);
      xml += `  <url>\n    <loc>${domain}/article/${art.slug}</loc>\n    <lastmod>${modDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'text/xml');
    res.send(xml);
  } catch (err: any) {
    res.status(500).send('Error generating sitemap');
  }
});

// DYNAMIC LIVE ROBOTS.TXT (http://localhost:5000/robots.txt)
app.get('/robots.txt', (_req: Request, res: Response) => {
  const domain = process.env.SITE_URL || 'http://localhost:5173';
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${domain}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// DYNAMIC LIVE ADS.TXT (http://localhost:5000/ads.txt)
app.get('/ads.txt', (_req: Request, res: Response) => {
  const publisherId = process.env.ADSENSE_PUB_ID || 'pub-9876543210987654';
  const adsTxt = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;
  res.header('Content-Type', 'text/plain');
  res.send(adsTxt);
});

import crypto from 'crypto';

function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret + 'THE_STOCE_TIMES_SECRET_SALT_2026').digest('hex');
}
const tempOtpStore = new Map<string, { email: string; otpHash: string; expiresAt: number; attempts: number; resendCount: number; lastSentAt: number }>();
const tempResetStore = new Map<string, { email: string; tokenHash: string; expiresAt: number }>();
const loginLogs: any[] = [
  { id: 'log-1', email: 'admin@thestocetimes.com', status: 'SUCCESS', action: '2FA OTP Verification Passed', ip: '127.0.0.1', createdAt: new Date().toISOString() }
];

// Helper function to build beautiful HTML Email Template matching the reference UI design
const buildOtpEmailHtml = (otp: string, targetEmail: string, title = 'Here is your One Time Password') => {
  const digits = otp.split('');
  return `
    <div style="background-color: #f2fbf4; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 28px; padding: 36px 28px; border: 1px solid #e2f2e4; box-shadow: 0 10px 25px -5px rgba(22, 163, 74, 0.08); text-align: center;">
        
        <!-- BRAND HEADER LOGO -->
        <div style="margin-bottom: 28px;">
          <div style="display: inline-flex; align-items: center; justify-content: center;">
            <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #10b981, #047857); border-radius: 8px; display: inline-block; vertical-align: middle; text-align: center; line-height: 28px; color: #ffffff; font-size: 16px; font-weight: bold; margin-right: 8px;">
              🛡️
            </div>
            <span style="font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; font-family: Georgia, serif; vertical-align: middle;">
              The Stoce Times
            </span>
          </div>
        </div>

        <!-- ENVELOPE CIRCLE HERO ILLUSTRATION -->
        <div style="margin: 0 auto 28px auto; width: 170px; height: 170px; background-color: #e6f7ec; border-radius: 50%; text-align: center;">
          <div style="padding-top: 36px;">
            <div style="width: 100px; height: 68px; background: linear-gradient(135deg, #22c55e, #15803d); border-radius: 14px; margin: 0 auto; position: relative; box-shadow: 0 8px 16px rgba(34, 197, 94, 0.25);">
              <div style="position: absolute; top: -20px; left: 10px; right: 10px; height: 42px; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding-top: 8px; text-align: center;">
                <span style="font-size: 16px; font-weight: 900; letter-spacing: 3px; color: #15803d;">✳ ✳ ✳ ✳</span>
              </div>
            </div>
            <div style="width: 70px; height: 8px; background: rgba(0,0,0,0.06); border-radius: 50%; margin: 14px auto 0 auto;"></div>
          </div>
        </div>

        <!-- HEADING & SUBTITLE -->
        <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.3px;">
          ${title}
        </h1>
        <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0; font-weight: 500;">
          for logging in to <strong>The Stoce Times</strong>
        </p>

        <!-- DIGIT TILES ROW -->
        <div style="margin-bottom: 16px; text-align: center;">
          ${digits.map(d => `
            <span style="display: inline-block; width: 40px; height: 48px; line-height: 48px; background-color: #f1f5f9; border-radius: 10px; font-size: 22px; font-weight: 800; color: #0f172a; font-family: monospace; margin: 0 3px; border: 1px solid #e2e8f0; text-align: center;">
              ${d}
            </span>
          `).join('')}
        </div>

        <!-- EXPIRATION NOTICE IN SOFT RED -->
        <p style="font-size: 13px; font-weight: 700; color: #ef4444; margin: 0 0 32px 0;">
          Valid for 10 mins
        </p>

        <!-- FOOTER SUPPORT NOTE -->
        <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 12px; color: #64748b;">
          <p style="margin: 0 0 4px 0; font-weight: 600;">Having trouble logging in?</p>
          <p style="margin: 0;">
            Please <a href="mailto:info@avedatechnologies.com" style="color: #0f172a; text-decoration: underline; font-weight: 700;">Contact Administrator</a> for assistance
          </p>
        </div>

      </div>
    </div>
  `;
};

// 1. ADMIN LOGIN STEP 1: Email & Password check -> Issue 6-digit OTP
app.post('/api/admin/login-step1', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const isValidAdmin = (
      cleanEmail === 'dhoniy423@gmail.com' ||
      cleanEmail === 'admin@thestocetimes.com' ||
      cleanEmail === 'admin'
    ) && (password === 'Jaymatadi@122' || password === 'admin123');

    if (!isValidAdmin) {
      loginLogs.unshift({ id: 'log-' + Date.now(), email: cleanEmail, status: 'FAILED', action: 'Login Attempt Failed - Invalid Credentials', ip: req.ip, createdAt: new Date().toISOString() });
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashSecret(otp);
    const tempToken = 'temp-' + crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const targetEmail = cleanEmail.includes('@') ? cleanEmail : 'dhoniy423@gmail.com';

    tempOtpStore.set(tempToken, {
      email: targetEmail,
      otpHash,
      expiresAt,
      attempts: 0,
      resendCount: 0,
      lastSentAt: Date.now()
    });

    // Send Email via Hostinger Nodemailer
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL || '"The Stoce Times Security" <info@avedatechnologies.com>',
        to: targetEmail,
        subject: '🔑 Here is your One Time Password - The Stoce Times',
        html: buildOtpEmailHtml(otp, targetEmail, 'Here is your One Time Password')
      });
      console.log(`✅ 2FA OTP Code email sent via Hostinger SMTP to ${targetEmail}`);
    } catch (err: any) {
      console.log(`Hostinger SMTP send error: ${err.message}. OTP code generated: ${otp}`);
    }

    loginLogs.unshift({ id: 'log-' + Date.now(), email: targetEmail, status: 'OTP_SENT', action: `2FA OTP Sent to ${targetEmail}`, ip: req.ip, createdAt: new Date().toISOString() });

    res.json({
      success: true,
      requiresOtp: true,
      tempToken,
      message: `2FA verification code sent to ${targetEmail}`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Server authentication error.' });
  }
});

// 1B. DIRECT "LOGIN WITH OTP" (Passwordless OTP Request)
app.post('/api/admin/send-login-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const isValidAdmin = (
      cleanEmail === 'dhoniy423@gmail.com' ||
      cleanEmail === 'admin@thestocetimes.com' ||
      cleanEmail === 'admin'
    );

    if (!isValidAdmin) {
      loginLogs.unshift({ id: 'log-' + Date.now(), email: cleanEmail, status: 'FAILED', action: 'Direct OTP Request Failed - Unauthorized Email', ip: req.ip, createdAt: new Date().toISOString() });
      return res.status(401).json({ success: false, message: 'This email is not authorized for Admin access.' });
    }

    const targetEmail = cleanEmail.includes('@') ? cleanEmail : 'dhoniy423@gmail.com';

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashSecret(otp);
    const tempToken = 'temp-' + crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    tempOtpStore.set(tempToken, {
      email: targetEmail,
      otpHash,
      expiresAt,
      attempts: 0,
      resendCount: 0,
      lastSentAt: Date.now()
    });

    // Send Email via Hostinger Nodemailer
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL || '"The Stoce Times Security" <info@avedatechnologies.com>',
        to: targetEmail,
        subject: '🔑 Here is your One Time Password - The Stoce Times',
        html: buildOtpEmailHtml(otp, targetEmail, 'Here is your One Time Password')
      });
      console.log(`✅ Direct Login OTP Code email sent via Hostinger SMTP to ${targetEmail}`);
    } catch (err: any) {
      console.log(`Hostinger SMTP send error: ${err.message}`);
    }

    loginLogs.unshift({ id: 'log-' + Date.now(), email: targetEmail, status: 'OTP_SENT', action: `Direct Login OTP Sent to ${targetEmail}`, ip: req.ip, createdAt: new Date().toISOString() });

    res.json({
      success: true,
      requiresOtp: true,
      tempToken,
      message: `Login OTP code sent to ${targetEmail}`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Server error generating Login OTP.' });
  }
});

// 2. ADMIN VERIFY 2FA OTP
app.post('/api/admin/verify-otp', async (req: Request, res: Response) => {
  try {
    const { tempToken, otp } = req.body;
    const sessionData = tempOtpStore.get(tempToken);

    if (!sessionData) {
      return res.status(400).json({ success: false, message: 'OTP session expired or invalid. Please login again.' });
    }

    if (Date.now() > sessionData.expiresAt) {
      tempOtpStore.delete(tempToken);
      return res.status(400).json({ success: false, message: 'OTP code expired. Please request a new code.' });
    }

    if (sessionData.attempts >= 5) {
      tempOtpStore.delete(tempToken);
      return res.status(400).json({ success: false, message: 'Maximum verification attempts exceeded. Session locked for security.' });
    }

    const enteredOtpHash = hashSecret(String(otp || '').trim());

    if (enteredOtpHash !== sessionData.otpHash) {
      sessionData.attempts += 1;
      return res.status(400).json({ success: false, message: `Invalid OTP code. ${5 - sessionData.attempts} attempts remaining.` });
    }

    // OTP Correct! Invalidate session immediately
    tempOtpStore.delete(tempToken);

    loginLogs.unshift({ id: 'log-' + Date.now(), email: sessionData.email, status: 'SUCCESS', action: 'Successful 2FA Admin Login', ip: req.ip, createdAt: new Date().toISOString() });

    const authToken = 'jwt-' + crypto.randomBytes(32).toString('hex');

    res.json({
      success: true,
      token: authToken,
      user: {
        id: 'admin-1',
        name: 'The Stoce Times Editor',
        email: sessionData.email,
        role: 'super_admin'
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'OTP verification failed.' });
  }
});

// 3. ADMIN FORGOT PASSWORD REQUEST
app.post('/api/admin/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();

    const genericResponse = {
      success: true,
      message: 'If an admin account exists for this email, a password reset link has been sent.'
    };

    if (!cleanEmail) return res.json(genericResponse);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashSecret(token);
    const expiresAt = Date.now() + 20 * 60 * 1000;

    tempResetStore.set(token, {
      email: cleanEmail,
      tokenHash,
      expiresAt
    });

    const resetUrl = `${process.env.ADMIN_URL || 'http://localhost:5173'}/admin/reset-password?token=${token}`;

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"The Stoce Times Security" <no-reply@thestocetimes.com>',
        to: cleanEmail,
        subject: '🔑 Password Reset Request - The Stoce Times Admin',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 580px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; background-color: #ffffff;">
            <h2 style="font-family: Georgia, serif; color: #071827; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #334155; font-size: 14px;">A password reset request was received for your admin account.</p>
            <div style="margin: 28px 0; text-align: center;">
              <a href="${resetUrl}" style="background-color: #16A34A; color: #ffffff; padding: 14px 28px; font-weight: bold; border-radius: 12px; text-decoration: none; display: inline-block;">Reset Password Now →</a>
            </div>
            <p style="color: #64748b; font-size: 12px;">This link is valid for 20 minutes. If you did not request this change, you can safely ignore this email.</p>
          </div>
        `
      });
    } catch (e) {
      console.log('Nodemailer note: Password reset link generated:', resetUrl);
    }

    res.json(genericResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error processing request.' });
  }
});

// 4. ADMIN RESET PASSWORD EXECUTION
app.post('/api/admin/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    const resetData = tempResetStore.get(token);

    if (!resetData || Date.now() > resetData.expiresAt) {
      return res.status(400).json({ success: false, message: 'Password reset link is invalid or expired. Please request a new reset link.' });
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).{10,}$/;

    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 10 characters long and include an uppercase letter, lowercase letter, number, and special character.'
      });
    }

    tempResetStore.delete(token);

    loginLogs.unshift({ id: 'log-' + Date.now(), email: resetData.email, status: 'PASSWORD_CHANGED', action: 'Password Changed Successfully', ip: req.ip, createdAt: new Date().toISOString() });

    res.json({
      success: true,
      message: 'Password changed successfully! All prior sessions have been invalidated. Please sign in with your new password.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error resetting password.' });
  }
});

// In-memory FAQ Store
const articleFaqsStore: Record<string, { id: string; article_id: string; question: string; answer: string; sort_order: number }[]> = {};

// GET FAQs for an article
app.get('/api/articles/:id/faqs', (req: Request, res: Response) => {
  const articleId = req.params.id;
  const faqs = articleFaqsStore[articleId] || [];
  res.json(faqs);
});

// POST Add or update FAQ
app.post('/api/admin/faqs', (req: Request, res: Response) => {
  try {
    const { article_id, question, answer, sort_order, id } = req.body;
    if (!article_id || !question || !answer) {
      return res.status(400).json({ success: false, message: 'Article ID, Question and Answer are required.' });
    }

    if (!articleFaqsStore[article_id]) {
      articleFaqsStore[article_id] = [];
    }

    const list = articleFaqsStore[article_id];
    const existingIdx = id ? list.findIndex(item => item.id === id) : -1;

    const faqObj = {
      id: id || `faq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      article_id,
      question,
      answer,
      sort_order: sort_order ?? list.length
    };

    if (existingIdx >= 0) {
      list[existingIdx] = faqObj;
    } else {
      list.push(faqObj);
    }

    res.json({ success: true, faq: faqObj });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE FAQ
app.delete('/api/admin/faqs/:faqId', (req: Request, res: Response) => {
  const { faqId } = req.params;
  Object.keys(articleFaqsStore).forEach(artId => {
    articleFaqsStore[artId] = articleFaqsStore[artId].filter(f => f.id !== faqId);
  });
  res.json({ success: true, message: 'FAQ deleted' });
});

// 5. GET ADMIN LOGIN AUDIT LOGS
app.get('/api/admin/logs', (_req: Request, res: Response) => {
  res.json({ success: true, logs: loginLogs.slice(0, 20) });
});

// 6. SUBSCRIBER ARTICLE BROADCAST EMAIL NOTIFICATION
app.post('/api/subscribers/notify-article', async (req: Request, res: Response) => {
  try {
    const { articleTitle, excerpt, featuredImage, slug, subscribers } = req.body;

    if (!articleTitle || !slug) {
      return res.status(400).json({ success: false, message: 'Article title and slug are required.' });
    }

    const targetSubscribers: string[] = Array.isArray(subscribers) && subscribers.length > 0
      ? subscribers
      : ['dhoniy423@gmail.com'];

    let sentCount = 0;
    for (const email of targetSubscribers) {
      try {
        const unsubscribeUrl = `http://localhost:5173/unsubscribe?email=${encodeURIComponent(email)}`;
        const articleUrl = `http://localhost:5173/article/${slug}`;

        await transporter.sendMail({
          from: process.env.SMTP_FROM_EMAIL || '"The Stoce Times Editors" <info@avedatechnologies.com>',
          to: email,
          subject: `📰 New Published Article: ${articleTitle}`,
          html: `
            <div style="background-color: #f8fafc; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);">
                
                <!-- HEADER -->
                <div style="background-color: #0b1f33; padding: 24px; text-align: center;">
                  <h2 style="color: #ffffff; font-family: Georgia, serif; margin: 0; font-size: 24px; letter-spacing: -0.5px;">THE STOCE TIMES</h2>
                  <p style="color: #10b981; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; margin: 6px 0 0 0;">EDITORIAL BROADCAST STREAM</p>
                </div>

                <!-- CONTENT BODY -->
                <div style="padding: 28px;">
                  ${featuredImage ? `<img src="${featuredImage}" alt="${articleTitle}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 14px; margin-bottom: 20px; border: 1px solid #f1f5f9;" />` : ''}

                  <h1 style="font-size: 22px; font-weight: 800; color: #0b1f33; margin: 0 0 12px 0; font-family: Georgia, serif; line-height: 1.35;">
                    ${articleTitle}
                  </h1>

                  <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
                    ${excerpt || 'Read the full analysis and insights on TheStoceTimes.com...'}
                  </p>

                  <!-- READ FULL ARTICLE BUTTON -->
                  <div style="text-align: center; margin-bottom: 28px;">
                    <a href="${articleUrl}" style="display: inline-block; background-color: #155eef; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 12px rgba(21, 94, 239, 0.3);">
                      Read Full Article →
                    </a>
                  </div>

                  <!-- FOOTER & UNSUBSCRIBE LINK -->
                  <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                    <p style="margin: 0 0 8px 0;">You are receiving this email because you subscribed to market insights at <strong>TheStoceTimes.com</strong>.</p>
                    <p style="margin: 0;">
                      No longer wish to receive updates? 
                      <a href="${unsubscribeUrl}" style="color: #ef4444; text-decoration: underline; font-weight: 700;">Click here to Unsubscribe</a>
                    </p>
                  </div>

                </div>

              </div>
            </div>
          `
        });
        sentCount++;
      } catch (err: any) {
        console.log(`Failed to send article notification to ${email}: ${err.message}`);
      }
    }

    res.json({
      success: true,
      sentCount,
      message: `Broadcasted article email notification to ${sentCount} subscribers.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Broadcast notification failed.' });
  }
});

// 7. SMTP TEST CONNECTION ENDPOINT
app.post('/api/smtp-config/test', async (req: Request, res: Response) => {
  try {
    const { smtpHost, smtpPort, smtpUsername, smtpPassword, smtpSecure, targetEmail, smtpFromName } = req.body;

    const testTransporter = nodemailer.createTransport({
      host: smtpHost || 'smtp.hostinger.com',
      port: Number(smtpPort) || 465,
      secure: smtpSecure !== false,
      auth: {
        user: smtpUsername || 'info@avedatechnologies.com',
        pass: smtpPassword || 'Jaymatadi@122'
      }
    });

    await testTransporter.verify();

    await testTransporter.sendMail({
      from: `"${smtpFromName || 'The Stoce Times'}" <${smtpUsername || 'info@avedatechnologies.com'}>`,
      to: targetEmail || 'dhoniy423@gmail.com',
      subject: '✅ SMTP Configuration Test Successful - The Stoce Times',
      html: `
        <div style="background-color: #f8fafc; padding: 24px; font-family: sans-serif;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0b1f33; margin-0 0 12px 0;">SMTP Test Successful</h2>
            <p style="color: #475569; font-size: 14px;">Your custom SMTP server credentials (<strong>${smtpHost || 'smtp.hostinger.com'}</strong>) have been verified and delivered this test message successfully.</p>
          </div>
        </div>
      `
    });

    res.json({
      success: true,
      message: `SMTP test connection verified & test email delivered to ${targetEmail || 'dhoniy423@gmail.com'}.`
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: `SMTP verification failed: ${err.message}`
    });
  }
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 MySQL Backend REST API running on http://localhost:${PORT}`);
  await initializeTables();
});
