import { useEffect } from 'react';
import { useNewsStore } from '@/store/newsStore';
import { mockArticles, mockVideos } from '@/data/mockNews';
import { newsService } from '@/services/newsService';
import { videoService } from '@/services/videoService';

// Hook to populate the store with real Firestore data (or fallback mock data if empty)
export function useMockData() {
  const { 
    currentLanguage,
    setHeroArticle, 
    setFeaturedArticles, 
    setTrendingArticles,
    setCategoryArticles,
    setVideos,
    setLoading,
    setError
  } = useNewsStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all published articles directly from Firestore
        const [
          allNewsRes,
          videosResponse
        ] = await Promise.all([
          newsService.getPublishedNews({ limitNum: 30 }),
          videoService.getTrendingVideos(currentLanguage, 10)
        ]);

        if (allNewsRes.articles.length > 0) {
          // Set hero article to the newest published article from Firestore
          setHeroArticle(allNewsRes.articles[0]);
          setFeaturedArticles(allNewsRes.articles.slice(1, 7));
          setTrendingArticles(allNewsRes.articles);
        } else {
          setHeroArticle(mockArticles[0]);
          setFeaturedArticles(mockArticles.slice(1, 6));
          setTrendingArticles(mockArticles);
        }

        if (videosResponse.videos.length > 0) {
          setVideos(videosResponse.videos);
        } else {
          setVideos(mockVideos);
        }

        // Load category-specific data from Firestore
        const categories = ['technology', 'sports', 'business', 'politics', 'health', 'world', 'environment'];
        for (const category of categories) {
          try {
            const categoryResponse = await newsService.getNewsByCategory(category, undefined, 6);
            if (categoryResponse.articles.length > 0) {
              setCategoryArticles(category, categoryResponse.articles);
            } else if (allNewsRes.articles.length > 0) {
              const matched = allNewsRes.articles.filter(a => (a.category || '').toLowerCase() === category.toLowerCase());
              setCategoryArticles(category, matched);
            } else {
              const catMocks = mockArticles.filter(a => a.category === category);
              setCategoryArticles(category, catMocks.length > 0 ? catMocks : mockArticles.slice(0, 4));
            }
          } catch (err) {
            console.warn(`Failed to load ${category} articles from Firestore:`, err);
          }
        }

      } catch (err) {
        console.error('Error loading data from Firebase:', err);
        setError('Failed to load news data from Firebase');
        
        setHeroArticle(mockArticles[0]);
        setFeaturedArticles(mockArticles.slice(1, 6));
        setTrendingArticles(mockArticles);
        setVideos(mockVideos);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    currentLanguage,
    setHeroArticle, 
    setFeaturedArticles, 
    setTrendingArticles, 
    setCategoryArticles, 
    setVideos,
    setLoading,
    setError
  ]);
}