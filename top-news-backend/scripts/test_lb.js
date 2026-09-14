import 'dotenv/config';
import { query } from '../src/db/index.js';

async function test() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const res = await query(
    `SELECT u.id as author_id, u.name as name, COALESCE(u.city, 'Gujarat Bureau') as city,
            COALESCE(COUNT(CASE WHEN na.status = 'published' AND na.created_at >= $1 AND na.created_at <= $2 THEN 1 END), 0)::int as published_count,
            COALESCE(SUM(CASE WHEN na.status = 'published' AND na.created_at >= $1 AND na.created_at <= $2 THEN na.views ELSE 0 END), 0)::int as total_views
     FROM users u
     LEFT JOIN news_articles na ON (na.author_id = u.id OR LOWER(na.author_name) = LOWER(u.name))
     WHERE u.role = 'reporter' OR u.role = 'admin'
     GROUP BY u.id, u.name, u.city
     ORDER BY published_count DESC, total_views DESC, u.name ASC`,
    [startOfMonth, endOfMonth]
  );

  console.log('Leaderboard SQL result:', res.rows);
  process.exit(0);
}

test();
