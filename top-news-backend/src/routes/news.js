import express from 'express';
import { pool } from '../db/index.js';
import { emitNewsCreated, emitNewsUpdated, emitNewsDeleted } from '../socket.js';

const router = express.Router();

// Helper: Convert database row to frontend NewsArticle JSON
function mapRowToArticle(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    title: row.title || '',
    slug: row.slug || '',
    description: row.description || '',
    content: row.content || '',
    imageUrl: row.image_url || '',
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
    status: row.status || 'published',
    authorId: row.author_id || '',
    authorName: row.author_name || '',
    authorRole: row.author_role || '',
    authorCity: row.author_city || '',
    authorPhoto: row.author_photo || '',
    pressCardNo: row.press_card_no || '',
    editorialNotes: row.editorial_notes || '',
    location: row.location || undefined,
    aiSummary: row.ai_summary || '',
    isBreaking: !!row.is_breaking,
  };
}

// Unique slug generator to handle duplicates safely
async function generateUniqueSlug(title, currentId = '') {
  let baseSlug = (title || 'article')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'article';

  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    const res = await pool.query('SELECT id FROM news_articles WHERE slug = $1', [uniqueSlug]);
    if (res.rows.length === 0 || (currentId && res.rows[0].id === currentId)) {
      break;
    }
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
}

// -------------------------------------------------------------------------
// GET /news - List articles with filtering & pagination
// -------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(500, parseInt(req.query.limit || '20', 10)));
    const offset = (page - 1) * limit;

    const { category, topic, language, section, status, authorId, search } = req.query;

    const conditions = [];
    const params = [];

    // Filter out deleted by default unless requested
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
      let langVal = language.toLowerCase().trim();
      if (langVal === 'english') langVal = 'en';
      if (langVal === 'gujarati') langVal = 'gu';
      if (langVal === 'hindi') langVal = 'hi';
      if (langVal === 'chinese' || langVal === 'zh-cn' || langVal === 'zh-tw' || langVal === '中文') langVal = 'zh';
      params.push(langVal);
      conditions.push(`LOWER(language) = $${params.length}`);
    }

    if (section && section.trim() !== '' && section.toLowerCase() !== 'all') {
      params.push(section.toLowerCase().trim());
      conditions.push(`LOWER(section) = $${params.length}`);
    }

    if (authorId && authorId.trim() !== '') {
      params.push(`%${authorId.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(author_id) LIKE $${params.length} OR LOWER(author_name) LIKE $${params.length} OR LOWER(press_card_no) LIKE $${params.length})`);
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

    // Count query
    const countSql = `SELECT COUNT(*) FROM news_articles ${whereClause}`;
    const countRes = await pool.query(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // Data query
    params.push(limit, offset);
    const dataSql = `
      SELECT * FROM news_articles 
      ${whereClause} 
      ORDER BY published_at DESC 
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const dataRes = await pool.query(dataSql, params);
    const articles = dataRes.rows.map(mapRowToArticle);

    res.json({
      total,
      page,
      limit,
      articles
    });
  } catch (err) {
    console.error('Error fetching news articles:', err);
    res.status(500).json({ error: 'Failed to fetch news articles', details: err.message });
  }
});

// -------------------------------------------------------------------------
// GET /news/stats/dashboard - Dashboard Statistics
// -------------------------------------------------------------------------
router.get('/stats/dashboard', async (req, res) => {
  try {
    const statsSql = `
      SELECT 
        COUNT(*) FILTER (WHERE status != 'deleted') as total,
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'draft') as draft,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COALESCE(SUM(views) FILTER (WHERE status != 'deleted'), 0) as total_views
      FROM news_articles
    `;
    const statsRes = await pool.query(statsSql);
    const s = statsRes.rows[0];

    const recentRes = await pool.query(
      `SELECT * FROM news_articles WHERE status != 'deleted' ORDER BY published_at DESC LIMIT 5`
    );

    res.json({
      total: parseInt(s.total || 0, 10),
      published: parseInt(s.published || 0, 10),
      pending: parseInt(s.pending || 0, 10),
      draft: parseInt(s.draft || 0, 10),
      rejected: parseInt(s.rejected || 0, 10),
      totalViews: parseInt(s.total_views || 0, 10),
      recent: recentRes.rows.map(mapRowToArticle)
    });
  } catch (err) {
    console.error('Error fetching news dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch news stats', details: err.message });
  }
});

// -------------------------------------------------------------------------
// GET /news/stats/reporter/:authorId - Reporter Specific Statistics
// -------------------------------------------------------------------------
router.get('/stats/reporter/:authorId', async (req, res) => {
  try {
    const authId = req.params.authorId.trim().toLowerCase();
    const statsSql = `
      SELECT 
        COUNT(*) FILTER (WHERE status != 'deleted') as total,
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'draft') as draft,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COALESCE(SUM(views) FILTER (WHERE status != 'deleted'), 0) as total_views
      FROM news_articles
      WHERE (LOWER(author_id) = $1 OR LOWER(author_name) = $1)
    `;
    const statsRes = await pool.query(statsSql, [authId]);
    const s = statsRes.rows[0];

    const recentRes = await pool.query(
      `SELECT * FROM news_articles WHERE status != 'deleted' AND (LOWER(author_id) = $1 OR LOWER(author_name) = $1) ORDER BY published_at DESC LIMIT 5`,
      [authId]
    );

    res.json({
      total: parseInt(s.total || 0, 10),
      published: parseInt(s.published || 0, 10),
      pending: parseInt(s.pending || 0, 10),
      draft: parseInt(s.draft || 0, 10),
      rejected: parseInt(s.rejected || 0, 10),
      totalViews: parseInt(s.total_views || 0, 10),
      recent: recentRes.rows.map(mapRowToArticle)
    });
  } catch (err) {
    console.error('Error fetching reporter stats:', err);
    res.status(500).json({ error: 'Failed to fetch reporter stats', details: err.message });
  }
});

// -------------------------------------------------------------------------
// GET /news/:id - Fetch article by ID or Slug
// -------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT * FROM news_articles WHERE (id = $1 OR slug = $1) AND status != 'deleted' LIMIT 1`;
    const result = await pool.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News article not found' });
    }

    res.json(mapRowToArticle(result.rows[0]));
  } catch (err) {
    console.error('Error fetching news article:', err);
    res.status(500).json({ error: 'Failed to fetch article', details: err.message });
  }
});

// -------------------------------------------------------------------------
// POST /news - Create new news article
// -------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.title || !data.title.trim()) {
      return res.status(400).json({ error: 'Article title is required' });
    }

    const articleId = data.id || data._id || (`news_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
    const slug = await generateUniqueSlug(data.slug || data.title, articleId);
    const title = data.title.trim();
    const description = data.description ? data.description.trim() : '';
    const content = data.content || '';
    const imageUrl = data.imageUrl ? data.imageUrl.trim() : '';
    const category = (data.category || 'general').toLowerCase().trim();
    const topic = (data.topic || 'general').toLowerCase().trim();
    const language = (data.language || 'en').toLowerCase().trim();
    const section = data.section || 'main';
    const keywords = Array.isArray(data.keywords) ? data.keywords : [];
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const sourceUrl = data.sourceUrl ? data.sourceUrl.trim() : '';
    const views = typeof data.views === 'number' ? data.views : 0;
    const status = data.status || 'published';
    
    // Check if author_id exists in users table to prevent FK constraint error
    let authorId = data.authorId ? String(data.authorId).trim() : null;
    if (authorId) {
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [authorId]);
      if (userCheck.rows.length === 0) {
        authorId = null;
      }
    }

    const authorName = data.authorName ? data.authorName.trim() : null;
    const authorRole = data.authorRole ? data.authorRole.trim() : null;
    const authorCity = data.authorCity ? data.authorCity.trim() : null;
    const authorPhoto = data.authorPhoto ? data.authorPhoto.trim() : null;
    const pressCardNo = data.pressCardNo ? data.pressCardNo.trim() : null;
    const editorialNotes = data.editorialNotes ? data.editorialNotes.trim() : null;
    const location = data.location && typeof data.location === 'object' ? JSON.stringify(data.location) : null;
    const aiSummary = data.aiSummary ? data.aiSummary.trim() : null;
    const isBreaking = Boolean(data.isBreaking || data.is_breaking || data.section === 'breaking');
    const publishedAt = data.publishedAt ? new Date(data.publishedAt).toISOString() : new Date().toISOString();

    if (section === 'featured') {
      await pool.query(
        `UPDATE news_articles SET section = 'main' WHERE section = 'featured' AND LOWER(language) = LOWER($1) AND id != $2`,
        [language, articleId]
      );
    }

    const insertSql = `
      INSERT INTO news_articles (
        id, title, slug, description, content, image_url, category, topic,
        language, section, keywords, tags, source_url, views, status,
        author_id, author_name, author_role, author_city, author_photo,
        press_card_no, editorial_notes, location, ai_summary, is_breaking,
        published_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        description = EXCLUDED.description,
        content = EXCLUDED.content,
        image_url = EXCLUDED.image_url,
        category = EXCLUDED.category,
        topic = EXCLUDED.topic,
        language = EXCLUDED.language,
        section = EXCLUDED.section,
        keywords = EXCLUDED.keywords,
        tags = EXCLUDED.tags,
        source_url = EXCLUDED.source_url,
        status = EXCLUDED.status,
        author_id = EXCLUDED.author_id,
        author_name = EXCLUDED.author_name,
        editorial_notes = EXCLUDED.editorial_notes,
        location = EXCLUDED.location,
        ai_summary = EXCLUDED.ai_summary,
        is_breaking = EXCLUDED.is_breaking,
        updated_at = NOW()
      RETURNING *;
    `;

    const result = await pool.query(insertSql, [
      articleId, title, slug, description, content, imageUrl, category, topic,
      language, section, keywords, tags, sourceUrl, views, status,
      authorId, authorName, authorRole, authorCity, authorPhoto,
      pressCardNo, editorialNotes, location, aiSummary, isBreaking,
      publishedAt
    ]);

    const article = mapRowToArticle(result.rows[0]);
    emitNewsCreated(article);
    res.status(201).json(article);
  } catch (err) {
    console.error('Error creating news article:', err);
    res.status(500).json({ error: 'Failed to create article', details: err.message });
  }
});

// -------------------------------------------------------------------------
// PUT /news/:id - Update existing news article
// -------------------------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body || {};

    const existingRes = await pool.query('SELECT * FROM news_articles WHERE id = $1 OR slug = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found for update' });
    }

    const current = existingRes.rows[0];
    const targetId = current.id;

    const title = data.title !== undefined ? data.title.trim() : current.title;
    const slug = data.slug !== undefined ? await generateUniqueSlug(data.slug, targetId) : current.slug;
    const description = data.description !== undefined ? data.description.trim() : current.description;
    const content = data.content !== undefined ? data.content : current.content;
    const imageUrl = data.imageUrl !== undefined ? data.imageUrl.trim() : current.image_url;
    const category = data.category !== undefined ? data.category.toLowerCase().trim() : current.category;
    const topic = data.topic !== undefined ? data.topic.toLowerCase().trim() : current.topic;
    const language = data.language !== undefined ? data.language.toLowerCase().trim() : current.language;
    const section = data.section !== undefined ? data.section : current.section;
    const keywords = data.keywords !== undefined ? (Array.isArray(data.keywords) ? data.keywords : []) : current.keywords;
    const tags = data.tags !== undefined ? (Array.isArray(data.tags) ? data.tags : []) : current.tags;
    const sourceUrl = data.sourceUrl !== undefined ? data.sourceUrl.trim() : current.source_url;
    const status = data.status !== undefined ? data.status : current.status;
    const views = data.views !== undefined ? parseInt(data.views, 10) : current.views;

    let authorId = (data.authorId !== undefined ? data.authorId : current.author_id) || null;
    if (authorId && String(authorId).trim() !== '') {
      authorId = String(authorId).trim();
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [authorId]);
      if (userCheck.rows.length === 0) {
        authorId = null;
      }
    } else {
      authorId = null;
    }

    const authorName = data.authorName !== undefined ? data.authorName : current.author_name;
    const authorRole = data.authorRole !== undefined ? data.authorRole : current.author_role;
    const authorCity = data.authorCity !== undefined ? data.authorCity : current.author_city;
    const authorPhoto = data.authorPhoto !== undefined ? data.authorPhoto : current.author_photo;
    const pressCardNo = data.pressCardNo !== undefined ? data.pressCardNo : current.press_card_no;
    const editorialNotes = data.editorialNotes !== undefined ? data.editorialNotes : current.editorial_notes;
    const location = data.location !== undefined ? (data.location ? JSON.stringify(data.location) : null) : current.location;
    const aiSummary = data.aiSummary !== undefined ? data.aiSummary : current.ai_summary;
    const isBreaking = data.isBreaking !== undefined ? !!data.isBreaking : current.is_breaking;
    const publishedAt = data.publishedAt ? new Date(data.publishedAt).toISOString() : current.published_at;

    // If this article is being set to 'featured', reset other featured articles ONLY in the same language
    // so each language (English, Gujarati, etc.) can have its own dedicated Hero section article
    if (section === 'featured' && current.section !== 'featured') {
      await pool.query(
        `UPDATE news_articles SET section = 'main' WHERE section = 'featured' AND LOWER(language) = LOWER($1) AND id != $2`,
        [language, targetId]
      );
    }

    const updateSql = `
      UPDATE news_articles SET
        title = $1,
        slug = $2,
        description = $3,
        content = $4,
        image_url = $5,
        category = $6,
        topic = $7,
        language = $8,
        section = $9,
        keywords = $10,
        tags = $11,
        source_url = $12,
        status = $13,
        views = $14,
        author_id = $15,
        author_name = $16,
        author_role = $17,
        author_city = $18,
        author_photo = $19,
        press_card_no = $20,
        editorial_notes = $21,
        location = $22,
        ai_summary = $23,
        is_breaking = $24,
        published_at = $25,
        updated_at = NOW()
      WHERE id = $26
      RETURNING *;
    `;

    const result = await pool.query(updateSql, [
      title, slug, description, content, imageUrl, category, topic,
      language, section, keywords, tags, sourceUrl, status, views,
      authorId, authorName, authorRole, authorCity, authorPhoto,
      pressCardNo, editorialNotes, location, aiSummary, isBreaking,
      publishedAt, targetId
    ]);

    const updatedArticle = mapRowToArticle(result.rows[0]);
    emitNewsUpdated(updatedArticle);
    res.json(updatedArticle);
  } catch (err) {
    console.error('Error updating news article:', err);
    res.status(500).json({ error: 'Failed to update article', details: err.message });
  }
});

// -------------------------------------------------------------------------
// PATCH /news/:id/views - Increment view count atomically
// -------------------------------------------------------------------------
router.patch('/:id/views', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      UPDATE news_articles 
      SET views = views + 1, updated_at = NOW() 
      WHERE id = $1 OR slug = $1 
      RETURNING *;
    `;
    const result = await pool.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found to increment views' });
    }

    const updatedArticle = mapRowToArticle(result.rows[0]);
    emitNewsUpdated(updatedArticle);
    res.json({ success: true, id: updatedArticle.id, views: updatedArticle.views });
  } catch (err) {
    console.error('Error incrementing news views:', err);
    res.status(500).json({ error: 'Failed to increment views', details: err.message });
  }
});

// -------------------------------------------------------------------------
// DELETE /news/:id - Soft-delete news article
// -------------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      UPDATE news_articles 
      SET status = 'deleted', updated_at = NOW() 
      WHERE id = $1 OR slug = $1 
      RETURNING id;
    `;
    const result = await pool.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found to delete' });
    }

    const deletedId = result.rows[0].id;
    emitNewsDeleted(deletedId);
    res.json({ success: true, message: 'Article deleted successfully', id: deletedId });
  } catch (err) {
    console.error('Error deleting news article:', err);
    res.status(500).json({ error: 'Failed to delete article', details: err.message });
  }
});

export default router;
