import { useState, useEffect, useCallback } from 'react';
import { videoService } from '@/services/videoService';
import { NewsVideo, VideoResponse } from '@/store/newsStore';

export function usePublishedVideos(params: {
  language?: string;
  category?: string;
  topic?: string;
  limitNum?: number;
} = {}) {
  const [data, setData] = useState<VideoResponse>({ total: 0, page: 1, limit: params.limitNum || 10, videos: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await videoService.getPublishedVideos(params);
      setData(res);
    } catch (err: any) {
      console.error('usePublishedVideos error:', err);
      setError('Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  }, [params.language, params.category, params.topic, params.limitNum]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return { data, loading, error, refetch: fetchVideos };
}

export function useVideoBySlug(slug?: string) {
  const [video, setVideo] = useState<NewsVideo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideo = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await videoService.getVideoBySlug(slug);
      if (!res) {
        setError('Video not found');
      } else {
        setVideo(res);
      }
    } catch (err: any) {
      console.error(`useVideoBySlug error (${slug}):`, err);
      setError('Failed to fetch video details');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

  return { video, loading, error, refetch: fetchVideo };
}

export function useVideosByCategory(category?: string, language?: string, limitNum = 12) {
  const [data, setData] = useState<VideoResponse>({ total: 0, page: 1, limit: limitNum, videos: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    if (!category) return;
    try {
      setLoading(true);
      setError(null);
      const res = await videoService.getVideosByCategory(category, language, limitNum);
      setData(res);
    } catch (err: any) {
      console.error(`useVideosByCategory error (${category}):`, err);
      setError('Failed to fetch category videos');
    } finally {
      setLoading(false);
    }
  }, [category, language, limitNum]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return { data, loading, error, refetch: fetchVideos };
}

export function useVideosByLanguage(language = 'en', limitNum = 12) {
  return usePublishedVideos({ language, limitNum });
}

export function useTrendingVideos(language?: string, limitNum = 10) {
  const [data, setData] = useState<VideoResponse>({ total: 0, page: 1, limit: limitNum, videos: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await videoService.getTrendingVideos(language, limitNum);
      setData(res);
    } catch (err: any) {
      console.error('useTrendingVideos error:', err);
      setError('Failed to fetch trending videos');
    } finally {
      setLoading(false);
    }
  }, [language, limitNum]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return { data, loading, error, refetch: fetchTrending };
}

export function useMostViewedVideos(language?: string, limitNum = 10) {
  return useTrendingVideos(language, limitNum);
}
