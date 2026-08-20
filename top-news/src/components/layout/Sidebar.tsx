import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, Mail, Cloud, ExternalLink } from 'lucide-react';
import { NewsCard } from '@/components/news/NewsCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { newsAPI } from '@/services/api';
import { useNewsStore } from '@/store/newsStore';
import { Skeleton } from '@/components/ui/skeleton';

export function Sidebar() {
  const { currentLanguage, trendingArticles, setTrendingArticles } = useNewsStore();

  const { data: trendingData, isLoading } = useQuery({
    queryKey: ['trending-sidebar', currentLanguage],
    queryFn: () => newsAPI.getTrendingNews(currentLanguage),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: mostReadData, isLoading: isMostReadLoading } = useQuery({
    queryKey: ['most-read-sidebar', currentLanguage],
    queryFn: () => newsAPI.getTrendingNewsMostRead(currentLanguage),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    if (trendingData?.articles) {
      setTrendingArticles(trendingData.articles.slice(0, 8));
    }
  }, [trendingData, setTrendingArticles]);

  return (
    <aside className="w-full lg:w-80 space-y-8">
      {/* Trending Now */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="news-card p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Trending Now</h3>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <Skeleton className="w-12 h-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {trendingArticles.slice(0, 5).map((article, index) => (
              <motion.div
                key={article._id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <NewsCard
                  article={article}
                  variant="sidebar"
                  showImage={true}
                  showDescription={false}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Most Read This Week */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="news-card p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Eye className="h-5 w-5 text-secondary" />
          <h3 className="text-lg font-semibold">Most Read This Week</h3>
        </div>
        
        {isMostReadLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {(mostReadData?.articles ?? []).slice(0, 5).map((article, index) => (
              <motion.div
                key={article._id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start space-x-3 group cursor-pointer"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <a 
                  href={`/article/${article.language}/${article.category}/${article.topic}/${article.slug}`}
                  className="text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2"
                >
                  {article.title}
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Newsletter Signup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="news-card p-6 bg-gradient-to-br from-primary/5 to-secondary/5"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Mail className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Newsletter</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Get the latest news delivered directly to your inbox every morning.
        </p>
        
        <form className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email"
            className="w-full"
          />
          <Button type="submit" className="w-full">
            Subscribe
          </Button>
        </form>
        
        <p className="text-xs text-muted-foreground mt-3">
          By subscribing, you agree to our Privacy Policy and Terms of Service.
        </p>
      </motion.div>

      {/* Mini Weather Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="news-card p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Cloud className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Weather</h3>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground mb-1">22°C</div>
          <div className="text-sm text-muted-foreground mb-2">Partly Cloudy</div>
          <div className="text-xs text-muted-foreground">New Delhi, India</div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <div className="text-center">
            <div className="font-medium">Mon</div>
            <div>25°/18°</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Tue</div>
            <div>27°/19°</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Wed</div>
            <div>24°/17°</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Thu</div>
            <div>26°/20°</div>
          </div>
        </div>
      </motion.div>

      {/* Advertisement Slot */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="news-card p-6 bg-gradient-to-br from-muted/50 to-muted border-dashed overflow-hidden relative group"
      >
        <div className="text-center space-y-4">
          <div className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            <span>Advertisement</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted-foreground/15 text-muted-foreground font-semibold uppercase tracking-wider scale-90">Sponsored</span>
          </div>
          <div className="aspect-[4/3] w-full rounded-lg overflow-hidden relative bg-muted/30">
            <img 
              src="/premium_ad_banner.png" 
              alt="Top News Premium Subscription Ad" 
              className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-xs font-semibold flex items-center gap-1">
                Go Premium <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300">
            Learn More
          </Button>
        </div>
      </motion.div>
    </aside>
  );
}