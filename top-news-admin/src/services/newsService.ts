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
  increment,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { storageService } from '@/services/storageService';
import { NewsArticle, ApiResponse } from '@/types';
import { newsToFirestore, newsFromFirestore, generateSlug, parseDateToMillis, isLanguageMatch } from '@/utils/converters';

export { generateSlug };

const DELETED_NEWS_KEY = 'topnews_deleted_news_ids';
const CREATED_NEWS_KEY = 'topnews_created_news_articles';

export const getDeletedNewsIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DELETED_NEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addDeletedNewsId = (id: string) => {
  try {
    const current = getDeletedNewsIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(DELETED_NEWS_KEY, JSON.stringify(current));
    }
  } catch (e) { }
};

export const getCreatedNewsArticles = (): NewsArticle[] => {
  try {
    const raw = localStorage.getItem(CREATED_NEWS_KEY);
    const articles: NewsArticle[] = raw ? JSON.parse(raw) : [];
    if (articles.length > 0) {
      articles.forEach(article => {
        fetch('http://localhost:3000/settings/create-news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ article })
        }).catch(() => { });
      });
    }
    return articles;
  } catch (e) {
    return [];
  }
};

export const saveCreatedNewsArticle = (article: NewsArticle) => {
  try {
    const current = getCreatedNewsArticles();
    const existingIndex = current.findIndex(a => (a.id && a.id === article.id) || (a._id && a._id === article._id));
    if (existingIndex >= 0) {
      current[existingIndex] = article;
    } else {
      current.unshift(article);
    }
    localStorage.setItem(CREATED_NEWS_KEY, JSON.stringify(current));
    fetch('http://localhost:3000/settings/create-news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article })
    }).catch(() => { });
  } catch (e) { }
};

export const removeCreatedNewsArticle = (id: string) => {
  try {
    const current = getCreatedNewsArticles();
    const filtered = current.filter(a => a.id !== id && a._id !== id);
    localStorage.setItem(CREATED_NEWS_KEY, JSON.stringify(filtered));
  } catch (e) { }
};

export const newsService = {
  /**
   * Get paginated & filtered list of news articles
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
    const deletedIds = getDeletedNewsIds();

    let firestoreArticles: NewsArticle[] = [];
    try {
      const newsColRef = collection(db, 'news');
      const querySnapshot = await getDocs(newsColRef);
      firestoreArticles = querySnapshot.docs.map(d => newsFromFirestore(d, d.id));
    } catch (e) {
      console.warn('Firestore fetch notice:', e);
    }

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
    } catch (e) { }

    let settingsDeletedIds: string[] = [];
    let settingsCreatedArticles: NewsArticle[] = [];
    try {
      const setRes = await fetch('http://localhost:3000/settings');
      if (setRes.ok) {
        const setData = await setRes.json();
        if (Array.isArray(setData.deletedNewsIds)) settingsDeletedIds = setData.deletedNewsIds;
        if (Array.isArray(setData.createdArticles)) settingsCreatedArticles = setData.createdArticles;
      }
    } catch (e) { }

    const localCreated = getCreatedNewsArticles();
    const articleMap = new Map<string, NewsArticle>();
    firestoreArticles.forEach(a => { if (a.id || a._id) articleMap.set((a.id || a._id)!, a); });
    backendArticles.forEach(a => { if (a.id || a._id) articleMap.set((a.id || a._id)!, a); });
    settingsCreatedArticles.forEach(a => { if (a.id || a._id) articleMap.set((a.id || a._id)!, a); });
    localCreated.forEach(a => { if (a.id || a._id) articleMap.set((a.id || a._id)!, a); });

    // Auto-sync any local-created articles into Firebase Firestore
    for (const localArt of localCreated) {
      const artId = localArt.id || localArt._id;
      if (artId && !firestoreArticles.some(f => (f.id === artId || f._id === artId))) {
        try {
          const payload = newsToFirestore(localArt, true);
          await setDoc(doc(db, 'news', artId), payload, { merge: true });
        } catch (e) {}
      }
    }

    let articles = Array.from(articleMap.values()).filter(a =>
      (a as any).status !== 'deleted' &&
      !deletedIds.includes(a.id || a._id || '') &&
      !settingsDeletedIds.includes(a.id || a._id || '')
    );

    if (options.authorId && options.authorId.trim() !== '') {
      const authId = options.authorId.trim().toLowerCase();
      articles = articles.filter(a => {
        const aId = (a.authorId || '').toLowerCase().trim();
        const aName = (a.authorName || '').toLowerCase().trim();
        const aEmail = ((a as any).authorEmail || '').toLowerCase().trim();
        return (
          aId === authId ||
          (aId && authId.includes(aId)) ||
          (aId && aId.includes(authId)) ||
          (aEmail && (aEmail === authId || authId.includes(aEmail))) ||
          (aName && (aName === authId || authId.includes(aName)))
        );
      });
    }

    if (options.status && options.status !== 'all') {
      const statusVal = options.status.toLowerCase();
      articles = articles.filter(a => (a.status || 'published').toLowerCase() === statusVal);
    }

    if (options.language && options.language.trim() !== '') {
      articles = articles.filter(a => isLanguageMatch(a.language, options.language));
    }

    if (options.category && options.category.trim() !== '' && options.category.toLowerCase() !== 'all') {
      const catVal = options.category.toLowerCase().trim();
      articles = articles.filter(a => (a.category || '').toLowerCase() === catVal);
    }

    if (options.topic && options.topic.trim() !== '') {
      const topVal = options.topic.toLowerCase().trim();
      articles = articles.filter(a => (a.topic || '').toLowerCase() === topVal);
    }

    if (options.search && options.search.trim() !== '') {
      const term = options.search.toLowerCase().trim();
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term) ||
        (Array.isArray(a.keywords) && a.keywords.some(k => k.toLowerCase().includes(term)))
      );
    }

    articles.sort((a, b) => parseDateToMillis(b.publishedAt) - parseDateToMillis(a.publishedAt));

    const total = articles.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedArticles = articles.slice(startIndex, startIndex + limitNum);

    return {
      total,
      page: pageNum,
      limit: limitNum,
      articles: paginatedArticles,
    };
  },

  /**
   * Get single news article by ID
   */
  async getNewsById(id: string): Promise<NewsArticle | null> {
    if (!id) return null;

    // 1. Check localStorage created articles
    try {
      const localCreated = getCreatedNewsArticles();
      const foundLocal = localCreated.find(a => a.id === id || a._id === id || a.slug === id);
      if (foundLocal) return foundLocal;
    } catch (e) { }

    // 2. Check backend settings endpoint created articles
    try {
      const setRes = await fetch('http://localhost:3000/settings');
      if (setRes.ok) {
        const setData = await setRes.json();
        if (Array.isArray(setData.createdArticles)) {
          const foundSet = setData.createdArticles.find((a: any) => a.id === id || a._id === id || a.slug === id);
          if (foundSet) return foundSet;
        }
      }
    } catch (e) { }

    // 3. Check Firestore
    try {
      const docRef = doc(db, 'news', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return newsFromFirestore(docSnap, docSnap.id);
      }
    } catch (e) { }

    // 4. Check getNews list query fallback
    try {
      const res = await this.getNews({ limit: 100 });
      const foundInList = res.articles.find(a => a.id === id || a._id === id || a.slug === id);
      if (foundInList) return foundInList;
    } catch (e) { }

    return null;
  },

  /**
   * Create news article directly in Firestore
   */
  async createNews(data: Partial<NewsArticle>): Promise<NewsArticle> {
    const payload = newsToFirestore(data, true);
    const newsColRef = collection(db, 'news');

    let createdArticle: NewsArticle | null = null;

    try {
      const docRef = await addDoc(newsColRef, payload);
      const createdSnap = await getDoc(docRef);
      createdArticle = newsFromFirestore(createdSnap, docRef.id);
    } catch (err: unknown) {
      console.warn('Firestore createNews notice:', err);
    }

    try {
      const res = await fetch('http://localhost:3000/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const backendData = await res.json();
        if (!createdArticle) {
          createdArticle = { ...data, id: backendData._id || backendData.id || Date.now().toString() } as NewsArticle;
        }
      }
    } catch (e) { }

    if (!createdArticle) {
      const customId = 'news_' + Date.now();
      createdArticle = {
        ...data,
        id: customId,
        _id: customId,
        views: 0,
        publishedAt: data.publishedAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: data.status || 'published'
      } as NewsArticle;

      try {
        await setDoc(doc(db, 'news', customId), payload, { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc fallback notice:', e);
      }
    }

    if (createdArticle) {
      saveCreatedNewsArticle(createdArticle);
      try {
        await fetch('http://localhost:3000/settings/create-news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ article: createdArticle })
        });
      } catch (e) { }
    }

    return createdArticle;
  },

  /**
   * Update existing news article directly in Firestore
   */
  async updateNews(id: string, data: Partial<NewsArticle>): Promise<NewsArticle> {
    const existingArticle = await this.getNewsById(id);

    const fullArticle: NewsArticle = existingArticle
      ? { ...existingArticle, ...data, id, _id: id }
      : ({ ...data, id, _id: id } as NewsArticle);

    const docRef = doc(db, 'news', id);
    const payload = newsToFirestore(fullArticle, false);

    let updatedArticle: NewsArticle | null = null;

    try {
      await setDoc(docRef, payload, { merge: true });
      const updatedSnap = await getDoc(docRef);
      if (updatedSnap.exists()) {
        updatedArticle = newsFromFirestore(updatedSnap, id);
      }
    } catch (err: unknown) {
      console.warn('Firestore updateNews notice:', err);
    }

    try {
      await fetch(`http://localhost:3000/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) { }

    const finalArticle = updatedArticle || fullArticle;

    if (finalArticle) {
      saveCreatedNewsArticle(finalArticle);
      try {
        await fetch('http://localhost:3000/settings/create-news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ article: finalArticle })
        });
      } catch (e) { }
    }

    return finalArticle;
  },

  /**
   * Delete news article and clean up Storage images
   */
  async deleteNews(id: string): Promise<void> {
    addDeletedNewsId(id);
    removeCreatedNewsArticle(id);

    try {
      await fetch('http://localhost:3000/settings/delete-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (e) { }

    try {
      const news = await this.getNewsById(id);
      if (news && news.imageUrl) {
        try {
          await storageService.deleteNewsImage(news.imageUrl);
        } catch (e) { }
      }
    } catch (e) { }

    try {
      const news = await this.getNewsById(id);
      if (news && news.imageUrl) {
        try {
          await storageService.deleteNewsImage(news.imageUrl);
        } catch (e) { }
      }
    } catch (e) { }

    let firestoreDeleted = false;
    // Firestore deletion
    try {
      const docRef = doc(db, 'news', id);
      await deleteDoc(docRef);
      firestoreDeleted = true;
    } catch (err) {
      console.warn('Firestore deleteDoc notice, attempting soft delete:', err);
    }

    if (!firestoreDeleted) {
      try {
        const docRef = doc(db, 'news', id);
        await setDoc(docRef, { status: 'deleted', updatedAt: serverTimestamp() }, { merge: true });
      } catch (err) {
        console.warn('Firestore soft delete notice:', err);
      }
    }

    // Backend API deletion
    try {
      await fetch(`http://localhost:3000/news/${id}`, {
        method: 'DELETE'
      });
    } catch (e) { }
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
      status: 'draft',
      editorialNotes: notes
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
    const docRef = doc(db, 'news', id);
    await updateDoc(docRef, {
      views: increment(1),
      updatedAt: serverTimestamp()
    });
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
      const newsColRef = collection(db, 'news');
      const querySnapshot = await getDocs(newsColRef);
      const deletedIds = getDeletedNewsIds();
      const localCreated = getCreatedNewsArticles();
      const articleMap = new Map<string, NewsArticle>();
      querySnapshot.docs.forEach(d => {
        const item = newsFromFirestore(d, d.id);
        if (item.id || item._id) articleMap.set((item.id || item._id)!, item);
      });
      localCreated.forEach(a => { if (a.id || a._id) articleMap.set((a.id || a._id)!, a); });

      const articles = Array.from(articleMap.values())
        .filter(a => (a as any).status !== 'deleted' && !deletedIds.includes(a.id || a._id || ''));

      const total = articles.length;
      const published = articles.filter(a => a.status === 'published').length;
      const pending = articles.filter(a => a.status === 'pending').length;
      const draft = articles.filter(a => a.status === 'draft').length;
      const rejected = articles.filter(a => a.status === 'rejected').length;
      const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);

      articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      const recent = articles.slice(0, 5);

      return { total, published, pending, draft, rejected, totalViews, recent };
    } catch (error) {
      console.error('Error fetching news stats:', error);
      return { total: 0, published: 0, pending: 0, draft: 0, rejected: 0, totalViews: 0, recent: [] };
    }
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
      const allNews = await this.getNews({ authorId, limit: 1000 });
      const articles = allNews.articles || [];
      const total = articles.length;
      const published = articles.filter(a => a.status === 'published').length;
      const pending = articles.filter(a => a.status === 'pending').length;
      const draft = articles.filter(a => a.status === 'draft').length;
      const rejected = articles.filter(a => a.status === 'rejected').length;
      const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
      const recent = articles.slice(0, 5);
      return { total, published, pending, draft, rejected, totalViews, recent };
    } catch (e) {
      return { total: 0, published: 0, pending: 0, draft: 0, rejected: 0, totalViews: 0, recent: [] };
    }
  }
};
