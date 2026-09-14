export type AppRole = 'admin' | 'reporter';

export interface AppUser {
  uid: string;
  id?: string;
  _id?: string;
  email: string;
  name: string;
  role: AppRole;
  active: boolean;
  phone?: string;
  city?: string;
  district?: string;
  beat?: string; // e.g. Crime, Sports, Politics, Local, Tech
  pressCardNo?: string;
  photoUrl?: string;
  bio?: string;
  rating?: number;
  articlesCount?: number;
  viewsCount?: number;
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AdminUser = AppUser;

export interface NewsArticle {
  _id?: string;
  id?: string;
  title: string;
  slug?: string;
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
  views?: number;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  authorCity?: string;
  authorPhoto?: string;
  pressCardNo?: string;
  editorialNotes?: string;
  location?: {
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  aiSummary?: string;
  isBreaking?: boolean;
}

export interface ShortVideo {
  _id?: string;
  id?: string;
  title: string;
  slug?: string;
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
  views?: number;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
  status: 'draft' | 'published';
}

export interface ApiResponse<T> {
  total: number;
  page: number;
  limit: number;
  articles?: T[];
  videos?: T[];
  lastDoc?: any;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface LanguageOption {
  code: string;
  name: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "gu", name: "Gujarati" },
  { code: "pa", name: "Punjabi" },
  { code: "zh", name: "Chinese" },
  { code: "ru", name: "Russian" }
];

export const LANGUAGES = LANGUAGE_OPTIONS.map(l => l.code);

export const getLanguageName = (code?: string): string => {
  if (!code) return '';
  const match = LANGUAGE_OPTIONS.find(l => l.code.toLowerCase() === code.toLowerCase().trim());
  return match ? match.name : code.toUpperCase();
};

export const CATEGORIES = [
  "sports", "technology", "business", "politics", "entertainment", "health",
  "lifestyle", "world", "environment", "education", "science", "automobile",
  "opinion", "breaking-news"
];