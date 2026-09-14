import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, checkConnection } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🔄 Checking PostgreSQL connection status...');
  const connected = await checkConnection();
  if (!connected) {
    console.error('❌ Could not connect to PostgreSQL database "top_news". Migration aborted.');
    process.exit(1);
  }

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('🚀 Running database schema creation...');
    await pool.query(sql);
    console.log('✅ PostgreSQL DDL execution finished!');

    // Verify created tables in PostgreSQL top_news database
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tableNames = tablesRes.rows.map(r => r.table_name);
    console.log('\n========================================');
    console.log('📊 POSTGRESQL CREATED TABLES VERIFICATION');
    console.log('========================================');
    console.log(`Total Tables: ${tableNames.length}`);
    tableNames.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
    console.log('========================================\n');

  } catch (err) {
    console.error('❌ Error executing database migration:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigration();
