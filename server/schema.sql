-- MySQL Schema Script for FinancePulse Database
CREATE DATABASE IF NOT EXISTS finance_pulse_db;
USE finance_pulse_db;

-- 1. Authors Table
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
);

-- 2. Categories Table
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
);

-- 3. Articles Table
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
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

-- 4. Financial Rules Management Table
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
);

-- 5. Ad Placements Table
CREATE TABLE IF NOT EXISTS ad_placements (
  placement_key VARCHAR(128) PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  page_group VARCHAR(64) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  network VARCHAR(64) DEFAULT 'google-adsense',
  device VARCHAR(32) DEFAULT 'all'
);

-- 6. Ad Units Table
CREATE TABLE IF NOT EXISTS ad_units (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(64) NOT NULL,
  network VARCHAR(64) NOT NULL,
  slot_id VARCHAR(128) NOT NULL,
  placement VARCHAR(128) NOT NULL,
  target_device VARCHAR(32) DEFAULT 'all',
  status VARCHAR(32) DEFAULT 'active'
);

-- 7. House Ads Table
CREATE TABLE IF NOT EXISTS house_ads (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  cta_text VARCHAR(128) NOT NULL,
  target_url TEXT NOT NULL,
  image_url TEXT NOT NULL,
  placement VARCHAR(128) NOT NULL,
  status VARCHAR(32) DEFAULT 'active'
);

-- 8. Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(64) PRIMARY KEY,
  article_id VARCHAR(64) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(32) DEFAULT 'pending',
  created_at VARCHAR(64) NOT NULL,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Blog Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  subscribed_at VARCHAR(64) NOT NULL,
  status VARCHAR(32) DEFAULT 'active'
);

-- 10. Contact Messages Table
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
);

-- 11. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(64) DEFAULT 'super_admin',
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 12. Admin OTPs Table (2FA Verification)
CREATE TABLE IF NOT EXISTS admin_otps (
  id VARCHAR(64) PRIMARY KEY,
  admin_id VARCHAR(64) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  purpose VARCHAR(64) DEFAULT 'login_2fa',
  attempts INT DEFAULT 0,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- 13. Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id VARCHAR(64) PRIMARY KEY,
  admin_id VARCHAR(64) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- 14. Admin Audit & Login Activity Logs Table
CREATE TABLE IF NOT EXISTS admin_login_logs (
  id VARCHAR(64) PRIMARY KEY,
  admin_id VARCHAR(64) NOT NULL,
  ip_address VARCHAR(64),
  user_agent TEXT,
  status VARCHAR(32) NOT NULL,
  action VARCHAR(128) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
