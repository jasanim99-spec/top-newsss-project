// import { useEffect, useRef, useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { motion } from 'framer-motion';
// import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
// import { VideoCard } from '@/components/news/VideoCard';
// import { Button } from '@/components/ui/button';
// import { newsAPI } from '@/services/api';
// import { useNewsStore } from '@/store/newsStore';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Link } from 'react-router-dom';

// export function VideoSection() {
//   const { currentLanguage, videos, setVideos } = useNewsStore();
//   const [canScrollLeft, setCanScrollLeft] = useState(false);
//   const [canScrollRight, setCanScrollRight] = useState(true);
//   const scrollContainerRef = useRef<HTMLDivElement>(null);

//   const { data: videosData, isLoading } = useQuery({
//     queryKey: ['trending-videos', currentLanguage],
//     queryFn: () => newsAPI.getTrendingVideos(currentLanguage),
//     staleTime: 5 * 60 * 1000,
//   });

//   useEffect(() => {
//     if (videosData?.videos) {
//       setVideos(videosData.videos);
//     }
//   }, [videosData, setVideos]);

//   const checkScrollButtons = () => {
//     if (scrollContainerRef.current) {
//       const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
//       setCanScrollLeft(scrollLeft > 0);
//       setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
//     }
//   };

//   const scroll = (direction: 'left' | 'right') => {
//     if (scrollContainerRef.current) {
//       const scrollAmount = 400;
//       const currentScroll = scrollContainerRef.current.scrollLeft;
//       const targetScroll = direction === 'left' 
//         ? currentScroll - scrollAmount 
//         : currentScroll + scrollAmount;
      
//       scrollContainerRef.current.scrollTo({
//         left: targetScroll,
//         behavior: 'smooth'
//       });
//     }
//   };

//   useEffect(() => {
//     checkScrollButtons();
//     const scrollContainer = scrollContainerRef.current;
//     if (scrollContainer) {
//       scrollContainer.addEventListener('scroll', checkScrollButtons);
//       window.addEventListener('resize', checkScrollButtons);
//       return () => {
//         scrollContainer.removeEventListener('scroll', checkScrollButtons);
//         window.removeEventListener('resize', checkScrollButtons);
//       };
//     }
//   }, [videos]);

//   if (isLoading) {
//     return (
//       <section className="mb-12 bg-muted/30 py-12">
//         <div className="news-container">
//           <div className="flex items-center justify-between mb-6">
//             <Skeleton className="h-8 w-48" />
//             <div className="flex space-x-2">
//               <Skeleton className="h-10 w-10 rounded-full" />
//               <Skeleton className="h-10 w-10 rounded-full" />
//             </div>
//           </div>
//           <div className="flex space-x-6 overflow-hidden">
//             {[...Array(4)].map((_, i) => (
//               <div key={i} className="flex-shrink-0 w-80">
//                 <Skeleton className="aspect-video w-full rounded-lg mb-4" />
//                 <Skeleton className="h-4 w-full mb-2" />
//                 <Skeleton className="h-4 w-3/4" />
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     );
//   }

//   if (!videos || videos.length === 0) {
//     return null;
//   }

//   return (
//     <section className="mb-12 bg-muted/30 py-12">
//       <div className="news-container">
//         <div className="flex items-center justify-between mb-8">
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true }}
//             className="flex items-center space-x-3"
//           >
//             <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
//               <Play className="h-5 w-5 text-primary-foreground" fill="currentColor" />
//             </div>
//             <div>
//               <h2 className="text-2xl lg:text-3xl font-bold font-serif text-foreground">
//                 Video News
//               </h2>
//               <p className="text-muted-foreground text-sm">
//                 Watch the latest news stories and breaking updates
//               </p>
//             </div>
//           </motion.div>
          
//           <div className="flex items-center space-x-4">
//             <Button variant="outline" asChild className="hidden sm:flex">
//               <Link to="/videos">
//                 View All Videos
//               </Link>
//             </Button>
            
//             <div className="flex space-x-2">
//               <Button
//                 variant="outline"
//                 size="icon"
//                 onClick={() => scroll('left')}
//                 disabled={!canScrollLeft}
//                 className="h-10 w-10 rounded-full"
//               >
//                 <ChevronLeft className="h-4 w-4" />
//               </Button>
//               <Button
//                 variant="outline"
//                 size="icon"
//                 onClick={() => scroll('right')}
//                 disabled={!canScrollRight}
//                 className="h-10 w-10 rounded-full"
//               >
//                 <ChevronRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </div>

//         <div 
//           ref={scrollContainerRef}
//           className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
//           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//         >
//           {videos.map((video, index) => (
//             <motion.div
//               key={video._id}
//               initial={{ opacity: 0, x: 50 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.4, delay: index * 0.1 }}
//               className="flex-shrink-0 w-80"
//             >
//               <VideoCard video={video} />
//             </motion.div>
//           ))}
//         </div>

//         {/* Mobile View All Button */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="mt-6 sm:hidden"
//         >
//           <Button className="w-full" asChild>
//             <Link to="/videos">
//               View All Videos
//             </Link>
//           </Button>
//         </motion.div>
//       </div>
//     </section>
//   );
// }

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { VideoCard } from '@/components/news/VideoCard';
import { Button } from '@/components/ui/button';
import { newsAPI } from '@/services/api';
import { useNewsStore } from '@/store/newsStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

export function VideoSection() {
  const { currentLanguage, videos, setVideos } = useNewsStore();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: videosData, isLoading } = useQuery({
    queryKey: ['trending-videos', currentLanguage],
    queryFn: () => newsAPI.getTrendingVideos(currentLanguage),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (videosData?.videos) {
      // Take first 9 videos for 3x3 grid
      setVideos(videosData.videos.slice(0, 9));
    }
  }, [videosData, setVideos]);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth;
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
  }, [videos]);

  // Group videos into rows of 3
  const videoRows = videos ? videos.reduce((rows: any[][], video, index) => {
    const rowIndex = Math.floor(index / 3);
    if (!rows[rowIndex]) {
      rows[rowIndex] = [];
    }
    rows[rowIndex].push(video);
    return rows;
  }, []) : [];

  if (isLoading) {
    return (
      <section className="mb-12 bg-muted/30 py-12">
        <div className="news-container">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="aspect-video w-full rounded-lg mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="news-container">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-800/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header Row */}
          <div className="flex items-center justify-between mb-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center space-x-3.5"
            >
              <div className="h-12 w-12 bg-gradient-to-tr from-red-600 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30 text-white">
                <Play className="h-6 w-6 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Video News & Shorts
                  </h2>
                  <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full animate-pulse">
                    ▶ LIVE
                  </span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm font-medium mt-0.5">
                  Watch latest video bulletins, ground reports, and short clips
                </p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <Button asChild className="hidden sm:flex bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md border-0 transition-all active:scale-95">
                <Link to="/videos">
                  View All Videos →
                </Link>
              </Button>
              
              <div className="flex space-x-2 md:hidden">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className="h-9 w-9 rounded-xl bg-white/10 text-white border-white/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className="h-9 w-9 rounded-xl bg-white/10 text-white border-white/20"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop: 3x3 Grid Layout */}
          <div className="hidden md:block relative z-10">
            <div className="space-y-6">
              {videoRows.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-3 gap-6">
                  {row.map((video, videoIndex) => (
                    <motion.div
                      key={video._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: (rowIndex * 3 + videoIndex) * 0.1 }}
                    >
                      <VideoCard video={video} />
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: Horizontal Scroll */}
          <div className="md:hidden relative z-10">
            <div 
              ref={scrollContainerRef}
              className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {videos.map((video, index) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex-shrink-0 w-72"
                >
                  <VideoCard video={video} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-6 md:hidden relative z-10"
          >
            <Button className="w-full bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold rounded-xl" asChild>
              <Link to="/videos">
                View All Videos
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}