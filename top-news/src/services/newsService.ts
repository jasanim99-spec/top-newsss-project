import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  increment,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  startAfter
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { NewsArticle, NewsResponse } from '@/store/newsStore';
import { parseDateToMillis, isLanguageMatch, getCreatedNewsArticles, getDeletedNewsIds } from '@/utils/converters';
import { mockArticles } from '@/data/mockNews';

const NEWS_COLLECTION = 'news';

// Helper to convert Firestore document to NewsArticle with clean dates
const mapDocToNewsArticle = (docSnap: QueryDocumentSnapshot<DocumentData> | DocumentData, id: string): NewsArticle => {
  const data = docSnap.data ? docSnap.data() : docSnap;
  
  const formatDate = (val: any): string => {
    if (!val) return new Date().toISOString();
    if (val instanceof Timestamp) return val.toDate().toISOString();
    if (typeof val === 'object' && 'seconds' in val) {
      return new Date(val.seconds * 1000).toISOString();
    }
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return new Date(val).toISOString();
    return new Date().toISOString();
  };

  return {
    _id: id,
    id: id,
    title: data.title || '',
    slug: data.slug || '',
    description: data.description || '',
    content: data.content || '',
    imageUrl: data.imageUrl || '',
    category: data.category || '',
    topic: data.topic || '',
    language: data.language || 'en',
    section: data.section || 'main',
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    sourceUrl: data.sourceUrl || '',
    views: typeof data.views === 'number' ? data.views : 0,
    publishedAt: formatDate(data.publishedAt),
    createdAt: formatDate(data.createdAt),
    updatedAt: formatDate(data.updatedAt),
    status: data.status || 'published',
  };
};

const DELETED_NEWS_KEY = 'topnews_deleted_news_ids';

const getDeletedNewsIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DELETED_NEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const CREATED_NEWS_KEY = 'topnews_created_news_articles';

const getCreatedNewsArticles = (): NewsArticle[] => {
  try {
    const raw = localStorage.getItem(CREATED_NEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const newsService = {
  // Fetch published news with optional filtering & pagination
  async getPublishedNews(options: {
    language?: string;
    category?: string;
    topic?: string;
    limitNum?: number;
    startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
  } = {}): Promise<NewsResponse> {
    const pageSize = options.limitNum || 20;

    try {
      let firestoreArticles: NewsArticle[] = [];
      try {
        const newsColRef = collection(db, NEWS_COLLECTION);
        const querySnapshot = await getDocs(newsColRef);
        firestoreArticles = querySnapshot.docs.map(docSnap => mapDocToNewsArticle(docSnap, docSnap.id));
      } catch (e) {}

      let backendArticles: NewsArticle[] = [];
      try {
        const res = await fetch('http://localhost:3000/news');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.articles)) {
            backendArticles = data.articles;
          } else if (Array.isArray(data)) {
            backendArticles = data;
          }
        }
      } catch (e) {}

      let settingsDeletedIds: string[] = [];
      let settingsCreatedArticles: NewsArticle[] = [];
      try {
        const setRes = await fetch('http://localhost:3000/settings');
        if (setRes.ok) {
          const setData = await setRes.json();
          if (Array.isArray(setData.deletedNewsIds)) settingsDeletedIds = setData.deletedNewsIds;
          if (Array.isArray(setData.createdArticles)) settingsCreatedArticles = setData.createdArticles;
        }
      } catch (e) {}

      const localCreated = getCreatedNewsArticles();
      const deletedIds = getDeletedNewsIds();

      const articleMap = new Map<string, NewsArticle>();
      firestoreArticles.forEach(a => { if (a.id || a._id) articleMap.set((a.id || a._id)!, a); });
      backendArticles.forEach(a => { if (a.id || a._id) articleMap.set((a.id || a._id)!, a); });
      settingsCreatedArticles.forEach(a => { if (a.id || a._id) articleMap.set((a.id || a._id)!, a); });
      localCreated.forEach(a => { if (a.id || a._id) articleMap.set((a.id || a._id)!, a); });

      // Fallback to mockArticles only if no other articles exist anywhere
      if (articleMap.size === 0) {
        mockArticles.forEach(a => { if (a.id || a._id) articleMap.set((a.id || a._id)!, a); });
      }

      let articles = Array.from(articleMap.values());

      // Filter published and non-deleted
      articles = articles.filter(a =>
        ((a.status || 'published').toLowerCase() === 'published' || (a.status as any) === 'approved') &&
        !deletedIds.includes(a.id || a._id || '') &&
        !settingsDeletedIds.includes(a.id || a._id || '')
      );

      if (options.language) {
        articles = articles.filter(a => isLanguageMatch(a.language || 'en', options.language));
      }

      if (options.category && options.category !== 'all') {
        articles = articles.filter(a => (a.category || '').toLowerCase() === options.category?.toLowerCase());
      }

      if (options.topic) {
        articles = articles.filter(a => (a.topic || '').toLowerCase() === options.topic?.toLowerCase());
      }

      // Sort by publishedAt desc
      articles.sort((a, b) => parseDateToMillis(b.publishedAt) - parseDateToMillis(a.publishedAt));

      const paginated = articles.slice(0, pageSize);

      return {
        total: articles.length,
        page: 1,
        limit: pageSize,
        articles: paginated
      };
    } catch (error) {
      console.error('Error fetching published news from Firestore:', error);
      return { total: 0, page: 1, limit: pageSize, articles: [] };
    }
  },

  // Fetch article by ID
  async getNewsById(id: string): Promise<NewsArticle | null> {
    try {
      const res = await this.getPublishedNews({ limitNum: 1000 });
      const article = res.articles.find(a => a.id === id || a._id === id || a.slug === id);
      if (article) {
        return article;
      }
      const docRef = doc(db, NEWS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return mapDocToNewsArticle(docSnap, docSnap.id);
      }
      return null;
    } catch (error) {
      console.error(`Error fetching news by ID (${id}):`, error);
      return null;
    }
  },

  // Fetch article by slug
  async getNewsBySlug(slug: string): Promise<NewsArticle | null> {
    try {
      const res = await this.getPublishedNews({ limitNum: 1000 });
      const article = res.articles.find(a => a.slug === slug || a.id === slug || a._id === slug);
      if (article) {
        return article;
      }
      const newsColRef = collection(db, NEWS_COLLECTION);
      const querySnapshot = await getDocs(newsColRef);
      const docSnap = querySnapshot.docs.find(d => d.data().slug === slug || d.id === slug);

      if (docSnap) {
        return mapDocToNewsArticle(docSnap, docSnap.id);
      }
      return null;
    } catch (error) {
      console.error(`Error fetching news by slug (${slug}):`, error);
      return null;
    }
  },

  // Fetch news by category
  async getNewsByCategory(category: string, language?: string, limitNum = 12): Promise<NewsResponse> {
    return this.getPublishedNews({ category, language, limitNum });
  },

  // Fetch news by topic
  async getNewsByTopic(topic: string, language?: string, limitNum = 12): Promise<NewsResponse> {
    return this.getPublishedNews({ topic, language, limitNum });
  },

  // Fetch news by language
  async getNewsByLanguage(language: string, limitNum = 12): Promise<NewsResponse> {
    return this.getPublishedNews({ language, limitNum });
  },

  // Fetch featured news
  async getFeaturedNews(language?: string, limitNum = 6): Promise<NewsResponse> {
    return this.getPublishedNews({ language, limitNum });
  },

  // Fetch trending news
  async getTrendingNews(language?: string, limitNum = 10): Promise<NewsResponse> {
    return this.getPublishedNews({ language, limitNum });
  },

  // Fetch most read news
  async getMostReadNews(language?: string, limitNum = 10): Promise<NewsResponse> {
    return this.getTrendingNews(language, limitNum);
  },

  // Search service
  async searchNews(searchQuery: string, language?: string, limitNum = 20): Promise<NewsResponse> {
    if (!searchQuery || !searchQuery.trim()) {
      return { total: 0, page: 1, limit: limitNum, articles: [] };
    }

    try {
      const publishedRes = await this.getPublishedNews({ language, limitNum: 50 });
      const qLower = searchQuery.toLowerCase().trim();

      const matched = publishedRes.articles.filter(article => {
        return (
          article.title.toLowerCase().includes(qLower) ||
          article.description.toLowerCase().includes(qLower) ||
          article.keywords.some(k => k.toLowerCase().includes(qLower)) ||
          article.tags.some(t => t.toLowerCase().includes(qLower)) ||
          article.category.toLowerCase().includes(qLower) ||
          article.topic.toLowerCase().includes(qLower)
        );
      });

      return {
        total: matched.length,
        page: 1,
        limit: limitNum,
        articles: matched.slice(0, limitNum)
      };
    } catch (error) {
      console.error('Error performing search:', error);
      return { total: 0, page: 1, limit: limitNum, articles: [] };
    }
  },

  // Safely increment article views using atomic Firestore increment
  async incrementNewsViews(id: string): Promise<void> {
    if (!id) return;
    try {
      const docRef = doc(db, NEWS_COLLECTION, id);
      await updateDoc(docRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error(`Error incrementing views for article ${id}:`, error);
    }
  },

  // Get related news excluding current article ID
  async getRelatedNews(article: NewsArticle, limitNum = 4): Promise<NewsArticle[]> {
    try {
      const categoryRes = await this.getNewsByCategory(article.category, article.language, limitNum + 2);
      const filtered = categoryRes.articles.filter(a => a._id !== article._id && a.slug !== article.slug);
      return filtered.slice(0, limitNum);
    } catch (error) {
      console.error('Error fetching related news:', error);
      return [];
    }
  }
};
