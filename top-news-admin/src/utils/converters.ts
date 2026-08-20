import {
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { NewsArticle, ShortVideo, AdminUser } from '@/types';

// Utility to generate slug from title
export const generateSlug = (title: string): string => {
  return (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Safe date parsing helper
export const parseFirestoreDate = (val: any): string => {
  if (!val) return new Date().toISOString();
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === 'object' && 'seconds' in val && typeof val.seconds === 'number') {
    return new Date(val.seconds * 1000).toISOString();
  }
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return new Date(val).toISOString();
  return new Date().toISOString();
};

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

export const parseAnyDate = (val: any): Date => {
  const millis = parseDateToMillis(val);
  return new Date(millis);
};

export const isLanguageMatch = (lang1?: string, lang2?: string): boolean => {
  if (!lang1 || !lang2) return true;
  const l1 = lang1.toLowerCase().trim();
  const l2 = lang2.toLowerCase().trim();
  if (l1 === 'all' || l2 === 'all' || l1 === '' || l2 === '') return true;
  if (l1 === l2) return true;
  if ((l1 === 'en' && l2 === 'english') || (l1 === 'english' && l2 === 'en')) return true;
  if ((l1 === 'hi' && l2 === 'hindi') || (l1 === 'hindi' && l2 === 'hi')) return true;
  if ((l1 === 'gu' && l2 === 'gujarati') || (l1 === 'gujarati' && l2 === 'gu')) return true;
  if ((l1 === 'bn' && l2 === 'bengali') || (l1 === 'bengali' && l2 === 'bn')) return true;
  if ((l1 === 'mr' && l2 === 'marathi') || (l1 === 'marathi' && l2 === 'mr')) return true;
  if ((l1 === 'ta' && l2 === 'tamil') || (l1 === 'tamil' && l2 === 'ta')) return true;
  if ((l1 === 'te' && l2 === 'telugu') || (l1 === 'telugu' && l2 === 'te')) return true;
  if ((l1 === 'kn' && l2 === 'kannada') || (l1 === 'kannada' && l2 === 'kn')) return true;
  if ((l1 === 'ml' && l2 === 'malayalam') || (l1 === 'malayalam' && l2 === 'ml')) return true;
  if ((l1 === 'pa' && l2 === 'punjabi') || (l1 === 'punjabi' && l2 === 'pa')) return true;
  if ((l1 === 'ur' && l2 === 'urdu') || (l1 === 'urdu' && l2 === 'ur')) return true;
  if ((l1 === 'es' && l2 === 'spanish') || (l1 === 'spanish' && l2 === 'es')) return true;
  if ((l1 === 'ar' && l2 === 'arabic') || (l1 === 'arabic' && l2 === 'ar')) return true;
  if ((l1 === 'zh' && l2 === 'chinese') || (l1 === 'chinese' && l2 === 'zh')) return true;
  if ((l1 === 'ru' && l2 === 'russian') || (l1 === 'russian' && l2 === 'ru')) return true;
  return false;
};

// ----------------------------------------------------
// NEWS ARTICLE CONVERTERS
// ----------------------------------------------------
export const newsToFirestore = (article: Partial<NewsArticle>, isCreate = false): Record<string, any> => {
  const payload: Record<string, any> = {};

  if (article.title !== undefined) {
    payload.title = article.title.trim();
    payload.slug = article.slug || generateSlug(article.title);
  } else if (article.slug !== undefined) {
    payload.slug = article.slug.trim();
  }

  if (article.description !== undefined) payload.description = article.description.trim();
  if (article.content !== undefined) payload.content = article.content;
  if (article.imageUrl !== undefined) payload.imageUrl = article.imageUrl.trim();
  if (article.category !== undefined) payload.category = article.category.trim().toLowerCase();
  if (article.topic !== undefined) payload.topic = article.topic.trim().toLowerCase();
  if (article.language !== undefined) payload.language = article.language.trim().toLowerCase();
  if (article.section !== undefined) payload.section = article.section;
  if (article.keywords !== undefined) payload.keywords = Array.isArray(article.keywords) ? article.keywords : [];
  if (article.tags !== undefined) payload.tags = Array.isArray(article.tags) ? article.tags : [];
  if (article.sourceUrl !== undefined) payload.sourceUrl = article.sourceUrl.trim();
  if (article.status !== undefined) payload.status = article.status;
  if (article.views !== undefined) payload.views = typeof article.views === 'number' ? article.views : 0;
  if (article.authorId !== undefined) payload.authorId = article.authorId;
  if (article.authorName !== undefined) payload.authorName = article.authorName;
  if (article.authorRole !== undefined) payload.authorRole = article.authorRole;
  if (article.authorCity !== undefined) payload.authorCity = article.authorCity;
  if (article.authorPhoto !== undefined) payload.authorPhoto = article.authorPhoto;
  if (article.pressCardNo !== undefined) payload.pressCardNo = article.pressCardNo;
  if (article.editorialNotes !== undefined) payload.editorialNotes = article.editorialNotes;
  if (article.location !== undefined) payload.location = article.location;
  if (article.aiSummary !== undefined) payload.aiSummary = article.aiSummary;
  if (article.isBreaking !== undefined) payload.isBreaking = article.isBreaking;

  if (article.publishedAt !== undefined) {
    payload.publishedAt = parseAnyDate(article.publishedAt);
  }

  if (isCreate) {
    payload.createdAt = serverTimestamp();
    payload.views = payload.views ?? 0;
    payload.status = payload.status ?? 'published';
  }
  payload.updatedAt = serverTimestamp();

  // Remove any undefined keys to prevent Firestore addDoc errors
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  return payload;
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
    authorId: data.authorId || '',
    authorName: data.authorName || '',
    authorRole: data.authorRole || '',
    authorCity: data.authorCity || '',
    authorPhoto: data.authorPhoto || '',
    pressCardNo: data.pressCardNo || '',
    editorialNotes: data.editorialNotes || '',
    location: data.location || undefined,
    aiSummary: data.aiSummary || '',
    isBreaking: !!data.isBreaking,
    publishedAt: parseFirestoreDate(data.publishedAt),
    createdAt: parseFirestoreDate(data.createdAt),
    updatedAt: parseFirestoreDate(data.updatedAt),
  };
};

// ----------------------------------------------------
// SHORT VIDEO CONVERTERS
// ----------------------------------------------------
export const videoToFirestore = (video: Partial<ShortVideo>, isCreate = false): Record<string, any> => {
  const payload: Record<string, any> = {};

  if (video.title !== undefined) {
    payload.title = video.title.trim();
    payload.slug = video.slug ? video.slug.trim() : generateSlug(video.title);
  } else if (video.slug !== undefined) {
    payload.slug = video.slug.trim();
  }

  if (video.description !== undefined) payload.description = video.description.trim();
  if (video.videoUrl !== undefined) payload.videoUrl = video.videoUrl.trim();
  if (video.thumbnailUrl !== undefined) payload.thumbnailUrl = video.thumbnailUrl.trim();
  if (video.duration !== undefined) payload.duration = typeof video.duration === 'number' ? video.duration : 0;
  if (video.category !== undefined) payload.category = video.category.trim().toLowerCase();
  if (video.topic !== undefined) payload.topic = video.topic.trim().toLowerCase();
  if (video.language !== undefined) payload.language = video.language.trim().toLowerCase();
  if (video.section !== undefined) payload.section = video.section;
  if (video.keywords !== undefined) payload.keywords = Array.isArray(video.keywords) ? video.keywords : [];
  if (video.tags !== undefined) payload.tags = Array.isArray(video.tags) ? video.tags : [];
  if (video.sourceUrl !== undefined) payload.sourceUrl = video.sourceUrl.trim();
  if (video.status !== undefined) payload.status = video.status;
  if (video.views !== undefined) payload.views = typeof video.views === 'number' ? video.views : 0;

  if (video.publishedAt !== undefined) {
    payload.publishedAt = video.publishedAt ? new Date(video.publishedAt) : new Date();
  }

  if (isCreate) {
    payload.createdAt = serverTimestamp();
    payload.views = payload.views ?? 0;
    payload.status = payload.status ?? 'published';
  }
  payload.updatedAt = serverTimestamp();

  // Remove any undefined keys to prevent Firestore addDoc errors
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  return payload;
};

export const videoFromFirestore = (docSnap: QueryDocumentSnapshot<DocumentData> | DocumentData, id: string): ShortVideo => {
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

// ----------------------------------------------------
// ADMIN / APP USER CONVERTERS
// ----------------------------------------------------
export const adminToFirestore = (admin: Partial<AdminUser>, isCreate = false): Record<string, any> => {
  const payload: Record<string, any> = {};

  if (admin.uid !== undefined) payload.uid = admin.uid;
  if (admin.email !== undefined) payload.email = admin.email.trim().toLowerCase();
  if (admin.name !== undefined) payload.name = admin.name.trim();
  if (admin.role !== undefined) payload.role = admin.role;
  if (admin.active !== undefined) payload.active = admin.active === true;
  if (admin.phone !== undefined) payload.phone = admin.phone.trim();
  if (admin.city !== undefined) payload.city = admin.city.trim();
  if (admin.district !== undefined) payload.district = admin.district.trim();
  if (admin.beat !== undefined) payload.beat = admin.beat.trim();
  if (admin.pressCardNo !== undefined) payload.pressCardNo = admin.pressCardNo.trim();
  if (admin.photoUrl !== undefined) payload.photoUrl = admin.photoUrl.trim();
  if (admin.bio !== undefined) payload.bio = admin.bio.trim();
  if (admin.rating !== undefined) payload.rating = admin.rating;
  if (admin.articlesCount !== undefined) payload.articlesCount = admin.articlesCount;
  if (admin.viewsCount !== undefined) payload.viewsCount = admin.viewsCount;
  if (admin.joinedAt !== undefined) payload.joinedAt = admin.joinedAt;

  if (isCreate) {
    payload.createdAt = serverTimestamp();
    payload.role = payload.role ?? 'admin';
    payload.active = payload.active ?? true;
    payload.joinedAt = payload.joinedAt || new Date().toISOString();
  }
  payload.updatedAt = serverTimestamp();

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  return payload;
};

export const adminFromFirestore = (docSnap: QueryDocumentSnapshot<DocumentData> | DocumentData, id: string): AdminUser => {
  const data = docSnap.data ? docSnap.data() : docSnap;
  const activeStr = String(data.active).toLowerCase().trim();
  const isActive = data.active === true || activeStr === 'true' || (data.active !== false && activeStr !== 'false' && activeStr !== 'inactive');

  return {
    uid: id,
    id: id,
    _id: id,
    email: data.email || '',
    name: data.name || '',
    role: data.role || 'admin',
    active: isActive,
    phone: data.phone || '',
    city: data.city || '',
    district: data.district || '',
    beat: data.beat || 'General',
    pressCardNo: data.pressCardNo || `PRESS-${id.slice(0, 6).toUpperCase()}`,
    photoUrl: data.photoUrl || '',
    bio: data.bio || '',
    rating: typeof data.rating === 'number' ? data.rating : 5.0,
    articlesCount: typeof data.articlesCount === 'number' ? data.articlesCount : 0,
    viewsCount: typeof data.viewsCount === 'number' ? data.viewsCount : 0,
    joinedAt: parseFirestoreDate(data.joinedAt || data.createdAt),
    createdAt: parseFirestoreDate(data.createdAt),
    updatedAt: parseFirestoreDate(data.updatedAt),
  };
};
