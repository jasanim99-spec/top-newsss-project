import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// 1. Local Read-Only PostgreSQL Connection Pool
const localPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres1234',
  database: process.env.DB_NAME || 'top_news',
});

// 2. Target Neon / Production Cloud Connection Pool
const targetConnectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;

async function runMigration() {
  console.log('====================================================');
  console.log('🚀 TOP NEWS DATABASE MIGRATION SCRIPT (LOCAL -> NEON)');
  console.log('====================================================\n');

  // STEP 1: Read-Only Inspection of Local DB
  console.log('📍 STEP 1: Exporting local PostgreSQL database records (READ-ONLY)...');
  const localData = {};
  const tables = ['users', 'news_articles', 'advertisements', 'reporter_leaves', 'reporter_goals', 'short_videos', 'site_settings'];

  try {
    for (const table of tables) {
      try {
        const res = await localPool.query(`SELECT * FROM ${table}`);
        localData[table] = res.rows;
        console.log(`   ✅ Local '${table}': ${res.rows.length} records exported`);
      } catch (err) {
        console.log(`   ⚠️ Local '${table}': ${err.message}`);
        localData[table] = [];
      }
    }

    // Save JSON Backup locally
    const backupPath = path.join(process.cwd(), 'local_db_backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(localData, null, 2));
    console.log(`\n💾 Local DB Backup saved securely to: ${backupPath}`);
  } catch (err) {
    console.error('❌ Failed to export local DB:', err.message);
    process.exit(1);
  }

  // STEP 2: Verify Target Cloud Database Connection
  if (!targetConnectionString) {
    console.log('\n⚠️ TARGET DATABASE_URL IS NOT SET IN ENVIRONMENT / .env!');
    console.log('   Please set DATABASE_URL or NEON_DATABASE_URL in your top-news-backend/.env file');
    console.log('   Example: DATABASE_URL="postgres://user:pass@ep-host.neon.tech/top_news?sslmode=require"');
    console.log('\n   Local Backup File created successfully: local_db_backup.json');
    await localPool.end();
    return;
  }

  console.log('\n📍 STEP 2: Connecting to Target Cloud PostgreSQL (Neon DB)...');
  let targetPool = new Pool({
    connectionString: targetConnectionString.trim(),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const timeRes = await targetPool.query('SELECT NOW()');
    console.log(`   ✅ Connected to Target Cloud DB successfully at: ${timeRes.rows[0].now}`);
  } catch (err) {
    if (targetConnectionString.includes('-pooler.')) {
      console.log('   Retrying with direct connection string...');
      const directConn = targetConnectionString.replace('-pooler.', '.');
      targetPool = new Pool({
        connectionString: directConn.trim(),
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });
      try {
        const timeRes = await targetPool.query('SELECT NOW()');
        console.log(`   ✅ Connected to Target Cloud DB (Direct) successfully at: ${timeRes.rows[0].now}`);
      } catch (err2) {
        console.error('❌ Could not connect to Target DB:', err2.message);
        await localPool.end();
        await targetPool.end();
        process.exit(1);
      }
    } else {
      console.error('❌ Could not connect to Target DB:', err.message);
      await localPool.end();
      await targetPool.end();
      process.exit(1);
    }
  }

  // STEP 3: Apply Schema to Target DB
  console.log('\n📍 STEP 3: Verifying/Creating Schema on Target DB...');
  try {
    const schemaPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await targetPool.query(schemaSql);
      console.log('   ✅ Schema verified and tables created (if not present)');
    }
  } catch (err) {
    console.warn('   ⚠️ Schema execution notice:', err.message);
  }

  // STEP 4: Import Data preserving IDs, relationships & timestamps
  console.log('\n📍 STEP 4: Migrating records to Target Cloud DB...');

  for (const table of tables) {
    const rows = localData[table];
    if (!rows || rows.length === 0) {
      console.log(`   ℹ️ Table '${table}': 0 local records to migrate`);
      continue;
    }

    // Ensure table exists on target DB
    await targetPool.query(`CREATE TABLE IF NOT EXISTS ${table} (id VARCHAR(128) PRIMARY KEY)`);

    // Ensure all columns exist on target table
    const sampleRow = rows[0];
    const columns = Object.keys(sampleRow);

    for (const col of columns) {
      try {
        await targetPool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} ${col.endsWith('_at') || col.endsWith('_date') ? 'TIMESTAMPTZ' : col.endsWith('_count') || col === 'views' || col === 'duration' || col === 'click_count' || col === 'total_days' ? 'INT' : col.startsWith('is_') || col === 'active' ? 'BOOLEAN' : col.endsWith('_notes') || col === 'bio' || col === 'content' || col === 'description' || col.endsWith('_url') ? 'TEXT' : col === 'keywords' || col === 'tags' ? 'TEXT[]' : col === 'location' ? 'JSONB' : 'VARCHAR(500)'}`);
      } catch (err) {
        // Ignore column add errors if already exists
      }
    }

    let migrated = 0;
    for (const row of rows) {
      const rowCols = Object.keys(row);
      const colNamesStr = rowCols.join(', ');
      const placeholdersStr = rowCols.map((_, i) => `$${i + 1}`).join(', ');
      const updateSetStr = rowCols
        .filter(c => c !== 'id')
        .map(c => `${c} = EXCLUDED.${c}`)
        .join(', ');

      const values = rowCols.map(c => row[c]);
      const sql = `
        INSERT INTO ${table} (${colNamesStr})
        VALUES (${placeholdersStr})
        ON CONFLICT (id) DO UPDATE SET ${updateSetStr || 'updated_at = NOW()'}
      `;

      await targetPool.query(sql, values);
      migrated++;
    }
    console.log(`   ✅ Table '${table}': ${migrated} records migrated successfully`);
  }

  // STEP 5: Verify Target Cloud DB Record Counts
  console.log('\n📍 STEP 5: Verifying Target DB record counts...');
  const targetCounts = {};
  for (const table of tables) {
    try {
      const res = await targetPool.query(`SELECT COUNT(*) FROM ${table}`);
      targetCounts[table] = parseInt(res.rows[0].count, 10);
      console.log(`   📊 Target '${table}': ${targetCounts[table]} records`);
    } catch (e) {
      targetCounts[table] = 0;
    }
  }

  console.log('\n====================================================');
  console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
  console.log('====================================================');

  await localPool.end();
  await targetPool.end();
}

runMigration().catch(err => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
