import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/storage';

export const storageService = {
  // Helper to retrieve public download URL from Storage path if needed
  async getMediaUrl(path: string): Promise<string> {
    if (!path) return '';
    // If it's already an absolute HTTP/HTTPS URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    try {
      const mediaRef = ref(storage, path);
      return await getDownloadURL(mediaRef);
    } catch (error) {
      console.warn(`Failed to resolve download URL for path (${path}):`, error);
      return path;
    }
  },

  getNewsCoverPath(newsId: string, filename: string): string {
    return `news/${newsId}/cover/${filename}`;
  },

  getVideoThumbnailPath(videoId: string, filename: string): string {
    return `videos/${videoId}/thumbnail/${filename}`;
  },

  getVideoFilePath(videoId: string, filename: string): string {
    return `videos/${videoId}/video/${filename}`;
  }
};
