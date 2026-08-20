import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { newsService } from '@/services/newsService';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Eye, 
  Mic, 
  Camera, 
  PlusCircle, 
  Award, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Flame
} from 'lucide-react';

export const ReporterDashboard: React.FC = () => {
  const { user, admin } = useAuth();
  const authorId = admin?.uid || admin?.id || user?.uid || user?.email || '';

  const { data: stats, isLoading } = useQuery({
    queryKey: ['reporter-stats', authorId, admin?.email],
    queryFn: () => newsService.getReporterStats(authorId || admin?.email || user?.email || ''),
    enabled: true,
    refetchInterval: 5000,
  });

  const displayName = admin?.name || user?.email?.split('@')[0] || 'Reporter';
  const pressId = admin?.pressCardNo || `PRESS-TN-${(authorId || '000').slice(0, 6).toUpperCase()}`;

  return (
    <div className="space-y-6">
      {/* TOP WELCOME HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003882] via-[#0058be] to-[#1e40af] text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-black font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                ACCREDITED JOURNALIST
              </span>
              <span className="text-blue-200 text-xs font-mono">{pressId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {displayName} 👋
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-red-300" />
              <span>{admin?.beat || 'General Reporting'} • {admin?.city || 'Gujarat Bureau'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/reporter/submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition-all active:scale-95 animate-pulse"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>+ Send Breaking News</span>
            </Link>
          </div>
        </div>
      </div>

      {/* QUICK STATS 4 CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Submitted */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0058be] flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total News</p>
            <p className="text-xl font-bold text-gray-900">{isLoading ? '...' : stats?.total || 0}</p>
          </div>
        </div>

        {/* Live Published */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Live / Published</p>
            <p className="text-xl font-bold text-emerald-600">{isLoading ? '...' : stats?.published || 0}</p>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">In Review</p>
            <p className="text-xl font-bold text-amber-600">{isLoading ? '...' : stats?.pending || 0}</p>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Reader Views</p>
            <p className="text-xl font-bold text-indigo-600">{isLoading ? '...' : stats?.totalViews?.toLocaleString() || 0}</p>
          </div>
        </div>
      </div>

      {/* QUICK REPORTING ACTION TILES */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
          <Zap className="w-4 h-4 text-amber-500" />
          Quick Field Reporting Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Voice News */}
          <Link
            to="/reporter/submit?mode=voice"
            className="group bg-gradient-to-br from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 p-5 rounded-2xl border border-red-200 transition-all flex flex-col justify-between shadow-sm active:scale-98"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full uppercase">Fast</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">🎙️ Voice Dictation Report</h3>
              <p className="text-xs text-gray-600 mt-1">Dictate your news report using voice input.</p>
            </div>
          </Link>

          {/* Camera Upload */}
          <Link
            to="/reporter/submit?mode=camera"
            className="group bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 p-5 rounded-2xl border border-blue-200 transition-all flex flex-col justify-between shadow-sm active:scale-98"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0058be] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-[#0058be] text-white px-2 py-0.5 rounded-full uppercase">Ground</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">📸 Camera / Media Upload</h3>
              <p className="text-xs text-gray-600 mt-1">Capture photos/videos directly from ground zero.</p>
            </div>
          </Link>

          {/* Digital Press Card */}
          <Link
            to="/reporter/press-card"
            className="group bg-gradient-to-br from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 p-5 rounded-2xl border border-amber-200 transition-all flex flex-col justify-between shadow-sm active:scale-98"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full uppercase">Accredited</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">💳 Digital Press ID Card</h3>
              <p className="text-xs text-gray-600 mt-1">View and print official digital Press Card.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* RECENT SUBMISSIONS FEED */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-sm text-gray-900">Recent Submissions (My Submissions)</h3>
            <p className="text-xs text-gray-500">Status of news articles submitted by you</p>
          </div>
          <Link
            to="/reporter/articles"
            className="text-xs font-bold text-[#0058be] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-xs text-gray-400">Loading submissions...</div>
        ) : !stats?.recent || stats.recent.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-600">No news articles submitted yet.</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Click the button below to submit a new report.</p>
            <Link
              to="/reporter/submit"
              className="inline-flex items-center gap-1.5 mt-3 bg-[#0058be] text-white px-4 py-2 rounded-xl text-xs font-bold shadow"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Write New Report
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.recent.map((art) => {
              const statusBadge = {
                published: { label: 'Live / Approved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                pending: { label: 'Pending Review', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
                draft: { label: 'Draft / Revision', bg: 'bg-gray-100 text-gray-700 border-gray-200' },
                rejected: { label: 'Revision Needed', bg: 'bg-red-50 text-red-700 border-red-200' },
              }[art.status || 'pending'];

              return (
                <div key={art.id || art._id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {art.imageUrl && (
                      <img
                        src={art.imageUrl}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100 border border-gray-200"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate max-w-md">{art.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                        <span className="capitalize font-medium text-[#0058be]">{art.category}</span>
                        <span>•</span>
                        <span>{new Date(art.publishedAt || art.createdAt || '').toLocaleDateString('en-GB')}</span>
                        {art.views !== undefined && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-gray-600 font-semibold">
                              <Eye className="w-3 h-3 text-gray-400" /> {art.views}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusBadge?.bg}`}>
                      {statusBadge?.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReporterDashboard;
