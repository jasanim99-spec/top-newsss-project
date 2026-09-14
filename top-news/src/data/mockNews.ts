import { NewsArticle, NewsVideo } from '@/store/newsStore';

export const mockArticles: NewsArticle[] = [
  {
    _id: 'article_cwc_vande_mataram',
    id: 'article_cwc_vande_mataram',
    title: "'Should not have played to BJP's strength': Congress unease over 'Vande Mataram' stand",
    slug: "should-not-have-played-to-bjp-strength-congress-unease-over-vande-mataram-stand",
    description: "A day after the Congress Working Committee (CWC) reaffirmed that only the first two stanzas of 'Vande Mataram' would be sung at party events, there is a growing sense of unease in sections of the party that believe the leadership should have handled the matter with more nuance.",
    content: "A day after the Congress Working Committee (CWC) reaffirmed that only the first two stanzas of 'Vande Mataram' would be sung at party events, there is a growing sense of unease in sections of the party that believe the leadership should have handled the matter with more nuance. Senior leaders expressed concerns that the decision might be misinterpreted, while others maintained that sticking to historical precedents established during the freedom struggle was the right approach.",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800",
    category: "politics",
    topic: "general",
    language: "en",
    section: "main",
    keywords: ["Congress", "BJP", "Vande Mataram", "Politics", "CWC"],
    tags: ["Politics", "National", "CWC"],
    publishedAt: new Date().toISOString(),
    authorName: "Admin Desk",
    authorRole: "admin",
    views: 120,
    status: "published"
  }
];

export const mockVideos: NewsVideo[] = [];