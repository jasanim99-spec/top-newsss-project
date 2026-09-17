-- PostgreSQL Database Schema for Top News
-- Database: top_news

-- 1. Users / Admins / Reporters Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(128) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'reporter',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    phone VARCHAR(50),
    city VARCHAR(100),
    district VARCHAR(100),
    beat VARCHAR(100) DEFAULT 'General',
    press_card_no VARCHAR(100),
    photo_url TEXT,
    bio TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    articles_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- 2. News Articles Table
CREATE TABLE IF NOT EXISTS news_articles (
    id VARCHAR(128) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    content TEXT,
    image_url TEXT,
    category VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    language VARCHAR(20) NOT NULL DEFAULT 'en',
    section VARCHAR(50) DEFAULT 'main',
    keywords TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    source_url TEXT,
    views INT DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    author_id VARCHAR(128) REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(255),
    author_role VARCHAR(50),
    author_city VARCHAR(100),
    author_photo TEXT,
    press_card_no VARCHAR(100),
    editorial_notes TEXT,
    location JSONB,
    ai_summary TEXT,
    is_breaking BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_slug ON news_articles(slug);
CREATE INDEX IF NOT EXISTS idx_news_status ON news_articles(status);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_topic ON news_articles(topic);
CREATE INDEX IF NOT EXISTS idx_news_language ON news_articles(language);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_author_id ON news_articles(author_id);

-- 3. Short Videos Table
CREATE TABLE IF NOT EXISTS short_videos (
    id VARCHAR(128) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INT DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    language VARCHAR(20) NOT NULL DEFAULT 'en',
    section VARCHAR(50) DEFAULT 'main',
    keywords TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    source_url TEXT,
    views INT DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_videos_slug ON short_videos(slug);
CREATE INDEX IF NOT EXISTS idx_videos_status ON short_videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_category ON short_videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_language ON short_videos(language);
CREATE INDEX IF NOT EXISTS idx_videos_published_at ON short_videos(published_at DESC);

-- 4. Advertisements Table
CREATE TABLE IF NOT EXISTS advertisements (
    id VARCHAR(128) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    image_url TEXT,
    link_url TEXT,
    position VARCHAR(100) DEFAULT 'sidebar',
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    click_count INT DEFAULT 0,
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Reporter Leaves Table
CREATE TABLE IF NOT EXISTS reporter_leaves (
    id VARCHAR(128) PRIMARY KEY,
    reporter_id VARCHAR(128) REFERENCES users(id) ON DELETE CASCADE,
    reporter_name VARCHAR(255),
    reporter_email VARCHAR(255),
    leave_type VARCHAR(100),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    total_days INT DEFAULT 1,
    reason TEXT,
    backup_reporter VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Reporter Goals Table
CREATE TABLE IF NOT EXISTS reporter_goals (
    id VARCHAR(128) PRIMARY KEY,
    reporter_id VARCHAR(128) REFERENCES users(id) ON DELETE CASCADE,
    target_articles INT DEFAULT 0,
    target_views INT DEFAULT 0,
    month INT,
    year INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'general',
    logo_url TEXT DEFAULT '/logo.png',
    favicon_url TEXT DEFAULT '/logo.png',
    site_name VARCHAR(255) DEFAULT 'TOP NEWS',
    site_tagline TEXT DEFAULT 'Breaking News, Latest Updates & Current Affairs',
    admin_url VARCHAR(255) DEFAULT 'http://localhost:5173',
    main_website_url VARCHAR(255) DEFAULT 'http://localhost:8080',
    master_key VARCHAR(255),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Push Subscriptions Table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    endpoint TEXT PRIMARY KEY,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    language VARCHAR(20) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Push Notifications History Table
CREATE TABLE IF NOT EXISTS push_notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    icon TEXT DEFAULT '/logo.png',
    url TEXT DEFAULT '/',
    sent_count INT DEFAULT 0,
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

