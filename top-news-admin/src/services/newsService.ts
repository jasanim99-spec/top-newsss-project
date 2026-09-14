import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { storageService } from '@/services/storageService';
import { NewsArticle, ApiResponse } from '@/types';
import { newsToFirestore, newsFromFirestore, generateSlug, parseDateToMillis, isLanguageMatch } from '@/utils/converters';

export { generateSlug };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('topnews_realtime_sync') : null;

export const newsService = {
  /**
   * Get paginated & filtered list of news articles from PostgreSQL REST API
   */
  async getNews(options: {
    page?: number;
    limit?: number;
    category?: string;
    topic?: string;
    language?: string;
    status?: 'draft' | 'pending' | 'published' | 'rejected' | 'all';
    authorId?: string;
    search?: string;
  } = {}): Promise<ApiResponse<NewsArticle>> {
    const pageNum = options.page || 1;
    const limitNum = options.limit || 10;

    const queryParams = new URLSearchParams();
    queryParams.append('page', pageNum.toString());
    queryParams.append('limit', limitNum.toString());
    if (options.category) queryParams.append('category', options.category);
    if (options.topic) queryParams.append('topic', options.topic);
    if (options.language) queryParams.append('language', options.language);
    if (options.status) queryParams.append('status', options.status);
    if (options.authorId) queryParams.append('authorId', options.authorId);
    if (options.search) queryParams.append('search', options.search);

    try {
      const res = await fetch(`${API_BASE_URL}/news?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          total: data.total || 0,
          page: data.page || pageNum,
          limit: data.limit || limitNum,
          articles: data.articles || []
        };
      }
    } catch (err) {
      console.warn('PostgreSQL API news fetch error, falling back to Firestore:', err);
    }

    // Fallback to Firestore if backend server is unreachable
    try {
      const newsColRef = collection(db, 'news');
      const querySnapshot = await getDocs(newsColRef);
      let articles = querySnapshot.docs
        .filter(d => d.data().status !== 'deleted')
        .map(d => newsFromFirestore(d, d.id));

      if (options.category && options.category.toLowerCase() !== 'all') {
        articles = articles.filter(a => (a.category || '').toLowerCase() === options.category!.toLowerCase());
      }
      if (options.status && options.status !== 'all') {
        articles = articles.filter(a => (a.status || 'published').toLowerCase() === options.status!.toLowerCase());
      }

      articles.sort((a, b) => parseDateToMillis(b.publishedAt) - parseDateToMillis(a.publishedAt));
      const total = articles.length;
      const paginated = articles.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return { total, page: pageNum, limit: limitNum, articles: paginated };
    } catch (e) {
      return { total: 0, page: pageNum, limit: limitNum, articles: [] };
    }
  },

  /**
   * Get single news article by ID or slug
   */
  async getNewsById(id: string): Promise<NewsArticle | null> {
    if (!id) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/news/${encodeURIComponent(id)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('PostgreSQL API getNewsById error:', err);
    }

    // Fallback check in Firestore
    try {
      const docRef = doc(db, 'news', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return newsFromFirestore(docSnap, docSnap.id);
      }
    } catch (e) { }

    return null;
  },

  /**
   * Create news article in PostgreSQL + dual Firestore update
   */
  async createNews(data: Partial<NewsArticle>): Promise<NewsArticle> {
    let createdArticle: NewsArticle | null = null;

    try {
      const res = await fetch(`${API_BASE_URL}/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        createdArticle = await res.json();
      }
    } catch (err) {
      console.warn('PostgreSQL API createNews error:', err);
    }

    const targetId = createdArticle?.id || data.id || data._id || ('news_' + Date.now());
    const fullArticle: NewsArticle = createdArticle || {
      ...data,
      id: targetId,
      _id: targetId,
      title: data.title ? data.title.trim() : '',
      slug: data.slug || generateSlug(data.title || ''),
      description: data.description || '',
      content: data.content || '',
      imageUrl: data.imageUrl || '',
      category: (data.category || 'general').toLowerCase().trim(),
      topic: (data.topic || 'general').toLowerCase().trim(),
      language: (data.language || 'en').toLowerCase().trim(),
      section: data.section || 'main',
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      status: data.status || 'published',
      views: 0,
      publishedAt: data.publishedAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Dual update to Firestore for backup compatibility
    try {
      const payload = newsToFirestore(fullArticle, true);
      await setDoc(doc(db, 'news', targetId), payload, { merge: true });
    } catch (e) { }

    if (syncChannel) {
      syncChannel.postMessage({ type: 'NEWS_UPDATED', article: fullArticle });
    }

    return fullArticle;
  },

  /**
   * Update existing news article in PostgreSQL + dual Firestore update
   */
  async updateNews(id: string, data: Partial<NewsArticle>): Promise<NewsArticle> {
    let updatedArticle: NewsArticle | null = null;

    try {
      const res = await fetch(`${API_BASE_URL}/news/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        updatedArticle = await res.json();
      } else {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Update failed with status ${res.status}`);
      }
    } catch (err) {
      console.warn('PostgreSQL API updateNews error:', err);
      throw err;
    }

    const finalArticle: NewsArticle = updatedArticle || ({ id, ...data } as NewsArticle);

    // Dual update to Firestore for backup compatibility
    try {
      const docRef = doc(db, 'news', id);
      const payload = newsToFirestore(finalArticle, false);
      await setDoc(docRef, payload, { merge: true });
    } catch (e) { }

    if (syncChannel) {
      syncChannel.postMessage({ type: 'NEWS_UPDATED', article: finalArticle });
    }

    return finalArticle;
  },

  /**
   * Delete news article in PostgreSQL + Storage cleanup + dual Firestore deletion
   */
  async deleteNews(id: string): Promise<void> {
    try {
      const news = await this.getNewsById(id);
      if (news && news.imageUrl) {
        try {
          await storageService.deleteNewsImage(news.imageUrl);
        } catch (e) { }
      }
    } catch (e) { }

    try {
      await fetch(`${API_BASE_URL}/news/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('PostgreSQL API deleteNews error:', err);
    }

    // Dual update to Firestore for backup compatibility
    try {
      const docRef = doc(db, 'news', id);
      await setDoc(docRef, { status: 'deleted', updatedAt: serverTimestamp() }, { merge: true });
      await deleteDoc(docRef);
    } catch (e) { }

    if (syncChannel) {
      syncChannel.postMessage({ type: 'NEWS_DELETED', id });
    }
  },

  /**
   * Publish news article
   */
  async publishNews(id: string): Promise<NewsArticle> {
    return this.updateNews(id, {
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Approve pending article from reporter
   */
  async approveNews(id: string, notes?: string): Promise<NewsArticle> {
    return this.updateNews(id, {
      status: 'published',
      publishedAt: new Date().toISOString(),
      editorialNotes: notes || 'Approved and published by editorial desk'
    });
  },

  /**
   * Reject article with feedback
   */
  async rejectNews(id: string, notes: string): Promise<NewsArticle> {
    return this.updateNews(id, {
      status: 'rejected',
      editorialNotes: notes
    });
  },

  /**
   * Request changes / revision from reporter
   */
  async requestRevision(id: string, notes: string): Promise<NewsArticle> {
    return this.updateNews(id, {
      status: 'rejected',
      editorialNotes: notes || 'Revision requested by editorial desk'
    });
  },

  /**
   * Unpublish news article (set to draft)
   */
  async unpublishNews(id: string): Promise<NewsArticle> {
    return this.updateNews(id, { status: 'draft' });
  },

  /**
   * Increment view count atomically
   */
  async incrementViews(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/news/${encodeURIComponent(id)}/views`, {
        method: 'PATCH'
      });
    } catch (e) { }

    try {
      const docRef = doc(db, 'news', id);
      await updateDoc(docRef, {
        views: increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (e) { }
  },

  /**
   * Dashboard statistics for news
   */
  async getNewsStats(): Promise<{
    total: number;
    published: number;
    pending: number;
    draft: number;
    rejected: number;
    totalViews: number;
    recent: NewsArticle[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/news/stats/dashboard`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('PostgreSQL API getNewsStats error:', err);
    }

    const fallback = await this.getNews({ limit: 500, status: 'all' });
    const articles = fallback.articles || [];
    return {
      total: articles.length,
      published: articles.filter(a => a.status === 'published').length,
      pending: articles.filter(a => a.status === 'pending').length,
      draft: articles.filter(a => a.status === 'draft').length,
      rejected: articles.filter(a => a.status === 'rejected').length,
      totalViews: articles.reduce((acc, curr) => acc + (curr.views || 0), 0),
      recent: articles.slice(0, 5)
    };
  },

  /**
   * Get reporter statistics
   */
  async getReporterStats(authorId: string): Promise<{
    total: number;
    published: number;
    pending: number;
    draft: number;
    rejected: number;
    totalViews: number;
    recent: NewsArticle[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/news/stats/reporter/${encodeURIComponent(authorId)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('PostgreSQL API getReporterStats error:', err);
    }

    const fallback = await this.getNews({ authorId, limit: 1000, status: 'all' });
    const articles = fallback.articles || [];
    return {
      total: articles.length,
      published: articles.filter(a => a.status === 'published').length,
      pending: articles.filter(a => a.status === 'pending').length,
      draft: articles.filter(a => a.status === 'draft').length,
      rejected: articles.filter(a => a.status === 'rejected').length,
      totalViews: articles.reduce((acc, curr) => acc + (curr.views || 0), 0),
      recent: articles.slice(0, 5)
    };
  }
};
