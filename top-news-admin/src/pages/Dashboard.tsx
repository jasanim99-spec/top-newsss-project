import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Video, 
  Eye, 
  TrendingUp, 
  Play, 
  ArrowUpRight
} from 'lucide-react';
import { newsService } from '@/services/newsService';
import { videoService } from '@/services/videoService';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const formatTimeAgo = (dateInput: string | Date | number | undefined): string => {
  if (!dateInput) return 'Recently';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Recently';
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: newsStats, isLoading: newsLoading } = useQuery({
    queryKey: ['news-stats'],
    queryFn: () => newsService.getNewsStats(),
    staleTime: 0,
  });

  const { data: videoStats, isLoading: videoLoading } = useQuery({
    queryKey: ['video-stats'],
    queryFn: () => videoService.getVideoStats(),
    staleTime: 0,
  });

  if (newsLoading || videoLoading) {
    return <LoadingSpinner />;
  }

  const totalNews = newsStats?.total || 0;
  const totalVideos = videoStats?.total || 0;
  const combinedViews = (newsStats?.totalViews || 0) + (videoStats?.totalViews || 0);

  const formattedViews = combinedViews >= 1000000 
    ? `${(combinedViews / 1000000).toFixed(1)}M` 
    : combinedViews >= 1000 
    ? `${(combinedViews / 1000).toFixed(1)}K` 
    : combinedViews.toString();

  const recentNewsList = newsStats?.recent || [];
  const recentVideosList = videoStats?.recent || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-[#191c1d] tracking-tight">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm mt-1">Real-time performance metrics and recent activity across your media network.</p>
        </div>
      </section>

      {/* Pending Reviews Alert Banner if any */}
      {(newsStats as any)?.pending > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                🚨 {(newsStats as any).pending} new articles submitted by reporters require review!
              </h4>
              <p className="text-xs text-amber-100 mt-0.5">
                Open the Editorial Desk to review and publish live.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/news/reviews')}
            className="bg-white text-orange-700 hover:bg-amber-50 px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95 flex-shrink-0"
          >
            <span>Review Now</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Stat Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total News */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-[#0058be] text-white p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full text-white">+12%</span>
            </div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Total News Articles</p>
            <h3 className="text-3xl lg:text-4xl font-extrabold mt-1 tracking-tight">
              {totalNews > 0 ? totalNews.toLocaleString() : '0'}
            </h3>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <FileText className="w-32 h-32 text-white" />
          </div>
        </motion.div>

        {/* Short Videos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-[#d0e1fb] text-[#191c1d] p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-[#0058be]/10 p-2.5 rounded-xl">
                <Video className="w-6 h-6 text-[#0058be]" />
              </div>
              <span className="text-xs font-bold bg-[#0058be]/10 text-[#0058be] px-2.5 py-1 rounded-full">+24%</span>
            </div>
            <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Short Videos Published</p>
            <h3 className="text-3xl lg:text-4xl font-extrabold mt-1 text-[#0058be] tracking-tight">
              {totalVideos > 0 ? totalVideos.toLocaleString() : '0'}
            </h3>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <Video className="w-32 h-32 text-[#0058be]" />
          </div>
        </motion.div>

        {/* Total Views */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-[#d8e2ff] text-[#001a42] p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-[#0058be]/10 p-2.5 rounded-xl">
                <Eye className="w-6 h-6 text-[#0058be]" />
              </div>
            </div>
            <p className="text-[#004395] text-xs font-semibold uppercase tracking-wider">Total Views (MTD)</p>
            <h3 className="text-3xl lg:text-4xl font-extrabold mt-1 tracking-tight text-[#001a42]">
              {combinedViews > 0 ? formattedViews : '0'}
            </h3>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <Eye className="w-32 h-32 text-[#0058be]" />
          </div>
        </motion.div>

        {/* Pending Submissions / Queue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          onClick={() => navigate('/news/reviews')}
          className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-amber-500/20 p-2.5 rounded-xl text-amber-700">
                <FileText className="w-6 h-6 text-amber-700" />
              </div>
              <span className="text-xs font-bold bg-amber-500 text-white px-2.5 py-1 rounded-full">Editorial</span>
            </div>
            <p className="text-amber-800 text-xs font-semibold uppercase tracking-wider">Pending Submissions</p>
            <h3 className="text-3xl lg:text-4xl font-extrabold mt-1 text-amber-700 tracking-tight">
              {(newsStats as any)?.pending || 0}
            </h3>
          </div>
        </motion.div>
      </div>

      {/* Side-by-Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent News Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col max-h-[600px] overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0058be]" />
              Recent News
            </h3>
            <button 
              onClick={() => navigate('/news')}
              className="text-[#0058be] text-xs font-bold hover:underline flex items-center gap-1"
            >
              View All
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {recentNewsList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No recent news articles yet.</p>
              </div>
            ) : (
              recentNewsList.map((article) => (
                <div
                  key={article._id || article.id}
                  onClick={() => navigate('/news')}
                  className="flex gap-4 p-3 hover:bg-gray-50 rounded-xl transition-all group cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={article.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500&auto=format&fit=crop&q=60'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#0058be] transition-colors">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="bg-[#0058be]/10 text-[#0058be] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {article.category || 'Technology'}
                      </span>
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{(article.views || 0).toLocaleString()}</span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {formatTimeAgo(article.publishedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Videos Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col max-h-[600px] overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-[#0058be]" />
              Recent Videos
            </h3>
            <button 
              onClick={() => navigate('/videos')}
              className="text-[#0058be] text-xs font-bold hover:underline flex items-center gap-1"
            >
              Manage Clips
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {recentVideosList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Video className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No short videos uploaded yet.</p>
              </div>
            ) : (
              recentVideosList.map((video, idx) => (
                <div
                  key={video._id || video.id}
                  onClick={() => navigate('/videos')}
                  className="flex gap-4 p-3 hover:bg-gray-50 rounded-xl transition-all group cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900 relative">
                    <img
                      src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60'}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      0:{video.duration || 15}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-start pt-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-[#0058be] transition-colors">
                      {video.title}
                    </h4>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <span className="text-[#0058be] font-bold text-[10px] uppercase">
                        {idx === 0 ? 'Trending #1' : video.category || 'General'}
                      </span>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{(video.views || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;