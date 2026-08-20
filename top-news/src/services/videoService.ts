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
import { NewsVideo, VideoResponse } from '@/store/newsStore';

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

const DELETED_VIDEO_KEY = 'topnews_deleted_video_ids';
const CREATED_VIDEO_KEY = 'topnews_created_videos';

const getDeletedVideoIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DELETED_VIDEO_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const getCreatedVideos = (): NewsVideo[] => {
  try {
    const raw = localStorage.getItem(CREATED_VIDEO_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const videoService = {
  // Fetch published videos with optional filters & pagination
  async getPublishedVideos(options: {
    language?: string;
    category?: string;
    topic?: string;
    limitNum?: number;
    startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
  } = {}): Promise<VideoResponse> {
    const pageSize = options.limitNum || 10;
    try {
      let firestoreVideos: NewsVideo[] = [];
      try {
        const videosColRef = collection(db, VIDEOS_COLLECTION);
        const querySnapshot = await getDocs(videosColRef);
        firestoreVideos = querySnapshot.docs.map(docSnap => mapDocToNewsVideo(docSnap, docSnap.id));
      } catch (e) {}

      let backendVideos: NewsVideo[] = [];
      try {
        const res = await fetch('http://localhost:3000/short-videos');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.videos)) {
            backendVideos = data.videos;
          } else if (Array.isArray(data)) {
            backendVideos = data;
          }
        }
      } catch (e) {}

      const localCreated = getCreatedVideos();
      const deletedIds = getDeletedVideoIds();

      const videoMap = new Map<string, NewsVideo>();
      firestoreVideos.forEach(v => { if (v.id || v._id) videoMap.set((v.id || v._id)!, v); });
      backendVideos.forEach(v => { if (v.id || v._id) videoMap.set((v.id || v._id)!, v); });
      localCreated.forEach(v => { if (v.id || v._id) videoMap.set((v.id || v._id)!, v); });

      let videos: NewsVideo[] = Array.from(videoMap.values());

      // Filter published and non-deleted
      videos = videos.filter(v => v.status === 'published' && !deletedIds.includes(v.id || v._id || ''));

      if (options.language) {
        const langVal = options.language.toLowerCase();
        videos = videos.filter(v => v.language.toLowerCase() === langVal);
      }

      if (options.category && options.category !== 'all') {
        const catVal = options.category.toLowerCase();
        videos = videos.filter(v => v.category.toLowerCase() === catVal);
      }

      if (options.topic) {
        const topVal = options.topic.toLowerCase();
        videos = videos.filter(v => v.topic.toLowerCase() === topVal);
      }

      // Sort by publishedAt desc
      videos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      const paginated = videos.slice(0, pageSize);

      return {
        total: videos.length,
        page: 1,
        limit: pageSize,
        videos: paginated
      };
    } catch (error) {
      console.error('Error fetching published videos:', error);
      return { total: 0, page: 1, limit: pageSize, videos: [] };
    }
  },

  // Fetch video by ID
  async getVideoById(id: string): Promise<NewsVideo | null> {
    try {
      const docRef = doc(db, VIDEOS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const video = mapDocToNewsVideo(docSnap, docSnap.id);
        if (video.status === 'published') {
          return video;
        }
      }
      return null;
    } catch (error) {
      console.error(`Error fetching video by ID (${id}):`, error);
      return null;
    }
  },

  // Fetch video by slug
  async getVideoBySlug(slug: string): Promise<NewsVideo | null> {
    try {
      const videosColRef = collection(db, VIDEOS_COLLECTION);
      const querySnapshot = await getDocs(videosColRef);
      const docSnap = querySnapshot.docs.find(d => d.data().slug === slug);

      if (docSnap) {
        return mapDocToNewsVideo(docSnap, docSnap.id);
      }
      return null;
    } catch (error) {
      console.error(`Error fetching video by slug (${slug}):`, error);
      return null;
    }
  },

  // Fetch videos by category
  async getVideosByCategory(category: string, language?: string, limitNum = 12): Promise<VideoResponse> {
    return this.getPublishedVideos({ category, language, limitNum });
  },

  // Fetch videos by language
  async getVideosByLanguage(language: string, limitNum = 12): Promise<VideoResponse> {
    return this.getPublishedVideos({ language, limitNum });
  },

  // Fetch trending videos (ordered by views)
  async getTrendingVideos(language?: string, limitNum = 10): Promise<VideoResponse> {
    try {
      const res = await this.getPublishedVideos({ language, limitNum: 50 });
      let videos = res.videos;
      videos.sort((a, b) => (b.views || 0) - (a.views || 0));
      return { total: videos.length, page: 1, limit: limitNum, videos: videos.slice(0, limitNum) };
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      return { total: 0, page: 1, limit: limitNum, videos: [] };
    }
  },

  // Fetch most viewed videos
  async getMostViewedVideos(language?: string, limitNum = 10): Promise<VideoResponse> {
    return this.getTrendingVideos(language, limitNum);
  },

  // Search videos by query
  async searchVideos(searchQuery: string, language?: string, limitNum = 20): Promise<VideoResponse> {
    if (!searchQuery || !searchQuery.trim()) {
      return { total: 0, page: 1, limit: limitNum, videos: [] };
    }

    try {
      const res = await this.getPublishedVideos({ language, limitNum: 50 });
      const qLower = searchQuery.toLowerCase().trim();

      const matched = res.videos.filter(video => {
        return (
          video.title.toLowerCase().includes(qLower) ||
          video.description.toLowerCase().includes(qLower) ||
          video.keywords.some(k => k.toLowerCase().includes(qLower)) ||
          video.tags.some(t => t.toLowerCase().includes(qLower)) ||
          video.category.toLowerCase().includes(qLower)
        );
      });

      return {
        total: matched.length,
        page: 1,
        limit: limitNum,
        videos: matched.slice(0, limitNum)
      };
    } catch (error) {
      console.error('Error searching videos:', error);
      return { total: 0, page: 1, limit: limitNum, videos: [] };
    }
  },

  // Increment video views using atomic increment
  async incrementVideoViews(id: string): Promise<void> {
    if (!id) return;
    try {
      const docRef = doc(db, VIDEOS_COLLECTION, id);
      await updateDoc(docRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error(`Error incrementing views for video ${id}:`, error);
    }
  },

  // Get related videos excluding current video ID
  async getRelatedVideos(video: NewsVideo, limitNum = 4): Promise<NewsVideo[]> {
    try {
      const categoryRes = await this.getVideosByCategory(video.category, video.language, limitNum + 2);
      const filtered = categoryRes.videos.filter(v => v._id !== video._id && v.slug !== video.slug);
      return filtered.slice(0, limitNum);
    } catch (error) {
      console.error('Error fetching related videos:', error);
      return [];
    }
  }
};
