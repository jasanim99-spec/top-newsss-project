import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// In-memory or fallback storage for custom reporter targets
const customTargets = new Map(); // reporterId -> { targetArticles, targetViews }

// Helper to get start and end dates of current month
function getCurrentMonthBounds() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startOfMonth = new Date(year, month, 1).toISOString();
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
  return { startOfMonth, endOfMonth, monthName: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }) };
}

// 1. GET REPORTER GOALS & BADGES DATA
router.get('/reporter/:reporterId', async (req, res) => {
  try {
    const { reporterId } = req.params;
    const decodedId = decodeURIComponent(reporterId);
    const { startOfMonth, endOfMonth, monthName } = getCurrentMonthBounds();

    // Fetch custom target or use defaults
    const custom = customTargets.get(decodedId) || {};
    const targetArticles = custom.targetArticles || 20;
    const targetViews = custom.targetViews || 10000;

    let publishedArticlesCount = 0;
    let currentViews = 0;
    let totalSubmittedCount = 0;
    let totalApprovedCount = 0;
    let hasBreakingNews = false;
    let recentArticleDates = [];

    // Query DB if available
    try {
      const searchPattern = `%${decodedId.replace(/[^a-zA-Z0-9 ]/g, '')}%`;
      const articlesRes = await query(
        `SELECT id, views, is_breaking, status, created_at, published_at 
         FROM news_articles 
         WHERE status != 'deleted' AND (author_id = $1 OR LOWER(author_id) = LOWER($1) OR LOWER(author_name) LIKE LOWER($2))
         ORDER BY created_at DESC`,
        [decodedId, searchPattern]
      );

      if (articlesRes && articlesRes.rows) {
        const rows = articlesRes.rows;
        totalSubmittedCount = rows.length;

        rows.forEach((art) => {
          const artDate = new Date(art.published_at || art.created_at).toISOString();
          if (artDate >= startOfMonth && artDate <= endOfMonth) {
            if (art.status === 'published') {
              publishedArticlesCount++;
              currentViews += parseInt(art.views || 0, 10);
              totalApprovedCount++;
            }
          }
          if (art.is_breaking || art.status === 'published') {
            if (art.is_breaking) hasBreakingNews = true;
          }
          if (art.created_at || art.published_at) {
            const dayStr = new Date(art.published_at || art.created_at).toISOString().slice(0, 10);
            recentArticleDates.push(dayStr);
          }
        });
      }
    } catch (dbErr) {
      console.warn('DB query in goals router error:', dbErr.message);
    }

    // Calculate Active Streak
    const uniqueDays = Array.from(new Set(recentArticleDates)).sort().reverse();
    let activeStreak = 0;
    if (uniqueDays.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      
      let cursor = uniqueDays.includes(today) ? today : (uniqueDays.includes(yesterday) ? yesterday : null);
      if (cursor) {
        let currDate = new Date(cursor);
        while (true) {
          const dateStr = currDate.toISOString().slice(0, 10);
          if (uniqueDays.includes(dateStr)) {
            activeStreak++;
            currDate.setDate(currDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // Accuracy Calculation
    const approvalRate = totalSubmittedCount > 0 
      ? Math.round((totalApprovedCount / totalSubmittedCount) * 100)
      : 100;

    // Badges definitions & unlock status
    const badges = [
      {
        id: 'speedDemon',
        name: 'Speed Demon',
        description: 'Published urgent breaking news live on TOP NEWS',
        icon: '🚀',
        color: 'from-amber-500 to-rose-600',
        unlocked: hasBreakingNews || publishedArticlesCount > 0,
        progress: hasBreakingNews ? 'Unlocked' : '1 Breaking News needed'
      },
      {
        id: 'starReporter',
        name: 'Star Journalist',
        description: 'Crossed 1,000+ total reader views this month',
        icon: '🌟',
        color: 'from-blue-500 to-cyan-500',
        unlocked: currentViews >= 1000,
        progress: `${currentViews} / 1,000 Views`
      },
      {
        id: 'masterWriter',
        name: 'Master Writer',
        description: 'Published 10+ approved news articles this month',
        icon: '📝',
        color: 'from-purple-600 to-indigo-600',
        unlocked: publishedArticlesCount >= 10,
        progress: `${publishedArticlesCount} / 10 Articles`
      },
      {
        id: 'verifiedJournalist',
        name: 'Accuracy Champion',
        description: 'Maintained 90%+ editor approval rate on submissions',
        icon: '🛡️',
        color: 'from-emerald-500 to-teal-600',
        unlocked: approvalRate >= 90 && totalSubmittedCount > 0,
        progress: `${approvalRate}% Approval Rate`
      },
      {
        id: 'streakMaster',
        name: 'Daily Streak Master',
        description: 'Submitted articles for 3+ consecutive days',
        icon: '🔥',
        color: 'from-orange-500 to-red-600',
        unlocked: activeStreak >= 3,
        progress: `${activeStreak} / 3 Days Streak`
      }
    ];

    // Compute Articles Progress percentage
    const articlePercentage = Math.min(100, Math.round((publishedArticlesCount / targetArticles) * 100));
    const viewsPercentage = Math.min(100, Math.round((currentViews / targetViews) * 100));

    res.json({
      monthName,
      targetArticles,
      publishedArticlesCount,
      articlePercentage,
      targetViews,
      currentViews,
      viewsPercentage,
      activeStreak,
      approvalRate,
      badges,
      rank: 1
    });
  } catch (err) {
    console.error('Error fetching reporter goals:', err);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// 2. GET LEADERBOARD FOR CURRENT MONTH
router.get('/leaderboard', async (req, res) => {
  try {
    const { startOfMonth, endOfMonth, monthName } = getCurrentMonthBounds();

    let leaderboard = [];

    try {
      const dbRes = await query(
        `SELECT u.id as author_id, u.name as name, COALESCE(u.city, 'Gujarat Bureau') as city,
                COALESCE(COUNT(CASE WHEN na.status = 'published' AND na.created_at >= $1 AND na.created_at <= $2 THEN 1 END), 0)::int as published_count,
                COALESCE(SUM(CASE WHEN na.status = 'published' AND na.created_at >= $1 AND na.created_at <= $2 THEN na.views ELSE 0 END), 0)::int as total_views
         FROM users u
         LEFT JOIN news_articles na ON (na.author_id = u.id OR LOWER(na.author_name) = LOWER(u.name))
         WHERE u.role = 'reporter'
         GROUP BY u.id, u.name, u.city
         ORDER BY published_count DESC, total_views DESC, u.name ASC
         LIMIT 10`,
        [startOfMonth, endOfMonth]
      );

      if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
        leaderboard = dbRes.rows.map((row, idx) => ({
          rank: idx + 1,
          authorId: row.author_id,
          name: row.name || 'Reporter',
          city: row.city || 'Gujarat Bureau',
          publishedCount: parseInt(row.published_count || 0, 10),
          totalViews: parseInt(row.total_views || 0, 10),
        }));
      }
    } catch (dbErr) {
      console.warn('DB query in leaderboard fallback:', dbErr.message);
    }

    res.json({
      monthName,
      leaderboard
    });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// 3. SET CUSTOM REPORTER TARGET (ADMIN ENDPOINT)
router.post('/target', (req, res) => {
  try {
    const { reporterId, targetArticles, targetViews } = req.body;
    if (!reporterId) {
      return res.status(400).json({ error: 'Reporter ID is required' });
    }

    customTargets.set(reporterId, {
      targetArticles: parseInt(targetArticles || 20, 10),
      targetViews: parseInt(targetViews || 10000, 10)
    });

    res.json({ success: true, message: `Target updated for ${reporterId}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update target' });
  }
});

export default router;
