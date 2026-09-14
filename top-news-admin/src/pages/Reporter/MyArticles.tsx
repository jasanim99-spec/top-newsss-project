import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { newsService } from '@/services/newsService';
import { 
  FileText, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  PlusCircle, 
  MessageSquare,
  MapPin,
  Calendar,
  ExternalLink,
  Edit
} from 'lucide-react';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

export const MyArticles: React.FC = () => {
  const navigate = useNavigate();
  const { user, admin } = useAuth();
  const authorId = admin?.uid || admin?.id || user?.uid || user?.email || '';
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'published' | 'draft' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['reporter-articles', authorId, admin?.email, statusFilter, searchTerm],
    queryFn: () => newsService.getNews({
      authorId: authorId || admin?.email || user?.email || '',
      status: statusFilter,
      search: searchTerm,
      limit: 100
    }),
    refetchInterval: 2000,
    staleTime: 0,
    enabled: true,
  });

  const articles = data?.articles || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* HEADER BANNER - Vibrant Dark Indigo Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 tracking-wider shadow-xs">
              <FileText className="w-3.5 h-3.5" />
              REPORTER SUBMISSIONS
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">My Articles</h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            List of news reports submitted by you and their live status
          </p>
        </div>

        <button
          onClick={() => navigate('/reporter/submit')}
          type="button"
          className="relative z-10 bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white px-5 py-3 rounded-xl text-xs font-black shadow-lg shadow-rose-600/25 flex items-center gap-2 transition-all active:scale-95 flex-shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4.5 h-4.5 text-white" />
          <span>+ Write New Report</span>
        </button>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto shadow-sm">
          {[
            { key: 'all', label: 'All', activeColor: 'bg-slate-900 text-white' },
            { key: 'pending', label: '🟡 Pending Review', activeColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' },
            { key: 'published', label: '🟢 Published', activeColor: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' },
            { key: 'rejected', label: '🔴 Revision Needed', activeColor: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.key
                  ? `${tab.activeColor} shadow-md scale-105`
                  : 'text-slate-600 hover:bg-slate-100/90'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-semibold shadow-xs"
          />
        </div>
      </div>

      {/* ARTICLES LIST CARDS */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm text-slate-400 text-xs font-semibold">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
            Loading submitted articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm text-slate-400 text-xs font-semibold">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No articles found matching criteria.
          </div>
        ) : (
          articles.map((art: any) => {
            const statusBadge = {
              published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              pending: 'bg-amber-50 text-amber-700 border-amber-200',
              draft: 'bg-slate-100 text-slate-700 border-slate-200',
              rejected: 'bg-rose-50 text-rose-700 border-rose-200',
            }[art.status || 'pending'];

            const dateStr = art.publishedAt || art.createdAt 
              ? new Date(art.publishedAt || art.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'Recently';

            return (
              <div
                key={art.id || art._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden group"
              >
                <div className="h-full w-1.5 bg-gradient-to-b from-indigo-500 to-purple-600 absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start gap-4 flex-1 min-w-0 pl-1">
                  {art.imageUrl && (
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-24 h-24 rounded-2xl object-cover border border-slate-100 shadow-md flex-shrink-0 group-hover:scale-105 transition-transform"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase border tracking-wider ${statusBadge}`}>
                        {art.status === 'published' ? '✓ Published & Live' : art.status || 'pending'}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">
                        {art.category}
                      </span>
                      {art.location?.city && (
                        <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-600" />
                          {art.location.city}
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-black text-slate-900 hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                      {art.title}
                    </h2>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      {art.description}
                    </p>

                    {art.editorialFeedback && (
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-2.5 rounded-r-xl text-xs text-amber-900 font-medium">
                        <strong>Editor Note:</strong> {art.editorialFeedback}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-semibold pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {dateStr}
                      </span>
                      <span className="flex items-center gap-1 text-slate-700 font-extrabold">
                        <Eye className="w-3.5 h-3.5 text-cyan-600" />
                        {art.views || 0} Views
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  <a
                    href={`http://localhost:8080/article/${art.id || art._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-indigo-200/80 transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
                  >
                    <span>View on Website</span>
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyArticles;
