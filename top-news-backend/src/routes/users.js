import express from 'express';
import { pool } from '../db/index.js';

const router = express.Router();

function mapRowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    uid: row.id,
    _id: row.id,
    email: row.email || '',
    name: row.name || '',
    role: row.role || 'reporter',
    active: row.active !== false,
    phone: row.phone || '',
    city: row.city || '',
    district: row.district || '',
    beat: row.beat || 'General',
    pressCardNo: row.press_card_no || '',
    photoUrl: row.photo_url || '',
    bio: row.bio || '',
    rating: parseFloat(row.rating || 5.0),
    articlesCount: parseInt(row.articles_count || 0, 10),
    viewsCount: parseInt(row.views_count || 0, 10),
    joinedAt: row.joined_at ? new Date(row.joined_at).toISOString() : new Date().toISOString(),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
  };
}

// -------------------------------------------------------------------------
// GET /users - List all users / team members
// -------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { role, active } = req.query;
    const conditions = [];
    const params = [];

    if (role && role !== 'all') {
      params.push(role.toLowerCase().trim());
      conditions.push(`LOWER(role) = $${params.length}`);
    }

    if (active !== undefined && active !== 'all') {
      params.push(active === 'true' || active === '1');
      conditions.push(`active = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM users ${whereClause} ORDER BY created_at DESC`;
    const result = await pool.query(sql, params);

    res.json(result.rows.map(mapRowToUser));
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

// -------------------------------------------------------------------------
// GET /users/:id - Fetch single user profile by ID or email
// -------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT * FROM users WHERE id = $1 OR LOWER(email) = LOWER($1) LIMIT 1`;
    const result = await pool.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json(mapRowToUser(result.rows[0]));
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile', details: err.message });
  }
});

// -------------------------------------------------------------------------
// POST /users - Create new team member profile
// -------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.email || !data.email.trim()) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const userId = data.id || data.uid || (`user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
    const email = data.email.trim().toLowerCase();
    const name = data.name ? data.name.trim() : email.split('@')[0];
    const role = (data.role || 'reporter').trim().toLowerCase();
    const active = data.active !== false;
    const phone = data.phone ? data.phone.trim() : null;
    const city = data.city ? data.city.trim() : null;
    const district = data.district ? data.district.trim() : null;
    const beat = data.beat ? data.beat.trim() : 'General';
    const pressCardNo = data.pressCardNo ? data.pressCardNo.trim() : null;
    const photoUrl = data.photoUrl ? data.photoUrl.trim() : null;
    const bio = data.bio ? data.bio.trim() : null;
    const rating = typeof data.rating === 'number' ? data.rating : 5.0;
    const articlesCount = typeof data.articlesCount === 'number' ? data.articlesCount : 0;
    const viewsCount = typeof data.viewsCount === 'number' ? data.viewsCount : 0;
    const joinedAt = data.joinedAt ? new Date(data.joinedAt).toISOString() : new Date().toISOString();

    const insertSql = `
      INSERT INTO users (
        id, email, name, role, active, phone, city, district, beat,
        press_card_no, photo_url, bio, rating, articles_count, views_count,
        joined_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        active = EXCLUDED.active,
        phone = EXCLUDED.phone,
        city = EXCLUDED.city,
        district = EXCLUDED.district,
        beat = EXCLUDED.beat,
        press_card_no = EXCLUDED.press_card_no,
        photo_url = EXCLUDED.photo_url,
        bio = EXCLUDED.bio,
        updated_at = NOW()
      RETURNING *;
    `;

    const result = await pool.query(insertSql, [
      userId, email, name, role, active, phone, city, district, beat,
      pressCardNo, photoUrl, bio, rating, articlesCount, viewsCount, joinedAt
    ]);

    res.status(201).json(mapRowToUser(result.rows[0]));
  } catch (err) {
    console.error('Error creating user profile:', err);
    res.status(500).json({ error: 'Failed to create user profile', details: err.message });
  }
});

// -------------------------------------------------------------------------
// PUT /users/:id - Update user profile
// -------------------------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body || {};

    const existingRes = await pool.query('SELECT * FROM users WHERE id = $1 OR LOWER(email) = LOWER($1)', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found for update' });
    }

    const current = existingRes.rows[0];
    const targetId = current.id;

    const email = data.email !== undefined ? data.email.trim().toLowerCase() : current.email;
    const name = data.name !== undefined ? data.name.trim() : current.name;
    const role = data.role !== undefined ? data.role.trim().toLowerCase() : current.role;
    const active = data.active !== undefined ? (data.active !== false) : current.active;
    const phone = data.phone !== undefined ? data.phone.trim() : current.phone;
    const city = data.city !== undefined ? data.city.trim() : current.city;
    const district = data.district !== undefined ? data.district.trim() : current.district;
    const beat = data.beat !== undefined ? data.beat.trim() : current.beat;
    const pressCardNo = data.pressCardNo !== undefined ? data.pressCardNo.trim() : current.press_card_no;
    const photoUrl = data.photoUrl !== undefined ? data.photoUrl.trim() : current.photo_url;
    const bio = data.bio !== undefined ? data.bio.trim() : current.bio;
    const rating = data.rating !== undefined ? parseFloat(data.rating) : current.rating;
    const articlesCount = data.articlesCount !== undefined ? parseInt(data.articlesCount, 10) : current.articles_count;
    const viewsCount = data.viewsCount !== undefined ? parseInt(data.viewsCount, 10) : current.views_count;

    const updateSql = `
      UPDATE users SET
        email = $1,
        name = $2,
        role = $3,
        active = $4,
        phone = $5,
        city = $6,
        district = $7,
        beat = $8,
        press_card_no = $9,
        photo_url = $10,
        bio = $11,
        rating = $12,
        articles_count = $13,
        views_count = $14,
        updated_at = NOW()
      WHERE id = $15
      RETURNING *;
    `;

    const result = await pool.query(updateSql, [
      email, name, role, active, phone, city, district, beat,
      pressCardNo, photoUrl, bio, rating, articlesCount, viewsCount, targetId
    ]);

    res.json(mapRowToUser(result.rows[0]));
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Failed to update user profile', details: err.message });
  }
});

// -------------------------------------------------------------------------
// PATCH /users/:id/status - Toggle user active status
// -------------------------------------------------------------------------
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body || {};

    const sql = `
      UPDATE users 
      SET active = COALESCE($2, NOT active), updated_at = NOW() 
      WHERE id = $1 OR LOWER(email) = LOWER($1)
      RETURNING *;
    `;
    const result = await pool.query(sql, [id, active !== undefined ? active : null]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json(mapRowToUser(result.rows[0]));
  } catch (err) {
    console.error('Error toggling user status:', err);
    res.status(500).json({ error: 'Failed to update status', details: err.message });
  }
});

// -------------------------------------------------------------------------
// DELETE /users/:id - Delete team member profile
// -------------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `DELETE FROM users WHERE id = $1 OR LOWER(email) = LOWER($1) RETURNING id;`;
    const result = await pool.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found to delete' });
    }

    res.json({ success: true, message: 'User profile deleted successfully', id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting user profile:', err);
    res.status(500).json({ error: 'Failed to delete user profile', details: err.message });
  }
});

export default router;
