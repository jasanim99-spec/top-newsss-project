import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, checkConnection } from './index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================================================================
// 1. FIREBASE ADMIN SDK INITIALIZATION
// =========================================================================
let firestoreDb = null;

function initializeFirebaseAdmin() {
  const possiblePaths = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    path.join(__dirname, '../../serviceAccountKey.json'),
    path.join(__dirname, '../serviceAccountKey.json'),
    path.join(process.cwd(), 'serviceAccountKey.json')
  ].filter(Boolean);

  let keyPath = possiblePaths.find(p => fs.existsSync(p));

  if (!keyPath) {
    console.error('\n====================================================================');
    console.error('❌ FIREBASE ADMIN SDK SERVICE ACCOUNT KEY REQUIRED');
    console.error('====================================================================');
    console.error('Firebase security rules prevent unauthenticated Web SDK queries from reading');
    console.error('protected collections like "admins" and "settings/general".\n');
    console.error('To proceed safely without altering your production Firestore security rules:');
    console.error('1. Open Firebase Console (https://console.firebase.google.com/)');
    console.error('2. Go to Project Settings -> Service accounts tab');
    console.error('3. Click "Generate new private key"');
    console.error('4. Save the downloaded JSON file as "serviceAccountKey.json" inside:');
    console.error(`   ${path.resolve(__dirname, '../../serviceAccountKey.json')}\n`);
    console.error('====================================================================\n');
    throw new Error('Missing serviceAccountKey.json for Firebase Admin SDK.');
  }

  try {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    firestoreDb = admin.firestore();
    console.log(`🔒 Successfully initialized Firebase Admin SDK using key: ${keyPath}`);
  } catch (err) {
    console.error('❌ Error reading Firebase service account JSON:', err.message);
    throw err;
  }
}

// =========================================================================
// 2. HELPER FUNCTIONS FOR TYPE & DATE SANITIZATION
// =========================================================================

function parseDate(val) {
  if (!val) return new Date().toISOString();
  if (typeof val === 'object' && '_seconds' in val && typeof val._seconds === 'number') {
    return new Date(val._seconds * 1000).toISOString();
  }
  if (typeof val === 'object' && 'seconds' in val && typeof val.seconds === 'number') {
    return new Date(val.seconds * 1000).toISOString();
  }
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'string') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  if (typeof val === 'number') return new Date(val).toISOString();
  return new Date().toISOString();
}

function parseArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(v => String(v).trim()).filter(Boolean);
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

function generateSlug(title) {
  return (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchAdminDocs(collectionName) {
  const docsList = [];
  try {
    const snap = await firestoreDb.collection(collectionName).get();
    snap.forEach(d => docsList.push({ id: d.id, data: () => d.data() }));
  } catch (err) {
    console.warn(`  ⚠️ Notice reading collection "${collectionName}":`, err.message);
  }
  return docsList;
}

// =========================================================================
// 3. MAIN DATA MIGRATION EXECUTION LOGIC
// =========================================================================
export async function migrateDataFromFirebase() {
  console.log('\n====================================================');
  console.log('🚀 FIREBASE TO POSTGRESQL DATA MIGRATION ENGINE');
  console.log('====================================================\n');

  // Verify PostgreSQL DB connection
  const dbConnected = await checkConnection();
  if (!dbConnected) {
    console.error('❌ PostgreSQL database connection failed. Aborting data migration.');
    process.exit(1);
  }

  // Initialize Firebase Admin SDK
  initializeFirebaseAdmin();

  const summary = {
    users: { found: 0, migrated: 0, skipped: 0, errors: 0 },
    news: { found: 0, migrated: 0, skipped: 0, errors: 0 },
    videos: { found: 0, migrated: 0, skipped: 0, errors: 0 },
    settings: { found: 0, migrated: 0, skipped: 0, errors: 0 }
  };

  const pgClient = await pool.connect();

  try {
    // -----------------------------------------------------------------------
    // STEP 1: MIGRATE USERS / ADMINS -> users TABLE (WITH TRANSACTION)
    // -----------------------------------------------------------------------
    console.log('\n📦 [1/4] Processing Firestore "admins" & "users" collections -> PostgreSQL "users" table...');
    const existingUserIds = new Set();
    try {
      const adminDocs = await fetchAdminDocs('admins');
      const userDocs = await fetchAdminDocs('users');
      const combinedDocs = [...adminDocs, ...userDocs];
      summary.users.found = combinedDocs.length;

      const userMap = new Map();
      combinedDocs.forEach(d => {
        const data = d.data();
        const uId = String(d.id || data.uid || data.id || data._id).trim();
        userMap.set(uId, { id: uId, ...data });
      });

      await pgClient.query('BEGIN');

      const userQuery = `
        INSERT INTO users (
          id, email, name, role, active, phone, city, district, beat,
          press_card_no, photo_url, bio, rating, articles_count, views_count,
          joined_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
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
          rating = EXCLUDED.rating,
          articles_count = EXCLUDED.articles_count,
          views_count = EXCLUDED.views_count,
          updated_at = EXCLUDED.updated_at;
      `;

      for (const u of userMap.values()) {
        try {
          const userId = String(u.id || u.uid || `user_${Date.now()}`);
          const email = String(u.email || `user_${userId}@topnews.com`).trim().toLowerCase();
          const name = String(u.name || email.split('@')[0]).trim();
          const role = String(u.role || 'reporter').trim().toLowerCase();
          const active = u.active !== false;
          const phone = u.phone ? String(u.phone).trim() : null;
          const city = u.city ? String(u.city).trim() : null;
          const district = u.district ? String(u.district).trim() : null;
          const beat = u.beat ? String(u.beat).trim() : 'General';
          const pressCardNo = u.pressCardNo ? String(u.pressCardNo).trim() : null;
          const photoUrl = u.photoUrl ? String(u.photoUrl).trim() : null;
          const bio = u.bio ? String(u.bio).trim() : null;
          const rating = typeof u.rating === 'number' ? u.rating : 5.00;
          const articlesCount = typeof u.articlesCount === 'number' ? u.articlesCount : 0;
          const viewsCount = typeof u.viewsCount === 'number' ? u.viewsCount : 0;
          const joinedAt = parseDate(u.joinedAt || u.createdAt);
          const createdAt = parseDate(u.createdAt);
          const updatedAt = parseDate(u.updatedAt);

          await pgClient.query(userQuery, [
            userId, email, name, role, active, phone, city, district, beat,
            pressCardNo, photoUrl, bio, rating, articlesCount, viewsCount,
            joinedAt, createdAt, updatedAt
          ]);

          existingUserIds.add(userId);
          summary.users.migrated++;
        } catch (uErr) {
          console.error(`  ❌ User migration error (${u.email || u.id}):`, uErr.message);
          summary.users.errors++;
        }
      }

      await pgClient.query('COMMIT');
      console.log(`  ✅ Successfully committed ${summary.users.migrated} user records!`);
    } catch (err) {
      await pgClient.query('ROLLBACK');
      console.error('  ❌ Users transaction failed and rolled back:', err.message);
      summary.users.errors++;
    }

    // -----------------------------------------------------------------------
    // STEP 2: MIGRATE NEWS -> news_articles TABLE (WITH TRANSACTION)
    // -----------------------------------------------------------------------
    console.log('\n📦 [2/4] Processing Firestore "news" collection -> PostgreSQL "news_articles" table...');
    try {
      const newsDocs = await fetchAdminDocs('news');
      summary.news.found = newsDocs.length;

      const existingSlugs = new Set();
      const slugRes = await pgClient.query('SELECT slug FROM news_articles');
      slugRes.rows.forEach(r => existingSlugs.add(r.slug));

      await pgClient.query('BEGIN');

      const newsQuery = `
        INSERT INTO news_articles (
          id, title, slug, description, content, image_url, category, topic,
          language, section, keywords, tags, source_url, views, status,
          author_id, author_name, author_role, author_city, author_photo,
          press_card_no, editorial_notes, location, ai_summary, is_breaking,
          published_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
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
          views = EXCLUDED.views,
          status = EXCLUDED.status,
          author_id = EXCLUDED.author_id,
          author_name = EXCLUDED.author_name,
          author_role = EXCLUDED.author_role,
          author_city = EXCLUDED.author_city,
          author_photo = EXCLUDED.author_photo,
          press_card_no = EXCLUDED.press_card_no,
          editorial_notes = EXCLUDED.editorial_notes,
          location = EXCLUDED.location,
          ai_summary = EXCLUDED.ai_summary,
          is_breaking = EXCLUDED.is_breaking,
          published_at = EXCLUDED.published_at,
          updated_at = EXCLUDED.updated_at;
      `;

      for (const d of newsDocs) {
        const data = d.data();
        const articleId = String(d.id || data.id || data._id).trim();
        const title = String(data.title || '').trim();
        let baseSlug = String(data.slug || generateSlug(title) || articleId).trim();
        const status = String(data.status || 'published').trim().toLowerCase();

        // Skip only if title is completely empty or article was explicitly soft-deleted
        if (!title || status === 'deleted') {
          summary.news.skipped++;
          continue;
        }

        // Deterministic unique slug generation if baseSlug collides with a different article ID
        let uniqueSlug = baseSlug;
        let suffixCounter = 1;
        while (existingSlugs.has(uniqueSlug)) {
          // Check if existing slug belongs to the same article ID (idempotent update)
          const checkOwner = await pgClient.query('SELECT id FROM news_articles WHERE slug = $1', [uniqueSlug]);
          if (checkOwner.rows.length === 0 || checkOwner.rows[0].id === articleId) {
            break;
          }
          uniqueSlug = `${baseSlug}-${articleId.slice(-6)}-${suffixCounter}`;
          suffixCounter++;
        }

        try {
          // Use SAVEPOINT so any individual record error does NOT abort the main transaction
          await pgClient.query('SAVEPOINT article_sp');

          const description = data.description ? String(data.description).trim() : null;
          const content = data.content ? String(data.content) : null;
          const imageUrl = data.imageUrl ? String(data.imageUrl).trim() : null;
          const category = String(data.category || 'general').trim().toLowerCase();
          const topic = String(data.topic || 'general').trim().toLowerCase();
          const language = String(data.language || 'en').trim().toLowerCase();
          const section = String(data.section || 'main').trim();
          const keywords = parseArray(data.keywords);
          const tags = parseArray(data.tags);
          const sourceUrl = data.sourceUrl ? String(data.sourceUrl).trim() : null;
          const views = typeof data.views === 'number' ? data.views : 0;
          
          // Verify author_id foreign key existence in users table to prevent FK constraint failures
          let authorId = data.authorId ? String(data.authorId).trim() : null;
          if (authorId && !existingUserIds.has(authorId)) {
            authorId = null; // Set FK to NULL while preserving author display details
          }

          const authorName = data.authorName ? String(data.authorName).trim() : null;
          const authorRole = data.authorRole ? String(data.authorRole).trim() : null;
          const authorCity = data.authorCity ? String(data.authorCity).trim() : null;
          const authorPhoto = data.authorPhoto ? String(data.authorPhoto).trim() : null;
          const pressCardNo = data.pressCardNo ? String(data.pressCardNo).trim() : null;
          const editorialNotes = data.editorialNotes ? String(data.editorialNotes).trim() : null;
          const location = data.location && typeof data.location === 'object' ? JSON.stringify(data.location) : null;
          const aiSummary = data.aiSummary ? String(data.aiSummary).trim() : null;
          const isBreaking = !!data.isBreaking;
          const publishedAt = parseDate(data.publishedAt);
          const createdAt = parseDate(data.createdAt);
          const updatedAt = parseDate(data.updatedAt);

          await pgClient.query(newsQuery, [
            articleId, title, uniqueSlug, description, content, imageUrl, category, topic,
            language, section, keywords, tags, sourceUrl, views, status,
            authorId, authorName, authorRole, authorCity, authorPhoto,
            pressCardNo, editorialNotes, location, aiSummary, isBreaking,
            publishedAt, createdAt, updatedAt
          ]);

          await pgClient.query('RELEASE SAVEPOINT article_sp');
          existingSlugs.add(uniqueSlug);
          summary.news.migrated++;
        } catch (nErr) {
          await pgClient.query('ROLLBACK TO SAVEPOINT article_sp');
          console.error(`  ❌ Article migration error "${title}" (ID: ${articleId}):`, nErr.message);
          summary.news.errors++;
        }
      }

      await pgClient.query('COMMIT');
      console.log(`  ✅ Successfully committed ${summary.news.migrated} news article records! (Skipped: ${summary.news.skipped})`);
    } catch (err) {
      await pgClient.query('ROLLBACK');
      console.error('  ❌ News batch transaction failed and rolled back:', err.message);
      summary.news.errors++;
    }

    // -----------------------------------------------------------------------
    // STEP 3: MIGRATE VIDEOS -> short_videos TABLE (WITH TRANSACTION)
    // -----------------------------------------------------------------------
    console.log('\n📦 [3/4] Processing Firestore "videos" collection -> PostgreSQL "short_videos" table...');
    try {
      const videoDocs = await fetchAdminDocs('videos');
      summary.videos.found = videoDocs.length;

      await pgClient.query('BEGIN');

      const videoQuery = `
        INSERT INTO short_videos (
          id, title, slug, description, video_url, thumbnail_url, duration,
          category, topic, language, section, keywords, tags, source_url, views,
          status, published_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
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
          views = EXCLUDED.views,
          status = EXCLUDED.status,
          published_at = EXCLUDED.published_at,
          updated_at = EXCLUDED.updated_at;
      `;

      for (const d of videoDocs) {
        const data = d.data();
        const videoId = String(d.id || data.id || data._id).trim();
        const title = String(data.title || '').trim();
        const slug = String(data.slug || generateSlug(title) || videoId).trim();
        const videoUrl = String(data.videoUrl || '').trim();
        const status = String(data.status || 'published').trim().toLowerCase();

        if (!title || !videoUrl || status === 'deleted') {
          summary.videos.skipped++;
          continue;
        }

        try {
          const description = data.description ? String(data.description).trim() : null;
          const thumbnailUrl = data.thumbnailUrl ? String(data.thumbnailUrl).trim() : null;
          const duration = typeof data.duration === 'number' ? data.duration : 0;
          const category = String(data.category || 'general').trim().toLowerCase();
          const topic = String(data.topic || 'general').trim().toLowerCase();
          const language = String(data.language || 'en').trim().toLowerCase();
          const section = String(data.section || 'main').trim();
          const keywords = parseArray(data.keywords);
          const tags = parseArray(data.tags);
          const sourceUrl = data.sourceUrl ? String(data.sourceUrl).trim() : null;
          const views = typeof data.views === 'number' ? data.views : 0;
          const publishedAt = parseDate(data.publishedAt);
          const createdAt = parseDate(data.createdAt);
          const updatedAt = parseDate(data.updatedAt);

          await pgClient.query(videoQuery, [
            videoId, title, slug, description, videoUrl, thumbnailUrl, duration,
            category, topic, language, section, keywords, tags, sourceUrl, views,
            status, publishedAt, createdAt, updatedAt
          ]);

          summary.videos.migrated++;
        } catch (vErr) {
          console.error(`  ❌ Video migration error "${title}" (${videoId}):`, vErr.message);
          summary.videos.errors++;
        }
      }

      await pgClient.query('COMMIT');
      console.log(`  ✅ Successfully committed ${summary.videos.migrated} short video records! (Skipped: ${summary.videos.skipped})`);
    } catch (err) {
      await pgClient.query('ROLLBACK');
      console.error('  ❌ Videos transaction failed and rolled back:', err.message);
      summary.videos.errors++;
    }

    // -----------------------------------------------------------------------
    // STEP 4: MIGRATE SETTINGS -> site_settings TABLE (WITH TRANSACTION)
    // -----------------------------------------------------------------------
    console.log('\n📦 [4/4] Processing Firestore "settings/general" document -> PostgreSQL "site_settings" table...');
    try {
      const settingsDocSnap = await firestoreDb.collection('settings').doc('general').get();
      summary.settings.found = settingsDocSnap.exists ? 1 : 0;

      await pgClient.query('BEGIN');

      const data = settingsDocSnap.exists ? settingsDocSnap.data() : {};
      const logoUrl = data.logoUrl || '/logo.png';
      const faviconUrl = data.faviconUrl || '/logo.png';
      const siteName = data.siteName || 'TOP NEWS';
      const siteTagline = data.siteTagline || 'Breaking News, Latest Updates & Current Affairs';
      const adminUrl = data.adminUrl || 'http://localhost:5173';
      const mainWebsiteUrl = data.mainWebsiteUrl || 'http://localhost:8080';
      const masterKey = process.env.MASTER_KEY || null;
      const updatedAt = parseDate(data.updatedAt);

      const settingsQuery = `
        INSERT INTO site_settings (
          id, logo_url, favicon_url, site_name, site_tagline, admin_url,
          main_website_url, master_key, updated_at
        ) VALUES (
          'general', $1, $2, $3, $4, $5, $6, $7, $8
        )
        ON CONFLICT (id) DO UPDATE SET
          logo_url = EXCLUDED.logo_url,
          favicon_url = EXCLUDED.favicon_url,
          site_name = EXCLUDED.site_name,
          site_tagline = EXCLUDED.site_tagline,
          admin_url = EXCLUDED.admin_url,
          main_website_url = EXCLUDED.main_website_url,
          master_key = EXCLUDED.master_key,
          updated_at = EXCLUDED.updated_at;
      `;

      await pgClient.query(settingsQuery, [
        logoUrl, faviconUrl, siteName, siteTagline, adminUrl,
        mainWebsiteUrl, masterKey, updatedAt
      ]);

      await pgClient.query('COMMIT');
      summary.settings.migrated = 1;
      console.log('  ✅ Successfully committed site_settings record!');
    } catch (err) {
      await pgClient.query('ROLLBACK');
      console.error('  ❌ Settings transaction failed and rolled back:', err.message);
      summary.settings.errors++;
    }

    // SUMMARY REPORT
    console.log('\n====================================================');
    console.log('📊 DATA MIGRATION SUMMARY REPORT');
    console.log('====================================================');
    console.log(`Users / Admins  : Found ${summary.users.found} | Migrated ${summary.users.migrated} | Skipped ${summary.users.skipped} | Errors ${summary.users.errors}`);
    console.log(`News Articles   : Found ${summary.news.found} | Migrated ${summary.news.migrated} | Skipped ${summary.news.skipped} | Errors ${summary.news.errors}`);
    console.log(`Short Videos    : Found ${summary.videos.found} | Migrated ${summary.videos.migrated} | Skipped ${summary.videos.skipped} | Errors ${summary.videos.errors}`);
    console.log(`Site Settings   : Found ${summary.settings.found} | Migrated ${summary.settings.migrated} | Skipped ${summary.settings.skipped} | Errors ${summary.settings.errors}`);
    console.log('====================================================\n');

    // POST-MIGRATION POSTGRESQL ROW COUNT VERIFICATION
    console.log('🔍 VERIFYING POSTGRESQL ROW COUNTS AFTER MIGRATION...');
    const userCount = await pgClient.query('SELECT COUNT(*) FROM users');
    const newsCount = await pgClient.query('SELECT COUNT(*) FROM news_articles');
    const videoCount = await pgClient.query('SELECT COUNT(*) FROM short_videos');
    const settingsCount = await pgClient.query('SELECT COUNT(*) FROM site_settings');

    console.log('\n====================================================');
    console.log('✅ POSTGRESQL FINAL ROW COUNT VERIFICATION');
    console.log('====================================================');
    console.log(`  - users table          : ${userCount.rows[0].count} rows`);
    console.log(`  - news_articles table  : ${newsCount.rows[0].count} rows`);
    console.log(`  - short_videos table   : ${videoCount.rows[0].count} rows`);
    console.log(`  - site_settings table  : ${settingsCount.rows[0].count} rows`);
    console.log('====================================================\n');

  } catch (globalErr) {
    console.error('❌ Critical migration error:', globalErr);
  } finally {
    pgClient.release();
    await pool.end();
  }
}

// Script entry point when executed directly via node or npm run
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isDirectRun || process.argv.includes('--run')) {
  migrateDataFromFirebase();
}
