const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  progress: string;
}

export interface ReporterGoalsData {
  monthName: string;
  targetArticles: number;
  publishedArticlesCount: number;
  articlePercentage: number;
  targetViews: number;
  currentViews: number;
  viewsPercentage: number;
  activeStreak: number;
  approvalRate: number;
  badges: Badge[];
  rank: number;
}

export interface LeaderboardEntry {
  rank: number;
  authorId: string;
  name: string;
  city: string;
  publishedCount: number;
  totalViews: number;
}

export interface LeaderboardData {
  monthName: string;
  leaderboard: LeaderboardEntry[];
}

export const goalService = {
  async getReporterGoals(reporterId: string): Promise<ReporterGoalsData> {
    const res = await fetch(`${API}/goals/reporter/${encodeURIComponent(reporterId)}`);
    if (!res.ok) throw new Error('Failed to fetch reporter goals');
    return res.json();
  },

  async getLeaderboard(): Promise<LeaderboardData> {
    const res = await fetch(`${API}/goals/leaderboard`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return res.json();
  },

  async updateReporterTarget(reporterId: string, targetArticles: number, targetViews?: number) {
    const res = await fetch(`${API}/goals/target`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reporterId, targetArticles, targetViews: targetViews || 10000 }),
    });
    if (!res.ok) throw new Error('Failed to update reporter target');
    return res.json();
  }
};

export default goalService;
