const cacheKeyPrefix = 'topnews_translation_cache_v1_';

// In-memory cache for instant zero-latency lookups
const memoryCache: Record<string, string> = {};

/**
 * Translates text into target language using Google Translate API (client=gtx)
 * with multi-level (memory + localStorage) caching for instant performance.
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim() || !targetLang || targetLang === 'en') return text;

  const trimmedText = text.trim();
  const key = `${targetLang}:${trimmedText}`;

  // 1. Check in-memory cache
  if (memoryCache[key]) {
    return memoryCache[key];
  }

  // 2. Check localStorage cache
  try {
    const cached = localStorage.getItem(cacheKeyPrefix + key);
    if (cached) {
      memoryCache[key] = cached;
      return cached;
    }
  } catch (e) {}

  // 3. Perform dynamic fetch
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(trimmedText)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data[0])) {
        const translated = data[0].map((item: any) => item[0]).join('');
        if (translated) {
          memoryCache[key] = translated;
          try {
            localStorage.setItem(cacheKeyPrefix + key, translated);
          } catch (e) {}
          return translated;
        }
      }
    }
  } catch (err) {
    console.warn('Translation error for key:', key, err);
  }

  return text;
}

/**
 * Translates a single article object (title, description, content, aiSummary)
 */
export async function translateArticle<T extends Record<string, any>>(
  article: T,
  targetLang: string
): Promise<T> {
  if (!article || !targetLang || targetLang === 'en') return article;

  const [translatedTitle, translatedDesc, translatedContent, translatedSummary] = await Promise.all([
    article.title ? translateText(article.title, targetLang) : Promise.resolve(article.title),
    article.description ? translateText(article.description, targetLang) : Promise.resolve(article.description),
    article.content ? translateText(article.content, targetLang) : Promise.resolve(article.content),
    article.aiSummary ? translateText(article.aiSummary, targetLang) : Promise.resolve(article.aiSummary),
  ]);

  return {
    ...article,
    title: translatedTitle || article.title,
    description: translatedDesc || article.description,
    content: translatedContent || article.content,
    aiSummary: translatedSummary || article.aiSummary,
  };
}

/**
 * Translates an array of articles
 */
export async function translateArticles<T extends Record<string, any>>(
  articles: T[],
  targetLang: string
): Promise<T[]> {
  if (!articles || articles.length === 0 || !targetLang || targetLang === 'en') return articles;
  return Promise.all(articles.map((art) => translateArticle(art, targetLang)));
}
