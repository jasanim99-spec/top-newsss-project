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
import { ShortVideo, ApiResponse } from '@/types';
import { videoToFirestore, videoFromFirestore, generateSlug, parseDateToMillis, isLanguageMatch } from '@/utils/converters';

export { generateSlug };

const DELETED_VIDEO_KEY = 'topnews_deleted_video_ids';
const CREATED_VIDEO_KEY = 'topnews_created_videos';

export const getDeletedVideoIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DELETED_VIDEO_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addDeletedVideoId = (id: string) => {
  try {
    const current = getDeletedVideoIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(DELETED_VIDEO_KEY, JSON.stringify(current));
    }
  } catch (e) {}
};

export const getCreatedVideos = (): ShortVideo[] => {
  try {
    const raw = localStorage.getItem(CREATED_VIDEO_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveCreatedVideo = (video: ShortVideo) => {
  try {
    const current = getCreatedVideos();
    const existingIndex = current.findIndex(v => (v.id && v.id === video.id) || (v._id && v._id === video._id));
    if (existingIndex >= 0) {
      current[existingIndex] = video;
    } else {
      current.unshift(video);
    }
    localStorage.setItem(CREATED_VIDEO_KEY, JSON.stringify(current));
  } catch (e) {}
};

export const removeCreatedVideo = (id: string) => {
  try {
    const current = getCreatedVideos();
    const filtered = current.filter(v => v.id !== id && v._id !== id);
    localStorage.setItem(CREATED_VIDEO_KEY, JSON.stringify(filtered));
  } catch (e) {}
};

export const videoService = {
  /**
   * Get paginated & filtered list of short videos
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
    const deletedIds = getDeletedVideoIds();

    let firestoreVideos: ShortVideo[] = [];
    try {
      const videosColRef = collection(db, 'videos');
      const querySnapshot = await getDocs(videosColRef);
      firestoreVideos = querySnapshot.docs.map(d => videoFromFirestore(d, d.id));
    } catch (e) {
      console.warn('Firestore video fetch notice:', e);
    }

    let backendVideos: ShortVideo[] = [];
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
    } catch (e) { }

    const localCreated = getCreatedVideos();
    const videoMap = new Map<string, ShortVideo>();
    firestoreVideos.forEach(v => { if (v.id || v._id) videoMap.set((v.id || v._id)!, v); });
    backendVideos.forEach(v => { if (v.id || v._id) videoMap.set((v.id || v._id)!, v); });
    localCreated.forEach(v => { if (v.id || v._id) videoMap.set((v.id || v._id)!, v); });

    let videos = Array.from(videoMap.values()).filter(v =>
      (v as any).status !== 'deleted' &&
      !deletedIds.includes(v.id || v._id || '')
    );

    if (options.status && options.status !== 'all') {
      const statusVal = options.status.toLowerCase();
      videos = videos.filter(v => (v.status || 'published').toLowerCase() === statusVal);
    }

    if (options.language && options.language.trim() !== '') {
      videos = videos.filter(v => isLanguageMatch(v.language, options.language));
    }

    if (options.category && options.category.trim() !== '' && options.category.toLowerCase() !== 'all') {
      const catVal = options.category.toLowerCase().trim();
      videos = videos.filter(v => (v.category || '').toLowerCase() === catVal);
    }

    if (options.topic && options.topic.trim() !== '') {
      const topVal = options.topic.toLowerCase().trim();
      videos = videos.filter(v => (v.topic || '').toLowerCase() === topVal);
    }

    if (options.search && options.search.trim() !== '') {
      const term = options.search.toLowerCase().trim();
      videos = videos.filter(v =>
        v.title.toLowerCase().includes(term) ||
        v.description.toLowerCase().includes(term) ||
        (Array.isArray(v.keywords) && v.keywords.some(k => k.toLowerCase().includes(term)))
      );
    }

    videos.sort((a, b) => parseDateToMillis(b.publishedAt) - parseDateToMillis(a.publishedAt));

    const total = videos.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedVideos = videos.slice(startIndex, startIndex + limitNum);

    return {
      total,
      page: pageNum,
      limit: limitNum,
      videos: paginatedVideos,
    };
  },

  /**
   * Get single short video by ID
   */
  async getVideoById(id: string): Promise<ShortVideo | null> {
    if (!id) return null;
    const docRef = doc(db, 'videos', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return videoFromFirestore(docSnap, docSnap.id);
  },

  /**
   * Automatically create video (Auto collection creation)
   */
  async createVideo(data: Partial<ShortVideo>): Promise<ShortVideo> {
    const payload = videoToFirestore(data, true);
    const videosColRef = collection(db, 'videos');

    let createdVideo: ShortVideo | null = null;

    try {
      const docRef = await addDoc(videosColRef, payload);
      const createdSnap = await getDoc(docRef);
      createdVideo = videoFromFirestore(createdSnap, docRef.id);
    } catch (err: unknown) {
      console.warn('Firestore createVideo notice:', err);
    }

    try {
      const res = await fetch('http://localhost:3000/short-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const backendData = await res.json();
        if (!createdVideo) {
          createdVideo = { ...data, id: backendData._id || backendData.id || Date.now().toString() } as ShortVideo;
        }
      }
    } catch (e) {}

    if (!createdVideo) {
      const customId = 'video_' + Date.now();
      createdVideo = {
        ...data,
        id: customId,
        _id: customId,
        views: 0,
        publishedAt: data.publishedAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: data.status || 'published'
      } as ShortVideo;
    }

    if (createdVideo) {
      saveCreatedVideo(createdVideo);
    }

    return createdVideo;
  },

  /**
   * Update existing video
   */
  async updateVideo(id: string, data: Partial<ShortVideo>): Promise<ShortVideo> {
    const existingVideo = await this.getVideoById(id);

    const fullVideo: ShortVideo = existingVideo
      ? { ...existingVideo, ...data, id, _id: id }
      : ({ ...data, id, _id: id } as ShortVideo);

    const docRef = doc(db, 'videos', id);
    const payload = videoToFirestore(fullVideo, false);

    let updatedVideo: ShortVideo | null = null;

    try {
      await setDoc(docRef, payload, { merge: true });
      const updatedSnap = await getDoc(docRef);
      if (updatedSnap.exists()) {
        updatedVideo = videoFromFirestore(updatedSnap, id);
      }
    } catch (err: unknown) {
      console.warn('Firestore updateVideo notice:', err);
    }

    try {
      await fetch(`http://localhost:3000/short-videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {}

    const finalVideo = updatedVideo || fullVideo;

    if (finalVideo) {
      saveCreatedVideo(finalVideo);
    }

    return finalVideo;
  },

  /**
   * Delete video and clean up Storage media
   */
  async deleteVideo(id: string): Promise<void> {
    addDeletedVideoId(id);
    removeCreatedVideo(id);

    try {
      const video = await this.getVideoById(id);
      if (video) {
        if (video.videoUrl) {
          try { await storageService.deleteVideo(video.videoUrl); } catch (e) {}
        }
        if (video.thumbnailUrl) {
          try { await storageService.deleteVideoThumbnail(video.thumbnailUrl); } catch (e) {}
        }
      }
    } catch (e) {}

    let firestoreDeleted = false;
    // Firestore deletion
    try {
      const docRef = doc(db, 'videos', id);
      await deleteDoc(docRef);
      firestoreDeleted = true;
    } catch (err) {
      console.warn('Firestore deleteVideo notice, attempting soft delete:', err);
    }

    if (!firestoreDeleted) {
      try {
        const docRef = doc(db, 'videos', id);
        await setDoc(docRef, { status: 'deleted', updatedAt: serverTimestamp() }, { merge: true });
      } catch (err) {
        console.warn('Firestore video soft delete notice:', err);
      }
    }

    // Backend API deletion
    try {
      await fetch(`http://localhost:3000/short-videos/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {}
  },

  /**
   * Publish short video
   */
  async publishVideo(id: string): Promise<ShortVideo> {
    return this.updateVideo(id, { status: 'published' });
  },

  /**
   * Unpublish short video (set to draft)
   */
  async unpublishVideo(id: string): Promise<ShortVideo> {
    return this.updateVideo(id, { status: 'draft' });
  },

  /**
   * Increment view count atomically
   */
  async incrementViews(id: string): Promise<void> {
    const docRef = doc(db, 'videos', id);
    await updateDoc(docRef, {
      views: increment(1),
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Dashboard statistics for videos
   */
  async getVideoStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    totalViews: number;
    recent: ShortVideo[];
  }> {
    try {
      const videosColRef = collection(db, 'videos');
      const querySnapshot = await getDocs(videosColRef);
      const deletedIds = getDeletedVideoIds();
      const localCreated = getCreatedVideos();
      const videoMap = new Map<string, ShortVideo>();
      querySnapshot.docs.forEach(d => {
        const item = videoFromFirestore(d, d.id);
        if (item.id || item._id) videoMap.set((item.id || item._id)!, item);
      });
      localCreated.forEach(v => { if (v.id || v._id) videoMap.set((v.id || v._id)!, v); });

      const videos = Array.from(videoMap.values())
        .filter(v => (v as any).status !== 'deleted' && !deletedIds.includes(v.id || v._id || ''));

      const total = videos.length;
      const published = videos.filter(v => v.status === 'published').length;
      const draft = videos.filter(v => v.status === 'draft').length;
      const totalViews = videos.reduce((acc, curr) => acc + (curr.views || 0), 0);

      videos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      const recent = videos.slice(0, 5);

      return { total, published, draft, totalViews, recent };
    } catch (error) {
      console.error('Error fetching video stats:', error);
      return { total: 0, published: 0, draft: 0, totalViews: 0, recent: [] };
    }
  }
};
