import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { storageService } from '@/services/storageService';
import { ShortVideo, ApiResponse } from '@/types';
import { videoToFirestore, videoFromFirestore, generateSlug, parseDateToMillis } from '@/utils/converters';

export { generateSlug };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('topnews_realtime_sync') : null;

export const videoService = {
  /**
   * Get paginated & filtered list of short videos from PostgreSQL REST API
   */
  async getVideos(options: {
    page?: number;
    limit?: number;
    category?: string;
    topic?: string;
    language?: string;
    status?: 'draft' | 'published' | 'all';
    search?: string;
  } = {}): Promise<ApiResponse<ShortVideo>> {
    const pageNum = options.page || 1;
    const limitNum = options.limit || 10;

    const queryParams = new URLSearchParams();
    queryParams.append('page', pageNum.toString());
    queryParams.append('limit', limitNum.toString());
    if (options.category) queryParams.append('category', options.category);
    if (options.topic) queryParams.append('topic', options.topic);
    if (options.language) queryParams.append('language', options.language);
    if (options.status) queryParams.append('status', options.status);
    if (options.search) queryParams.append('search', options.search);

    try {
      const res = await fetch(`${API_BASE_URL}/short-videos?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const videoList = data.videos || data.articles || [];
        return {
          total: data.total || videoList.length,
          page: data.page || pageNum,
          limit: data.limit || limitNum,
          videos: videoList,
          articles: videoList
        };
      }
    } catch (err) {
      console.warn('PostgreSQL API video fetch error, falling back to Firestore:', err);
    }

    // Fallback to Firestore
    try {
      const videosColRef = collection(db, 'videos');
      const querySnapshot = await getDocs(videosColRef);
      let videos = querySnapshot.docs
        .filter(d => d.data().status !== 'deleted')
        .map(d => videoFromFirestore(d, d.id));

      if (options.category && options.category.toLowerCase() !== 'all') {
        videos = videos.filter(v => (v.category || '').toLowerCase() === options.category!.toLowerCase());
      }

      videos.sort((a, b) => parseDateToMillis(b.publishedAt) - parseDateToMillis(a.publishedAt));
      const total = videos.length;
      const paginated = videos.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return { total, page: pageNum, limit: limitNum, videos: paginated, articles: paginated };
    } catch (e) {
      return { total: 0, page: pageNum, limit: limitNum, videos: [], articles: [] };
    }
  },

  /**
   * Get single short video by ID
   */
  async getVideoById(id: string): Promise<ShortVideo | null> {
    if (!id) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/short-videos/${encodeURIComponent(id)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('PostgreSQL API getVideoById error:', err);
    }

    try {
      const docRef = doc(db, 'videos', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return videoFromFirestore(docSnap, docSnap.id);
      }
    } catch (e) { }

    return null;
  },

  /**
   * Create short video
   */
  async createVideo(data: Partial<ShortVideo>): Promise<ShortVideo> {
    let createdVideo: ShortVideo | null = null;

    try {
      const res = await fetch(`${API_BASE_URL}/short-videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        createdVideo = await res.json();
      }
    } catch (err) {
      console.warn('PostgreSQL API createVideo error:', err);
    }

    const targetId = createdVideo?.id || data.id || data._id || ('video_' + Date.now());
    const fullVideo: ShortVideo = createdVideo || {
      ...data,
      id: targetId,
      _id: targetId,
      title: data.title ? data.title.trim() : '',
      slug: data.slug || generateSlug(data.title || ''),
      description: data.description || '',
      videoUrl: data.videoUrl || '',
      thumbnailUrl: data.thumbnailUrl || '',
      duration: data.duration || 0,
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

    try {
      const payload = videoToFirestore(fullVideo, true);
      await setDoc(doc(db, 'videos', targetId), payload, { merge: true });
    } catch (e) { }

    if (syncChannel) {
      syncChannel.postMessage({ type: 'VIDEO_UPDATED', video: fullVideo });
    }

    return fullVideo;
  },

  /**
   * Update existing short video
   */
  async updateVideo(id: string, data: Partial<ShortVideo>): Promise<ShortVideo> {
    let updatedVideo: ShortVideo | null = null;

    try {
      const res = await fetch(`${API_BASE_URL}/short-videos/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        updatedVideo = await res.json();
      }
    } catch (err) {
      console.warn('PostgreSQL API updateVideo error:', err);
    }

    const finalVideo: ShortVideo = updatedVideo || ({ id, ...data } as ShortVideo);

    try {
      const docRef = doc(db, 'videos', id);
      const payload = videoToFirestore(finalVideo, false);
      await setDoc(docRef, payload, { merge: true });
    } catch (e) { }

    if (syncChannel) {
      syncChannel.postMessage({ type: 'VIDEO_UPDATED', video: finalVideo });
    }

    return finalVideo;
  },

  /**
   * Delete short video
   */
  async deleteVideo(id: string): Promise<void> {
    try {
      const video = await this.getVideoById(id);
      if (video) {
        if (video.videoUrl) {
          try { await storageService.deleteVideo(video.videoUrl); } catch (e) { }
        }
        if (video.thumbnailUrl) {
          try { await storageService.deleteNewsImage(video.thumbnailUrl); } catch (e) { }
        }
      }
    } catch (e) { }

    try {
      await fetch(`${API_BASE_URL}/short-videos/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('PostgreSQL API deleteVideo error:', err);
    }

    try {
      const docRef = doc(db, 'videos', id);
      await setDoc(docRef, { status: 'deleted', updatedAt: serverTimestamp() }, { merge: true });
      await deleteDoc(docRef);
    } catch (e) { }

    if (syncChannel) {
      syncChannel.postMessage({ type: 'VIDEO_DELETED', id });
    }
  },

  /**
   * Increment view count atomically
   */
  async incrementViews(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/short-videos/${encodeURIComponent(id)}/views`, {
        method: 'PATCH'
      });
    } catch (e) { }

    try {
      const docRef = doc(db, 'videos', id);
      await updateDoc(docRef, {
        views: increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (e) { }
  },

  /**
   * Video Dashboard statistics
   */
  async getVideoStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    totalViews: number;
    recent: ShortVideo[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/short-videos/stats/dashboard`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('PostgreSQL API getVideoStats error:', err);
    }

    const fallback = await this.getVideos({ limit: 500, status: 'all' });
    const videos = fallback.articles || [];
    return {
      total: videos.length,
      published: videos.filter(v => v.status === 'published').length,
      draft: videos.filter(v => v.status === 'draft').length,
      totalViews: videos.reduce((acc, curr) => acc + (curr.views || 0), 0),
      recent: videos.slice(0, 5)
    };
  }
};
