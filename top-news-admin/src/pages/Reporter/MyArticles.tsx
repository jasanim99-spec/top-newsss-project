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
    enabled: true,
  });

  const articles = data?.articles || [];

  const statusCounts = {
    all: articles.length,
    pending: articles.filter(a => a.status === 'pending').length,
    published: articles.filter(a => a.status === 'published').length,
    rejected: articles.filter(a => a.status === 'rejected' || a.status === 'draft').length,
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-gray-900">My Articles</h1>
          <p className="text-xs text-gray-500 mt-0.5">List of news reports submitted by you and their live status</p>
        </div>

        <button
          onClick={() => navigate('/reporter/submit')}
          type="button"
          className="bg-[#0058be] hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all active:scale-95 flex-shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Write New Report</span>
        </button>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: '🟡 Pending Review' },
            { key: 'published', label: '🟢 Published' },
            { key: 'rejected', label: '🔴 Revision Needed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-[#0058be] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 text-xs font-semibold bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0058be] shadow-sm"
          />
        </div>
      </div>

      {/* ARTICLES LIST */}
      {isLoading ? (
        <LoadingSpinner />
      ) : articles.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center shadow-sm">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-700">No articles found.</h3>
          <p className="text-xs text-gray-400 mt-1">There are no articles under this filter.</p>
          <button
            onClick={() => navigate('/reporter/submit')}
            type="button"
            className="inline-flex items-center gap-1.5 mt-4 bg-[#0058be] hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit News Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {articles.map((art) => {
            const statusConfig = {
              published: {
                label: '🟢 Published & Live',
                badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                icon: CheckCircle
              },
              pending: {
                label: '🟡 Pending Review (With Editor)',
                badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
                icon: Clock
              },
              draft: {
                label: '⚪ Draft / Incomplete',
                badgeBg: 'bg-gray-100 text-gray-700 border-gray-200',
                icon: FileText
              },
              rejected: {
                label: '🔴 Needs Revision',
                badgeBg: 'bg-red-50 text-red-700 border-red-200',
                icon: AlertCircle
              },
            }[art.status || 'pending'];

            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={art.id || art._id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start gap-4"
              >
                {/* Cover Image */}
                {art.imageUrl && (
                  <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    <img
                      src={art.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${statusConfig.badgeBg}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>

                    <span className="text-[10px] font-bold text-[#0058be] bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                      {art.category}
                    </span>

                    {art.location?.city && (
                      <span className="text-[10px] text-gray-500 font-semibold flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-red-400" />
                        {art.location.city}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {art.description}
                  </p>

                  {/* Editorial Feedback / Remark if any */}
                  {art.editorialNotes && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-2.5 rounded-r-lg text-xs text-amber-900 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[11px] text-amber-800">Editor Note:</p>
                        <p className="text-[11px]">{art.editorialNotes}</p>
                      </div>
                    </div>
                  )}

                  {/* Metadata Bottom */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(art.publishedAt || art.createdAt || '').toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      {art.status === 'published' && (
                        <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          {art.views || 0} Views
                        </span>
                      )}
                    </div>

                    {art.status === 'published' && (
                      <a
                        href={`http://localhost:8080/news/${art.category}/${art.topic || 'general'}/${art.slug || art.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-[#0058be] hover:underline flex items-center gap-1"
                      >
                        <span>View on Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyArticles;
