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
  Search
} from 'lucide-react';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

export const PendingReviews: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackModalArticle, setFeedbackModalArticle] = useState<NewsArticle | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');

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

  // Approve Mutation
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

  // Revision / Reject Mutation
  const revisionMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      return newsService.requestRevision(id, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-news-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('💬 Revision request sent to reporter.');
      setFeedbackModalArticle(null);
      setFeedbackNote('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error sending revision note.');
    }
  });

  return (
    <div className="space-y-6">
      {/* TOP HEADER */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900">Editorial Review Desk (Pending Submissions)</h1>
            <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              {articles.length} Pending
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Review fresh submissions from field reporters and publish them in 1-click.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search news or reporter name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
        </div>
      </div>

      {/* PENDING SUBMISSIONS LIST */}
      {isLoading ? (
        <LoadingSpinner />
      ) : articles.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center shadow-sm">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">All news articles reviewed!</h3>
          <p className="text-xs text-gray-400 mt-1">There are currently no pending submissions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((art) => (
            <div
              key={art.id || art._id}
              className="bg-white rounded-2xl border-2 border-amber-200/80 p-5 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              {/* TOP REPORTER BADGE & TIMESTAMP */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#0058be] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {(art.authorName || 'R').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-gray-900">{art.authorName || 'Field Reporter'}</span>
                      <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-300">
                        {art.pressCardNo || 'ACCREDITED'}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500" />
                      <span>{art.authorCity || art.location?.city || 'Gujarat Bureau'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Submitted: {new Date(art.publishedAt || art.createdAt || '').toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                  <span className="bg-blue-50 text-[#0058be] font-bold text-[10px] px-2 py-0.5 rounded-md uppercase">
                    {art.category}
                  </span>
                </div>
              </div>

              {/* ARTICLE BODY & IMAGE */}
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {art.imageUrl && (
                  <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    <img
                      src={art.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    {art.isBreaking && (
                      <span className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                        🔴 BREAKING
                      </span>
                    )}
                    <h3 className="text-base font-extrabold text-gray-900 leading-snug">
                      {art.title}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {art.description}
                  </p>

                  {/* AI Summary preview if available */}
                  {art.aiSummary && (
                    <div className="bg-purple-50 p-2 rounded-lg text-xs text-purple-900 border border-purple-200">
                      <span className="font-bold flex items-center gap-1 text-purple-800 text-[10px]">
                        <Sparkles className="w-3 h-3 text-purple-600" /> AI Key Bullets:
                      </span>
                      <pre className="font-sans text-[11px] whitespace-pre-wrap mt-0.5">{art.aiSummary}</pre>
                    </div>
                  )}

                  {/* Location & Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {art.location?.city && (
                      <span className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-red-500" />
                        {art.location.city} {art.location.district ? `(${art.location.district})` : ''}
                      </span>
                    )}
                    {art.tags?.map((t) => (
                      <span key={t} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTIONS BAR */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/news/${art.id || art._id}/edit`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit & Refine</span>
                  </Link>

                  <button
                    onClick={() => setFeedbackModalArticle(art)}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Request Revision</span>
                  </button>
                </div>

                <button
                  onClick={() => approveMutation.mutate(art.id || art._id || '')}
                  disabled={approveMutation.isPending}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{approveMutation.isPending ? 'Approving...' : '✅ Approve & Publish'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FEEDBACK / REVISION MODAL */}
      {feedbackModalArticle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-600" />
              <span>Send Revision Feedback to Reporter</span>
            </h3>
            <p className="text-xs text-gray-500">
              Provide revision feedback for article <strong>"{feedbackModalArticle.title}"</strong>:
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Please upload a high-resolution photo and clarify the location..."
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFeedbackModalArticle(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!feedbackNote.trim()) {
                    toast.error('Please enter revision feedback notes.');
                    return;
                  }
                  revisionMutation.mutate({
                    id: feedbackModalArticle.id || feedbackModalArticle._id || '',
                    notes: feedbackNote.trim()
                  });
                }}
                disabled={revisionMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition-all"
              >
                {revisionMutation.isPending ? 'Sending...' : 'Send Revision Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingReviews;

