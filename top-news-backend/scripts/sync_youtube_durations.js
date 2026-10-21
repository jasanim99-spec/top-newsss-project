import pg from 'pg';

async function extractYouTubeDuration(url) {
  try {
    let videoId = '';
    if (url.includes('embed/')) videoId = url.split('embed/')[1]?.split('?')[0];
    else if (url.includes('shorts/')) videoId = url.split('shorts/')[1]?.split('?')[0];
    else if (url.includes('watch?v=')) videoId = url.split('watch?v=')[1]?.split('&')[0];
    else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0];

    if (!videoId) return null;

    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const html = await res.text();
    const match = html.match(/"lengthSeconds":"(\d+)"/);
    if (match) {
      return parseInt(match[1], 10);
    }
  } catch (err) {
    console.error(`Error fetching YouTube duration for ${url}:`, err.message);
  }
  return null;
}

async function run() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Zch7yLNazH2C@ep-plain-thunder-b38559px-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const pool = new pg.Pool({ connectionString });

  console.log('Fetching all short_videos from database...');
  const result = await pool.query('SELECT id, title, video_url, duration FROM short_videos ORDER BY id ASC');
  const videos = result.rows;
  console.log(`Found ${videos.length} videos. Starting duration synchronization...`);

  // Cache by URL so duplicate URLs don't fetch twice
  const urlCache = new Map();

  for (const video of videos) {
    let duration = urlCache.get(video.video_url);
    if (duration === undefined) {
      console.log(`Fetching YouTube duration for: ${video.title} (${video.video_url})...`);
      duration = await extractYouTubeDuration(video.video_url);
      urlCache.set(video.video_url, duration);
      // Small delay to be polite
      await new Promise(r => setTimeout(r, 400));
    }

    if (duration && duration > 0) {
      const min = Math.floor(duration / 60);
      const sec = duration % 60;
      console.log(`Updating video [${video.id}] duration: ${video.duration}s -> ${duration}s (${min}:${sec.toString().padStart(2, '0')})`);
      await pool.query('UPDATE short_videos SET duration = $1, updated_at = NOW() WHERE id = $2', [duration, video.id]);
    } else {
      console.log(`Could not extract duration for [${video.id}] ${video.video_url}`);
    }
  }

  console.log('Finished updating all video durations in Neon PostgreSQL!');
  await pool.end();
}

run().catch(console.error);
