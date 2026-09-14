import { useEffect } from 'react';
import { useNewsStore } from '@/store/newsStore';
import { mockArticles, mockVideos } from '@/data/mockNews';
import { newsService } from '@/services/newsService';
import { videoService } from '@/services/videoService';
import { isLanguageMatch } from '@/utils/converters';

export function useMockData() {
  const { 
    currentLanguage,
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

        // Fetch published articles in current language directly from API/DB
        const [
          allNewsRes,
          videosResponse
        ] = await Promise.all([
          newsService.getPublishedNews({ language: currentLanguage, limitNum: 30 }),
          videoService.getTrendingVideos(currentLanguage, 10)
        ]);

        if (allNewsRes.articles.length > 0) {
          setFeaturedArticles(allNewsRes.articles.slice(0, 6));
          setTrendingArticles(allNewsRes.articles);
        } else {
          // Filter mock articles by current language
          const langMocks = mockArticles.filter(a => isLanguageMatch(a.language, currentLanguage));
          setFeaturedArticles(langMocks.slice(0, 6));
          setTrendingArticles(langMocks);
        }

        if (videosResponse.videos.length > 0) {
          setVideos(videosResponse.videos);
        } else {
          const langVideoMocks = mockVideos.filter(v => isLanguageMatch(v.language, currentLanguage));
          setVideos(langVideoMocks);
        }

        // Load category-specific data in current language
        const categories = ['technology', 'sports', 'business', 'politics', 'health', 'world', 'environment'];
        for (const category of categories) {
          try {
            const categoryResponse = await newsService.getNewsByCategory(category, currentLanguage, 6);
            if (categoryResponse.articles.length > 0) {
              setCategoryArticles(category, categoryResponse.articles);
            } else if (allNewsRes.articles.length > 0) {
              const matched = allNewsRes.articles.filter(a => 
                (a.category || '').toLowerCase() === category.toLowerCase() &&
                isLanguageMatch(a.language, currentLanguage)
              );
              setCategoryArticles(category, matched);
            } else {
              const catMocks = mockArticles.filter(a => 
                a.category === category && 
                isLanguageMatch(a.language, currentLanguage)
              );
              setCategoryArticles(category, catMocks);
            }
          } catch (err) {
            console.warn(`Failed to load ${category} articles:`, err);
          }
        }

      } catch (err) {
        console.error('Error loading news data:', err);
        setError('Failed to load news data');
        
        const langMocks = mockArticles.filter(a => isLanguageMatch(a.language, currentLanguage));
        setFeaturedArticles(langMocks.slice(0, 6));
        setTrendingArticles(langMocks);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    currentLanguage,
    setFeaturedArticles, 
    setTrendingArticles, 
    setCategoryArticles, 
    setVideos,
    setLoading,
    setError
  ]);
}