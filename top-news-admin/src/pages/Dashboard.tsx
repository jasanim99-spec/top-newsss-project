import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Video, 
  Eye, 
  TrendingUp, 
  Play, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Users,
  Bell,
  Megaphone,
  Plus,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { newsService } from '@/services/newsService';
import { videoService } from '@/services/videoService';
import { authService } from '@/services/authService';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
    refetchInterval: 5000,
  });

  const { data: videoStats, isLoading: videoLoading } = useQuery({
    queryKey: ['video-stats'],
    queryFn: () => videoService.getVideoStats(),
    staleTime: 0,
    refetchInterval: 5000,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => authService.getAllTeamMembers(),
    staleTime: 10000,
  });

  const { data: subscriberData } = useQuery({
    queryKey: ['push-subscriber-count'],
    queryFn: () => fetch(`${API}/notifications/subscribers/count`).then(r => r.json()),
    staleTime: 10000,
  });

  const { data: adsData } = useQuery({
    queryKey: ['ads-stats'],
    queryFn: () => fetch(`${API}/ads`).then(r => r.json()),
    staleTime: 10000,
  });

  if (newsLoading || videoLoading) {
    return <LoadingSpinner />;
  }

  const totalNews = newsStats?.total || 0;
  const totalVideos = videoStats?.total || 0;
  const combinedViews = (newsStats?.totalViews || 0) + (videoStats?.totalViews || 0);
  const pendingCount = (newsStats as any)?.pending || 0;
  const teamCount = teamMembers.length || 0;
  const subscriberCount = subscriberData?.count || 0;
  const activeAdsCount = (adsData?.ads || []).filter((a: any) => a.is_active).length || 0;

  const formattedViews = combinedViews >= 1000000 
    ? `${(combinedViews / 1000000).toFixed(1)}M` 
    : combinedViews >= 1000 
    ? `${(combinedViews / 1000).toFixed(1)}K` 
    : combinedViews.toString();

  const recentNewsList = newsStats?.recent || [];
  const recentVideosList = videoStats?.recent || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Dynamic Colorful Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 shadow-2xl border border-indigo-800/40">
        {/* Glow Blobs */}
        <div className="absolute -right-12 -top-12 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 tracking-wider shadow-sm">
                <Zap className="w-3.5 h-3.5 fill-current" /> LIVE CONTROL CENTER
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> SYSTEM ONLINE
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white">
              TOP NEWS Admin Console
            </h1>
            <p className="text-slate-300 text-sm font-medium max-w-2xl leading-relaxed">
              Real-time media publishing, journalist management, push broadcasting, and network performance dashboard.
            </p>
          </div>

          {/* Quick Header CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/news/create')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 text-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create News</span>
            </button>
            
            <button
              onClick={() => navigate('/videos/create')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-500/25 flex items-center gap-2 text-xs transition-all active:scale-95 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Short Clip</span>
            </button>

            <button
              onClick={() => navigate('/notifications')}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-2 text-xs transition-all active:scale-95 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>Push Broadcast</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pending Reviews Alert Banner */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4.5 rounded-2xl shadow-lg flex items-center justify-between gap-4 font-sans"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-black">
                {pendingCount} News Article{pendingCount > 1 ? 's' : ''} Pending Review!
              </p>
              <p className="text-xs text-amber-100 font-medium">
                Reporters have submitted new draft articles waiting for your editorial approval.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/news/reviews')}
            className="bg-white text-amber-900 hover:bg-amber-50 px-4 py-2 rounded-xl text-xs font-black shadow transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <span>Review Now</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* VIBRANT BENTO STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total News */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full">
              Articles
            </span>
          </div>
          <div className="mt-5">
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {totalNews > 0 ? totalNews.toLocaleString() : '0'}
            </p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1.5 flex items-center justify-between">
              <span>Total Articles</span>
              <span className="text-emerald-600 text-[11px] flex items-center font-extrabold">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Published
              </span>
            </p>
          </div>
        </div>

        {/* Short Videos */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-pink-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200/60 px-3 py-1 rounded-full">
              Short Clips
            </span>
          </div>
          <div className="mt-5">
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {totalVideos > 0 ? totalVideos.toLocaleString() : '0'}
            </p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1.5 flex items-center justify-between">
              <span>Short Videos</span>
            </p>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
              Reach
            </span>
          </div>
          <div className="mt-5">
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {combinedViews > 0 ? formattedViews : '0'}
            </p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1.5 flex items-center justify-between">
              <span>Total Network Views</span>
              <span className="text-teal-600 text-[11px] flex items-center font-extrabold">
                <Activity className="w-3 h-3 mr-0.5" /> Real-time
              </span>
            </p>
          </div>
        </div>

        {/* Review Queue */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full">
              Queue
            </span>
          </div>
          <div className="mt-5">
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {pendingCount}
            </p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1.5 flex items-center justify-between">
              <span>Pending Reviews</span>
              <span className="text-amber-600 text-[11px] flex items-center font-extrabold">
                {pendingCount > 0 ? 'Needs Approval' : 'Desk Clear'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* SECONDARY LIVE NETWORK KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Active Reporters */}
        <div 
          onClick={() => navigate('/reporters')}
          className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 rounded-2xl border border-indigo-100 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{teamCount}</div>
              <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Journalists & Team</div>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Web Push Subscribers */}
        <div 
          onClick={() => navigate('/notifications')}
          className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 rounded-2xl border border-emerald-100 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{subscriberCount}</div>
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Push Subscribers</div>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Active Ads */}
        <div 
          onClick={() => navigate('/ads')}
          className="bg-gradient-to-br from-purple-50/80 via-white to-pink-50/50 rounded-2xl border border-purple-100 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{activeAdsCount}</div>
              <div className="text-xs font-bold text-purple-900 uppercase tracking-wider">Active Ads Running</div>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* RECENT ACTIVITY TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent News */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <FileText className="w-4 h-4 text-rose-400" />
              </div>
              <h3 className="font-bold text-base tracking-tight">Recent Published News</h3>
            </div>
            <button
              onClick={() => navigate('/news')}
              className="text-xs font-bold text-rose-300 hover:text-white flex items-center gap-1 transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/10"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 flex-1 divide-y divide-slate-100">
            {recentNewsList.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium text-center py-10">No recent news articles found.</p>
            ) : (
              recentNewsList.slice(0, 5).map((item: any) => (
                <div
                  key={item.id || item._id}
                  onClick={() => navigate(`/news/${item.id || item._id}/view`)}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4 hover:bg-slate-50 p-2.5 rounded-2xl transition-all cursor-pointer group"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-100 flex-shrink-0 shadow-sm"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold flex-shrink-0">
                      NEWS
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-rose-600 transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-1.5">
                      <span className="uppercase text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md font-bold">{item.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-cyan-600" /> {(item.views || 0).toLocaleString()} views</span>
                      <span>•</span>
                      <span>{formatTimeAgo(item.publishedAt || item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Videos */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Video className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="font-bold text-base tracking-tight">Recent Short Video Clips</h3>
            </div>
            <button
              onClick={() => navigate('/videos')}
              className="text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1 transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/10"
            >
              <span>Manage Clips</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 flex-1 divide-y divide-slate-100">
            {recentVideosList.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                <Video className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No short videos uploaded yet.
              </div>
            ) : (
              recentVideosList.slice(0, 5).map((item: any) => (
                <div
                  key={item.id || item._id}
                  onClick={() => navigate('/videos')}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4 hover:bg-slate-50 p-2.5 rounded-2xl transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-sm relative overflow-hidden">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <Play className="w-5 h-5 fill-white text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-1.5">
                      <span className="uppercase text-purple-700 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-md font-bold">{item.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-cyan-600" /> {(item.views || 0).toLocaleString()} views</span>
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