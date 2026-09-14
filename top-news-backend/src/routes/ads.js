import { Router } from 'express';
import { pool } from '../db/index.js';

const router = Router();

// GET /ads — fetch all or active approved ads (excludes pending/rejected client requests)
router.get('/', async (req, res) => {
  try {
    const { position, active } = req.query;
    const conditions = ["(status IS NULL OR status = 'approved')"];
    const params = [];

    if (active === 'true') {
      conditions.push(`is_active = true`);
      conditions.push(`(start_date IS NULL OR start_date <= NOW())`);
      conditions.push(`(end_date IS NULL OR end_date >= NOW())`);
    }
    if (position && position !== 'all') {
      params.push(position);
      conditions.push(`position = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT * FROM advertisements ${where} ORDER BY created_at DESC`,
      params
    );
    res.json({ ads: result.rows, total: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ads — create new ad (admin in-house)
router.post('/', async (req, res) => {
  try {
    const { title, image_url, link_url, position = 'sidebar', is_active = true, start_date, end_date } = req.body;
    if (!title || !link_url) return res.status(400).json({ error: 'title and link_url are required' });

    const result = await pool.query(
      `INSERT INTO advertisements (title, image_url, link_url, position, is_active, status, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, 'approved', $6, $7) RETURNING *`,
      [title.trim(), image_url || null, link_url.trim(), position, is_active,
       start_date ? new Date(start_date) : null, end_date ? new Date(end_date) : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /ads/:id — update ad
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image_url, link_url, position, is_active, start_date, end_date } = req.body;

    const existing = await pool.query('SELECT * FROM advertisements WHERE id = $1', [id]);
    if (existing.rowCount === 0) return res.status(404).json({ error: 'Ad not found' });
    const cur = existing.rows[0];

    const result = await pool.query(
      `UPDATE advertisements SET
        title = $1, image_url = $2, link_url = $3, position = $4,
        is_active = $5, start_date = $6, end_date = $7, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [
        title ?? cur.title,
        image_url !== undefined ? image_url : cur.image_url,
        link_url ?? cur.link_url,
        position ?? cur.position,
        is_active !== undefined ? is_active : cur.is_active,
        start_date ? new Date(start_date) : cur.start_date,
        end_date ? new Date(end_date) : cur.end_date,
        id
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /ads/:id/toggle — quick enable/disable
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE advertisements SET is_active = NOT is_active, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Ad not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ads/:id/click — increment click count
router.post('/:id/click', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE advertisements SET click_count = click_count + 1 WHERE id = $1`, [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ads/request — Client public ad submission request
router.post('/request', async (req, res) => {
  try {
    const { client_name, client_email, client_phone, title, image_url, link_url, position = 'sidebar', notes } = req.body;
    if (!client_name || !client_email || !title || !link_url) {
      return res.status(400).json({ error: 'client_name, client_email, title, and link_url are required' });
    }

    const result = await pool.query(
      `INSERT INTO advertisements (title, image_url, link_url, position, is_active, client_name, client_email, client_phone, status, notes)
       VALUES ($1, $2, $3, $4, false, $5, $6, $7, 'pending', $8) RETURNING *`,
      [title.trim(), image_url || null, link_url.trim(), position, client_name.trim(), client_email.trim(), client_phone || null, notes || null]
    );
    res.status(201).json({ message: 'Ad campaign request submitted successfully! Pending admin review.', ad: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /ads/requests — Fetch pending or filtered client requests for admin review
router.get('/requests', async (req, res) => {
  try {
    const { status } = req.query;
    const filterStatus = status || 'pending';
    const result = await pool.query(
      `SELECT * FROM advertisements WHERE status = $1 ORDER BY created_at DESC`,
      [filterStatus]
    );
    res.json({ requests: result.rows, total: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /ads/:id/approve — Admin approve and activate client ad
router.patch('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE advertisements SET is_active = true, status = 'approved', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Ad request not found' });
    res.json({ message: 'Ad request approved and activated successfully!', ad: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /ads/:id/reject — Admin reject client ad
router.patch('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE advertisements SET is_active = false, status = 'rejected', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Ad request not found' });
    res.json({ message: 'Ad request rejected.', ad: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /ads/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM advertisements WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Ad not found' });
    res.json({ deleted: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
