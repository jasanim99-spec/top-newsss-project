import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsCard } from '@/components/news/NewsCard';
import { Button } from '@/components/ui/button';
import { newsAPI } from '@/services/api';
import { useNewsStore } from '@/store/newsStore';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useRef } from 'react';

export function FeaturedSection() {
  const { currentLanguage, featuredArticles, setFeaturedArticles } = useNewsStore();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: newsData, isLoading } = useQuery({
    queryKey: ['featured-carousel', currentLanguage],
    queryFn: () => newsAPI.getFeaturedNews(currentLanguage),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (newsData?.articles && newsData.articles.length > 0) {
      const items = newsData.articles.length > 1 ? newsData.articles.slice(1, 7) : newsData.articles;
      setFeaturedArticles(items);
    } else {
      setFeaturedArticles([]);
    }
  }, [newsData, setFeaturedArticles]);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [featuredArticles]);

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="news-container">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          <div className="flex space-x-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-80">
                <Skeleton className="aspect-video w-full rounded-lg mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!featuredArticles || featuredArticles.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="news-container">
        <div className="flex items-center justify-between mb-6">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-2xl lg:text-3xl font-bold font-serif text-foreground"
          >
            Featured Stories
          </motion.h2>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
  ref={scrollContainerRef}
  className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
>
  {featuredArticles.map((article, index) => (
    <motion.div
      key={article._id}
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="flex-shrink-0 w-[calc(25%-18px)] min-w-[280px]"
    >
      <NewsCard
        article={article}
        showDescription={true}
      />
    </motion.div>
  ))}
</div>
      </div>
    </section>
  );
}

// import { useEffect, useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { motion } from 'framer-motion';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
// import { NewsCard } from '@/components/news/NewsCard';
// import { Button } from '@/components/ui/button';
// import { newsAPI } from '@/services/api';
// import { useNewsStore } from '@/store/newsStore';
// import { Skeleton } from '@/components/ui/skeleton';

// export function FeaturedSection() {
//   const { currentLanguage, featuredArticles, setFeaturedArticles } = useNewsStore();
//   const [currentPage, setCurrentPage] = useState(0);
//   const itemsPerPage = 16; // 4 rows × 4 columns = 16 articles

//   const { data: newsData, isLoading } = useQuery({
//     queryKey: ['featured-carousel', currentLanguage],
//     queryFn: () => newsAPI.getFeaturedNews(currentLanguage,currentPage),
//     staleTime: 5 * 60 * 1000,
//   });

//   useEffect(() => {
//     if (newsData?.articles) {
//       // Skip the first article (used in hero) and take remaining articles
//       setFeaturedArticles(newsData.articles.slice(1));
//     }
//   }, [newsData, setFeaturedArticles]);

//   // Reset to first page when articles change
//   useEffect(() => {
//     setCurrentPage(0);
//   }, [featuredArticles]);

//   if (isLoading) {
//     return (
//       <section className="mb-12">
//         <div className="news-container">
//           <div className="flex items-center justify-between mb-6">
//             <Skeleton className="h-8 w-48" />
//             <div className="flex space-x-2">
//               <Skeleton className="h-10 w-10 rounded-full" />
//               <Skeleton className="h-10 w-10 rounded-full" />
//             </div>
//           </div>
//           {/* 4x4 Grid Skeleton */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {[...Array(16)].map((_, i) => (
//               <div key={i} className="w-full">
//                 <Skeleton className="aspect-video w-full rounded-lg mb-4" />
//                 <Skeleton className="h-4 w-full mb-2" />
//                 <Skeleton className="h-4 w-3/4 mb-2" />
//                 <Skeleton className="h-3 w-1/2" />
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     );
//   }

//   if (!featuredArticles || featuredArticles.length === 0) {
//     return null;
//   }

//   // Calculate pagination
//   const totalPages = Math.ceil(featuredArticles.length / itemsPerPage);
//   const startIndex = currentPage * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentArticles = featuredArticles.slice(startIndex, endIndex);

//   const goToPreviousPage = () => {
//     setCurrentPage(prev => Math.max(0, prev - 1));
//   };

//   const goToNextPage = () => {
//     setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
//   };

//   const canGoLeft = currentPage > 0;
//   const canGoRight = currentPage < totalPages - 1;

//   return (
//     <section className="mb-12">
//       <div className="news-container">
//         {/* Header with title and navigation */}
//         <div className="flex items-center justify-between mb-8">
//           <motion.h2 
//             initial={{ opacity: 0, x: -20 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true }}
//             className="text-2xl lg:text-3xl font-bold font-serif text-foreground"
//           >
//             Featured Stories
//           </motion.h2>
          
//           <div className="flex items-center space-x-4">
//             {/* Page indicator */}
//             {totalPages > 1 && (
//               <span className="text-sm text-muted-foreground font-medium">
//                 {currentPage + 1} of {totalPages}
//               </span>
//             )}
            
//             {/* Navigation buttons */}
//             <div className="flex space-x-2">
//               <Button
//                 variant="outline"
//                 size="icon"
//                 onClick={goToPreviousPage}
//                 disabled={!canGoLeft}
//                 className="h-10 w-10 rounded-full border-2 hover:bg-primary hover:text-white transition-all duration-200"
//               >
//                 <ChevronLeft className="h-4 w-4" />
//               </Button>
//               <Button
//                 variant="outline"
//                 size="icon"
//                 onClick={goToNextPage}
//                 disabled={!canGoRight}
//                 className="h-10 w-10 rounded-full border-2 hover:bg-primary hover:text-white transition-all duration-200"
//               >
//                 <ChevronRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* 4x4 Grid layout for articles */}
//         <motion.div
//           key={currentPage} // This triggers animation when page changes
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, ease: "easeOut" }}
//           className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
//         >
//           {currentArticles.map((article, index) => {
//             // Calculate row and column for stagger animation
//             const row = Math.floor(index / 4);
//             const col = index % 4;
//             const delay = (row * 0.1) + (col * 0.05);

//             return (
//               <motion.div
//                 key={article._id}
//                 initial={{ opacity: 0, y: 30, scale: 0.95 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 transition={{ 
//                   duration: 0.4, 
//                   delay: delay,
//                   ease: "easeOut"
//                 }}
//                 className="w-full"
//               >
//                 <NewsCard
//                   article={article}
//                   showDescription={true}
//                 />
//               </motion.div>
//             );
//           })}
//         </motion.div>

//         {/* Fill empty slots if less than 16 articles on current page */}
//         {/* {currentArticles.length < itemsPerPage && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 opacity-30">
//             {[...Array(itemsPerPage - currentArticles.length)].map((_, i) => (
//               <div key={`empty-${i}`} className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
//                 <span className="text-gray-400 text-sm">No more articles</span>
//               </div>
//             ))}
//           </div>
//         )} */}

//         {/* Optional: Dot indicators for visual feedback */}
//         {totalPages > 1 && (
//           <div className="flex justify-center mt-8 space-x-3">
//             {Array.from({ length: totalPages }, (_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setCurrentPage(i)}
//                 className={`w-3 h-3 rounded-full transition-all duration-200 ${
//                   i === currentPage 
//                     ? 'bg-primary scale-110' 
//                     : 'bg-muted-foreground/30 hover:bg-muted-foreground/60 hover:scale-105'
//                 }`}
//                 aria-label={`Go to page ${i + 1}`}
//               />
//             ))}
//           </div>
//         )}

//         {/* Stats info */}
//         {featuredArticles.length > 0 && (
//           <div className="text-center mt-6 text-sm text-muted-foreground">
//             Showing {startIndex + 1}-{Math.min(endIndex, featuredArticles.length)} of {featuredArticles.length} articles
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }