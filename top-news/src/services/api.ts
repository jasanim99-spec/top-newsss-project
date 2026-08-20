import { NewsResponse, VideoResponse, NewsArticle, NewsVideo } from '@/store/newsStore';
import { newsService } from './newsService';
import { videoService } from './videoService';

class NewsAPI {
  // Fetch all news with pagination
  async getAllNews(page = 1, limit = 10): Promise<NewsResponse> {
    return newsService.getPublishedNews({ limitNum: limit });
  }

  // Fetch news by language, category, topic
  async getNewsByFilter(
    language = 'en',
    category?: string,
    topic?: string,
    page = 1,
    limit = 10
  ): Promise<NewsResponse> {
    return newsService.getPublishedNews({
      language,
      category,
      topic,
      limitNum: limit
    });
  }

  async getFeaturedNews(
    language = 'en',
    page = 1,
    limit = 24
  ): Promise<NewsResponse> {
    return newsService.getFeaturedNews(language, limit);
  }

  // Fetch specific article by slug
  async getArticleBySlug(
    language: string,
    category: string,
    topic: string,
    slug: string
  ): Promise<NewsArticle> {
    const article = await newsService.getNewsBySlug(slug);
    if (!article) {
      throw new Error('Article not found or not published');
    }
    return article;
  }

  // Fetch all videos
  async getAllVideos(page = 1, limit = 10): Promise<VideoResponse> {
    return videoService.getPublishedVideos({ limitNum: limit });
  }

  // Fetch videos with query parameters
  async getVideosWithQuery(params: {
    language?: string;
    category?: string;
    topic?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<VideoResponse> {
    return videoService.getPublishedVideos({
      language: params.language,
      category: params.category,
      topic: params.topic,
      limitNum: params.limit || 10
    });
  }

  // Fetch videos by category filter
  async getVideosByFilter(
    language = 'en',
    category?: string,
    topic?: string,
    page = 1,
    limit = 10
  ): Promise<VideoResponse> {
    return videoService.getPublishedVideos({
      language,
      category,
      topic,
      limitNum: limit
    });
  }

  // Fetch specific video by slug
  async getVideoBySlug(
    language: string,
    category: string,
    topic: string,
    slug: string
  ): Promise<NewsVideo> {
    const video = await videoService.getVideoBySlug(slug);
    if (!video) {
      throw new Error('Video not found or not published');
    }
    return video;
  }

  // Utility methods
  async getBreakingNews(language = 'en'): Promise<NewsResponse> {
    return newsService.getNewsByCategory('breaking-news', language, 5);
  }

  async getTrendingNews(
    language = 'en',
    page = 1,
    limit = 12
  ): Promise<NewsResponse> {
    return newsService.getTrendingNews(language, limit);
  }

  async getTrendingNewsMostRead(
    language = 'en',
    page = 1,
    limit = 12
  ): Promise<NewsResponse> {
    return newsService.getMostReadNews(language, limit);
  }

  async getTrendingVideos(language = 'en'): Promise<VideoResponse> {
    return videoService.getTrendingVideos(language, 10);
  }
}

export const newsAPI = new NewsAPI();