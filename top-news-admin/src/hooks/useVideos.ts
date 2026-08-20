import { useState, useEffect, useCallback } from 'react';
import { videoService } from '@/services/videoService';
import { ShortVideo, ApiResponse } from '@/types';

export function useVideos(options: {
  page?: number;
  limit?: number;
  category?: string;
  topic?: string;
  language?: string;
  status?: 'draft' | 'published' | 'all';
  search?: string;
} = {}) {
  const [data, setData] = useState<ApiResponse<ShortVideo>>({ total: 0, page: options.page || 1, limit: options.limit || 10, videos: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await videoService.getVideos(options);
      setData(res);
    } catch (err: any) {
      console.error('useVideos hook error:', err);
      setError(err.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  }, [options.page, options.limit, options.category, options.topic, options.language, options.status, options.search]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const createVideo = async (videoData: Partial<ShortVideo>) => {
    const res = await videoService.createVideo(videoData);
    await fetchVideos();
    return res;
  };

  const updateVideo = async (id: string, videoData: Partial<ShortVideo>) => {
    const res = await videoService.updateVideo(id, videoData);
    await fetchVideos();
    return res;
  };

  const deleteVideo = async (id: string) => {
    await videoService.deleteVideo(id);
    await fetchVideos();
  };

  const publishVideo = async (id: string) => {
    await videoService.publishVideo(id);
    await fetchVideos();
  };

  const unpublishVideo = async (id: string) => {
    await videoService.unpublishVideo(id);
    await fetchVideos();
  };

  return {
    data,
    videos: data.videos || [],
    total: data.total,
    loading,
    error,
    refetch: fetchVideos,
    createVideo,
    updateVideo,
    deleteVideo,
    publishVideo,
    unpublishVideo
  };
}

export function useVideoDetail(id?: string) {
  const [video, setVideo] = useState<ShortVideo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await videoService.getVideoById(id);
      setVideo(res);
      if (!res) setError('Video not found');
    } catch (err: any) {
      console.error(`useVideoDetail error (${id}):`, err);
      setError('Failed to fetch video details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { video, loading, error, refetch: fetchDetail };
}
