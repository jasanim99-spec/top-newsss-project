import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newsService } from '@/services/newsService';
import { NewsArticle } from '@/types';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit, 
  MessageSquare, 
  MapPin, 
  User, 
  ShieldCheck, 
  Calendar, 
  Eye, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  Search,
  Check,
  X,
  UserCheck
} from 'lucide-react';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const PendingReviews: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'news' | 'leaves'>('news');
  const [feedbackModalArticle, setFeedbackModalArticle] = useState<NewsArticle | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // News Submissions Query
  const { data, isLoading } = useQuery({
    queryKey: ['pending-news-reviews', searchTerm],
    queryFn: () => newsService.getNews({
      status: 'pending',
      search: searchTerm,
      limit: 100
    }),
    refetchInterval: 2000,
    staleTime: 0
  });

  const articles = data?.articles || [];

  // Reporter Leaves Query
  const { data: leavesData } = useQuery({
    queryKey: ['pending-reporter-leaves'],
    queryFn: () => fetch(`${API}/leaves?status=all`).then(r => r.json()),
    refetchInterval: 3000,
  });

  const leavesList = leavesData?.leaves || [];
  const pendingLeaves = leavesList.filter((l: any) => l.status === 'pending');

  // Leave Status Change Mutation
  const leaveStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`${API}/leaves/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Status update failed');
      return json;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending-reporter-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success(`🎉 Leave request ${variables.status} successfully!`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update leave status');
    }
  });

  // Approve News Mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return newsService.approveNews(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-news-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news-stats'] });
      toast.success('✅ Article Approved & Published Live!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to approve article.');
    }
  });

  // Bulk Approve
  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return Promise.all(ids.map(id => newsService.approveNews(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-news-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news-stats'] });
      setSelectedIds([]);
      toast.success('🎉 Selected articles published live successfully!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed bulk approve.');
    }
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, feedback }: { id: string; feedback: string }) => {
      return newsService.rejectNews(id, feedback);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-news-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Revision note sent to reporter.');
      setFeedbackModalArticle(null);
      setFeedbackNote('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error sending revision note.');
    }
  });

  const allSelected = articles.length > 0 && selectedIds.length === articles.length;
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(articles.map(a => a._id || a.id || ''));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* VIBRANT TOP HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-indigo-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-extrabold tracking-wider uppercase rounded-full shadow-sm">
              EDITORIAL CONTROL
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Editorial Review & Approval Desk</h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium">
            Review field reporter news submissions and publish live with 1-click workflow.
          </p>
        </div>

        {/* Pending Counter Badge */}
        <div className="relative z-10 flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 shrink-0 text-white font-bold text-xs">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Pending Submissions ({articles.length})</span>
        </div>
      </div>

      {/* NEWS REVIEWS CONTENT */}
      <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200">
            {articles.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-red-700 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-700">Select All</span>
              </label>
            )}

            {selectedIds.length > 0 && (
              <button
                onClick={() => bulkApproveMutation.mutate(selectedIds)}
                disabled={bulkApproveMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow flex items-center gap-2 transition-all active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve Selected ({selectedIds.length})</span>
              </button>
            )}

            <div className="relative flex-1 max-w-xs ml-auto">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pending news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : articles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-gray-800">No Pending News Submissions!</h3>
              <p className="text-xs text-gray-500 mt-1">All news articles have been reviewed and published.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {articles.map((art: NewsArticle) => (
                <div key={art._id || art.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start justify-between gap-4 hover:border-red-300 transition-colors">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(art._id || art.id || '')}
                      onChange={() => toggleSelect(art._id || art.id || '')}
                      className="mt-1 w-4 h-4 accent-red-700 cursor-pointer"
                    />

                    {art.imageUrl && (
                      <img
                        src={art.imageUrl}
                        alt=""
                        className="w-20 h-20 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                          {art.category}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">• {art.authorName || 'Reporter'}</span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 leading-snug">{art.title}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">{art.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button
                      onClick={() => approveMutation.mutate(art._id || art.id || '')}
                      disabled={approveMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Live</span>
                    </button>

                    <button
                      onClick={() => setFeedbackModalArticle(art)}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Revision</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* REVISION MODAL */}
      {feedbackModalArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">Send Revision Feedback to Reporter</h3>
            <textarea
              rows={4}
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="Explain required changes..."
              className="w-full p-3 text-xs border rounded-xl"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setFeedbackModalArticle(null)} className="px-4 py-2 text-xs font-bold">Cancel</button>
              <button
                onClick={() => rejectMutation.mutate({ id: feedbackModalArticle._id || feedbackModalArticle.id || '', feedback: feedbackNote })}
                className="bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingReviews;
