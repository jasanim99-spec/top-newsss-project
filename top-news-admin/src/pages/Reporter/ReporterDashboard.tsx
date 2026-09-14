import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { newsService } from '@/services/newsService';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Eye, 
  Zap, 
  Search, 
  RotateCcw, 
  Monitor, 
  Coffee, 
  Smartphone, 
  PlusCircle, 
  Filter, 
  MapPin, 
  ShieldCheck,
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const ReporterDashboard: React.FC = () => {
  const { user, admin } = useAuth();
  const authorId = admin?.uid || admin?.id || user?.uid || user?.email || '';

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['reporter-stats', authorId, admin?.email],
    queryFn: () => newsService.getReporterStats(authorId || admin?.email || user?.email || ''),
    enabled: true,
    refetchInterval: 5000,
  });

  const displayName = admin?.name || user?.name || user?.email?.split('@')[0] || 'Reporter';
  const displayEmail = admin?.email || user?.email || 'reporter@topnews.com';
  const pressId = admin?.pressCardNo || `PRESS-TN-${(authorId || '000').slice(0, 6).toUpperCase()}`;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? '🌅 Good Morning' : currentHour < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening';
  const motivationalMessages = [
    "Truth in reporting changes the world. Keep bringing real stories to light!",
    "Your dedication to journalism keeps our readers informed and empowered.",
    "Every headline you write shapes history. Great to see you active on desk!",
    "Excellence in journalism begins with your passion and fearless integrity.",
  ];
  const messageIndex = (authorId.length + new Date().getDate()) % motivationalMessages.length;
  const todayMotivation = motivationalMessages[messageIndex];

  const recentList = stats?.recent || [];

  const filteredArticles = recentList.filter((art: any) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = art.title?.toLowerCase().includes(q);
      const matchCategory = art.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchCategory) return false;
    }
    if (startDate) {
      const artDate = new Date(art.publishedAt || art.createdAt).toISOString().slice(0, 10);
      if (artDate < startDate) return false;
    }
    if (endDate) {
      const artDate = new Date(art.publishedAt || art.createdAt).toISOString().slice(0, 10);
      if (artDate > endDate) return false;
    }
    return true;
  });

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* USER PROFILE HEADER BANNER - Dynamic Welcoming Greeting */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0 border border-white/20">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> {greeting}
              </span>
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                {admin?.role || 'Reporter'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">Welcome back, {displayName}!</h1>
            <p className="text-xs text-indigo-200/90 font-medium italic mt-1">
              ✨ "{todayMotivation}"
            </p>
            <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-2 font-medium">
              <span>{displayEmail}</span>
              <span>•</span>
              <span className="font-mono text-indigo-300 font-bold">{pressId}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> {admin?.city || 'Gujarat Bureau'}
              </span>
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 w-full md:w-auto">
          <Link
            to="/reporter/submit"
            className="bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black px-5 py-3 rounded-xl shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 flex-1 md:flex-initial"
          >
            <PlusCircle className="w-4.5 h-4.5 text-white" />
            <span>+ Submit New Article</span>
          </Link>
          <Link
            to="/reporter/press-card"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-sm text-xs font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Digital ID</span>
          </Link>
        </div>
      </div>

      {/* 1. FIND IN REPORT (FILTER BAR) */}
      <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 bg-white">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-3.5 font-bold text-xs sm:text-sm flex items-center gap-2 border-b border-indigo-800/40">
          <Filter className="w-4 h-4 text-amber-400" />
          <span className="font-black">Find in Report</span>
        </div>
        <div className="p-5 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Search:</span>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none font-semibold bg-slate-50/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Start Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none font-semibold bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">End Date:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none font-semibold bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {}}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>

            <button
              onClick={handleClear}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY STAT CARDS - Ultra Modern Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* PUBLISHED NEWS CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
              <Monitor className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full">
              Published
            </span>
          </div>
          <div className="mt-5">
            <p className="text-3xl font-black text-slate-900 tracking-tight">{isLoading ? '...' : stats?.published || 0}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1.5">Total Published News</p>
          </div>
        </div>

        {/* PENDING REVIEWS CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-orange-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
              <Coffee className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full">
              In Review
            </span>
          </div>
          <div className="mt-5">
            <p className="text-3xl font-black text-slate-900 tracking-tight">{isLoading ? '...' : stats?.pending || 0}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1.5">Pending Editor Reviews</p>
          </div>
        </div>

        {/* READER VIEWS CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700 bg-cyan-50 border border-cyan-200/60 px-3 py-1 rounded-full">
              Total Reach
            </span>
          </div>
          <div className="mt-5">
            <p className="text-3xl font-black text-slate-900 tracking-tight">{isLoading ? '...' : (stats?.totalViews || 0).toLocaleString()}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1.5">Total Reader Views</p>
          </div>
        </div>
      </div>

      {/* 3. REPORT TABLE CONTAINER */}
      <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 bg-white relative">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 absolute top-0 left-0" />
        <div className="bg-slate-900 text-white px-6 py-4 font-bold text-sm flex items-center justify-between pt-5">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="font-black text-sm sm:text-base tracking-tight">My Submitted News Report</h3>
          </div>
          <div className="bg-white/10 text-indigo-200 border border-white/15 px-3 py-1 rounded-full text-xs font-mono font-bold">
            Showing {filteredArticles.length} entries
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-16 text-slate-400 text-xs font-semibold">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
              Loading report data...
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs font-semibold">
              No news records found for selected filter.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Article Title</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-center">Views</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredArticles.map((art: any) => {
                  const statusBadge = {
                    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    pending: 'bg-amber-50 text-amber-700 border-amber-200',
                    draft: 'bg-slate-100 text-slate-700 border-slate-200',
                    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
                  }[art.status || 'pending'];

                  const dateStr = art.publishedAt || art.createdAt 
                    ? new Date(art.publishedAt || art.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'N/A';

                  return (
                    <tr key={art.id || art._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5 font-semibold text-slate-700 whitespace-nowrap">{dateStr}</td>
                      <td className="py-4 px-5 font-extrabold text-slate-900 max-w-xs truncate">
                        {art.title}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 uppercase text-[10px]">
                          {art.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${statusBadge}`}>
                          {art.status || 'pending'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center font-mono font-extrabold text-slate-800">
                        {art.views || 0}
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <Link
                          to={`/news/${art.id || art._id}/edit`}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95 inline-block"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReporterDashboard;
