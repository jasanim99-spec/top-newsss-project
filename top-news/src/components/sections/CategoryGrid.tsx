import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { NewsCard } from '@/components/news/NewsCard';
import { Button } from '@/components/ui/button';
import { newsAPI } from '@/services/api';
import { useNewsStore } from '@/store/newsStore';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { 
    name: 'Technology', 
    key: 'technology',
    description: 'Latest tech news, gadgets, and innovations'
  },
  { 
    name: 'Sports', 
    key: 'sports',
    description: 'Live scores, matches, and sports updates'
  },
  { 
    name: 'Business', 
    key: 'business',
    description: 'Market news, economy, and finance updates'
  },
  { 
    name: 'Politics', 
    key: 'politics',
    description: 'Government news, policies, and elections'
  },
  { 
    name: 'Entertainment', 
    key: 'entertainment',
    description: 'Movies, celebrities, and show business'
  },
  { 
    name: 'Health', 
    key: 'health',
    description: 'Medical news, wellness, and health tips'
  }
];

export function CategoryGrid() {
  const { currentLanguage, categoryArticles, setCategoryArticles } = useNewsStore();

  // Fetch articles for each category
  const techQuery = useQuery({
    queryKey: ['category-tech', currentLanguage],
    queryFn: () => newsAPI.getNewsByFilter(currentLanguage, 'technology', undefined, 1, 4),
    staleTime: 5 * 60 * 1000,
  });

  const sportsQuery = useQuery({
    queryKey: ['category-sports', currentLanguage], 
    queryFn: () => newsAPI.getNewsByFilter(currentLanguage, 'sports', undefined, 1, 4),
    staleTime: 5 * 60 * 1000,
  });

  const businessQuery = useQuery({
    queryKey: ['category-business', currentLanguage],
    queryFn: () => newsAPI.getNewsByFilter(currentLanguage, 'business', undefined, 1, 4),
    staleTime: 5 * 60 * 1000,
  });

  const politicsQuery = useQuery({
    queryKey: ['category-politics', currentLanguage],
    queryFn: () => newsAPI.getNewsByFilter(currentLanguage, 'politics', undefined, 1, 4),
    staleTime: 5 * 60 * 1000,
  });

  const entertainmentQuery = useQuery({
    queryKey: ['category-entertainment', currentLanguage],
    queryFn: () => newsAPI.getNewsByFilter(currentLanguage, 'entertainment', undefined, 1, 4),
    staleTime: 5 * 60 * 1000,
  });

  const healthQuery = useQuery({
    queryKey: ['category-health', currentLanguage],
    queryFn: () => newsAPI.getNewsByFilter(currentLanguage, 'health', undefined, 1, 4),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setCategoryArticles('technology', techQuery.data?.articles || []);
  }, [techQuery.data?.articles, setCategoryArticles]);

  useEffect(() => {
    setCategoryArticles('sports', sportsQuery.data?.articles || []);
  }, [sportsQuery.data?.articles, setCategoryArticles]);

  useEffect(() => {
    setCategoryArticles('business', businessQuery.data?.articles || []);
  }, [businessQuery.data?.articles, setCategoryArticles]);

  useEffect(() => {
    setCategoryArticles('politics', politicsQuery.data?.articles || []);
  }, [politicsQuery.data?.articles, setCategoryArticles]);

  useEffect(() => {
    setCategoryArticles('entertainment', entertainmentQuery.data?.articles || []);
  }, [entertainmentQuery.data?.articles, setCategoryArticles]);

  useEffect(() => {
    setCategoryArticles('health', healthQuery.data?.articles || []);
  }, [healthQuery.data?.articles, setCategoryArticles]);

  const isLoading = techQuery.isLoading || sportsQuery.isLoading || businessQuery.isLoading || 
                   politicsQuery.isLoading || entertainmentQuery.isLoading || healthQuery.isLoading;

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="news-container">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div key={category.key} className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48" />
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="aspect-video w-full rounded-lg mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="news-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {categories.map((category, categoryIndex) => {
            const articles = categoryArticles[category.key] || [];
            const mainArticle = articles[0];
            const sideArticles = articles.slice(1, 4);

            return (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                className="space-y-6"
              >
                {/* Category Header */}
                <div className="border-b border-border pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold font-serif text-foreground capitalize">
                      {category.name}
                    </h2>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/category/${category.key}`} className="flex items-center space-x-1 text-primary hover:text-primary-hover">
                        <span className="text-sm">View All</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>

                {/* Main Article */}
                {mainArticle && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + categoryIndex * 0.1 }}
                  >
                    <NewsCard
                      article={mainArticle}
                      showDescription={true}
                      className="mb-4"
                    />
                  </motion.div>
                )}

                {/* Side Articles */}
                <div className="space-y-4">
                  {sideArticles.map((article, index) => (
                    <motion.div
                      key={article._id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.3 + categoryIndex * 0.1 + index * 0.05 }}
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

                {/* Load More Button */}
                {articles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.5 + categoryIndex * 0.1 }}
                  >
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      asChild
                    >
                      <Link to={`/category/${category.key}`}>
                        More {category.name} News
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}