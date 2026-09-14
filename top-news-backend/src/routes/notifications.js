import { Router } from 'express';
import webpush from 'web-push';
import dotenv from 'dotenv';
import { pool } from '../db/index.js';

dotenv.config();

const router = Router();

// VAPID keys (env or generated defaults)
const DEFAULT_VAPID_PUBLIC = 'BJ-ENb2cEns8p2Z4zeFDKBe7eGZDqKr__yzpTPbS99N4u2PQl-YmXm4FOxrvWYV-NjcojisVnLPRHNZ_DN9Dl4w';
const DEFAULT_VAPID_PRIVATE = 'JGdCGDoPN9fDeahkr16QwEkplUwuC9UnfpKAw-nWR2c';

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@topnews.com';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  try {
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
  } catch (err) {
    console.error('VAPID setup error:', err.message);
  }
}

// GET /notifications/vapid-public — send public key to frontend
router.get('/vapid-public', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC });
});

// GET /notifications/history — fetch sent notification history
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM push_notifications ORDER BY sent_at DESC LIMIT 50'
    );
    res.json({ notifications: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /notifications/subscribers/count
router.get('/subscribers/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM push_subscriptions');
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /notifications/subscribe — save browser subscription
router.post('/subscribe', async (req, res) => {
  try {
    const { endpoint, keys, language = 'en' } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }
    await pool.query(
      `INSERT INTO push_subscriptions (endpoint, p256dh, auth, language)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) DO UPDATE SET language = $4`,
      [endpoint, keys.p256dh, keys.auth, language]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /notifications/unsubscribe
router.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /notifications/send — send push to all subscribers
router.post('/send', async (req, res) => {
  try {
    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
      return res.status(500).json({ error: 'VAPID keys not configured. Run generate-vapid script.' });
    }
    const { title, body, icon = '/logo.png', url = '/' } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'title and body required' });

    const formattedTitle = title.includes('TOP NEWS') || title.includes('Top News')
      ? title
      : `📰 TOP NEWS | ${title}`;

    const subsResult = await pool.query('SELECT * FROM push_subscriptions');
    const subscriptions = subsResult.rows;

    const payload = JSON.stringify({ title: formattedTitle, body, icon, url, timestamp: Date.now() });

    let sentCount = 0;
    const deadEndpoints = [];

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
          sentCount++;
        } catch (err) {
          // 410 Gone = subscription expired, remove it
          if (err.statusCode === 410 || err.statusCode === 404) {
            deadEndpoints.push(sub.endpoint);
          }
        }
      })
    );

    // Cleanup dead subscriptions
    if (deadEndpoints.length > 0) {
      await pool.query(
        `DELETE FROM push_subscriptions WHERE endpoint = ANY($1)`,
        [deadEndpoints]
      );
    }

    // Log notification
    await pool.query(
      `INSERT INTO push_notifications (title, body, icon, url, sent_count) VALUES ($1,$2,$3,$4,$5)`,
      [title, body, icon, url, sentCount]
    );

    res.json({ ok: true, sent: sentCount, total: subscriptions.length, removed: deadEndpoints.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { router as notificationsRouter };
export default router;
