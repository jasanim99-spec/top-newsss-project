import pg from 'pg';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_u38NawxLgSRt@ep-dry-cherry-a8316m98-pooler.eastus2.azure.neon.tech/neondb?sslmode=require';

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

async function seed() {
  console.log('Updating sample short video URLs in Neon DB...');
  for (const v of sampleVideos) {
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO short_videos (id, title, slug, description, video_url, thumbnail_url, duration, category, topic, language, section, views, status, published_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET
         video_url = EXCLUDED.video_url,
         thumbnail_url = EXCLUDED.thumbnail_url,
         updated_at = NOW();`,
      [id, v.title, v.slug, v.description, v.video_url, v.thumbnail_url, v.duration, v.category, v.topic, v.language, v.section, v.views, v.status]
    );
  }
  console.log('✅ High-speed video URLs updated successfully in Neon DB!');
  await pool.end();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
