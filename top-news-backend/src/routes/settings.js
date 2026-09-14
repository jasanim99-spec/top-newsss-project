import express from 'express';
import { pool } from '../db/index.js';
import { emitSettingsUpdated } from '../socket.js';

const router = express.Router();

function mapRowToSettings(row) {
  if (!row) {
    return {
      logoUrl: '/logo.png',
      faviconUrl: '/logo.png',
      siteName: 'TOP NEWS',
      siteTagline: 'Breaking News, Latest Updates & Current Affairs',
      adminUrl: 'http://localhost:5173',
      mainWebsiteUrl: 'http://localhost:8080',
      masterKey: process.env.MASTER_KEY || 'TOPNEWS2026'
    };
  }
  return {
    logoUrl: row.logo_url || '/logo.png',
    faviconUrl: row.favicon_url || '/logo.png',
    siteName: row.site_name || 'TOP NEWS',
    siteTagline: row.site_tagline || 'Breaking News, Latest Updates & Current Affairs',
    adminUrl: row.admin_url || 'http://localhost:5173',
    mainWebsiteUrl: row.main_website_url || 'http://localhost:8080',
    masterKey: process.env.MASTER_KEY || row.master_key || 'TOPNEWS2026',
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
  };
}

// -------------------------------------------------------------------------
// GET /settings - Fetch site settings
// -------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM site_settings WHERE id = 'general' LIMIT 1`);
    if (result.rows.length === 0) {
      return res.json(mapRowToSettings(null));
    }
    res.json(mapRowToSettings(result.rows[0]));
  } catch (err) {
    console.error('Error fetching site settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings', details: err.message });
  }
});

// -------------------------------------------------------------------------
// POST or PUT /settings - Update site settings
// -------------------------------------------------------------------------
const updateSettingsHandler = async (req, res) => {
  try {
    const data = req.body || {};

    const currentRes = await pool.query(`SELECT * FROM site_settings WHERE id = 'general' LIMIT 1`);
    const current = currentRes.rows.length > 0 ? currentRes.rows[0] : {};

    const logoUrl = data.logoUrl !== undefined ? data.logoUrl.trim() : (current.logo_url || '/logo.png');
    const faviconUrl = data.faviconUrl !== undefined ? data.faviconUrl.trim() : (current.favicon_url || '/logo.png');
    const siteName = data.siteName !== undefined ? data.siteName.trim() : (current.site_name || 'TOP NEWS');
    const siteTagline = data.siteTagline !== undefined ? data.siteTagline.trim() : (current.site_tagline || 'Breaking News, Latest Updates & Current Affairs');
    const adminUrl = data.adminUrl !== undefined ? data.adminUrl.trim() : (current.admin_url || 'http://localhost:5173');
    const mainWebsiteUrl = data.mainWebsiteUrl !== undefined ? data.mainWebsiteUrl.trim() : (current.main_website_url || 'http://localhost:8080');
    const masterKey = process.env.MASTER_KEY || current.master_key || null;

    const upsertSql = `
      INSERT INTO site_settings (
        id, logo_url, favicon_url, site_name, site_tagline, admin_url, main_website_url, master_key, updated_at
      ) VALUES (
        'general', $1, $2, $3, $4, $5, $6, $7, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        logo_url = EXCLUDED.logo_url,
        favicon_url = EXCLUDED.favicon_url,
        site_name = EXCLUDED.site_name,
        site_tagline = EXCLUDED.site_tagline,
        admin_url = EXCLUDED.admin_url,
        main_website_url = EXCLUDED.main_website_url,
        master_key = EXCLUDED.master_key,
        updated_at = NOW()
      RETURNING *;
    `;

    const result = await pool.query(upsertSql, [
      logoUrl, faviconUrl, siteName, siteTagline, adminUrl, mainWebsiteUrl, masterKey
    ]);

    const updatedSettings = mapRowToSettings(result.rows[0]);
    emitSettingsUpdated(updatedSettings);
    res.json(updatedSettings);
  } catch (err) {
    console.error('Error updating site settings:', err);
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
};

router.post('/', updateSettingsHandler);
router.put('/', updateSettingsHandler);

export default router;
