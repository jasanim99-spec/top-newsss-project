import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/layout/Sidebar';
import { NewsCard } from '@/components/news/NewsCard';
import { VideoCard } from '@/components/news/VideoCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { newsService } from '@/services/newsService';
import { videoService } from '@/services/videoService';
import { newsAPI } from '@/services/api';
import { NewsArticle, NewsVideo } from '@/store/newsStore';
import { useNewsStore } from '@/store/newsStore';

const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'trending', label: 'Trending' },
  { value: 'popular', label: 'Popular' },
  { value: 'most-read', label: 'Most Read' }
];

export default function CategoryPage() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentLanguage } = useNewsStore();
  
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [videos, setVideos] = useState<NewsVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');

  const categoryTitle = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Category';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const fetchCategoryData = async () => {
      if (!category) return;

      try {
        setLoading(true);
        // Fetch Articles
        let newsRes = await newsService.getNewsByCategory(category, currentLanguage, 12);
        if (!newsRes.articles || newsRes.articles.length === 0) {
          newsRes = await newsAPI.getNewsByFilter(currentLanguage, category, undefined, currentPage, 12);
        }
        setArticles(newsRes.articles || []);
        setTotalPages(Math.ceil((newsRes.total || newsRes.articles.length || 1) / 12));

        // Fetch Category Short Videos
        const videoRes = await videoService.getVideosByCategory(category, currentLanguage, 6);
        setVideos(videoRes.videos || []);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();

    window.addEventListener('topnews_realtime_refetch', fetchCategoryData);
    return () => {
      window.removeEventListener('topnews_realtime_refetch', fetchCategoryData);
    };
  }, [category, currentLanguage, sortBy, currentPage]);

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('sort', newSort);
      return newParams;
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="news-container py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="space-y-4">
                    <div className="h-48 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{categoryTitle} News & Videos - Top News</title>
        <meta 
          name="description" 
          content={`Latest ${categoryTitle.toLowerCase()} news, updates, videos and analysis. Stay informed with comprehensive ${categoryTitle.toLowerCase()} coverage.`} 
        />
        <meta 
          name="keywords" 
          content={`${categoryTitle.toLowerCase()}, news, latest ${categoryTitle.toLowerCase()}, updates, breaking news`} 
        />
        <link rel="canonical" href={`https://topsnews.in/category/${category}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${categoryTitle} News - Top News`} />
        <meta property="og:description" content={`Latest ${categoryTitle.toLowerCase()} news and updates`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://topsnews.in/category/${category}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-3 lg:pt-4">
          <div className="news-container pb-8">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold font-serif mb-4">{categoryTitle} News</h1>
              <p className="text-muted-foreground text-lg">
                Stay updated with the latest {categoryTitle.toLowerCase()} news and analysis
              </p>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content */}
              <div className="flex-1">
                {/* Filters */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    Showing {articles.length} articles
                  </p>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Articles Grid */}
                {error ? (
                  <div className="text-center py-12">
                    <h2 className="text-xl font-semibold mb-2">Unable to load news</h2>
                    <p className="text-muted-foreground">{error}</p>
                  </div>
                ) : articles.length === 0 ? (
                  <div className="text-center py-12">
                    <h2 className="text-xl font-semibold mb-2">No articles found</h2>
                    <p className="text-muted-foreground">Try changing the filters or check back later.</p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {articles.map((article, index) => (
                      <motion.div
                        key={article._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <NewsCard article={article} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Category Short Videos Section */}
                {videos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-12 pt-8 border-t border-border"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold font-serif">{categoryTitle} Short Videos</h2>
                        <p className="text-muted-foreground text-sm">Watch latest short video highlights for {categoryTitle.toLowerCase()}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {videos.map((video, index) => (
                        <motion.div
                          key={video._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          <VideoCard video={video} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-12">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      const page = index + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="lg:flex-shrink-0"
              >
                <div className="lg:sticky lg:top-24">
                  <Sidebar />
                </div>
              </motion.div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}