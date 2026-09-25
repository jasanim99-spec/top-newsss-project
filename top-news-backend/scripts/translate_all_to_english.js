import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Zch7yLNazH2C@ep-plain-thunder-b38559px-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function translateText(text, targetLang = 'en') {
  if (!text || !text.trim()) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text.trim())}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data[0])) {
        const translated = data[0].map((item) => item[0]).join('');
        if (translated) return translated;
      }
    }
  } catch (err) {
    console.warn('Translate error:', err);
  }
  return text;
}

async function run() {
  console.log('🚀 Starting translation of all PostgreSQL news articles to English...');
  const res = await pool.query('SELECT * FROM news_articles WHERE status != $1 ORDER BY created_at DESC', ['deleted']);
  console.log(`Found ${res.rows.length} total news articles to process.`);

  let updatedCount = 0;

  for (const article of res.rows) {
    console.log(`Processing [${article.id}] (${article.language}): ${article.title.slice(0, 30)}...`);

    const hasNonEnglish = /[\u0900-\u097F]|[\u0A80-\u0AFF]/.test(article.title + (article.description || '') + (article.content || ''));

    let newTitle = article.title;
    let newDesc = article.description;
    let newContent = article.content;
    let newAiSummary = article.ai_summary;

    if (hasNonEnglish || article.language !== 'en') {
      newTitle = await translateText(article.title, 'en');
      newDesc = article.description ? await translateText(article.description, 'en') : '';
      newContent = article.content ? await translateText(article.content, 'en') : '';
      newAiSummary = article.ai_summary ? await translateText(article.ai_summary, 'en') : '';
    }

    // Update DB
    await pool.query(
      `UPDATE news_articles 
       SET title = $1, description = $2, content = $3, ai_summary = $4, language = 'en', updated_at = NOW() 
       WHERE id = $5`,
      [newTitle, newDesc, newContent, newAiSummary, article.id]
    );

    updatedCount++;
    console.log(`✅ Updated [${article.id}] -> English: "${newTitle.slice(0, 40)}"`);
  }

  console.log(`🎉 Successfully converted all ${updatedCount} news articles to English in PostgreSQL!`);
  await pool.end();
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
