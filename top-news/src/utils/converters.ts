import {
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp
} from 'firebase/firestore';

export interface NewsArticle {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  imageUrl: string;
  category: string;
  topic?: string;
  language: string;
  section: string;
  keywords: string[];
  tags: string[];
  publishedAt: string;
  sourceUrl?: string;
  views?: number;
  status?: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
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
  topic?: string;
  language: string;
  section: string;
  keywords: string[];
  tags: string[];
  views: number;
  status?: 'draft' | 'published';
  publishedAt: string;
  sourceUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const parseDateToMillis = (val: any): number => {
  if (!val) return Date.now();
  if (val instanceof Timestamp) return val.toDate().getTime();
  if (typeof val === 'object' && 'seconds' in val && typeof val.seconds === 'number') {
    return val.seconds * 1000;
  }
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    let parsed = new Date(val).getTime();
    if (!isNaN(parsed)) return parsed;
    const parts = val.trim().split(/[\sT]+/);
    if (parts[0]) {
      const dParts = parts[0].split('-');
      if (dParts.length === 3 && dParts[0].length <= 2 && dParts[2].length === 4) {
        const day = dParts[0].padStart(2, '0');
        const month = dParts[1].padStart(2, '0');
        const year = dParts[2];
        const timeStr = parts[1] || '00:00:00';
        const iso = `${year}-${month}-${day}T${timeStr}`;
        parsed = new Date(iso).getTime();
        if (!isNaN(parsed)) return parsed;
      }
    }
  }
  return Date.now();
};

const CREATED_NEWS_KEY = 'topnews_created_news_articles';
const DELETED_NEWS_KEY = 'topnews_deleted_news_ids';

export const getCreatedNewsArticles = (): NewsArticle[] => {
  try {
    const raw = localStorage.getItem(CREATED_NEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const getDeletedNewsIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DELETED_NEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

import { formatDistanceToNow } from 'date-fns';

export const safeFormatDistanceToNow = (dateVal: any): string => {
  try {
    if (!dateVal) return 'Recently';
    let d: Date;
    if (dateVal instanceof Date) {
      d = dateVal;
    } else if (typeof dateVal === 'string') {
      const millis = parseDateToMillis(dateVal);
      d = new Date(millis);
    } else if (typeof dateVal === 'number') {
      d = new Date(dateVal);
    } else {
      d = new Date(dateVal);
    }
    if (isNaN(d.getTime())) return 'Recently';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch (e) {
    return 'Recently';
  }
};

export const isLanguageMatch = (lang1?: string, lang2?: string): boolean => {
  if (!lang1 || !lang2) return false;
  const l1 = lang1.toLowerCase().trim();
  const l2 = lang2.toLowerCase().trim();
  if (l1 === 'all' || l2 === 'all' || l1 === '*' || l2 === '*') return true;
  if (l1 === l2) return true;

  const mapCode = (c: string) => {
    if (c === 'english') return 'en';
    if (c === 'gujarati') return 'gu';
    if (c === 'hindi') return 'hi';
    if (c === 'bengali') return 'bn';
    if (c === 'marathi') return 'mr';
    if (c === 'tamil') return 'ta';
    if (c === 'telugu') return 'te';
    if (c === 'kannada') return 'kn';
    if (c === 'malayalam') return 'ml';
    if (c === 'punjabi') return 'pa';
    if (c === 'urdu') return 'ur';
    if (c === 'chinese' || c === 'zh-cn' || c === 'zh-tw' || c === '中文') return 'zh';
    return c;
  };

  return mapCode(l1) === mapCode(l2);
};

export const newsFromFirestore = (docSnap: QueryDocumentSnapshot<DocumentData> | DocumentData, id: string): NewsArticle => {
  const data = docSnap.data ? docSnap.data() : docSnap;

  return {
    _id: id,
    id: id,
    title: data.title || '',
    slug: data.slug || '',
    description: data.description || '',
    content: data.content || '',
    imageUrl: data.imageUrl || '',
    category: data.category || '',
    topic: data.topic || '',
    language: data.language || 'en',
    section: data.section || 'main',
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    sourceUrl: data.sourceUrl || '',
    views: typeof data.views === 'number' ? data.views : 0,
    status: data.status || 'published',
    publishedAt: parseFirestoreDate(data.publishedAt),
    createdAt: parseFirestoreDate(data.createdAt),
    updatedAt: parseFirestoreDate(data.updatedAt),
  };
};

export const videoFromFirestore = (docSnap: QueryDocumentSnapshot<DocumentData> | DocumentData, id: string): NewsVideo => {
  const data = docSnap.data ? docSnap.data() : docSnap;

  return {
    _id: id,
    id: id,
    title: data.title || '',
    slug: data.slug || '',
    description: data.description || '',
    videoUrl: data.videoUrl || '',
    thumbnailUrl: data.thumbnailUrl || '',
    duration: typeof data.duration === 'number' ? data.duration : 0,
    category: data.category || '',
    topic: data.topic || '',
    language: data.language || 'en',
    section: data.section || 'main',
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    sourceUrl: data.sourceUrl || '',
    views: typeof data.views === 'number' ? data.views : 0,
    status: data.status || 'published',
    publishedAt: parseFirestoreDate(data.publishedAt),
    createdAt: parseFirestoreDate(data.createdAt),
    updatedAt: parseFirestoreDate(data.updatedAt),
  };
};
