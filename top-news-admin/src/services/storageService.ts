import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from '@/firebase/storage';

// Helper to compress image to a tiny JPEG Data URL instantly
const compressImageToTinyDataUrl = (file: File, maxWidth = 800, maxHeight = 600, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const storageService = {
  /**
   * Upload branding assets (Logo / Favicon) to Firebase Storage with instant fallback
   */
  async uploadBrandingImage(
    file: File,
    type: 'logo' | 'favicon',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (onProgress) onProgress(30);
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `branding/${type}/${Date.now()}_${cleanFileName}`;

    try {
      const storageRef = ref(storage, storagePath);
      const snap = await Promise.race([
        uploadBytes(storageRef, file),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Storage timeout')), 2500))
      ]);
      if (onProgress) onProgress(80);
      const downloadUrl = await getDownloadURL((snap as any).ref);
      if (onProgress) onProgress(100);
      return downloadUrl;
    } catch (error) {
      console.warn(`Firebase Storage ${type} upload timed out or failed, using compressed fallback:`, error);
      const dataUrl = await compressImageToTinyDataUrl(file, 512, 512, 0.9);
      if (onProgress) onProgress(100);
      return dataUrl;
    }
  },

  /**
   * Upload cover image for a news article to Firebase Storage (with 2.5s instant compressed fallback)
   */
  async uploadNewsImage(
    file: File,
    newsId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (onProgress) onProgress(30);
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `news/${newsId}/cover/${Date.now()}_${cleanFileName}`;

    try {
      const storageRef = ref(storage, storagePath);
      const snap = await Promise.race([
        uploadBytes(storageRef, file),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Storage timeout')), 2500))
      ]);
      if (onProgress) onProgress(80);
      const downloadUrl = await getDownloadURL((snap as any).ref);
      if (onProgress) onProgress(100);
      return downloadUrl;
    } catch (error) {
      console.warn('Firebase Storage upload timed out or failed, using instant compressed image fallback:', error);
      const dataUrl = await compressImageToTinyDataUrl(file, 800, 600, 0.7);
      if (onProgress) onProgress(100);
      return dataUrl;
    }
  },

  /**
   * Delete cover image file from Storage
   */
  async deleteNewsImage(fileUrl: string): Promise<void> {
    if (!fileUrl || !fileUrl.includes('firebasestorage.googleapis.com')) return;
    try {
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
    } catch (error) {
      console.warn('Could not delete news image from storage:', error);
    }
  },

  /**
   * Upload video file for a short video to Firebase Storage with full progress tracking
   */
  async uploadVideo(
    file: File,
    videoId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (onProgress) onProgress(5);
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `videos/${videoId}/video/${Date.now()}_${cleanFileName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (onProgress) onProgress(Math.max(5, progress));
          }
        },
        (error) => {
          console.error('Firebase Storage video upload error:', error);
          reject(new Error(error.message || 'Firebase Storage upload failed. Check Firebase Storage Security Rules in Console or use Direct URL tab.'));
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve(downloadUrl);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  },

  /**
   * Delete video file from Storage
   */
  async deleteVideo(fileUrl: string): Promise<void> {
    if (!fileUrl || !fileUrl.includes('firebasestorage.googleapis.com')) return;
    try {
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
    } catch (error) {
      console.warn('Could not delete video file from storage:', error);
    }
  },

  /**
   * Upload thumbnail image for a video to Firebase Storage (with 2.5s instant compressed fallback)
   */
  async uploadVideoThumbnail(
    file: File,
    videoId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (onProgress) onProgress(30);
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `videos/${videoId}/thumbnail/${Date.now()}_${cleanFileName}`;

    try {
      const storageRef = ref(storage, storagePath);
      const snap = await Promise.race([
        uploadBytes(storageRef, file),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Storage timeout')), 2500))
      ]);
      if (onProgress) onProgress(80);
      const downloadUrl = await getDownloadURL((snap as any).ref);
      if (onProgress) onProgress(100);
      return downloadUrl;
    } catch (error) {
      console.warn('Firebase Storage thumbnail upload timed out or failed, using instant compressed thumbnail fallback:', error);
      const dataUrl = await compressImageToTinyDataUrl(file, 800, 600, 0.7);
      if (onProgress) onProgress(100);
      return dataUrl;
    }
  },

  /**
   * Delete video thumbnail file from Storage
   */
  async deleteVideoThumbnail(fileUrl: string): Promise<void> {
    if (!fileUrl || !fileUrl.includes('firebasestorage.googleapis.com')) return;
    try {
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
    } catch (error) {
      console.warn('Could not delete video thumbnail from storage:', error);
    }
  }
};
