import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  increment,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { NewsArticle, NewsResponse } from '@/store/newsStore';
import { parseDateToMillis, isLanguageMatch, getCreatedNewsArticles, getDeletedNewsIds } from '@/utils/converters';
import { mockArticles } from '@/data/mockNews';

const API_BASE_URL = 'http://localhost:3000';
const NEWS_COLLECTION = 'news';

const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('topnews_realtime_sync') : null;
if (syncChannel) {
  syncChannel.onmessage = (event) => {
    if (event.data && (event.data.type === 'NEWS_UPDATED' || event.data.type === 'NEWS_DELETED')) {
      window.dispatchEvent(new CustomEvent('topnews_realtime_refetch'));
    }
  };
}

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

export const newsService = {
  /**
   * Fetch published news with optional filtering & pagination from PostgreSQL REST API
   */
  async getPublishedNews(options: {
    language?: string;
    category?: string;
    topic?: string;
    section?: string;
    limitNum?: number;
    startAfterDoc?: any;
  } = {}): Promise<NewsResponse> {
    const pageSize = options.limitNum || 20;

    const queryParams = new URLSearchParams();
    queryParams.append('status', 'published');
    queryParams.append('limit', pageSize.toString());
    if (options.category) queryParams.append('category', options.category);
    if (options.topic) queryParams.append('topic', options.topic);
    if (options.language) queryParams.append('language', options.language);
    if (options.section) queryParams.append('section', options.section);

    try {
      const res = await fetch(`${API_BASE_URL}/news?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          total: data.total || 0,
          page: data.page || 1,
          limit: data.limit || pageSize,
          articles: data.articles || []
        };
      }
    } catch (err) {
      console.warn('PostgreSQL API news fetch notice, falling back to Firestore:', err);
    }

    // Fallback to Firestore
    try {
      const newsColRef = collection(db, NEWS_COLLECTION);
      const querySnapshot = await getDocs(newsColRef);
      let articles = querySnapshot.docs
        .map(docSnap => mapDocToNewsArticle(docSnap, docSnap.id))
        .filter(a => (a.status || 'published') === 'published');

      if (options.category && options.category !== 'all') {
        articles = articles.filter(a => (a.category || '').toLowerCase() === options.category!.toLowerCase());
      }
      if (options.topic) {
        articles = articles.filter(a => (a.topic || '').toLowerCase() === options.topic!.toLowerCase());
      }
      if (options.language) {
        articles = articles.filter(a => isLanguageMatch(a.language || 'en', options.language));
      }

      articles.sort((a, b) => parseDateToMillis(b.publishedAt) - parseDateToMillis(a.publishedAt));

      return {
        total: articles.length,
        page: 1,
        limit: pageSize,
        articles: articles.slice(0, pageSize)
      };
    } catch (e) {
      return { total: 0, page: 1, limit: pageSize, articles: mockArticles.slice(0, pageSize) };
    }
  },

  /**
   * Fetch article by ID or Slug from PostgreSQL REST API
   */
  async getNewsById(id: string): Promise<NewsArticle | null> {
    if (!id) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/news/${encodeURIComponent(id)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('PostgreSQL API getNewsById notice:', err);
    }

    try {
      const docRef = doc(db, NEWS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return mapDocToNewsArticle(docSnap, docSnap.id);
      }
    } catch (e) { }

    return null;
  },

  /**
   * Fetch article by slug from PostgreSQL REST API
   */
  async getNewsBySlug(slug: string): Promise<NewsArticle | null> {
    return this.getNewsById(slug);
  },

  async getNewsByCategory(category: string, language?: string, limitNum = 12): Promise<NewsResponse> {
    return this.getPublishedNews({ category, language, limitNum });
  },

  async getNewsByTopic(topic: string, language?: string, limitNum = 12): Promise<NewsResponse> {
    return this.getPublishedNews({ topic, language, limitNum });
  },

  async getNewsByLanguage(language: string, limitNum = 12): Promise<NewsResponse> {
    return this.getPublishedNews({ language, limitNum });
  },

  async getFeaturedNews(language?: string, limitNum = 6): Promise<NewsResponse> {
    return this.getPublishedNews({ language, limitNum });
  },

  async getTrendingNews(language?: string, limitNum = 10): Promise<NewsResponse> {
    return this.getPublishedNews({ language, limitNum });
  },

  async getMostReadNews(language?: string, limitNum = 10): Promise<NewsResponse> {
    return this.getTrendingNews(language, limitNum);
  },

  /**
   * Search service via PostgreSQL REST API
   */
  async searchNews(searchQuery: string, language?: string, limitNum = 20): Promise<NewsResponse> {
    if (!searchQuery || !searchQuery.trim()) {
      return { total: 0, page: 1, limit: limitNum, articles: [] };
    }

    const queryParams = new URLSearchParams();
    queryParams.append('search', searchQuery.trim());
    queryParams.append('limit', limitNum.toString());
    if (language) queryParams.append('language', language);

    try {
      const res = await fetch(`${API_BASE_URL}/news?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          total: data.total || 0,
          page: data.page || 1,
          limit: data.limit || limitNum,
          articles: data.articles || []
        };
      }
    } catch (err) {
      console.warn('PostgreSQL API searchNews notice:', err);
    }

    return this.getPublishedNews({ language, limitNum });
  },

  /**
   * Increment article views in PostgreSQL REST API + Firestore
   */
  async incrementNewsViews(id: string): Promise<void> {
    if (!id) return;

    try {
      await fetch(`${API_BASE_URL}/news/${encodeURIComponent(id)}/views`, {
        method: 'PATCH'
      });
    } catch (e) { }

    try {
      const docRef = doc(db, NEWS_COLLECTION, id);
      await updateDoc(docRef, {
        views: increment(1)
      });
    } catch (e) { }
  },

  async getRelatedNews(article: NewsArticle, limitNum = 4): Promise<NewsArticle[]> {
    try {
      const categoryRes = await this.getNewsByCategory(article.category, article.language, limitNum + 2);
      const filtered = categoryRes.articles.filter(a => a._id !== article._id && a.slug !== article.slug);
      return filtered.slice(0, limitNum);
    } catch (error) {
      return [];
    }
  }
};
