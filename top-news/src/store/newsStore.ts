import { create } from 'zustand';

export interface NewsArticle {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  imageUrl: string;
  category: string;
  topic: string;
  language: string;
  section: string;
  keywords: string[];
  tags: string[];
  sourceUrl: string;
  views: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
}

export interface NewsVideo {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  category: string;
  topic: string;
  language: string;
  section: string;
  keywords: string[];
  tags: string[];
  sourceUrl: string;
  views: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
}

export interface NewsResponse {
  total: number;
  page: number;
  limit: number;
  articles: NewsArticle[];
  lastDoc?: any;
}

export interface VideoResponse {
  total: number;
  page: number;
  limit: number;
  videos: NewsVideo[];
  lastDoc?: any;
}

interface NewsState {
  // Data
  heroArticle: NewsArticle | null;
  featuredArticles: NewsArticle[];
  trendingArticles: NewsArticle[];
  categoryArticles: Record<string, NewsArticle[]>;
  videos: NewsVideo[];
  
  // UI State
  currentLanguage: string;
  searchQuery: string;
  selectedCategory: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setHeroArticle: (article: NewsArticle | null) => void;
  setFeaturedArticles: (articles: NewsArticle[]) => void;
  setTrendingArticles: (articles: NewsArticle[]) => void;
  setCategoryArticles: (category: string, articles: NewsArticle[]) => void;
  setVideos: (videos: NewsVideo[]) => void;
  setCurrentLanguage: (language: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNewsStore = create<NewsState>((set) => ({
  // Data
  heroArticle: null,
  featuredArticles: [],
  trendingArticles: [],
  categoryArticles: {},
  videos: [],
  
  // UI State
  currentLanguage: 'en',
  searchQuery: '',
  selectedCategory: '',
  isLoading: false,
  error: null,
  
  // Actions
  setHeroArticle: (article) => set({ heroArticle: article }),
  setFeaturedArticles: (articles) => set({ featuredArticles: articles }),
  setTrendingArticles: (articles) => set({ trendingArticles: articles }),
  setCategoryArticles: (category, articles) => 
    set((state) => ({
      categoryArticles: { ...state.categoryArticles, [category]: articles }
    })),
  setVideos: (videos) => set({ videos }),
  setCurrentLanguage: (language) => set({ currentLanguage: language }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error })
}));