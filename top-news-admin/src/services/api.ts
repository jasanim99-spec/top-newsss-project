import { NewsArticle, ShortVideo, ApiResponse } from '../types';
import { newsService } from './newsService';
import { videoService } from './videoService';

// News API adapter bridged to Firestore newsService
export const newsApi = {
  getAll: async (page = 1, limit = 10): Promise<ApiResponse<NewsArticle>> => {
    return newsService.getNews({ page, limit });
  },

  getByCategory: async (language: string, category: string, page = 1, limit = 10): Promise<ApiResponse<NewsArticle>> => {
    return newsService.getNews({ language, category, page, limit });
  },

  getById: async (id: string): Promise<NewsArticle | null> => {
    return newsService.getNewsById(id);
  },

  create: async (data: Omit<NewsArticle, '_id'>): Promise<NewsArticle> => {
    return newsService.createNews(data);
  },

  update: async (id: string, data: Partial<NewsArticle>): Promise<NewsArticle> => {
    return newsService.updateNews(id, data);
  },

  delete: async (id: string): Promise<void> => {
    return newsService.deleteNews(id);
  },
};

// Short Videos API adapter bridged to Firestore videoService
export const videosApi = {
  getAll: async (page = 1, limit = 10): Promise<ApiResponse<ShortVideo>> => {
    return videoService.getVideos({ page, limit });
  },

  getByCategory: async (language: string, category: string, page = 1, limit = 10): Promise<ApiResponse<ShortVideo>> => {
    return videoService.getVideos({ language, category, page, limit });
  },

  getById: async (id: string): Promise<ShortVideo | null> => {
    return videoService.getVideoById(id);
  },

  create: async (data: Omit<ShortVideo, '_id'>): Promise<ShortVideo> => {
    return videoService.createVideo(data);
  },

  update: async (id: string, data: Partial<ShortVideo>): Promise<ShortVideo> => {
    return videoService.updateVideo(id, data);
  },

  delete: async (id: string): Promise<void> => {
    return videoService.deleteVideo(id);
  },
};