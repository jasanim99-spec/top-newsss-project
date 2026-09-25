import { useNewsStore } from '@/store/newsStore';
import { translateText } from '@/services/translationService';
import { useState, useEffect } from 'react';

export const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  // Navigation & Categories (All Casing Variations)
  'HOME': { en: 'HOME', gu: 'હોમ', hi: 'होम', pa: 'ਹੋਮ', zh: '首页', ru: 'ГЛАВНАЯ' },
  'Home': { en: 'Home', gu: 'હોમ', hi: 'होम', pa: 'ਹੋਮ', zh: '首页', ru: 'Главная' },
  'home': { en: 'Home', gu: 'હોમ', hi: 'होम', pa: 'ਹੋਮ', zh: '首页', ru: 'Главная' },

  'WORLD': { en: 'WORLD', gu: 'વિશ્વ', hi: 'विश्व', pa: 'ਵਿਸ਼ਵ', zh: '国际', ru: 'МИР' },
  'World': { en: 'World', gu: 'વિશ્વ', hi: 'विश्व', pa: 'ਵਿਸ਼ਵ', zh: '国际', ru: 'Мир' },
  'world': { en: 'World', gu: 'વિશ્વ', hi: 'विश्व', pa: 'ਵਿਸ਼ਵ', zh: '国际', ru: 'Мир' },

  'POLITICS': { en: 'POLITICS', gu: 'રાજકારણ', hi: 'राजनीति', pa: 'ਰਾਜਨੀਤੀ', zh: '政治', ru: 'ПОЛИТИКА' },
  'Politics': { en: 'Politics', gu: 'રાજકારણ', hi: 'राजनीति', pa: 'ਰਾਜਨੀਤੀ', zh: '政治', ru: 'Политика' },
  'politics': { en: 'Politics', gu: 'રાજકારણ', hi: 'राजनीति', pa: 'ਰਾਜਨੀਤੀ', zh: '政治', ru: 'Политика' },

  'BUSINESS': { en: 'BUSINESS', gu: 'વ્યવસાય', hi: 'व्यापार', pa: 'ਕਾਰੋਬਾਰ', zh: '财经', ru: 'БИЗНЕС' },
  'Business': { en: 'Business', gu: 'વ્યવસાય', hi: 'व्यापार', pa: 'ਕਾਰੋਬਾਰ', zh: '财经', ru: 'Бизнес' },
  'business': { en: 'Business', gu: 'વ્યવસાય', hi: 'व्यापार', pa: 'ਕਾਰੋਬਾਰ', zh: '财经', ru: 'Бизнес' },

  'TECHNOLOGY': { en: 'TECHNOLOGY', gu: 'ટેકનોલોજી', hi: 'तकनीक', pa: 'ਤਕਨਾਲੋਜੀ', zh: '科技', ru: 'ТЕХНОЛОГИИ' },
  'Technology': { en: 'Technology', gu: 'ટેકનોલોજી', hi: 'तकनीक', pa: 'ਤਕਨਾਲੋਜੀ', zh: '科技', ru: 'Технологии' },
  'technology': { en: 'Technology', gu: 'ટેકનોલોજી', hi: 'तकનીક', pa: 'ਤਕਨਾਲੋਜੀ', zh: '科技', ru: 'Технологии' },

  'SPORTS': { en: 'SPORTS', gu: 'રમતગમત', hi: 'खेल', pa: 'ਖੇਡਾਂ', zh: '体育', ru: 'СПОРТ' },
  'Sports': { en: 'Sports', gu: 'રમતગમત', hi: 'खेल', pa: 'ਖੇਡਾਂ', zh: '体育', ru: 'Спорт' },
  'sports': { en: 'Sports', gu: 'રમતગમત', hi: 'खेल', pa: 'ਖੇਡਾਂ', zh: '体育', ru: 'Спорт' },

  'ENTERTAINMENT': { en: 'ENTERTAINMENT', gu: 'મનોરંજન', hi: 'मनोरंजन', pa: 'ਮਨੋਰੰਜਨ', zh: '娱乐', ru: 'РАЗВЛЕЧЕНИЯ' },
  'Entertainment': { en: 'Entertainment', gu: 'મનોરંજન', hi: 'मनोरंजन', pa: 'ਮਨੋਰੰਜਨ', zh: '娱乐', ru: 'Развлечения' },
  'entertainment': { en: 'Entertainment', gu: 'મનોરંજન', hi: 'मनोरंजन', pa: 'ਮਨੋਰੰਜਨ', zh: '娱乐', ru: 'Развлечения' },

  'HEALTH': { en: 'HEALTH', gu: 'આરોગ્ય', hi: 'स्वास्थ्य', pa: 'ਸਿਹਤ', zh: '健康', ru: 'ЗДОРОВЬЕ' },
  'Health': { en: 'Health', gu: 'આરોગ્ય', hi: 'स्वास्थ्य', pa: 'ਸਿਹਤ', zh: '健康', ru: 'Здоровье' },
  'health': { en: 'Health', gu: 'આરોગ્ય', hi: 'स्वास्थ्य', pa: 'ਸਿਹਤ', zh: '健康', ru: 'Здоровье' },

  'OPINION': { en: 'OPINION', gu: 'અભિપ્રાય', hi: 'विचार', pa: 'ਰਾਏ', zh: '观点', ru: 'МНЕНИЯ' },
  'Opinion': { en: 'Opinion', gu: 'અભિપ્રાય', hi: 'विचार', pa: 'ਰਾਏ', zh: '观点', ru: 'Мнение' },
  'opinion': { en: 'Opinion', gu: 'અભિપ્રાય', hi: 'विचार', pa: 'ਰਾਏ', zh: '观点', ru: 'Мнение' },

  'VIDEOS': { en: 'VIDEOS', gu: 'વીડિયો', hi: 'वीडियो', pa: 'ਵੀਡੀਓ', zh: '视频', ru: 'ВИДЕО' },
  'Videos': { en: 'Videos', gu: 'વીડિયો', hi: 'वीडियो', pa: 'ਵੀਡੀਓ', zh: '视频', ru: 'Видео' },
  'videos': { en: 'Videos', gu: 'વીડિયો', hi: 'वीडियो', pa: 'ਵੀਡੀਓ', zh: '视频', ru: 'Видео' },

  // Footer Quick Links & Variations
  'About Us': { en: 'About Us', gu: 'અમારા વિશે', hi: 'हमारे बारे में', pa: 'ਸਾਡੇ ਬਾਰੇ', zh: '关于我们', ru: 'О нас' },
  'About': { en: 'About Us', gu: 'અમારા વિશે', hi: 'हमारे बारे में', pa: 'ਸਾਡੇ ਬਾਰੇ', zh: '关于我们', ru: 'О нас' },

  'Contact Us': { en: 'Contact Us', gu: 'સંપર્ક કરો', hi: 'संपर्क करें', pa: 'ਸੰਪਰਕ ਕਰੋ', zh: '联系我们', ru: 'Контакты' },
  'Contact': { en: 'Contact Us', gu: 'સંપર્ક કરો', hi: 'संपर्क करें', pa: 'ਸੰਪਰਕ ਕਰੋ', zh: '联系 festival', ru: 'Контакты' },

  'Advertise With Us': { en: 'Advertise With Us', gu: 'અમારી સાથે જાહેરાત કરો', hi: 'हमारे साथ विज्ञापन दें', pa: 'ਸਾਡੇ ਨਾਲ ਵਿਗਿਆਪਨ ਦਿਓ', zh: '联系我们投放广告', ru: 'Реклама у нас' },
  'Advertise': { en: 'Advertise', gu: 'જાહેરાત કરો', hi: 'विज्ञापन दें', pa: 'ਇਸ਼ਤਿਹਾਰ ਦਿਓ', zh: '投放广告', ru: 'Реклама' },
  'Post Ad': { en: 'Post Ad', gu: 'જાહેરાત આપો', hi: 'विज्ञापन दें', pa: 'ਇਸ਼તਿਹਾਰ ਦਿਓ', zh: '发布广告', ru: 'Разместить рекламу' },

  'Privacy Policy': { en: 'Privacy Policy', gu: 'ગોપનીયતા નીતિ', hi: 'गोपनीयता नीति', pa: 'ਗੋਪਨੀਯਤਾ ਨੀਤੀ', zh: '隐私政策', ru: 'Политика конфиденциальности' },
  'Terms of Service': { en: 'Terms of Service', gu: 'સેવાની શરતો', hi: 'सेवा की शर्तें', pa: 'ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ', zh: '服务条款', ru: 'Условия использования' },
  'Terms of Use': { en: 'Terms of Use', gu: 'ઉપયોગની શરતો', hi: 'उपयोग की शर्तें', pa: 'ਵਰਤੋਂ ਦੀਆਂ ਸ਼ਰਤਾਂ', zh: '使用条款', ru: 'Условия использования' },
  'Sitemap': { en: 'Sitemap', gu: 'સાઇટમેપ', hi: 'साइटमैप', pa: 'ਸਾਈਟਮੈਪ', zh: '网站地图', ru: 'Карта сайта' },

  // Headings & Labels
  'Featured Stories': { en: 'Featured Stories', gu: 'મુખ્ય સમાચાર', hi: 'प्रमुख कहानियां', pa: 'ਖਾਸ ਖਬਰਾਂ', zh: '精选故事', ru: 'Главные новости' },
  'Trending News': { en: 'Trending News', gu: 'ટ્રેન્ડિંગ સમાચાર', hi: 'ट्रेंडिंग न्यूज़', pa: 'ਟਰੈਂਡਿੰਗ ਖਬਰਾਂ', zh: '热门新闻', ru: 'В тренде' },
  'Trending Now': { en: 'Trending Now', gu: 'હમણાં ટ્રેન્ડિંગ', hi: 'अभी ट्रेंडिंग', pa: 'ਹੁਣੇ ਟਰੈਂਡਿੰਗ', zh: '当前热门', ru: 'Сейчас в тренде' },
  'Latest News': { en: 'Latest News', gu: 'તાજા સમાચાર', hi: 'ताज़ा ख़बरें', pa: 'ਤਾਜ਼ਾ ਖਬਰਾਂ', zh: '最新新闻', ru: 'Последние новости' },
  'BREAKING NEWS': { en: 'BREAKING NEWS', gu: 'તાજા સમાચાર', hi: 'ब्रेकिंग न्यूज़', pa: 'ਤਾਜ਼ਾ ਖ਼ਬਰਾਂ', zh: '突发新闻', ru: 'ПОСЛЕДНИЕ НОВОСТИ' },
  'Breaking News': { en: 'Breaking News', gu: 'તાજા સમાચાર', hi: 'ब्रेकिंग न्यूज़', pa: 'ਤਾਜ਼ਾ ਖ਼ਬਰਾਂ', zh: '突发新闻', ru: 'Последние новости' },
  'Live Updates': { en: 'Live Updates', gu: 'લાઈવ અપડેટ્સ', hi: 'लाइव अपडेट', pa: 'ਲਾਈਵ ਅੱਪਡੇਟ', zh: '实时更新', ru: 'Прямой эфир' },
  'More News': { en: 'More News', gu: 'વધુ સમાચાર', hi: 'और समाचार', pa: 'ਹੋਰ ਖਬਰਾਂ', zh: '更多新闻', ru: 'Больше новостей' },
  'Quick Links': { en: 'Quick Links', gu: 'ઝડપી લિંક્સ', hi: 'त्वरित लिंक', pa: 'ਤੁਰੰત ਲਿੰਕ', zh: '快速链接', ru: 'Быстрые ссылки' },
  'Categories': { en: 'Categories', gu: 'શ્રેણીઓ', hi: 'श्रेणियां', pa: 'ਸ਼੍ਰੇਣੀਆਂ', zh: '分类', ru: 'Категории' },
  'Category': { en: 'Category', gu: 'કેટેગરી', hi: 'श्रेणी', pa: 'ਸ਼੍ਰੇਣੀ', zh: '分类', ru: 'Категория' },
  'Search': { en: 'Search', gu: 'શોધો', hi: 'खोजें', pa: 'ਖੋਜੋ', zh: '搜索', ru: 'Поиск' },
  'Search...': { en: 'Search...', gu: 'શોધો...', hi: 'खोजें...', pa: 'ਖੋਜੋ...', zh: '搜索...', ru: 'Поиск...' },
  'Search news...': { en: 'Search news...', gu: 'સમાચાર શોધો...', hi: 'समाचार खोजें...', pa: 'ਖਬਰਾਂ ਖੋਜੋ...', zh: '搜索新闻...', ru: 'Поиск новостей...' },
  'Search Results': { en: 'Search Results', gu: 'શોધ પરિણામો', hi: 'खोज परिणाम', pa: 'ਖੋਜ ਨਤੀਜੇ', zh: '搜索结果', ru: 'Результаты поиска' },
  'No articles found': { en: 'No articles found', gu: 'કોઈ લેખ મળ્યા નથી', hi: 'कोई लेख नहीं मिला', pa: 'ਕੋਈ ਲੇਖ ਨਹੀਂ ਮਿਲਿਆ', zh: '未找到文章', ru: 'Статьи не найдены' },
  'Follow Us': { en: 'Follow Us', gu: 'અમને અનુસરો', hi: 'हमें फॉलो करें', pa: 'ਸਾਡੇ ਨਾਲ ਜੁੜੋ', zh: '关注我们', ru: 'Подписывайтесь на нас' },
  'All Rights Reserved': { en: 'All Rights Reserved', gu: 'સર્વાધિકાર સુરક્ષિત', hi: 'सर्वाधिकार सुरक्षित', pa: 'ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ ਹਨ', zh: '保留所有权利', ru: 'Все права защищены' },
  'Read More': { en: 'Read More', gu: 'વધુ વાંચો', hi: 'और पढ़ें', pa: 'ਹੋਰ ਪੜ੍ਹੋ', zh: '阅读更多', ru: 'Читать далее' },
  'Share': { en: 'Share', gu: 'શેર કરો', hi: 'शेयर करें', pa: 'ਸਾਂਝા કરો', zh: '分享', ru: 'Поделиться' },
  'Views': { en: 'Views', gu: 'વ્યૂઝ', hi: 'दृश्य', pa: 'ਦੇਖੇ ਗਏ', zh: '浏览量', ru: 'Просмотров' },
  'views': { en: 'views', gu: 'વ્યૂઝ', hi: 'दृश्य', pa: 'ਦੇਖੇ ਗਏ', zh: '浏览量', ru: 'Просмотров' },
  'Published': { en: 'Published', gu: 'પ્રકાશિત', hi: 'प्रकाशित', pa: 'ਪ੍ਰਕਾਸ਼ਿਤ', zh: '发布于', ru: 'Опубликовано' },
  'Related Stories': { en: 'Related Stories', gu: 'સંબંધિત સમાચાર', hi: 'संबंधित कहानियां', pa: 'ਸੰਬੰਧਿਤ ਖਬਰਾਂ', zh: '相关故事', ru: 'Похожие новости' },
  'Top Videos': { en: 'Top Videos', gu: 'મુખ્ય વીડિયો', hi: 'शीर्ष वीडियो', pa: 'ਟੌਪ ਵੀਡੀਓ', zh: '热门视频', ru: 'Популярные видео' },
  'Watch': { en: 'Watch', gu: 'જુઓ', hi: 'देखें', pa: 'ਦੇਖੋ', zh: '观看', ru: 'Смотреть' },
  'Explore': { en: 'Explore', gu: 'શોધો', hi: 'एक्सप्लोर करें', pa: 'ਐਕਸਪਲੋਰ ਕਰੋ', zh: '探索', ru: 'Исследовать' },
  'Navigation': { en: 'Navigation', gu: 'નેવિગેશન', hi: 'नेविगेशन', pa: 'ਨੇਵੀਗੇਸ਼ਨ', zh: '导航', ru: 'Навигация' },
  'MORE': { en: 'MORE', gu: 'વધુ', hi: 'अधिक', pa: 'ਹੋਰ', zh: '更多', ru: 'ЕЩЕ' },
  'More': { en: 'More', gu: 'વધુ', hi: 'अधिक', pa: 'ਹੋਰ', zh: '更多', ru: 'Еще' },
  'Weather': { en: 'Weather', gu: 'હવામાન', hi: 'मौसम', pa: 'ਮੌਸਮ', zh: '天气', ru: 'Погода' },
  'Partly Cloudy': { en: 'Partly Cloudy', gu: 'અંશતઃ વાદળછાયું', hi: 'आंशिक रूप से बादल', pa: 'ਅੰਸ਼ਕ ਤੌਰ ਤੇ ਬੱਦਲਵਾਈ', zh: '局部多云', ru: 'Переменная облачность' },

  // Footer Brand Paragraph
  'Your premier destination for breaking news, insightful analysis, and comprehensive coverage of global events. Stay ahead with real-time updates and trusted journalism.': {
    en: 'Your premier destination for breaking news, insightful analysis, and comprehensive coverage of global events. Stay ahead with real-time updates and trusted journalism.',
    gu: 'તાજા સમાચાર, ઊંડાણપૂર્વકના વિશ્લેષણ અને વૈશ્વિક ઘટનાઓના વ્યાપક કવરેજ માટે તમારું મુખ્ય સરનામું. રીઅલ-ટાઇમ અપડેટ્સ અને વિશ્વસનીય પત્રકારત્વ સાથે આગળ રહો.',
    hi: 'ताज़ा समाचारों, गहन विश्लेषण और वैश्विक घटनाओं के व्यापक कवरेज के लिए आपका प्रमुख गंतव्य। वास्तविक समय के अपडेट और विश्वसनीय पत्रकारिता के साथ आगे रहें।',
    pa: 'ਤਾਜ਼ਾ ਖਬਰਾਂ, ਡੂੰਘਾਈ ਨਾਲ ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਗਲੋਬਲ ਘਟਨਾਵਾਂ ਦੀ ਵਿਆਪਕ ਕਵਰੇਜ ਲਈ ਤੁਹਾਡੀ ਮੁੱਖ ਜਗ੍ਹਾ। ਰੀਅਲ-ਟਾਈਮ ਅਪਡੇਟਸ ਨਾਲ ਅੱਗੇ ਰਹੋ।',
    zh: '您获取突发新闻、深入分析和全球事件全面报道的首选之地。',
    ru: 'Ваш главный источник последних новостей, глубокого анализа и всестороннего освещения мировых событий.'
  }
};

/**
 * Smart lookup function with case-insensitive and trimmed fallback.
 */
export function getUITranslation(key: string, lang: string): string {
  if (!key || !lang || lang === 'en') return key;

  const trimmed = key.trim();

  // 1. Direct key match
  if (UI_TRANSLATIONS[trimmed] && UI_TRANSLATIONS[trimmed][lang]) {
    return UI_TRANSLATIONS[trimmed][lang];
  }

  // 2. Case-insensitive key lookup
  const lowerKey = trimmed.toLowerCase();
  for (const dictKey of Object.keys(UI_TRANSLATIONS)) {
    if (dictKey.toLowerCase() === lowerKey && UI_TRANSLATIONS[dictKey][lang]) {
      return UI_TRANSLATIONS[dictKey][lang];
    }
  }

  return key;
}

/**
 * Custom React Hook for UI Translation that stays reactive to currentLanguage
 */
export function useUITranslator() {
  const currentLanguage = useNewsStore((state) => state.currentLanguage);

  const t = (key: string): string => {
    return getUITranslation(key, currentLanguage);
  };

  return { t, currentLanguage };
}

/**
 * Hook to translate long dynamic sentences asynchronously (e.g. paragraphs or custom titles)
 */
export function useAsyncTranslation(text: string): string {
  const currentLanguage = useNewsStore((state) => state.currentLanguage);
  const [translatedText, setTranslatedText] = useState(() => getUITranslation(text, currentLanguage));

  useEffect(() => {
    if (!text || currentLanguage === 'en') {
      setTranslatedText(text);
      return;
    }

    const dictMatch = getUITranslation(text, currentLanguage);
    if (dictMatch !== text) {
      setTranslatedText(dictMatch);
      return;
    }

    let isMounted = true;
    translateText(text, currentLanguage).then((res) => {
      if (isMounted && res) {
        setTranslatedText(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [text, currentLanguage]);

  return translatedText;
}
