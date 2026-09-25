import pg from 'pg';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Zch7yLNazH2C@ep-plain-thunder-b38559px-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const sampleVideos = [
  {
    title: "ISRO Lunar Mission: New Images Released from Moon Orbit",
    slug: "isro-lunar-mission-new-images-moon-orbit",
    description: "Watch latest high-resolution video footage sent by ISRO's lunar orbital spacecraft demonstrating crater mapping.",
    video_url: "https://vjs.zencdn.net/v/oceans.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&auto=format&fit=crop&q=80",
    duration: 65,
    category: "technology",
    topic: "space",
    language: "en",
    section: "main",
    views: 3422,
    status: "published"
  },
  {
    title: "Global Tech Summit 2026: AI & Robotics Innovation Showcase",
    slug: "global-tech-summit-2026-ai-robotics-showcase",
    description: "Highlights from the world's largest technology conference featuring next-gen artificial intelligence and autonomous robotics.",
    video_url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
    duration: 120,
    category: "technology",
    topic: "ai",
    language: "en",
    section: "main",
    views: 5892,
    status: "published"
  },
  {
    title: "World Cup Highlights: Historic Comeback Match Victory",
    slug: "world-cup-highlights-historic-comeback-victory",
    description: "Watch thrilling last-minute winning goals and commentary highlights from last night's championship game.",
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    duration: 90,
    category: "sports",
    topic: "football",
    language: "en",
    section: "main",
    views: 12400,
    status: "published"
  }
];

async function seedPool(poolInstance, name) {
  try {
    console.log(`Updating short videos in ${name}...`);
    for (const v of sampleVideos) {
      const id = crypto.randomUUID();
      await poolInstance.query(
        `INSERT INTO short_videos (id, title, slug, description, video_url, thumbnail_url, duration, category, topic, language, section, views, status, published_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           video_url = EXCLUDED.video_url,
           thumbnail_url = EXCLUDED.thumbnail_url,
           duration = EXCLUDED.duration,
           category = EXCLUDED.category,
           topic = EXCLUDED.topic,
           language = EXCLUDED.language,
           status = EXCLUDED.status,
           updated_at = NOW();`,
        [id, v.title, v.slug, v.description, v.video_url, v.thumbnail_url, v.duration, v.category, v.topic, v.language, v.section, v.views, v.status]
      );
    }
    console.log(`✅ Success for ${name}`);
    await poolInstance.end();
  } catch (e) {
    console.error(`❌ Error seeding ${name}:`, e.message);
  }
}

async function seedAll() {
  // 1. Local DB
  const localPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres1234',
    database: process.env.DB_NAME || 'top_news'
  });
  await seedPool(localPool, 'Local PostgreSQL (localhost)');

  // 2. Primary Neon DB
  const neonUrl1 = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_u38NawxLgSRt@ep-dry-cherry-a8316m98-pooler.eastus2.azure.neon.tech/neondb?sslmode=require';
  const neonPool1 = new Pool({ connectionString: neonUrl1, ssl: { rejectUnauthorized: false } });
  await seedPool(neonPool1, 'Neon Cloud DB (dry-cherry)');

  // 3. Alternate Neon DB
  const neonUrl2 = 'postgresql://neondb_owner:npg_Zch7yLNazH2C@ep-plain-thunder-b38559px-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const neonPool2 = new Pool({ connectionString: neonUrl2, ssl: { rejectUnauthorized: false } });
  await seedPool(neonPool2, 'Neon Cloud DB (plain-thunder)');
}

seedAll().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
