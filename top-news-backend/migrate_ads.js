import { pool } from './src/db/index.js';

const sql = `
CREATE TABLE IF NOT EXISTS advertisements (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  image_url   TEXT,
  link_url    TEXT NOT NULL,
  position    TEXT DEFAULT 'sidebar',
  is_active   BOOLEAN DEFAULT true,
  start_date  TIMESTAMPTZ,
  end_date    TIMESTAMPTZ,
  click_count INT DEFAULT 0,
  client_name  TEXT,
  client_email TEXT,
  client_phone TEXT,
  status       TEXT DEFAULT 'approved',
  notes        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS client_phone TEXT;
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          SERIAL PRIMARY KEY,
  endpoint    TEXT UNIQUE NOT NULL,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  language    TEXT DEFAULT 'en',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS push_notifications (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  icon        TEXT,
  url         TEXT,
  sent_at     TIMESTAMPTZ DEFAULT NOW(),
  sent_count  INT DEFAULT 0
);
`;

try {
  await pool.query(sql);
  console.log('✅ Tables created: advertisements, push_subscriptions, push_notifications');
} catch (err) {
  console.error('❌ Migration error:', err.message);
} finally {
  await pool.end();
}
