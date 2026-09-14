import express from 'express';
import { pool } from '../db/index.js';
import { emitVideoCreated, emitVideoUpdated, emitVideoDeleted } from '../socket.js';

const router = express.Router();

function mapRowToVideo(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    title: row.title || '',
    slug: row.slug || '',
    description: row.description || '',
    videoUrl: row.video_url || '',
    thumbnailUrl: row.thumbnail_url || '',
    duration: parseInt(row.duration || 0, 10),
    category: row.category || '',
    topic: row.topic || '',
    language: row.language || 'en',
    section: row.section || 'main',
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    sourceUrl: row.source_url || '',
    views: parseInt(row.views || 0, 10),
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : new Date().toISOString(),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    status: row.status || 'published'
  };
}

async function generateUniqueSlug(title, currentId = '') {
  let baseSlug = (title || 'video')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'video';

  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    const res = await pool.query('SELECT id FROM short_videos WHERE slug = $1', [uniqueSlug]);
    if (res.rows.length === 0 || (currentId && res.rows[0].id === currentId)) {
      break;
    }
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
}

// -------------------------------------------------------------------------
// GET /short-videos - List short videos
// -------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(500, parseInt(req.query.limit || '20', 10)));
    const offset = (page - 1) * limit;

    const { category, topic, language, status, search } = req.query;

    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      params.push(status.toLowerCase().trim());
      conditions.push(`LOWER(status) = $${params.length}`);
    } else {
      conditions.push(`status != 'deleted'`);
    }

    if (category && category !== 'all' && category.trim() !== '') {
      params.push(category.toLowerCase().trim());
      conditions.push(`LOWER(category) = $${params.length}`);
    }

    if (topic && topic.trim() !== '') {
      params.push(topic.toLowerCase().trim());
      conditions.push(`LOWER(topic) = $${params.length}`);
    }

    if (language && language.trim() !== '' && language.toLowerCase() !== 'all') {
      params.push(language.toLowerCase().trim());
      conditions.push(`LOWER(language) = $${params.length}`);
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim().toLowerCase()}%`);
      const searchIdx = params.length;
      conditions.push(`(
        LOWER(title) LIKE $${searchIdx} OR 
        LOWER(description) LIKE $${searchIdx} OR 
        array_to_string(keywords, ' ') ILIKE $${searchIdx} OR 
        array_to_string(tags, ' ') ILIKE $${searchIdx}
      )`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) FROM short_videos ${whereClause}`;
    const countRes = await pool.query(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(limit, offset);
    const dataSql = `
      SELECT * FROM short_videos 
      ${whereClause} 
      ORDER BY published_at DESC 
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const dataRes = await pool.query(dataSql, params);
    const videos = dataRes.rows.map(mapRowToVideo);

    res.json({
      total,
      page,
      limit,
      videos
    });
  } catch (err) {
    console.error('Error fetching short videos:', err);
    res.status(500).json({ error: 'Failed to fetch short videos', details: err.message });
  }
});

// -------------------------------------------------------------------------
// GET /short-videos/stats/dashboard - Dashboard Video Statistics
// -------------------------------------------------------------------------
router.get('/stats/dashboard', async (req, res) => {
  try {
    const statsSql = `
      SELECT 
        COUNT(*) FILTER (WHERE status != 'deleted') as total,
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status = 'draft') as draft,
        COALESCE(SUM(views) FILTER (WHERE status != 'deleted'), 0) as total_views
      FROM short_videos
    `;
    const statsRes = await pool.query(statsSql);
    const s = statsRes.rows[0];

    const recentRes = await pool.query(
      `SELECT * FROM short_videos WHERE status != 'deleted' ORDER BY published_at DESC LIMIT 5`
    );

    res.json({
      total: parseInt(s.total || 0, 10),
      published: parseInt(s.published || 0, 10),
      draft: parseInt(s.draft || 0, 10),
      totalViews: parseInt(s.total_views || 0, 10),
      recent: recentRes.rows.map(mapRowToVideo)
    });
  } catch (err) {
    console.error('Error fetching video stats:', err);
    res.status(500).json({ error: 'Failed to fetch video stats', details: err.message });
  }
});

// -------------------------------------------------------------------------
// GET /short-videos/:id - Fetch video by ID or Slug
// -------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT * FROM short_videos WHERE (id = $1 OR slug = $1) AND status != 'deleted' LIMIT 1`;
    const result = await pool.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Short video not found' });
    }

    res.json(mapRowToVideo(result.rows[0]));
  } catch (err) {
    console.error('Error fetching short video:', err);
    res.status(500).json({ error: 'Failed to fetch short video', details: err.message });
  }
});

// -------------------------------------------------------------------------
// POST /short-videos - Create short video
// -------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.title || !data.title.trim()) {
      return res.status(400).json({ error: 'Video title is required' });
    }
    if (!data.videoUrl || !data.videoUrl.trim()) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    const videoId = data.id || data._id || (`video_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
    const slug = await generateUniqueSlug(data.slug || data.title, videoId);
    const title = data.title.trim();
    const description = data.description ? data.description.trim() : '';
    const videoUrl = data.videoUrl.trim();
    const thumbnailUrl = data.thumbnailUrl ? data.thumbnailUrl.trim() : '';
    const duration = typeof data.duration === 'number' ? data.duration : 0;
    const category = (data.category || 'general').toLowerCase().trim();
    const topic = (data.topic || 'general').toLowerCase().trim();
    const language = (data.language || 'en').toLowerCase().trim();
    const section = data.section || 'main';
    const keywords = Array.isArray(data.keywords) ? data.keywords : [];
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const sourceUrl = data.sourceUrl ? data.sourceUrl.trim() : '';
    const views = typeof data.views === 'number' ? data.views : 0;
    const status = data.status || 'published';
    const publishedAt = data.publishedAt ? new Date(data.publishedAt).toISOString() : new Date().toISOString();

    const insertSql = `
      INSERT INTO short_videos (
        id, title, slug, description, video_url, thumbnail_url, duration,
        category, topic, language, section, keywords, tags, source_url, views,
        status, published_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        description = EXCLUDED.description,
        video_url = EXCLUDED.video_url,
        thumbnail_url = EXCLUDED.thumbnail_url,
        duration = EXCLUDED.duration,
        category = EXCLUDED.category,
        topic = EXCLUDED.topic,
        language = EXCLUDED.language,
        section = EXCLUDED.section,
        keywords = EXCLUDED.keywords,
        tags = EXCLUDED.tags,
        source_url = EXCLUDED.source_url,
        status = EXCLUDED.status,
        updated_at = NOW()
      RETURNING *;
    `;

    const result = await pool.query(insertSql, [
      videoId, title, slug, description, videoUrl, thumbnailUrl, duration,
      category, topic, language, section, keywords, tags, sourceUrl, views,
      status, publishedAt
    ]);

    const video = mapRowToVideo(result.rows[0]);
    emitVideoCreated(video);
    res.status(201).json(video);
  } catch (err) {
    console.error('Error creating short video:', err);
    res.status(500).json({ error: 'Failed to create short video', details: err.message });
  }
});

// -------------------------------------------------------------------------
// PUT /short-videos/:id - Update short video
// -------------------------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body || {};

    const existingRes = await pool.query('SELECT * FROM short_videos WHERE id = $1 OR slug = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Short video not found for update' });
    }

    const current = existingRes.rows[0];
    const targetId = current.id;

    const title = data.title !== undefined ? data.title.trim() : current.title;
    const slug = data.slug !== undefined ? await generateUniqueSlug(data.slug, targetId) : current.slug;
    const description = data.description !== undefined ? data.description.trim() : current.description;
    const videoUrl = data.videoUrl !== undefined ? data.videoUrl.trim() : current.video_url;
    const thumbnailUrl = data.thumbnailUrl !== undefined ? data.thumbnailUrl.trim() : current.thumbnail_url;
    const duration = data.duration !== undefined ? parseInt(data.duration, 10) : current.duration;
    const category = data.category !== undefined ? data.category.toLowerCase().trim() : current.category;
    const topic = data.topic !== undefined ? data.topic.toLowerCase().trim() : current.topic;
    const language = data.language !== undefined ? data.language.toLowerCase().trim() : current.language;
    const section = data.section !== undefined ? data.section : current.section;
    const keywords = data.keywords !== undefined ? (Array.isArray(data.keywords) ? data.keywords : []) : current.keywords;
    const tags = data.tags !== undefined ? (Array.isArray(data.tags) ? data.tags : []) : current.tags;
    const sourceUrl = data.sourceUrl !== undefined ? data.sourceUrl.trim() : current.source_url;
    const status = data.status !== undefined ? data.status : current.status;
    const views = data.views !== undefined ? parseInt(data.views, 10) : current.views;

    const updateSql = `
      UPDATE short_videos SET
        title = $1,
        slug = $2,
        description = $3,
        video_url = $4,
        thumbnail_url = $5,
        duration = $6,
        category = $7,
        topic = $8,
        language = $9,
        section = $10,
        keywords = $11,
        tags = $12,
        source_url = $13,
        status = $14,
        views = $15,
        updated_at = NOW()
      WHERE id = $16
      RETURNING *;
    `;

    const result = await pool.query(updateSql, [
      title, slug, description, videoUrl, thumbnailUrl, duration,
      category, topic, language, section, keywords, tags, sourceUrl, status, views,
      targetId
    ]);

    const updatedVideo = mapRowToVideo(result.rows[0]);
    emitVideoUpdated(updatedVideo);
    res.json(updatedVideo);
  } catch (err) {
    console.error('Error updating short video:', err);
    res.status(500).json({ error: 'Failed to update short video', details: err.message });
  }
});

// -------------------------------------------------------------------------
// PATCH /short-videos/:id/views - Increment video views
// -------------------------------------------------------------------------
router.patch('/:id/views', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      UPDATE short_videos 
      SET views = views + 1, updated_at = NOW() 
      WHERE id = $1 OR slug = $1 
      RETURNING *;
    `;
    const result = await pool.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Short video not found to increment views' });
    }

    const updatedVideo = mapRowToVideo(result.rows[0]);
    emitVideoUpdated(updatedVideo);
    res.json({ success: true, id: updatedVideo.id, views: updatedVideo.views });
  } catch (err) {
    console.error('Error incrementing video views:', err);
    res.status(500).json({ error: 'Failed to increment video views', details: err.message });
  }
});

// -------------------------------------------------------------------------
// DELETE /short-videos/:id - Delete short video
// -------------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      UPDATE short_videos 
      SET status = 'deleted', updated_at = NOW() 
      WHERE id = $1 OR slug = $1 
      RETURNING id;
    `;
    const result = await pool.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Short video not found to delete' });
    }

    const deletedId = result.rows[0].id;
    emitVideoDeleted(deletedId);
    res.json({ success: true, message: 'Short video deleted successfully', id: deletedId });
  } catch (err) {
    console.error('Error deleting short video:', err);
    res.status(500).json({ error: 'Failed to delete short video', details: err.message });
  }
});

export default router;
