import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VideoCard } from '@/components/news/VideoCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { newsAPI } from '@/services/api';
import { videoService } from '@/services/videoService';
import { NewsVideo } from '@/store/newsStore';
import { useNewsStore } from '@/store/newsStore';
import { mockVideos } from '@/data/mockNews';
import { Play, Clock, Eye, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'sports', label: 'Sports' },
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'politics', label: 'Politics' },
  { value: 'health', label: 'Health' }
];

const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'trending', label: 'Trending' },
  { value: 'popular', label: 'Popular' },
  { value: 'most-read', label: 'Most Viewed' }
];

export default function VideoPage() {
  const { language, category, topic, slug } = useParams();
  const { currentLanguage } = useNewsStore();
  const [videos, setVideos] = useState<NewsVideo[]>([]);
  const [currentVideo, setCurrentVideo] = useState<NewsVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const incrementedRef = useRef<string | null>(null);

  // Check if this is a specific video page
  const isSpecificVideo = !!(language && category && topic && slug);

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (isSpecificVideo) {
          // Fetch specific video
          let video;
          try {
            video = await videoService.getVideoBySlug(slug!);
            if (!video) {
              video = await newsAPI.getVideoBySlug(language!, category!, topic!, slug!);
            }
          } catch (err) {
            console.error('Error fetching video, falling back to mock:', err);
            video = mockVideos.find(v => v.slug === slug);
            if (!video) throw err;
          }
          setCurrentVideo(video);
          
          if (video && video._id && incrementedRef.current !== video._id) {
            incrementedRef.current = video._id;
            videoService.incrementVideoViews(video._id);
          }
          
          // Fetch related videos
          const params = {
            language: language!,
            category: category!,
            limit: 8
          };
          try {
            const response = await newsAPI.getVideosWithQuery(params);
            setVideos(response.videos?.filter(v => v._id !== video._id) || []);
          } catch (err) {
            console.warn('Failed to fetch related videos, falling back to mock:', err);
            setVideos(mockVideos.filter(v => v._id !== video._id && v.category === category));
          }
        } else {
          // Fetch all videos with filters
          const params = {
            language: currentLanguage,
            ...(categoryFilter && categoryFilter !== 'all' && { category: categoryFilter }),
            sort: sortBy,
            page: currentPage,
            limit: 12
          };

          const response = await newsAPI.getVideosWithQuery(params);
          setVideos(response.videos || []);
          setTotalPages(Math.ceil(response.total / 12));
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentLanguage, categoryFilter, sortBy, currentPage, language, category, topic, slug, isSpecificVideo]);

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="space-y-3">
                    <div className="aspect-[9/16] bg-muted rounded-lg"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
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

  // Single video page render
  if (isSpecificVideo && currentVideo) {
    return (
      <>
        <Helmet>
          <title>{currentVideo.title} - Top News</title>
          <meta name="description" content={currentVideo.description} />
          <meta name="keywords" content={currentVideo.keywords.join(', ')} />
          
          {/* Open Graph */}
          <meta property="og:title" content={currentVideo.title} />
          <meta property="og:description" content={currentVideo.description} />
          <meta property="og:type" content="video.other" />
          <meta property="og:image" content={currentVideo.thumbnailUrl} />
        </Helmet>

        <div className="min-h-screen bg-background">
          <Header />
          
          <main className="py-8">
            <div className="news-container">
              <div className="max-w-4xl mx-auto">
                {/* Video Player */}
                {/* <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                  <video
                    src={currentVideo.videoUrl}
                    poster={currentVideo.thumbnailUrl}
                    controls
                    className="w-full h-full"
                    autoPlay
                  />
                </div> */}
                <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-6 shadow-2xl border border-slate-800 relative">
                  {currentVideo.videoUrl.includes('youtube.com') || currentVideo.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={
                        currentVideo.videoUrl.includes('shorts/')
                          ? `https://www.youtube.com/embed/${currentVideo.videoUrl.split('shorts/')[1]?.split('?')[0]}?autoplay=1`
                          : currentVideo.videoUrl.includes('watch?v=')
                          ? `https://www.youtube.com/embed/${currentVideo.videoUrl.split('watch?v=')[1]?.split('&')[0]}?autoplay=1`
                          : `https://www.youtube.com/embed/${currentVideo.videoUrl.split('youtu.be/')[1]?.split('?')[0]}?autoplay=1`
                      }
                      title={currentVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <video
                      key={currentVideo.videoUrl}
                      controls
                      playsInline
                      preload="auto"
                      poster={currentVideo.thumbnailUrl}
                      className="w-full h-full object-contain"
                    >
                      <source src={currentVideo.videoUrl} type="video/mp4" />
                      <source src={currentVideo.videoUrl} type="video/webm" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
                {/* Video Info */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium uppercase">
                      {currentVideo.category}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {new Date(currentVideo.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl font-bold font-serif">{currentVideo.title}</h1>
                  <div className="prose prose-lg max-w-none prose-headings:font-serif prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-lg prose-p:leading-relaxed prose-strong:font-semibold prose-ul:list-disc prose-ol:list-decimal prose-li:mb-2 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-hr:border-border prose-hr:my-8">
                                      <ReactMarkdown
                                        components={{
                                          p: ({ children }) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
                                          h1: ({ children }) => (
                                            <h1 className="text-2xl font-bold mb-4 mt-8 text-foreground border-b border-border pb-2">
                                              {children}
                                            </h1>
                                          ),
                                          h2: ({ children }) => (
                                            <h2 className="text-xl font-semibold mb-3 mt-6 text-foreground">{children}</h2>
                                          ),
                                          h3: ({ children }) => (
                                            <h3 className="text-lg font-medium mb-2 mt-4 text-foreground">{children}</h3>
                                          ),
                                          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                                          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                                          li: ({ children }) => <li className="text-foreground leading-relaxed">{children}</li>,
                                          hr: () => <hr className="border-border my-8" />,
                                          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                          em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                                          blockquote: ({ children }) => (
                                            <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-muted/30 italic text-muted-foreground">
                                              {children}
                                            </blockquote>
                                          ),
                                          a: ({ href, children }) => (
                                            <a
                                              href={href}
                                              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              {children}
                                            </a>
                                          ),
                                          code: ({ children, ...props }) => {
                                            const isInline = !props.className?.includes("language-")
                                            if (isInline) {
                                              return (
                                                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground border">
                                                  {children}
                                                </code>
                                              )
                                            }
                                            return (
                                              <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4 border">
                                                <code className="text-sm font-mono text-foreground">{children}</code>
                                              </pre>
                                            )
                                          },
                                          pre: ({ children }) => (
                                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4 border">{children}</pre>
                                          ),
                                          table: ({ children }) => (
                                            <div className="overflow-x-auto my-6">
                                              <table className="min-w-full border-collapse border border-border bg-background">
                                                {children}
                                              </table>
                                            </div>
                                          ),
                                          thead: ({ children }) => <thead>{children}</thead>,
                                          tbody: ({ children }) => <tbody>{children}</tbody>,
                                          tr: ({ children }) => <tr>{children}</tr>,
                                          th: ({ children }) => (
                                            <th className="border border-border px-4 py-3 text-left font-semibold text-foreground bg-muted/30">
                                              {children}
                                            </th>
                                          ),
                                          td: ({ children }) => (
                                            <td className="border border-border px-4 py-3 text-foreground">{children}</td>
                                          ),
                                          img: ({ src, alt }) => (
                                            <img
                                              src={src || "/placeholder.svg"}
                                              alt={alt || ""}
                                              className="max-w-full h-auto rounded-lg my-4 border"
                                            />
                                          ),
                                        }}
                                      >
                                        {currentVideo.description.replace(/\\n/g, "\n")}
                                      </ReactMarkdown>
                                    </div>
                  {/* <p className="text-lg text-muted-foreground">{currentVideo.description}</p> */}
                  
                  <div className="flex items-center justify-between border-y border-border py-4">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{(currentVideo.views || 0).toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{Math.floor(currentVideo.duration / 60)}:{(currentVideo.duration % 60).toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Related Videos */}
                {videos.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Related Videos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>News Videos - Top News</title>
        <meta 
          name="description" 
          content="Watch the latest news videos, breaking news clips, and trending stories. Stay informed with video news updates." 
        />
        <meta 
          name="keywords" 
          content="news videos, breaking news videos, trending videos, video news, live updates" 
        />
        <link rel="canonical" href="https://topsnews.in/videos" />
        
        {/* Open Graph */}
        <meta property="og:title" content="News Videos - Top News" />
        <meta property="og:description" content="Watch the latest news videos and breaking news clips" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://topsnews.in/videos" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main>
          <div className="news-container py-8">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold font-serif mb-4">News Videos</h1>
              <p className="text-muted-foreground text-lg">
                Watch the latest news videos and stay updated with breaking stories
              </p>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="data-[state=open]:bg-white"> 
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="data-[state=open]:bg-white">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex-1"></div>
              
              <p className="text-sm text-muted-foreground self-end">
                {videos.length} videos found
              </p>
            </div>

            {/* Videos Grid */}
            {error ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">Unable to load videos</h2>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">No videos found</h2>
                <p className="text-muted-foreground">Try changing the filters or check back later.</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
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
        </main>
        
        <Footer />
      </div>
    </>
  );
}