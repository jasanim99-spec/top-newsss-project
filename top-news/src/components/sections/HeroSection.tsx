import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { NewsCard } from '@/components/news/NewsCard';
import { newsService } from '@/services/newsService';
import { useNewsStore } from '@/store/newsStore';
import { Skeleton } from '@/components/ui/skeleton';

export function HeroSection() {
  const { currentLanguage, heroArticle, setHeroArticle } = useNewsStore();

  const { data: newsData, isLoading } = useQuery({
    queryKey: ['featured-news', currentLanguage],
    queryFn: async () => {
      let res = await newsService.getPublishedNews({ section: 'featured', language: currentLanguage, limitNum: 6 });
      if (!res.articles || res.articles.length === 0) {
        res = await newsService.getPublishedNews({ language: currentLanguage, limitNum: 6 });
      }
      return res;
    },
    staleTime: 0,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (newsData?.articles && newsData.articles.length > 0) {
      setHeroArticle(newsData.articles[0]);
    } else {
      setHeroArticle(null);
    }
  }, [newsData, setHeroArticle]);

  if (isLoading) {
    return (
      <section className="relative">
        <div className="news-container">
          <div className="aspect-[16/9] lg:aspect-[21/9] w-full">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  if (!heroArticle) {
    return null;
  }

  return (
    <section className="relative pt-2 lg:pt-3 mb-12">
      <div className="news-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="aspect-[16/9] lg:aspect-[21/9] w-full"
        >
          <NewsCard
            article={heroArticle}
            variant="hero"
            className="h-full"
          />
        </motion.div>
      </div>
    </section>
  );
}