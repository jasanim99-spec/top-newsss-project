import { Router } from 'express';
import { pool } from '../db/index.js';

const router = Router();

// Auto-create table if not exists
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reporter_leaves (
        id SERIAL PRIMARY KEY,
        reporter_id TEXT NOT NULL,
        reporter_name TEXT NOT NULL,
        leave_type TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_days INT DEFAULT 1,
        reason TEXT NOT NULL,
        backup_reporter TEXT,
        status TEXT DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.error('Error initializing reporter_leaves table:', err.message);
  }
};
initDb();

// Helper to map DB row to JSON
function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    reporterId: row.reporter_id,
    reporterName: row.reporter_name,
    leaveType: row.leave_type,
    startDate: row.start_date ? new Date(row.start_date).toISOString().slice(0, 10) : '',
    endDate: row.end_date ? new Date(row.end_date).toISOString().slice(0, 10) : '',
    totalDays: parseInt(row.total_days || 1, 10),
    reason: row.reason || '',
    backupReporter: row.backup_reporter || '',
    status: row.status || 'pending',
    adminNotes: row.admin_notes || '',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
  };
}

// GET /leaves — Get all leaves (optionally filter by reporter_id or status)
router.get('/', async (req, res) => {
  try {
    const { reporterId, status } = req.query;
    const conditions = [];
    const params = [];

    if (reporterId) {
      params.push(reporterId.trim());
      conditions.push(`reporter_id = $${params.length}`);
    }

    if (status && status !== 'all') {
      params.push(status.toLowerCase().trim());
      conditions.push(`LOWER(status) = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM reporter_leaves ${whereClause} ORDER BY created_at DESC LIMIT 100`;
    
    const result = await pool.query(sql, params);
    res.json({ leaves: result.rows.map(mapRow) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /leaves/stats/:reporterId — Get leave balance & statistics
router.get('/stats/:reporterId', async (req, res) => {
  try {
    const { reporterId } = req.params;
    const result = await pool.query(
      `SELECT status, SUM(total_days) as days_count, COUNT(*) as app_count 
       FROM reporter_leaves 
       WHERE reporter_id = $1 
       GROUP BY status`,
      [reporterId]
    );

    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let totalUsedDays = 0;

    result.rows.forEach(row => {
      const days = parseInt(row.days_count || 0, 10);
      const count = parseInt(row.app_count || 0, 10);
      if (row.status === 'approved') {
        approved += count;
        totalUsedDays += days;
      } else if (row.status === 'pending') {
        pending += count;
      } else if (row.status === 'rejected') {
        rejected += count;
      }
    });

    const yearlyAllowance = 15;
    const remainingBalance = Math.max(0, yearlyAllowance - totalUsedDays);

    res.json({
      yearlyAllowance,
      totalUsedDays,
      remainingBalance,
      approved,
      pending,
      rejected,
      totalApplications: pending + approved + rejected
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /leaves — Apply for leave
router.post('/', async (req, res) => {
  try {
    const { reporterId, reporterName, leaveType, startDate, endDate, totalDays = 1, reason, backupReporter = '' } = req.body;
    if (!reporterId || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'reporterId, startDate, endDate and reason are required' });
    }

    const result = await pool.query(
      `INSERT INTO reporter_leaves (reporter_id, reporter_name, leave_type, start_date, end_date, total_days, reason, backup_reporter, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [
        reporterId,
        reporterName || 'Reporter',
        leaveType || 'Casual Leave',
        startDate,
        endDate,
        parseInt(totalDays || 1, 10),
        reason,
        backupReporter
      ]
    );

    res.json({ ok: true, leave: mapRow(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /leaves/:id/status — Admin Approve or Reject leave
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes = '' } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      `UPDATE reporter_leaves 
       SET status = $1, admin_notes = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [status, adminNotes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    res.json({ ok: true, leave: mapRow(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { router as leavesRouter };
export default router;
