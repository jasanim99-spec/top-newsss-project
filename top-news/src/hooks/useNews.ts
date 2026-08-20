import { useState, useEffect, useCallback } from 'react';
import { newsService } from '@/services/newsService';
import { NewsArticle, NewsResponse } from '@/store/newsStore';

export function usePublishedNews(params: {
  language?: string;
  category?: string;
  topic?: string;
  limitNum?: number;
} = {}) {
  const [data, setData] = useState<NewsResponse>({ total: 0, page: 1, limit: params.limitNum || 10, articles: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await newsService.getPublishedNews(params);
      setData(res);
    } catch (err: any) {
      console.error('usePublishedNews error:', err);
      setError('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  }, [params.language, params.category, params.topic, params.limitNum]);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 3000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  return { data, loading, error, refetch: fetchNews };
}

export function useNewsBySlug(slug?: string) {
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticle = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await newsService.getNewsBySlug(slug);
      if (!res) {
        setError('Article not found');
      } else {
        setArticle(res);
      }
    } catch (err: any) {
      console.error(`useNewsBySlug error (${slug}):`, err);
      setError('Failed to fetch article details');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  return { article, loading, error, refetch: fetchArticle };
}

export function useNewsByCategory(category?: string, language?: string, limitNum = 12) {
  const [data, setData] = useState<NewsResponse>({ total: 0, page: 1, limit: limitNum, articles: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    if (!category) return;
    try {
      setLoading(true);
      setError(null);
      const res = await newsService.getNewsByCategory(category, language, limitNum);
      setData(res);
    } catch (err: any) {
      console.error(`useNewsByCategory error (${category}):`, err);
      setError('Failed to fetch category news');
    } finally {
      setLoading(false);
    }
  }, [category, language, limitNum]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { data, loading, error, refetch: fetchNews };
}

export function useNewsByTopic(topic?: string, language?: string, limitNum = 12) {
  const [data, setData] = useState<NewsResponse>({ total: 0, page: 1, limit: limitNum, articles: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    if (!topic) return;
    try {
      setLoading(true);
      setError(null);
      const res = await newsService.getNewsByTopic(topic, language, limitNum);
      setData(res);
    } catch (err: any) {
      console.error(`useNewsByTopic error (${topic}):`, err);
      setError('Failed to fetch topic news');
    } finally {
      setLoading(false);
    }
  }, [topic, language, limitNum]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { data, loading, error, refetch: fetchNews };
}

export function useNewsByLanguage(language = 'en', limitNum = 12) {
  return usePublishedNews({ language, limitNum });
}

export function useTrendingNews(language?: string, limitNum = 10) {
  const [data, setData] = useState<NewsResponse>({ total: 0, page: 1, limit: limitNum, articles: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await newsService.getTrendingNews(language, limitNum);
      setData(res);
    } catch (err: any) {
      console.error('useTrendingNews error:', err);
      setError('Failed to fetch trending news');
    } finally {
      setLoading(false);
    }
  }, [language, limitNum]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return { data, loading, error, refetch: fetchTrending };
}

export function useMostReadNews(language?: string, limitNum = 10) {
  return useTrendingNews(language, limitNum);
}

export function useSearchNews(queryText?: string, language?: string) {
  const [data, setData] = useState<NewsResponse>({ total: 0, page: 1, limit: 20, articles: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSearch = useCallback(async () => {
    if (!queryText || !queryText.trim()) {
      setData({ total: 0, page: 1, limit: 20, articles: [] });
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await newsService.searchNews(queryText, language, 20);
      setData(res);
    } catch (err: any) {
      console.error('useSearchNews error:', err);
      setError('Failed to perform search');
    } finally {
      setLoading(false);
    }
  }, [queryText, language]);

  useEffect(() => {
    fetchSearch();
  }, [fetchSearch]);

  return { data, loading, error, refetch: fetchSearch };
}
