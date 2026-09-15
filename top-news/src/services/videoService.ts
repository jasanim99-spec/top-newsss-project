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
import { NewsVideo, VideoResponse } from '@/store/newsStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://top-newsss-project.vercel.app';
const VIDEOS_COLLECTION = 'videos';

const mapDocToNewsVideo = (docSnap: QueryDocumentSnapshot<DocumentData> | DocumentData, id: string): NewsVideo => {
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
    videoUrl: data.videoUrl || '',
    thumbnailUrl: data.thumbnailUrl || '',
    duration: typeof data.duration === 'number' ? data.duration : 0,
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

export const videoService = {
  /**
   * Fetch published videos with optional filters & pagination from PostgreSQL REST API
   */
  async getPublishedVideos(options: {
    language?: string;
    category?: string;
    topic?: string;
    limitNum?: number;
    startAfterDoc?: any;
  } = {}): Promise<VideoResponse> {
    const pageSize = options.limitNum || 10;

    const queryParams = new URLSearchParams();
    queryParams.append('status', 'published');
    queryParams.append('limit', pageSize.toString());
    if (options.category) queryParams.append('category', options.category);
    if (options.topic) queryParams.append('topic', options.topic);
    if (options.language) queryParams.append('language', options.language);

    try {
      const res = await fetch(`${API_BASE_URL}/short-videos?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          total: data.total || 0,
          page: data.page || 1,
          limit: data.limit || pageSize,
          videos: data.videos || []
        };
      }
    } catch (err) {
      console.warn('PostgreSQL API video fetch notice, falling back to Firestore:', err);
    }

    try {
      const videosColRef = collection(db, VIDEOS_COLLECTION);
      const querySnapshot = await getDocs(videosColRef);
      let videos = querySnapshot.docs
        .map(docSnap => mapDocToNewsVideo(docSnap, docSnap.id))
        .filter(v => (v.status || 'published') === 'published');

      if (options.category && options.category !== 'all') {
        videos = videos.filter(v => (v.category || '').toLowerCase() === options.category!.toLowerCase());
      }

      return {
        total: videos.length,
        page: 1,
        limit: pageSize,
        videos: videos.slice(0, pageSize)
      };
    } catch (e) {
      return { total: 0, page: 1, limit: pageSize, videos: [] };
    }
  },

  async getVideoById(id: string): Promise<NewsVideo | null> {
    if (!id) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/short-videos/${encodeURIComponent(id)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('PostgreSQL API getVideoById notice:', err);
    }

    try {
      const docRef = doc(db, VIDEOS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return mapDocToNewsVideo(docSnap, docSnap.id);
      }
    } catch (e) { }

    return null;
  },

  async getVideoBySlug(slug: string): Promise<NewsVideo | null> {
    return this.getVideoById(slug);
  },

  async getVideosByCategory(category: string, language?: string, limitNum = 10): Promise<VideoResponse> {
    return this.getPublishedVideos({ category, language, limitNum });
  },

  async getTrendingVideos(language?: string, limitNum = 10): Promise<VideoResponse> {
    return this.getPublishedVideos({ language, limitNum });
  },

  async incrementVideoViews(id: string): Promise<void> {
    if (!id) return;
    try {
      await fetch(`${API_BASE_URL}/short-videos/${encodeURIComponent(id)}/views`, {
        method: 'PATCH'
      });
    } catch (e) { }

    try {
      const docRef = doc(db, VIDEOS_COLLECTION, id);
      await updateDoc(docRef, {
        views: increment(1)
      });
    } catch (e) { }
  }
};
