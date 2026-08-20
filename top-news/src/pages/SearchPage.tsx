import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/layout/Sidebar';
import { NewsCard } from '@/components/news/NewsCard';
import { VideoCard } from '@/components/news/VideoCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { newsService } from '@/services/newsService';
import { videoService } from '@/services/videoService';
import { NewsArticle, NewsVideo } from '@/store/newsStore';
import { useNewsStore } from '@/store/newsStore';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentLanguage } = useNewsStore();
  const query = searchParams.get('q') || '';
  
  const [searchValue, setSearchValue] = useState(query);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [videos, setVideos] = useState<NewsVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('articles');

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, currentLanguage]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      const [articlesResponse, videosResponse] = await Promise.all([
        newsService.searchNews(searchQuery, currentLanguage, 20),
        videoService.searchVideos(searchQuery, currentLanguage, 20)
      ]);

      setArticles(articlesResponse.articles || []);
      setVideos(videosResponse.videos || []);
    } catch (err) {
      console.error('Error searching:', err);
      setError('Failed to search');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setSearchParams({ q: searchValue });
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => (
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    ));
  };

  const totalResults = articles.length + videos.length;

  return (
    <>
      <Helmet>
        <title>{query ? `Search: ${query} - Top News` : 'Search - Top News'}</title>
        <meta 
          name="description" 
          content={query ? `Search results for "${query}" on Top News` : 'Search for the latest news articles and videos on Top News'} 
        />
        <link rel="canonical" href={`https://topsnews.in/search${query ? `?q=${encodeURIComponent(query)}` : ''}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main>
          <div className="news-container py-8">
            {/* Search Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold font-serif mb-6">Search News</h1>
              
              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative max-w-2xl">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search for news, articles, videos..."
                    className="pl-12 h-12 text-lg"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  <Button type="submit" className="absolute right-2 top-2">
                    Search
                  </Button>
                </div>
              </form>

              {query && (
                <div className="text-muted-foreground">
                  {loading ? (
                    <p>Searching for "{query}"...</p>
                  ) : (
                    <p>
                      Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
                    </p>
                  )}
                </div>
              )}
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content */}
              <div className="flex-1">
                {loading ? (
                  <div className="space-y-6">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="animate-pulse flex space-x-4">
                        <div className="h-24 w-32 bg-muted rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                          <div className="h-3 bg-muted rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <h2 className="text-xl font-semibold mb-2">Search Error</h2>
                    <p className="text-muted-foreground">{error}</p>
                  </div>
                ) : !query ? (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Start Your Search</h2>
                    <p className="text-muted-foreground">Enter keywords to find news articles and videos</p>
                  </div>
                ) : totalResults === 0 ? (
                  <div className="text-center py-12">
                    <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
                    <p className="text-muted-foreground">
                      No articles or videos found for "{query}". Try different keywords.
                    </p>
                  </div>
                ) : (
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                      <TabsTrigger value="articles">
                        Articles ({articles.length})
                      </TabsTrigger>
                      <TabsTrigger value="videos">
                        Videos ({videos.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="articles">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                      >
                        {articles.map((article, index) => (
                          <motion.div
                            key={article._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="flex space-x-4 border-b border-border pb-6 last:border-b-0"
                          >
                            {article.imageUrl && (
                              <div className="flex-shrink-0">
                                <img
                                  src={article.imageUrl}
                                  alt={article.title}
                                  className="w-32 h-24 object-cover rounded"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-2 hover:text-primary">
                                {highlightText(article.title, query)}
                              </h3>
                              <p className="text-muted-foreground mb-2 line-clamp-2">
                                {highlightText(article.description, query)}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                                  {article.category}
                                </span>
                                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                <span>{(article.views || 0).toLocaleString()} views</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="videos">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      >
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
                      </motion.div>
                    </TabsContent>
                  </Tabs>
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