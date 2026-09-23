import nodemailer from 'nodemailer';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pool, testConnection } from './config/db';
import { INITIAL_ARTICLES } from '../src/data/initialData';

dotenv.config();

process.on('uncaughtException', (err: any) => {
  console.warn('⚠️ Server uncaughtException warning:', err.message || err);
});

process.on('unhandledRejection', (reason: any) => {
  console.warn('⚠️ Server unhandledRejection warning:', reason?.message || reason);
});

const smtpUser = process.env.SMTP_USERNAME || process.env.SMTP_USER || '';
const smtpPassword = process.env.SMTP_PASSWORD || '';
const hasSmtpConfig = Boolean(process.env.SMTP_HOST && smtpUser && smtpPassword);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: (process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465),
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  })
  : nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });

if (hasSmtpConfig) {
  transporter.verify((error) => {
    if (error) {
      console.error('SMTP authentication status:', error.message);
    } else {
      console.log('SMTP server authentication successful.');
    }
  });
} else {
  console.warn('SMTP credentials are not configured. Email delivery is disabled until SMTP env vars are set.');
}

const app = express();
const PORT = process.env.PORT || 5000;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';
const getSiteUrl = () => (process.env.SITE_URL || process.env.ADMIN_URL || 'https://thestocktimes.online').replace(/\/$/, '');

const envFiles = [
  { key: 'root', label: 'Root .env', filePath: path.resolve(process.cwd(), '.env') },
  { key: 'server', label: 'Server .env', filePath: path.resolve(process.cwd(), 'server', '.env') }
] as const;

type EnvFileKey = typeof envFiles[number]['key'];

const isSecretEnvKey = (key: string) => /(PASSWORD|SECRET|TOKEN|KEY|HASH|REDIS_URL)/i.test(key);

function normalizeEnvValue(value: string): string {
  const trimmed = String(value ?? '').trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function formatEnvValue(value: unknown): string {
  const raw = String(value ?? '');
  if (raw === '') return '';
  if (/[\s#"'`]/.test(raw)) {
    return `"${raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return raw;
}

function parseEnvContent(content: string): Record<string, string> {
  const values: Record<string, string> = {};
  content.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match) values[match[1]] = normalizeEnvValue(match[2]);
  });
  return values;
}

function updateEnvContent(content: string, updates: Record<string, string>): string {
  const seen = new Set<string>();
  const lines = content.split(/\r?\n/).map((line) => {
    const match = line.match(/^(\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*=\s*)(.*)$/);
    if (!match || !(match[2] in updates)) return line;
    seen.add(match[2]);
    return `${match[1]}${match[2]}${match[3]}${formatEnvValue(updates[match[2]])}`;
  });

  Object.entries(updates).forEach(([key, value]) => {
    if (!seen.has(key)) lines.push(`${key}=${formatEnvValue(value)}`);
  });

  return lines.join('\n').replace(/\n*$/, '\n');
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

const configuredAdminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || smtpUser)
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

const tempOtpStore = new Map<string, { email: string; otpHash: string; expiresAt: number; attempts: number; resendCount: number; lastSentAt: number }>();
const tempResetStore = new Map<string, { email: string; tokenHash: string; expiresAt: number }>();
const adminSessions = new Map<string, { email: string; expiresAt: number }>();
const loginLogs: any[] = [
  { id: 'log-1', email: configuredAdminEmails[0] || 'admin@thestocktimes.online', status: 'SYSTEM', action: 'Admin auth initialized', ip: '127.0.0.1', createdAt: new Date().toISOString() }
];
let inMemoryCommentsStore: any[] = [];
const allowedAuthors = [
  {
    id: 'usr-admin-1',
    name: 'Primary Admin',
    role: 'Editor-in-Chief & Primary Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Chief Executive Editor & Platform Administrator',
    credentials: 'Admin'
  },
  {
    id: 'auth-1',
    name: 'Vikramaditya Sharma',
    role: 'Senior Equity Analyst & Derivatives Strategist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Senior Equity Analyst & Derivatives Strategist',
    credentials: 'CFA, MBA Finance'
  },
  {
    id: 'auth-2',
    name: 'Priya Mukherjee',
    role: 'Personal Finance Expert & Wealth Planner',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    bio: 'Personal Finance Expert & Wealth Planner',
    credentials: 'CFP Certified'
  }
];
const authorIdAliases: Record<string, string> = {
  'author-1': 'auth-1',
  'author-2': 'auth-2',
  'author-3': 'usr-admin-1',
  'author-4': 'auth-1',
  'admin-1': 'usr-admin-1'
};
const normalizeAuthorId = (authorId?: string) => {
  const id = String(authorId || '').trim();
  return authorIdAliases[id] || id || 'usr-admin-1';
};

function sortCommentsNewest(comments: any[]) {
  return [...comments].sort((a, b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime());
}

function mergeCommentRows(dbRows: any[], fallbackRows: any[]) {
  const seen = new Set((dbRows || []).map((comment: any) => String(comment.id)));
  const mergedFallback = (fallbackRows || []).filter((comment: any) => !seen.has(String(comment.id)));
  return sortCommentsNewest([...(dbRows || []), ...mergedFallback]);
}

const adminSessionMinutes = Number(process.env.ADMIN_SESSION_EXPIRY_MINUTES || 720);
let runtimeAdminPasswordHash = '';

function isAdminEmail(email: string): boolean {
  return configuredAdminEmails.includes(email);
}

function isAdminPasswordValid(password: string): boolean {
  if (runtimeAdminPasswordHash) {
    return hashSecret(password) === runtimeAdminPasswordHash;
  }
  if (process.env.ADMIN_PASSWORD_HASH) {
    return hashSecret(password) === process.env.ADMIN_PASSWORD_HASH;
  }
  if (process.env.ADMIN_PASSWORD) {
    return password === process.env.ADMIN_PASSWORD;
  }
  return false;
}

function issueAdminSession(email: string): string {
  const token = 'adm-' + crypto.randomBytes(32).toString('hex');
  adminSessions.set(token, {
    email,
    expiresAt: Date.now() + adminSessionMinutes * 60 * 1000
  });
  return token;
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = String(req.headers.authorization || '');
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const session = token ? adminSessions.get(token) : null;

  if (!session || Date.now() > session.expiresAt) {
    if (token) adminSessions.delete(token);
    return res.status(401).json({ success: false, message: 'Admin authentication required.' });
  }

  session.expiresAt = Date.now() + adminSessionMinutes * 60 * 1000;
  next();
}

app.use('/api/admin/contact-messages', requireAdminAuth);
app.use('/api/admin/comments', requireAdminAuth);
app.use('/api/admin/faqs', requireAdminAuth);
app.use('/api/admin/env-config', requireAdminAuth);
app.use('/api/admin/logs', requireAdminAuth);
app.use('/api/admin/popup-notification', requireAdminAuth);
app.use('/api/admin/subscribers', requireAdminAuth);
app.use('/api/smtp-config', requireAdminAuth);
app.use('/api/users', requireAdminAuth);
app.use('/api/subscribers/notify-article', requireAdminAuth);
app.use('/api/articles', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'POST') return next();
  return requireAdminAuth(req, res, next);
});
app.use('/api/financial-rules', (req, res, next) => {
  if (req.method === 'GET') return next();
  return requireAdminAuth(req, res, next);
});
app.use('/api/social-media', (req, res, next) => {
  if (req.method === 'GET') return next();
  return requireAdminAuth(req, res, next);
});

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

app.get('/health', async (_req: Request, res: Response) => {
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
      ON DUPLICATE KEY UPDATE
        status = 'active',
        subscribed_at = VALUES(subscribed_at)
      `,
      [id, email, subscribedAt]
    );

    await transporter.sendMail({
      from: process.env.SMTP_FROM || smtpUser,
      to: email,
      subject: 'Welcome to TheStockTimes',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Welcome to TheStockTimes!</h2>
          <p>Thank you for subscribing to TheStockTimes.</p>
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

    console.error('Subscription error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to subscribe at this time.'
    });
  }
});

app.get('/api/admin/subscribers', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT id, email, subscribed_at, status
      FROM subscribers
      ORDER BY subscribed_at DESC
    `);

    const subscribers = (rows || []).map((row: any) => ({
      id: row.id,
      email: row.email,
      subscriptionDate: row.subscribed_at,
      verificationStatus: 'Verified',
      status: String(row.status || '').toLowerCase() === 'unsubscribed' ? 'Unsubscribed' : 'Active'
    }));

    res.json({ success: true, subscribers });
  } catch (error: any) {
    console.error('Subscribers list error:', error);
    res.status(500).json({ success: false, message: 'Unable to load subscribers.' });
  }
});

app.put('/api/admin/subscribers/:id/status', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '').trim();
    const requestedStatus = String(req.body.status || '').trim();
    const status = requestedStatus === 'Unsubscribed' ? 'unsubscribed' : 'active';

    await pool.query(
      `UPDATE subscribers SET status = ? WHERE id = ?`,
      [status, id]
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error('Subscriber status update error:', error);
    res.status(500).json({ success: false, message: 'Unable to update subscriber.' });
  }
});

app.delete('/api/admin/subscribers/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '').trim();
    await pool.query(`DELETE FROM subscribers WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Subscriber delete error:', error);
    res.status(500).json({ success: false, message: 'Unable to delete subscriber.' });
  }
});

const defaultPopupNotification = () => ({
  enabled: false,
  title: 'Market Update',
  message: 'Read the latest market insight from The Stock Times.',
  imageUrl: '',
  linkUrl: '',
  linkLabel: 'Open Update',
  delaySeconds: 10,
  updatedAt: new Date().toISOString()
});

const popupRowToSettings = (row: any) => ({
  enabled: Boolean(row?.enabled),
  title: row?.title || '',
  message: row?.message || '',
  imageUrl: row?.image_url || '',
  linkUrl: row?.link_url || '',
  linkLabel: row?.link_label || 'Open Update',
  delaySeconds: Math.max(1, Math.min(120, Number(row?.delay_seconds) || 10)),
  updatedAt: row?.updated_at || new Date().toISOString()
});

app.get('/api/popup-notification', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT enabled, title, message, image_url, link_url, link_label, delay_seconds, updated_at
      FROM popup_notification_settings
      WHERE id = 1
      LIMIT 1
    `);

    res.json({
      success: true,
      settings: rows?.[0] ? popupRowToSettings(rows[0]) : defaultPopupNotification()
    });
  } catch (error: any) {
    console.error('Popup notification load error:', error);
    res.status(500).json({ success: false, settings: defaultPopupNotification() });
  }
});

app.put('/api/admin/popup-notification', async (req: Request, res: Response) => {
  try {
    const delaySeconds = Math.max(1, Math.min(120, Number(req.body.delaySeconds) || 10));
    const settings = {
      enabled: Boolean(req.body.enabled),
      title: String(req.body.title || '').slice(0, 255),
      message: String(req.body.message || ''),
      imageUrl: String(req.body.imageUrl || ''),
      linkUrl: String(req.body.linkUrl || ''),
      linkLabel: String(req.body.linkLabel || 'Open Update').slice(0, 120),
      delaySeconds,
      updatedAt: new Date().toISOString()
    };

    await pool.query(
      `
      INSERT INTO popup_notification_settings
        (id, enabled, title, message, image_url, link_url, link_label, delay_seconds, updated_at)
      VALUES
        (1, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        enabled = VALUES(enabled),
        title = VALUES(title),
        message = VALUES(message),
        image_url = VALUES(image_url),
        link_url = VALUES(link_url),
        link_label = VALUES(link_label),
        delay_seconds = VALUES(delay_seconds),
        updated_at = VALUES(updated_at)
      `,
      [
        settings.enabled,
        settings.title,
        settings.message,
        settings.imageUrl,
        settings.linkUrl,
        settings.linkLabel,
        settings.delaySeconds,
        settings.updatedAt
      ]
    );

    res.json({ success: true, settings });
  } catch (error: any) {
    console.error('Popup notification save error:', error);
    res.status(500).json({ success: false, message: 'Unable to save popup notification.' });
  }
});

app.get('/api/admin/env-config', async (_req: Request, res: Response) => {
  try {
    const files = await Promise.all(envFiles.map(async (envFile) => {
      let content = '';
      try {
        content = await fs.readFile(envFile.filePath, 'utf8');
      } catch (error: any) {
        if (error?.code !== 'ENOENT') throw error;
      }

      const values = parseEnvContent(content);
      return {
        key: envFile.key,
        label: envFile.label,
        path: envFile.filePath,
        fields: Object.entries(values).map(([key, value]) => ({
          key,
          value,
          isSecret: isSecretEnvKey(key)
        }))
      };
    }));

    res.json({ success: true, files });
  } catch (error: any) {
    console.error('Failed to read env config:', error);
    res.status(500).json({ success: false, message: error.message || 'Unable to read environment files.' });
  }
});

app.put('/api/admin/env-config', async (req: Request, res: Response) => {
  try {
    const requestedFiles = req.body?.files || {};
    const updatedFiles: string[] = [];

    for (const envFile of envFiles) {
      const updates = requestedFiles[envFile.key as EnvFileKey];
      if (!updates || typeof updates !== 'object') continue;

      const normalizedUpdates = Object.entries(updates).reduce<Record<string, string>>((acc, [key, value]) => {
        if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
          acc[key] = String(value ?? '');
          process.env[key] = acc[key];
        }
        return acc;
      }, {});

      if (Object.keys(normalizedUpdates).length === 0) continue;

      let content = '';
      try {
        content = await fs.readFile(envFile.filePath, 'utf8');
      } catch (error: any) {
        if (error?.code !== 'ENOENT') throw error;
      }

      await fs.writeFile(envFile.filePath, updateEnvContent(content, normalizedUpdates), 'utf8');
      updatedFiles.push(envFile.label);
    }

    res.json({
      success: true,
      updatedFiles,
      message: updatedFiles.length
        ? `${updatedFiles.join(', ')} updated. Restart the server for DB, SMTP, PORT, and startup-only settings.`
        : 'No environment changes were submitted.'
    });
  } catch (error: any) {
    console.error('Failed to update env config:', error);
    res.status(500).json({ success: false, message: error.message || 'Unable to update environment files.' });
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
        from: process.env.SMTP_FROM || smtpUser,
        to: process.env.CONTACT_TO_EMAIL || configuredAdminEmails[0] || smtpUser,
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

    const ensureColumns = async (tableName: string, columns: Record<string, string>) => {
      const [existingRows]: any = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
        [tableName]
      );
      const existingColumns = new Set((existingRows || []).map((row: any) => String(row.COLUMN_NAME)));

      for (const [columnName, definition] of Object.entries(columns)) {
        if (!existingColumns.has(columnName)) {
          await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`);
        }
      }
    };

    await pool.query(`
      CREATE TABLE IF NOT EXISTS authors (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        avatar TEXT NOT NULL,
        bio TEXT NOT NULL,
        credentials VARCHAR(255) NOT NULL,
        article_count INT DEFAULT 0,
        total_views INT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      INSERT IGNORE INTO authors (id, name, role, avatar, bio, credentials) VALUES 
      ('usr-admin-1', 'Primary Admin', 'Editor-in-Chief & Primary Admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'Chief Executive Editor & Platform Administrator', 'Admin'),
      ('auth-1', 'Vikramaditya Sharma', 'Senior Equity Analyst & Derivatives Strategist', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'Senior Equity Analyst & Derivatives Strategist', 'CFA, MBA Finance'),
      ('auth-2', 'Priya Mukherjee', 'Personal Finance Expert & Wealth Planner', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'Personal Finance Expert & Wealth Planner', 'CFP Certified');
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        avatar TEXT,
        role VARCHAR(64) DEFAULT 'author',
        status VARCHAR(32) DEFAULT 'active',
        bio TEXT,
        credentials VARCHAR(255),
        created_at VARCHAR(64) NOT NULL
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
  CREATE TABLE IF NOT EXISTS popup_notification_settings (
    id TINYINT PRIMARY KEY DEFAULT 1,
    enabled BOOLEAN DEFAULT FALSE,
    title VARCHAR(255) DEFAULT '',
    message TEXT,
    image_url LONGTEXT,
    link_url TEXT,
    link_label VARCHAR(120) DEFAULT 'Open Update',
    delay_seconds INT DEFAULT 10,
    updated_at VARCHAR(64) NOT NULL
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
        image_source TEXT,
        gallery_images TEXT,
        faqs TEXT,
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

    await ensureColumns('articles', {
      image_caption: 'image_caption TEXT',
      image_source: 'image_source TEXT',
      gallery_images: 'gallery_images TEXT',
      faqs: 'faqs TEXT',
      highlights: 'highlights TEXT',
      show_published_date: 'show_published_date BOOLEAN DEFAULT TRUE',
      updated_at: 'updated_at VARCHAR(64)',
      scheduled_date: 'scheduled_date VARCHAR(64)',
      is_popular: 'is_popular BOOLEAN DEFAULT FALSE',
      seo_title: 'seo_title VARCHAR(500)',
      seo_description: 'seo_description TEXT',
      focus_keywords: 'focus_keywords TEXT',
      canonical_url: 'canonical_url TEXT',
      og_title: 'og_title VARCHAR(500)',
      og_description: 'og_description TEXT',
      social_share_image: 'social_share_image TEXT'
    });

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
      CREATE TABLE IF NOT EXISTS social_media_settings (
        id INT PRIMARY KEY,
        twitter_url TEXT,
        linkedin_url TEXT,
        facebook_url TEXT,
        instagram_url TEXT,
        youtube_url TEXT,
        reddit_url TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

    const [commentForeignKeys]: any = await pool.query(
      `SELECT CONSTRAINT_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'comments'
         AND COLUMN_NAME = 'article_id'
         AND REFERENCED_TABLE_NAME IS NOT NULL`
    );
    for (const fk of commentForeignKeys || []) {
      const constraintName = String(fk.CONSTRAINT_NAME || '').replace(/`/g, '');
      if (constraintName) {
        await pool.query(`ALTER TABLE comments DROP FOREIGN KEY \`${constraintName}\``);
      }
    }

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

    // AI ENGINE TABLES
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_topics (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        country VARCHAR(32) NOT NULL DEFAULT 'US',
        category VARCHAR(128) NOT NULL,
        trend_reason TEXT,
        freshness_score INT DEFAULT 80,
        status VARCHAR(32) DEFAULT 'discovered',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_keywords (
        id VARCHAR(64) PRIMARY KEY,
        topic_id VARCHAR(64) NOT NULL,
        keyword VARCHAR(255) NOT NULL,
        intent VARCHAR(64) DEFAULT 'informational',
        relevance_score INT DEFAULT 85,
        search_volume_estimate INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ai_keywords_topic (topic_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_research_sources (
        id VARCHAR(64) PRIMARY KEY,
        job_id VARCHAR(64) NOT NULL,
        claim TEXT NOT NULL,
        value VARCHAR(255),
        unit VARCHAR(64),
        source_url TEXT NOT NULL,
        source_title VARCHAR(500),
        country VARCHAR(32) NOT NULL DEFAULT 'US',
        verification_status VARCHAR(32) DEFAULT 'VERIFIED',
        published_at VARCHAR(64),
        retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ai_sources_job (job_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_article_jobs (
        id VARCHAR(64) PRIMARY KEY,
        topic_id VARCHAR(64),
        topic VARCHAR(500) NOT NULL,
        country VARCHAR(32) NOT NULL DEFAULT 'US',
        category VARCHAR(128) NOT NULL,
        status VARCHAR(64) DEFAULT 'queued',
        current_agent VARCHAR(64) DEFAULT 'research',
        article_id VARCHAR(64),
        verification_status VARCHAR(64) DEFAULT 'pending',
        publish_status VARCHAR(64) DEFAULT 'pending',
        error_message TEXT,
        retry_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_agent_runs (
        id VARCHAR(64) PRIMARY KEY,
        job_id VARCHAR(64) NOT NULL,
        agent_name VARCHAR(64) NOT NULL,
        latency_ms INT DEFAULT 0,
        tokens_used INT DEFAULT 0,
        output_json LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ai_runs_job (job_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_fact_checks (
        id VARCHAR(64) PRIMARY KEY,
        job_id VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'PASS',
        verification_score INT DEFAULT 100,
        issues_json LONGTEXT,
        requires_human_review BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ai_fact_checks_job (job_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_generated_assets (
        id VARCHAR(64) PRIMARY KEY,
        job_id VARCHAR(64) NOT NULL,
        asset_type VARCHAR(64) NOT NULL,
        url_or_svg LONGTEXT NOT NULL,
        prompt_used TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ai_assets_job (job_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS article_revisions (
        id VARCHAR(64) PRIMARY KEY,
        article_id VARCHAR(64) NOT NULL,
        revised_by VARCHAR(128) DEFAULT 'AI_ENGINE',
        title VARCHAR(500) NOT NULL,
        content LONGTEXT NOT NULL,
        changelog TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_revisions_article (article_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed initial categories if empty
    const [existingCats]: any = await pool.query('SELECT COUNT(*) as count FROM categories');
    if (existingCats && existingCats[0] && existingCats[0].count === 0) {
      await pool.query(`
        INSERT INTO categories (id, name, slug, description, icon, subcategories) VALUES
         ('stock-market', 'Stock Market', 'stock-market', 'Equity analysis and news', 'TrendingUp', '[]'),
        ('ipo', 'IPO', 'ipo', 'Upcoming IPO calendar, India IPOs, global IPOs, pre-apply research, allotment dates, listing schedules, and risk analysis.', 'Layers', '["Upcoming IPOs","India IPOs","Global IPOs","IPO Calendar","Pre-Apply Research","Allotment & Listing"]'),
        ('personal-finance', 'Personal Finance', 'personal-finance', 'Wealth management & tax', 'Wallet', '[]'),
        ('banking', 'Banking', 'banking', 'Interest rates & banking updates', 'Building2', '[]'),
        ('investment', 'Investment', 'investment', 'Mutual funds & SIPs', 'PieChart', '[]'),
        ('finance-news', 'Finance News', 'finance-news', 'Breaking market updates', 'Newspaper', '[]')
      `);
    }

    await pool.query(
      `INSERT INTO categories (id, name, slug, description, icon, subcategories)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         slug = VALUES(slug),
         description = VALUES(description),
         icon = VALUES(icon),
         subcategories = VALUES(subcategories)`,
      [
        'ipo',
        'IPO',
        'ipo',
        'Upcoming IPO calendar, India IPOs, global IPOs, pre-apply research, allotment dates, listing schedules, and risk analysis.',
        'Layers',
        JSON.stringify(['Upcoming IPOs', 'India IPOs', 'Global IPOs', 'IPO Calendar', 'Pre-Apply Research', 'Allotment & Listing'])
      ]
    );

    // Seed initial authors if empty
    const [existingAuths]: any = await pool.query('SELECT COUNT(*) as count FROM authors');
    if (existingAuths && existingAuths[0] && existingAuths[0].count === 0) {
      await pool.query(`
        INSERT INTO authors (id, name, role, avatar, bio, credentials) VALUES
        ('usr-admin-1', 'Primary Admin', 'Editor-in-Chief & Primary Admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'Chief Executive Editor & Platform Administrator', 'Admin'),
        ('auth-1', 'Vikramaditya Sharma', 'Senior Equity Analyst & Derivatives Strategist', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'Senior Equity Analyst & Derivatives Strategist', 'CFA, MBA Finance'),
        ('auth-2', 'Priya Mukherjee', 'Personal Finance Expert & Wealth Planner', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'Personal Finance Expert & Wealth Planner', 'CFP Certified')
      `);
    }

    const [existingRules]: any = await pool.query('SELECT COUNT(*) as count FROM financial_rules');
    if (existingRules && existingRules[0] && existingRules[0].count === 0) {
      const now = new Date().toISOString();
      await pool.query(
        `INSERT INTO financial_rules
         (rule_key, label, category, value, unit, description, last_updated, updated_by, source_reference)
         VALUES
         ('ppf_interest_rate', 'PPF Interest Rate', 'ppf', 7.1, 'percent', 'Current Public Provident Fund annual interest rate.', ?, 'System', 'Admin seed'),
         ('epf_interest_rate', 'EPF Interest Rate', 'epf', 8.25, 'percent', 'Current Employee Provident Fund annual interest rate.', ?, 'System', 'Admin seed'),
         ('nps_expected_return', 'NPS Expected Return', 'nps', 10.0, 'percent', 'Default expected NPS return assumption.', ?, 'System', 'Admin seed'),
         ('gst_default_rate', 'GST Default Rate', 'gst', 18.0, 'percent', 'Default GST calculator rate.', ?, 'System', 'Admin seed'),
         ('inflation_default_rate', 'Default Inflation Rate', 'inflation', 6.0, 'percent', 'Default inflation assumption for planning calculators.', ?, 'System', 'Admin seed')`,
        [now, now, now, now, now]
      );
    }

    await pool.query(`
      INSERT INTO social_media_settings (id, twitter_url, linkedin_url, facebook_url, instagram_url, youtube_url, reddit_url)
      VALUES (1, '', '', '', '', '', '')
      ON DUPLICATE KEY UPDATE id = id
    `);

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
    const { article_id, question, answer, sort_order, id: requestedId } = req.body;

    if (!article_id || !question || !answer) {
      return res.status(400).json({
        message: 'Article, question and answer are required'
      });
    }

    const id = requestedId || `faq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await pool.query(
      `INSERT INTO article_faqs
       (id, article_id, question, answer, sort_order)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         article_id = VALUES(article_id),
         question = VALUES(question),
         answer = VALUES(answer),
         sort_order = VALUES(sort_order)`,
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
    res.json(mergeCommentRows(Array.isArray(rows) ? rows : [], inMemoryCommentsStore));
  } catch (err: any) {
    // Handle database/API errors
    console.error('Failed to fetch admin comments:', err);
    res.json(sortCommentsNewest(inMemoryCommentsStore));
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

    const fallbackRows = inMemoryCommentsStore.filter(comment => comment.article_id === req.params.articleId && comment.status === 'approved');
    res.json(mergeCommentRows(Array.isArray(rows) ? rows : [], fallbackRows));
  } catch (err: any) {
    console.error('Failed to fetch comments:', err);
    res.json(
      sortCommentsNewest(inMemoryCommentsStore.filter(comment => comment.article_id === req.params.articleId && comment.status === 'approved'))
    );
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
    const createdAt = new Date().toISOString();
    const commentRecord = {
      id,
      article_id,
      author_name,
      author_email,
      content,
      status: 'pending',
      created_at: createdAt
    };

    try {
      await pool.query(
        `INSERT INTO comments
         (id, article_id, author_name, author_email, content, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [id, article_id, author_name, author_email, content]
      );
    } catch (dbErr: any) {
      console.warn('MySQL comment save unavailable; using in-memory comment fallback:', dbErr.message);
      inMemoryCommentsStore.unshift(commentRecord);
    }

    res.status(201).json({
      message: 'Comment submitted successfully',
      id,
      status: 'pending',
      comment: commentRecord
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
    inMemoryCommentsStore = inMemoryCommentsStore.map(comment =>
      comment.id === req.params.id ? { ...comment, status: req.body.status } : comment
    );
    res.json({
      message: 'Comment status updated successfully'
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
    inMemoryCommentsStore = inMemoryCommentsStore.filter(comment => comment.id !== req.params.id);
    res.json({
      message: 'Comment deleted successfully'
    });
  }
});

// ARTICLES ROUTES
app.get('/api/articles', async (_req: Request, res: Response) => {
  try {
    await pool.query(
      `UPDATE articles
       SET status = 'published', published_at = COALESCE(scheduled_date, published_at), updated_at = ?
       WHERE status = 'scheduled' AND scheduled_date IS NOT NULL AND scheduled_date <= ?`,
      [new Date().toISOString(), new Date().toISOString()]
    );
    const [rows]: any = await pool.query('SELECT * FROM articles ORDER BY published_at DESC');
    const parsedRows = Array.isArray(rows) ? rows.map(mapDbArticleToClient) : [];
    const mergedArticles = mergeArticlesForPublicFeed([...inMemoryArticlesStore, ...parsedRows]);
    inMemoryArticlesStore = mergedArticles;
    res.json(mergedArticles);
  } catch (err: any) {
    console.warn('MySQL articles route fallback to memory:', err.message);
    const mergedArticles = mergeArticlesForPublicFeed(inMemoryArticlesStore);
    inMemoryArticlesStore = mergedArticles;
    res.json(mergedArticles);
  }
});

app.get('/api/articles/:slug', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM articles WHERE slug = ?', [req.params.slug]);
    if (rows.length === 0) {
      const memoryArticle = inMemoryArticlesStore.find(a => a.slug === req.params.slug);
      return memoryArticle && isPublicReadyArticle(memoryArticle) ? res.json(memoryArticle) : res.status(404).json({ error: 'Article not found' });
    }
    const article = mapDbArticleToClient(rows[0]);
    if (!isPublicReadyArticle(article)) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err: any) {
    const memoryArticle = inMemoryArticlesStore.find(a => a.slug === req.params.slug);
    if (memoryArticle && isPublicReadyArticle(memoryArticle)) return res.json(memoryArticle);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/articles/:id/view', async (req: Request, res: Response) => {
  const idOrSlug = req.params.id;
  const memoryArticle = inMemoryArticlesStore.find(a => a.id === idOrSlug || a.slug === idOrSlug);

  try {
    const [updateResult]: any = await pool.query('UPDATE articles SET views = COALESCE(views, 0) + 1 WHERE id = ? OR slug = ?', [idOrSlug, idOrSlug]);
    const [rows]: any = await pool.query('SELECT views FROM articles WHERE id = ? OR slug = ? LIMIT 1', [idOrSlug, idOrSlug]);
    const dbViews = rows?.[0]?.views;

    if (updateResult?.affectedRows > 0 || typeof dbViews === 'number') {
      if (memoryArticle) {
        memoryArticle.views = typeof dbViews === 'number' ? dbViews : (memoryArticle.views || 0) + 1;
      }
      return res.json({ success: true, views: dbViews || memoryArticle?.views || 0 });
    }

    if (memoryArticle) {
      memoryArticle.views = (memoryArticle.views || 0) + 1;
      return res.json({ success: true, views: memoryArticle.views });
    }

    res.status(404).json({ success: false, error: 'Article not found' });
  } catch (err: any) {
    if (memoryArticle) {
      memoryArticle.views = (memoryArticle.views || 0) + 1;
      return res.json({ success: true, views: memoryArticle.views, fallback: true });
    }
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

app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const user = req.body;
    const id = user.id || `usr-${Date.now()}`;
    await pool.query(
      `INSERT INTO users (id, name, email, avatar, role, status, bio, credentials, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         avatar = VALUES(avatar),
         role = VALUES(role),
         status = VALUES(status),
         bio = VALUES(bio),
         credentials = VALUES(credentials)`,
      [
        id,
        user.name || '',
        String(user.email || '').trim().toLowerCase(),
        user.avatar || '',
        user.role || 'author',
        user.status || 'active',
        user.bio || '',
        user.credentials || '',
        user.createdAt || new Date().toISOString()
      ]
    );
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/users/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
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
    const [rows]: any = await pool.query("SELECT * FROM authors WHERE id IN ('usr-admin-1', 'auth-1', 'auth-2')");
    const byId = new Map((rows || []).map((author: any) => [author.id, author]));
    res.json(allowedAuthors.map(author => ({ ...author, ...(byId.get(author.id) || {}) })));
  } catch (err: any) {
    res.json(allowedAuthors);
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
    if (!FINNHUB_API_KEY) {
      return res.json({ source: 'Finnhub.io Disabled', articles: [] });
    }
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
    if (!FINNHUB_API_KEY) {
      return res.status(503).json({ error: 'Finnhub API key is not configured.' });
    }
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
    const domain = getSiteUrl();
    const date = new Date().toISOString().split('T')[0];

    let dbArticles: any[] = [];
    try {
      const [rows]: any = await pool.query("SELECT slug, title, excerpt, content, featured_image, status, published_at, updated_at FROM articles WHERE status = 'published'");
      dbArticles = (rows || []).filter((article: any) => isPublicReadyArticle({
        ...article,
        featuredImage: article.featured_image,
        publishedAt: article.published_at,
        updatedAt: article.updated_at
      }));
    } catch (err) {
      console.warn('Sitemap DB Query Warning:', err);
    }

    const mergedSitemapArticles = new Map<string, any>();
    mergeArticlesForPublicFeed(inMemoryArticlesStore)
      .filter((article: any) => (article.status || 'published') === 'published')
      .forEach((article: any) => {
        if (!article.slug) return;
        mergedSitemapArticles.set(article.slug, {
          slug: article.slug,
          published_at: article.publishedAt || article.published_at,
          updated_at: article.updatedAt || article.updated_at
        });
      });

    dbArticles.forEach((article: any) => {
      if (!article.slug) return;
      mergedSitemapArticles.set(article.slug, article);
    });

    dbArticles = Array.from(mergedSitemapArticles.values());

    const staticRoutes = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/stock-market', priority: '0.9', changefreq: 'daily' },
      { path: '/ipo', priority: '0.9', changefreq: 'daily' },
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
      { path: '/disclaimer', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/cookies', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/editorial', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/corrections', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/guidelines', priority: '0.5', changefreq: 'monthly' },
      { path: '/legal/refund', priority: '0.5', changefreq: 'monthly' },

      // 20 Financial Calculators
      { path: '/financial-tools/emi-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/loan-eligibility-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/sip-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/lumpsum-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/cagr-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/swp-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/sip-vs-lumpsum', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/fd-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/rd-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/ppf-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/epf-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/nps-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/income-tax-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/salary-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/gst-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/retirement-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/inflation-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/compound-interest-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/simple-interest-calculator', priority: '0.85', changefreq: 'weekly' },
      { path: '/financial-tools/net-worth-calculator', priority: '0.85', changefreq: 'weekly' },

      // 6 Comparison Engines
      { path: '/comparison-tools/sip-vs-fd', priority: '0.85', changefreq: 'weekly' },
      { path: '/comparison-tools/fd-vs-debt-fund', priority: '0.85', changefreq: 'weekly' },
      { path: '/comparison-tools/rent-vs-buy', priority: '0.85', changefreq: 'weekly' },
      { path: '/comparison-tools/loan-comparison', priority: '0.85', changefreq: 'weekly' },
      { path: '/comparison-tools/credit-card-comparison', priority: '0.85', changefreq: 'weekly' },
      { path: '/comparison-tools/mutual-fund-comparison', priority: '0.85', changefreq: 'weekly' }
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

// DYNAMIC LIVE ROBOTS.TXT
app.get('/robots.txt', (_req: Request, res: Response) => {
  const domain = getSiteUrl();
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${domain}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// DYNAMIC LIVE ADS.TXT
app.get('/ads.txt', (_req: Request, res: Response) => {
  const publisherId = (process.env.ADSENSE_PUB_ID || process.env.VITE_ADSENSE_PUB_ID || 'pub-5020716602157264').replace(/^ca-/, '');
  const adsTxt = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;
  res.header('Content-Type', 'text/plain');
  res.send(adsTxt);
});

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
              The Stock Times
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
          for logging in to <strong>The Stock Times</strong>
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

    const isValidAdmin = isAdminEmail(cleanEmail) && isAdminPasswordValid(String(password || ''));

    if (!isValidAdmin) {
      loginLogs.unshift({ id: 'log-' + Date.now(), email: cleanEmail, status: 'FAILED', action: 'Login Attempt Failed - Invalid Credentials', ip: req.ip, createdAt: new Date().toISOString() });
      return res.status(401).json({
        success: false,
        message: configuredAdminEmails.length === 0
          ? 'Admin email is not configured on the server.'
          : 'Invalid admin credentials.'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashSecret(otp);
    const tempToken = 'temp-' + crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const targetEmail = cleanEmail;

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
        from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_FROM || smtpUser,
        to: targetEmail,
        subject: '🔑 Here is your One Time Password - The Stock Times',
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

    const isValidAdmin = isAdminEmail(cleanEmail);

    if (!isValidAdmin) {
      loginLogs.unshift({ id: 'log-' + Date.now(), email: cleanEmail, status: 'FAILED', action: 'Direct OTP Request Failed - Unauthorized Email', ip: req.ip, createdAt: new Date().toISOString() });
      return res.status(401).json({ success: false, message: 'This email is not authorized for Admin access.' });
    }

    const targetEmail = cleanEmail;

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
        from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_FROM || smtpUser,
        to: targetEmail,
        subject: '🔑 Here is your One Time Password - The Stock Times',
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

    const authToken = issueAdminSession(sessionData.email);

    res.json({
      success: true,
      token: authToken,
      user: {
        id: 'admin-1',
        name: 'The Stock Times Editor',
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

    if (!cleanEmail || !isAdminEmail(cleanEmail)) return res.json(genericResponse);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashSecret(token);
    const expiresAt = Date.now() + 20 * 60 * 1000;

    tempResetStore.set(token, {
      email: cleanEmail,
      tokenHash,
      expiresAt
    });

    const resetUrl = `${getSiteUrl()}/admin/reset-password?token=${token}`;

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || smtpUser,
        to: cleanEmail,
        subject: '🔑 Password Reset Request - The Stock Times Admin',
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
    runtimeAdminPasswordHash = hashSecret(newPassword);
    adminSessions.clear();

    loginLogs.unshift({ id: 'log-' + Date.now(), email: resetData.email, status: 'PASSWORD_CHANGED', action: 'Password Changed Successfully', ip: req.ip, createdAt: new Date().toISOString() });

    res.json({
      success: true,
      message: 'Password changed successfully! All prior sessions have been invalidated. Please sign in with your new password.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error resetting password.' });
  }
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

    const targetSubscribers: string[] = Array.isArray(subscribers) ? subscribers : [];

    let sentCount = 0;
    for (const email of targetSubscribers) {
      try {
        const unsubscribeUrl = `${getSiteUrl()}/unsubscribe?email=${encodeURIComponent(email)}`;
        const articleUrl = `${getSiteUrl()}/article/${slug}`;

        await transporter.sendMail({
          from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_FROM || smtpUser,
          to: email,
          subject: `📰 New Published Article: ${articleTitle}`,
          html: `
            <div style="background-color: #f8fafc; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);">
                
                <!-- HEADER -->
                <div style="background-color: #0b1f33; padding: 24px; text-align: center;">
                  <h2 style="color: #ffffff; font-family: Georgia, serif; margin: 0; font-size: 24px; letter-spacing: -0.5px;">THE STOCK TIMES</h2>
                  <p style="color: #10b981; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; margin: 6px 0 0 0;">EDITORIAL BROADCAST STREAM</p>
                </div>

                <!-- CONTENT BODY -->
                <div style="padding: 28px;">
                  ${featuredImage ? `<img src="${featuredImage}" alt="${articleTitle}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 14px; margin-bottom: 20px; border: 1px solid #f1f5f9;" />` : ''}

                  <h1 style="font-size: 22px; font-weight: 800; color: #0b1f33; margin: 0 0 12px 0; font-family: Georgia, serif; line-height: 1.35;">
                    ${articleTitle}
                  </h1>

                  <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
                    ${excerpt || 'Read the full analysis and insights on TheStockTimes.online...'}
                  </p>

                  <!-- READ FULL ARTICLE BUTTON -->
                  <div style="text-align: center; margin-bottom: 28px;">
                    <a href="${articleUrl}" style="display: inline-block; background-color: #155eef; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 12px rgba(21, 94, 239, 0.3);">
                      Read Full Article →
                    </a>
                  </div>

                  <!-- FOOTER & UNSUBSCRIBE LINK -->
                  <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                    <p style="margin: 0 0 8px 0;">You are receiving this email because you subscribed to market insights at <strong>TheStockTimes.online</strong>.</p>
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

// IN-MEMORY ARTICLES STORE WITH MYSQL DATABASE SYNC
let inMemoryArticlesStore: any[] = [...INITIAL_ARTICLES];

const getArticleMergeKey = (article: any) => String(article?.slug || article?.id || article?.title || '').trim();

const getArticleSortTime = (article: any) => {
  const rawDate = article?.publishedAt || article?.published_at || article?.updatedAt || article?.updated_at || 0;
  const timestamp = new Date(rawDate).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const getArticlePlainText = (article: any) => String(article?.content || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const isPublicReadyArticle = (article: any) => {
  if ((article?.status || 'published') !== 'published') return false;
  const title = String(article?.title || '').toLowerCase();
  const excerpt = String(article?.excerpt || '').toLowerCase();
  const plainText = getArticlePlainText(article);

  if (!article?.slug || !article?.featuredImage) return false;
  if (title.includes('write detailed financial research') || title.includes('automatically detected article')) return false;
  if (excerpt === 'auto excerpt' || plainText === 'Auto Content') return false;
  return plainText.split(' ').filter(Boolean).length >= 120;
};

const mergeArticlesForPublicFeed = (articles: any[] = []) => {
  const merged = new Map<string, any>();

  [...INITIAL_ARTICLES, ...articles].forEach((article) => {
    const key = getArticleMergeKey(article);
    if (!key) return;
    merged.set(key, article);
  });

  return Array.from(merged.values())
    .filter(isPublicReadyArticle)
    .sort((a, b) => getArticleSortTime(b) - getArticleSortTime(a));
};

const parseJsonField = (value: any, fallback: any = []) => {
  if (typeof value !== 'string') return value || fallback;
  try {
    return JSON.parse(value || '[]');
  } catch {
    return fallback;
  }
};

const mapDbArticleToClient = (r: any) => ({
  id: r.id,
  title: r.title,
  slug: r.slug,
  categoryId: r.category_id,
  subCategory: r.sub_category,
  featuredImage: r.featured_image,
  imageCaption: r.image_caption,
  imageSource: r.image_source,
  excerpt: r.excerpt,
  content: r.content,
  highlights: parseJsonField(r.highlights),
  authorId: normalizeAuthorId(r.author_id),
  publishedAt: r.published_at,
  showPublishedDate: r.show_published_date !== 0,
  readTimeMinutes: r.read_time_minutes || 5,
  status: r.status || 'published',
  views: r.views || 0,
  isFeatured: Boolean(r.is_featured),
  isTrending: Boolean(r.is_trending),
  tags: parseJsonField(r.tags),
  galleryImages: parseJsonField(r.gallery_images),
  faqs: parseJsonField(r.faqs),
  seoTitle: r.seo_title,
  seoDescription: r.seo_description,
  focusKeywords: parseJsonField(r.focus_keywords),
  canonicalUrl: r.canonical_url,
  ogTitle: r.og_title,
  ogDescription: r.og_description,
  socialShareImage: r.social_share_image
});

async function saveArticleRecord(article: any) {
  const articleToSave = {
    ...article,
    id: article.id || `art-${Date.now()}`,
    publishedAt: article.publishedAt || new Date().toISOString(),
    status: article.status || 'published'
  };

  const existingIndex = inMemoryArticlesStore.findIndex(a => a.id === articleToSave.id || a.slug === articleToSave.slug);
  if (existingIndex >= 0) {
    inMemoryArticlesStore[existingIndex] = { ...inMemoryArticlesStore[existingIndex], ...articleToSave };
  } else {
    inMemoryArticlesStore.unshift(articleToSave);
  }

  const authorIdToUse = normalizeAuthorId(articleToSave.authorId);
  try {
    const conn = await pool.getConnection();
    try {
    await conn.query('SET FOREIGN_KEY_CHECKS=0');

    await conn.query(
      `INSERT INTO articles
      (id, title, slug, category_id, sub_category, featured_image, image_caption, image_source, excerpt, content, author_id, published_at, show_published_date, read_time_minutes, status, views, is_featured, is_trending, tags, gallery_images, faqs)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title=VALUES(title), slug=VALUES(slug), category_id=VALUES(category_id), sub_category=VALUES(sub_category),
        featured_image=VALUES(featured_image), image_caption=VALUES(image_caption), image_source=VALUES(image_source),
        excerpt=VALUES(excerpt), content=VALUES(content), author_id=VALUES(author_id), published_at=VALUES(published_at),
        show_published_date=VALUES(show_published_date), read_time_minutes=VALUES(read_time_minutes), status=VALUES(status),
        is_featured=VALUES(is_featured), is_trending=VALUES(is_trending), tags=VALUES(tags), gallery_images=VALUES(gallery_images), faqs=VALUES(faqs)`,
      [
        articleToSave.id,
        articleToSave.title,
        articleToSave.slug,
        articleToSave.categoryId || 'finance-news',
        articleToSave.subCategory || '',
        articleToSave.featuredImage || '',
        articleToSave.imageCaption || '',
        articleToSave.imageSource || '',
        articleToSave.excerpt || '',
        articleToSave.content || '',
        authorIdToUse,
        articleToSave.publishedAt,
        articleToSave.showPublishedDate !== false ? 1 : 0,
        articleToSave.readTimeMinutes || 5,
        articleToSave.status,
        articleToSave.views || 0,
        articleToSave.isFeatured ? 1 : 0,
        articleToSave.isTrending ? 1 : 0,
        JSON.stringify(articleToSave.tags || []),
        JSON.stringify(articleToSave.galleryImages || []),
        JSON.stringify(articleToSave.faqs || [])
      ]
    );

    await conn.query('SET FOREIGN_KEY_CHECKS=1');
    } finally {
      conn.release();
    }
  } catch (dbErr: any) {
    console.warn('MySQL article save unavailable; using in-memory article fallback:', dbErr.message);
  }

  return articleToSave;
}

// CREATE OR UPDATE ARTICLE (POST /api/articles & POST /api/admin/articles)
const handleSaveArticle = async (req: Request, res: Response) => {
  try {
    const article = req.body;
    if (!article || !article.title || !article.slug) {
      return res.status(400).json({ success: false, message: 'Article title and slug are required.' });
    }

    try {
      const savedArticle = await saveArticleRecord(article);
      return res.json({ success: true, article: savedArticle });
    } catch (dbErr: any) {
      console.error('MySQL article save failed:', dbErr.message);
      return res.status(500).json({
        success: false,
        message: `MySQL article save failed: ${dbErr.message}`
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

app.post('/api/articles', handleSaveArticle);
app.post('/api/admin/articles', handleSaveArticle);

// DELETE ARTICLE
const handleDeleteArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    inMemoryArticlesStore = inMemoryArticlesStore.filter(a => a.id !== id);
    try {
      await pool.query('DELETE FROM articles WHERE id = ?', [id]);
    } catch (e) { }
    res.json({ success: true, message: 'Article deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

app.delete('/api/articles/:id', handleDeleteArticle);
app.delete('/api/admin/articles/:id', handleDeleteArticle);

// AI CONTENT ENGINE REST ENDPOINTS
import { GeminiService } from './ai/services/geminiService';
import { executeArticlePipeline } from './ai/graph/workflow';

const inMemoryAiJobs: any[] = [];

app.use('/api/ai', requireAdminAuth);

// 1. GET /api/ai/test (Gemini Structured JSON Connectivity Test)
app.get('/api/ai/test', async (_req: Request, res: Response) => {
  try {
    const testResult = await GeminiService.testConnection();
    res.json({
      success: testResult.success,
      message: testResult.message,
      model: testResult.model,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. POST /api/ai/jobs/trigger (Milestone 1 Manual Topic Trigger)
app.post('/api/ai/jobs/trigger', async (req: Request, res: Response) => {
  try {
    const { topic, category = 'personal-finance', country = 'US', autoPublish = false } = req.body;
    if (!topic || String(topic).trim() === '') {
      return res.status(400).json({ success: false, message: 'Topic title is required.' });
    }

    const jobId = `job-${Date.now()}`;
    const cleanTopic = String(topic).trim();

    // Create initial job record in MySQL
    try {
      await pool.query(
        `INSERT INTO ai_article_jobs (id, topic, country, category, status, current_agent)
        VALUES (?, ?, ?, ?, 'researching', 'research')`,
        [jobId, cleanTopic, country, category]
      );
    } catch (e) {}

    // Execute LangGraph pipeline for topic
    const pipelineState = await executeArticlePipeline(jobId, cleanTopic, category, country);

    const isAutoPublish = autoPublish || process.env.AI_AUTO_PUBLISH === 'true';

    const jobObj = {
      id: jobId,
      topic: cleanTopic,
      country,
      category,
      status: isAutoPublish ? 'published' : pipelineState.status,
      currentAgent: pipelineState.currentAgent,
      verificationStatus: pipelineState.factCheckResult?.status || 'PASS',
      publishStatus: isAutoPublish ? 'published' : 'pending',
      articleId: undefined as string | undefined,
      createdAt: new Date().toISOString(),
      articleContent: pipelineState.articleContent,
      seoMetadata: pipelineState.seoMetadata,
      graphics: pipelineState.graphics,
      researchPack: pipelineState.researchPack,
      factCheckResult: pipelineState.factCheckResult
    };

    inMemoryAiJobs.unshift(jobObj);

    // If autoPublish is enabled, create and publish article immediately
    if (isAutoPublish) {
      const articleObj = {
        id: `art-${Date.now()}`,
        title: jobObj.articleContent?.h1Title || jobObj.topic,
        slug: jobObj.seoMetadata?.slug || jobObj.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        categoryId: jobObj.category || 'personal-finance',
        subCategory: jobObj.country === 'US' ? 'US Finance' : 'UK Finance',
        featuredImage: jobObj.graphics?.featuredImageUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
        excerpt: jobObj.articleContent?.excerpt || '',
        content: `${jobObj.articleContent?.introduction || ''}\n${jobObj.articleContent?.fullBodyHtml || ''}`,
        authorId: 'auth-1',
        publishedAt: new Date().toISOString(),
        showPublishedDate: true,
        readTimeMinutes: 6,
        status: 'published',
        views: 0,
        tags: ['AI Generated', jobObj.category, jobObj.country],
        faqs: jobObj.articleContent?.faqs || []
      };

      const savedArticle = await saveArticleRecord(articleObj);
      jobObj.articleId = savedArticle.id;
    }

    // Update MySQL job record
    try {
      await pool.query(
        `UPDATE ai_article_jobs SET status = ?, current_agent = ?, verification_status = ?, publish_status = ?, article_id = COALESCE(?, article_id) WHERE id = ?`,
        [jobObj.status, pipelineState.currentAgent, pipelineState.factCheckResult?.status || 'PASS', jobObj.publishStatus, jobObj.articleId || null, jobId]
      );
    } catch (e) {}

    res.json({ success: true, job: jobObj });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. GET /api/ai/jobs (Fetch Jobs List)
app.get('/api/ai/jobs', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM ai_article_jobs ORDER BY created_at DESC LIMIT 50');
    if (Array.isArray(rows) && rows.length > 0) {
      const articleIds = rows.map((r: any) => r.article_id).filter(Boolean);
      const articleById = new Map<string, any>();
      if (articleIds.length > 0) {
        try {
          const placeholders = articleIds.map(() => '?').join(',');
          const [articleRows]: any = await pool.query(`SELECT * FROM articles WHERE id IN (${placeholders})`, articleIds);
          if (Array.isArray(articleRows)) {
            articleRows.forEach((row: any) => {
              articleById.set(row.id, mapDbArticleToClient(row));
            });
          }
        } catch (articleErr: any) {
          console.warn('AI jobs article hydration skipped:', articleErr.message);
        }
      }

      const parsedJobs = rows.map((r: any) => {
        const memoryMatch = inMemoryAiJobs.find(m => m.id === r.id);
        if (memoryMatch) return memoryMatch;

        const article = articleById.get(r.article_id);
        return {
          id: r.id,
          topic: r.topic,
          country: r.country,
          category: r.category,
          status: r.status,
          currentAgent: r.current_agent,
          verificationStatus: r.verification_status,
          publishStatus: r.publish_status,
          articleId: r.article_id,
          createdAt: r.created_at,
          articleContent: article ? {
            h1Title: article.title,
            excerpt: article.excerpt,
            introduction: '',
            keyTakeaways: article.highlights || [],
            fullBodyHtml: article.content,
            faqs: article.faqs || [],
            disclaimer: ''
          } : undefined,
          seoMetadata: article ? {
            seoTitle: article.seoTitle || article.title,
            seoDescription: article.seoDescription || article.excerpt,
            slug: article.slug,
            primaryKeyword: article.focusKeywords?.[0] || article.title,
            secondaryKeywords: article.focusKeywords || []
          } : undefined,
          graphics: article ? {
            featuredImageUrl: article.featuredImage
          } : undefined
        };
      });
      return res.json({ success: true, jobs: parsedJobs });
    }
  } catch (e) {}
  res.json({ success: true, jobs: inMemoryAiJobs });
});

// 4. POST /api/ai/jobs/:id/approve (Approve & Publish Article)
app.post('/api/ai/jobs/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let job = inMemoryAiJobs.find(j => j.id === id);

    if (!job) {
      const [jobRows]: any = await pool.query('SELECT * FROM ai_article_jobs WHERE id = ? LIMIT 1', [id]);
      const dbJob = Array.isArray(jobRows) ? jobRows[0] : null;

      if (!dbJob) {
        return res.status(404).json({ success: false, message: 'Job not found.' });
      }

      if (dbJob.article_id) {
        await pool.query(
          "UPDATE articles SET status = 'published', published_at = COALESCE(published_at, ?), updated_at = ? WHERE id = ?",
          [new Date().toISOString(), new Date().toISOString(), dbJob.article_id]
        );
        await pool.query(
          `UPDATE ai_article_jobs SET status = 'published', publish_status = 'published', article_id = ? WHERE id = ?`,
          [dbJob.article_id, id]
        );

        const [articleRows]: any = await pool.query('SELECT * FROM articles WHERE id = ? LIMIT 1', [dbJob.article_id]);
        const article = Array.isArray(articleRows) && articleRows[0] ? mapDbArticleToClient(articleRows[0]) : null;
        if (article) {
          const existingIndex = inMemoryArticlesStore.findIndex(a => a.id === article.id);
          if (existingIndex >= 0) inMemoryArticlesStore[existingIndex] = article;
          else inMemoryArticlesStore.unshift(article);
        }

        return res.json({ success: true, message: 'Article approved and published successfully!', article });
      }

      return res.status(404).json({ success: false, message: 'Job article draft was not found. Please run the AI pipeline again.' });
    }

    const articleObj = {
      id: `art-${Date.now()}`,
      title: job.articleContent?.h1Title || job.topic,
      slug: job.seoMetadata?.slug || job.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryId: job.category || 'personal-finance',
      subCategory: job.country === 'US' ? 'US Finance' : 'UK Finance',
      featuredImage: job.graphics?.featuredImageUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
      excerpt: job.articleContent?.excerpt || '',
      content: `${job.articleContent?.introduction || ''}\n${job.articleContent?.fullBodyHtml || ''}`,
      authorId: 'auth-1',
      publishedAt: new Date().toISOString(),
      showPublishedDate: true,
      readTimeMinutes: 6,
      status: 'published',
      views: 0,
      tags: ['AI Generated', job.category, job.country],
      faqs: job.articleContent?.faqs || []
    };

    const savedArticle = await saveArticleRecord(articleObj);

    job.status = 'published';
    job.publishStatus = 'published';
    job.articleId = savedArticle.id;

    try {
      await pool.query(
        `UPDATE ai_article_jobs SET status = 'published', publish_status = 'published', article_id = ? WHERE id = ?`,
        [savedArticle.id, id]
      );
    } catch (e) {}

    res.json({ success: true, message: 'Article approved and published successfully!', article: savedArticle });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. SMTP TEST CONNECTION ENDPOINT
app.post('/api/smtp-config/test', async (req: Request, res: Response) => {
  try {
    const { smtpHost, smtpPort, smtpUsername, smtpPassword, smtpSecure, targetEmail, smtpFromName } = req.body;

    if (!smtpHost || !smtpUsername || !smtpPassword || !targetEmail) {
      return res.status(400).json({
        success: false,
        message: 'SMTP host, username, password, and target email are required for a test.'
      });
    }

    const testTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort) || 465,
      secure: smtpSecure !== false,
      auth: {
        user: smtpUsername,
        pass: smtpPassword
      }
    });

    await testTransporter.verify();

    await testTransporter.sendMail({
      from: `"${smtpFromName || 'The Stock Times'}" <${smtpUsername}>`,
      to: targetEmail,
      subject: '✅ SMTP Configuration Test Successful - The Stock Times',
      html: `
        <div style="background-color: #f8fafc; padding: 24px; font-family: sans-serif;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0b1f33; margin-0 0 12px 0;">SMTP Test Successful</h2>
            <p style="color: #475569; font-size: 14px;">Your custom SMTP server credentials (<strong>${smtpHost}</strong>) have been verified and delivered this test message successfully.</p>
          </div>
        </div>
      `
    });

    res.json({
      success: true,
      message: `SMTP test connection verified & test email delivered to ${targetEmail}.`
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: `SMTP verification failed: ${err.message}`
    });
  }
});

import { startDailyAiScheduler } from './ai/cron/dailyScheduler';

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 MySQL Backend REST API running on http://localhost:${PORT}`);
  await initializeTables();
  startDailyAiScheduler();
});
