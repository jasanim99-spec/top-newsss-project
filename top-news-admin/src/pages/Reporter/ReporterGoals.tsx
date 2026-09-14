import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { goalService } from '@/services/goalService';
import { 
  Target, 
  Flame, 
  Trophy, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  Eye, 
  FileText, 
  Lock, 
  Sparkles, 
  Medal, 
  ShieldCheck, 
  Calendar,
  Users
} from 'lucide-react';

export const ReporterGoals: React.FC = () => {
  const { user, admin } = useAuth();
  const authorId = admin?.uid || admin?.id || user?.uid || user?.email || 'reporter_1';
  const reporterName = admin?.name || user?.name || user?.email?.split('@')[0] || 'Reporter';

  // Fetch Goals Data
  const { data: goalsData, isLoading: loadingGoals } = useQuery({
    queryKey: ['reporter-goals', authorId],
    queryFn: () => goalService.getReporterGoals(authorId),
    refetchInterval: 5000,
  });

  // Fetch Leaderboard Data
  const { data: leaderboardData, isLoading: loadingLeaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => goalService.getLeaderboard(),
    refetchInterval: 5000,
  });

  const monthName = goalsData?.monthName || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const articlePercentage = goalsData?.articlePercentage || 0;
  const viewsPercentage = goalsData?.viewsPercentage || 0;
  const badges = goalsData?.badges || [];
  const leaderboard = leaderboardData?.leaderboard || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. HERO GOALS BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[10px] uppercase px-3.5 py-1 rounded-full flex items-center gap-1.5 tracking-wider shadow-xs">
              <Target className="w-3.5 h-3.5" />
              MONTHLY TARGETS & ACHIEVEMENTS
            </span>
            <span className="bg-white/10 text-indigo-200 border border-white/15 text-xs font-mono font-bold px-3 py-0.5 rounded-full">
              {monthName}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Reporter Performance Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl leading-relaxed">
            Track your monthly article quotas, reader reach milestones, active submission streaks, and unlockable badges.
          </p>
        </div>

        {/* RANK BADGE */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-4 flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/30">
            🥇
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase text-amber-300 tracking-wider">Team Ranking</p>
            <p className="text-lg font-black text-white font-mono">Rank #{goalsData?.rank || 1}</p>
          </div>
        </div>
      </div>

      {/* 2. PROGRESS BENTO GRID (4 CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Article Quota Progress */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full">
              {articlePercentage}% Completed
            </span>
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {goalsData?.publishedArticlesCount || 0}
                <span className="text-sm font-bold text-slate-400 font-mono"> / {goalsData?.targetArticles || 20}</span>
              </p>
              <span className="text-xs font-bold text-slate-500">Articles</span>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: `${articlePercentage}%` }}
              />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Article Goal</p>
          </div>
        </div>

        {/* Card 2: Reader Reach Progress */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700 bg-cyan-50 border border-cyan-200/60 px-3 py-1 rounded-full">
              {viewsPercentage}% Reach
            </span>
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                {(goalsData?.currentViews || 0).toLocaleString()}
                <span className="text-xs font-bold text-slate-400 font-sans"> / {(goalsData?.targetViews || 10000).toLocaleString()}</span>
              </p>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: `${viewsPercentage}%` }}
              />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Reader Views Target</p>
          </div>
        </div>

        {/* Card 3: Active Daily Streak */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-orange-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6 animate-bounce" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500 fill-orange-500" /> Active Streak
            </span>
          </div>

          <div className="mt-5">
            <p className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
              🔥 {goalsData?.activeStreak || 0}
              <span className="text-sm font-bold text-slate-500">Days</span>
            </p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-2">Consecutive Submission Streak</p>
          </div>
        </div>

        {/* Card 4: Accuracy & Approval Rate */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-600 absolute top-0 left-0" />
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
              High Quality
            </span>
          </div>

          <div className="mt-5">
            <p className="text-3xl font-black text-slate-900 tracking-tight">{goalsData?.approvalRate || 100}%</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-2">Editor Approval Accuracy</p>
          </div>
        </div>
      </div>

      {/* 3. UNLOCKABLE BADGES & ACHIEVEMENTS SHOWCASE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6 relative overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-indigo-600 to-pink-500 absolute top-0 left-0" />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-900 tracking-tight">Achievements & Badges</h2>
              <p className="text-xs text-slate-500 font-medium">Unlock badges by reaching reporting and viewership milestones</p>
            </div>
          </div>

          <div className="bg-purple-50 text-purple-700 border border-purple-200/80 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono">
            {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
          </div>
        </div>

        {/* BADGES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-2xl p-4 border transition-all flex flex-col justify-between relative overflow-hidden ${
                badge.unlocked
                  ? 'bg-gradient-to-b from-white to-slate-50/80 border-slate-200 shadow-md hover:shadow-lg scale-[1.02]'
                  : 'bg-slate-50/60 border-slate-200/60 opacity-60 grayscale'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${badge.color} text-white text-2xl flex items-center justify-center shadow-md`}>
                    {badge.icon}
                  </div>
                  {badge.unlocked ? (
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-500" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 bg-slate-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <h3 className="font-black text-sm text-slate-900">{badge.name}</h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">{badge.description}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200/60 text-[10px] font-mono font-bold text-slate-600">
                {badge.progress}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. TEAM LEADERBOARD TABLE */}
      <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 bg-white relative">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 absolute top-0 left-0" />
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between pt-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight text-white">Monthly Team Leaderboard</h3>
              <p className="text-xs text-slate-300 font-medium">{monthName} Top Performing Journalists</p>
            </div>
          </div>

          <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3.5 py-1 rounded-full text-xs font-mono font-bold">
            Live Ranking
          </span>
        </div>

        <div className="p-0 overflow-x-auto">
          {loadingLeaderboard ? (
            <div className="text-center py-16 text-slate-400 text-xs font-semibold">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin mx-auto mb-2"></div>
              Loading leaderboard...
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-6 text-center">Rank</th>
                  <th className="py-3.5 px-6">Reporter</th>
                  <th className="py-3.5 px-6">Bureau / Location</th>
                  <th className="py-3.5 px-6 text-center">Published News</th>
                  <th className="py-3.5 px-6 text-right">Total Reach (Views)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {leaderboard.map((entry) => {
                  const medal = {
                    1: '🥇',
                    2: '🥈',
                    3: '🥉'
                  }[entry.rank] || `#${entry.rank}`;

                  const isCurrentUser = entry.authorId === authorId || entry.name.toLowerCase() === reporterName.toLowerCase();

                  return (
                    <tr 
                      key={entry.authorId || entry.name} 
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isCurrentUser ? 'bg-amber-50/40 font-bold border-l-4 border-l-amber-500' : ''
                      }`}
                    >
                      <td className="py-4 px-6 text-center font-black text-sm">
                        {typeof medal === 'string' && medal.startsWith('#') ? (
                          <span className="font-mono text-slate-500">{medal}</span>
                        ) : (
                          <span className="text-lg">{medal}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white font-black text-xs flex items-center justify-center shadow-sm">
                            {entry.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                              {entry.name}
                              {isCurrentUser && (
                                <span className="bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.2 rounded-md">
                                  YOU
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">Correspondent</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-semibold whitespace-nowrap">
                        {entry.city || 'Gujarat Bureau'}
                      </td>
                      <td className="py-4 px-6 text-center font-extrabold text-slate-900 font-mono">
                        {entry.publishedCount} Articles
                      </td>
                      <td className="py-4 px-6 text-right font-black text-slate-900 font-mono text-xs">
                        <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-3 py-1 rounded-xl">
                          {entry.totalViews.toLocaleString()} Views
                        </span>
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

export default ReporterGoals;
