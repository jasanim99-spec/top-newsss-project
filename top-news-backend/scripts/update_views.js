import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('Connecting to PostgreSQL database...');
    const res = await pool.query("SELECT id, title, author_name, author_id FROM news_articles WHERE status != 'deleted'");
    console.log(`Found ${res.rows.length} articles to update views.`);

    let updatedCount = 0;
    for (const row of res.rows) {
      // Generate realistic high view counts (between 1,450 and 6,800 views per article)
      const newViews = Math.floor(Math.random() * 5350) + 1450;
      await pool.query('UPDATE news_articles SET views = $1 WHERE id = $2', [newViews, row.id]);
      updatedCount++;
    }

    console.log(`Successfully updated views for ${updatedCount} articles!`);

    const krishRes = await pool.query(
      "SELECT SUM(views) as total_views, COUNT(*) as art_count FROM news_articles WHERE status = 'published' AND (LOWER(author_name) LIKE '%krish%' OR LOWER(author_id) LIKE '%krish%' OR LOWER(author_id) LIKE '%auknpu%')"
    );

    console.log('Krish Dhakecha Updated Reader Stats:', krishRes.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Error updating views:', err);
    process.exit(1);
  }
}

main();
