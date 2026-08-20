/**
 * AI Smart Writing Assistant for Newsroom Editors & Reporters
 * Provides AI Bullet Summary, Headline Suggestions, SEO Tags, and Auto-Translation.
 */

export interface AISummaryResult {
  summary: string;
  bulletPoints: string[];
}

export interface AIHeadlineAndTagsResult {
  headlines: string[];
  suggestedTags: string[];
  suggestedKeywords: string[];
  suggestedTopic: string;
}

export const aiService = {
  /**
   * Generate 3-4 bullet key points summary from news article text
   */
  async generateSummary(text: string, language = 'gu'): Promise<AISummaryResult> {
    if (!text || text.trim().length < 10) {
      throw new Error('Please enter more content to generate an AI summary.');
    }

    const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
    const sentences = cleanText
      .split(/(?<=[.?!।\n])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 15);

    let bullets: string[] = [];

    if (sentences.length <= 3) {
      bullets = sentences;
    } else {
      // Pick key opening, middle, and impact sentences
      const first = sentences[0];
      const middleIndex = Math.floor(sentences.length / 2);
      const middle = sentences[middleIndex];
      const last = sentences[sentences.length - 1];

      bullets = [first, middle, last].filter(Boolean);
    }

    // Add prefix icon formatting
    const formattedBullets = bullets.map(b => `• ${b}`);
    const summary = formattedBullets.join('\n');

    return {
      summary,
      bulletPoints: bullets
    };
  },

  /**
   * Suggest catchy headlines, SEO tags, and keywords based on content
   */
  async suggestHeadlinesAndTags(
    title: string,
    content: string,
    category: string,
    language = 'gu'
  ): Promise<AIHeadlineAndTagsResult> {
    const raw = `${title} ${content}`.replace(/<[^>]*>?/gm, ' ');
    const words = raw
      .split(/\s+/)
      .map(w => w.replace(/[^\w\u0A80-\u0AFF\u0900-\u097F]/g, '').trim())
      .filter(w => w.length > 3);

    // Extract frequency of words for tags
    const freqMap: Record<string, number> = {};
    words.forEach(w => {
      const lower = w.toLowerCase();
      freqMap[lower] = (freqMap[lower] || 0) + 1;
    });

    const sortedWords = Object.keys(freqMap)
      .sort((a, b) => freqMap[b] - freqMap[a])
      .slice(0, 10);

    const baseTitle = title.trim() || 'Breaking News Update';

    let headlines: string[] = [];
    if (language === 'gu') {
      headlines = [
        `🔴 BREAKING: ${baseTitle}`,
        `સૌથી મોટા સમાચાર: ${baseTitle} - જાણો વિગત`,
        `${baseTitle}: સમગ્ર ઘટના અંગે મોટો ખુલાસો`,
        `તાજા સમાચાર: ${baseTitle} પર મહત્વપૂર્ણ અપડેટ`,
        `EXCLUSIVE: ${baseTitle} સાથે જોડાયેલી મુખ્ય બાબતો`
      ];
    } else if (language === 'hi') {
      headlines = [
        `🔴 BREAKING NEWS: ${baseTitle}`,
        `बड़ी खबर: ${baseTitle} - जानें पूरी डिटेल`,
        `${baseTitle}: मामले में बड़ा खुलासा`,
        `ताजा अपडेट: ${baseTitle} से जुड़ी मुख्य बातें`,
        `EXCLUSIVE: ${baseTitle} को लेकर सामने आई नई जानकारी`
      ];
    } else {
      headlines = [
        `🔴 BREAKING: ${baseTitle}`,
        `Top Story: Everything you need to know about ${baseTitle}`,
        `${baseTitle} - Major developments reported`,
        `Latest Update: Inside details on ${baseTitle}`,
        `EXCLUSIVE: Full coverage on ${baseTitle}`
      ];
    }

    const defaultCatTags: Record<string, string[]> = {
      'politics': ['Politics', 'Government', 'Breaking', 'Latest Update', 'Election'],
      'sports': ['Sports', 'Cricket', 'Match Update', 'Highlights', 'Live'],
      'business': ['Business', 'Markets', 'Economy', 'Finance', 'Trade'],
      'technology': ['Tech', 'Gadgets', 'Innovation', 'Digital', 'AI'],
      'entertainment': ['Cinema', 'Bollywood', 'Celebrity', 'OTT', 'Viral'],
      'breaking-news': ['BreakingNews', 'Urgent', 'Headlines', 'FlashNews', 'TopNews']
    };

    const categoryTags = defaultCatTags[category.toLowerCase()] || ['TopNews', 'Trending', 'Latest'];
    const mergedTags = Array.from(new Set([...categoryTags, ...sortedWords.slice(0, 6)]));

    return {
      headlines,
      suggestedTags: mergedTags,
      suggestedKeywords: sortedWords.slice(0, 8),
      suggestedTopic: category || 'general'
    };
  },

  /**
   * Fast client translation between Gujarati, Hindi, and English
   */
  async translateText(text: string, targetLang: 'gu' | 'hi' | 'en'): Promise<string> {
    if (!text || text.trim().length === 0) return '';

    try {
      // Use free web translation endpoint
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          return data[0].map((item: any) => item[0]).join('');
        }
      }
    } catch (e) {
      console.warn('Online translation error, returning original text:', e);
    }
    return text;
  }
};
