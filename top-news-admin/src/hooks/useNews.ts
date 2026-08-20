import { useState, useEffect, useCallback } from 'react';
import { newsService } from '@/services/newsService';
import { NewsArticle, ApiResponse } from '@/types';

export function useNews(options: {
  page?: number;
  limit?: number;
  category?: string;
  topic?: string;
  language?: string;
  status?: 'draft' | 'published' | 'all';
  search?: string;
} = {}) {
  const [data, setData] = useState<ApiResponse<NewsArticle>>({ total: 0, page: options.page || 1, limit: options.limit || 10, articles: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await newsService.getNews(options);
      setData(res);
    } catch (err: any) {
      console.error('useNews hook error:', err);
      setError(err.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  }, [options.page, options.limit, options.category, options.topic, options.language, options.status, options.search]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const createNews = async (articleData: Partial<NewsArticle>) => {
    const res = await newsService.createNews(articleData);
    await fetchNews();
    return res;
  };

  const updateNews = async (id: string, articleData: Partial<NewsArticle>) => {
    const res = await newsService.updateNews(id, articleData);
    await fetchNews();
    return res;
  };

  const deleteNews = async (id: string) => {
    await newsService.deleteNews(id);
    await fetchNews();
  };

  const publishNews = async (id: string) => {
    await newsService.publishNews(id);
    await fetchNews();
  };

  const unpublishNews = async (id: string) => {
    await newsService.unpublishNews(id);
    await fetchNews();
  };

  return {
    data,
    articles: data.articles || [],
    total: data.total,
    loading,
    error,
    refetch: fetchNews,
    createNews,
    updateNews,
    deleteNews,
    publishNews,
    unpublishNews
  };
}

export function useNewsDetail(id?: string) {
  const [article, setArticle] = useState<NewsArticle | null>(null);
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
      const res = await newsService.getNewsById(id);
      setArticle(res);
      if (!res) setError('Article not found');
    } catch (err: any) {
      console.error(`useNewsDetail error (${id}):`, err);
      setError('Failed to fetch article details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { article, loading, error, refetch: fetchDetail };
}
