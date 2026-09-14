import React, { useEffect } from 'react';
import { initSocketClient } from './services/socketService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import NewsList from './pages/News/NewsList';
import NewsForm from './pages/News/NewsForm';
import NewsDetail from './pages/News/NewsDetail';
import PendingReviews from './pages/News/PendingReviews';
import VideosList from './pages/Videos/VideosList';
import VideoForm from './pages/Videos/VideoForm';
import TeamManagement from './pages/Team/TeamManagement';
import Settings from './pages/Settings';
import Login from './pages/Login';
import AccessDenied from './pages/AccessDenied';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AdsList from './pages/Ads/AdsList';
import PushNotify from './pages/Notifications/PushNotify';

// Reporter Module Pages
import ReporterLayout from './pages/Reporter/ReporterLayout';
import ReporterDashboard from './pages/Reporter/ReporterDashboard';
import SubmitNews from './pages/Reporter/SubmitNews';
import MyArticles from './pages/Reporter/MyArticles';
import PressCardPage from './pages/Reporter/PressCardPage';
import LeaveManagement from './pages/Reporter/LeaveManagement';
import ReporterGoals from './pages/Reporter/ReporterGoals';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useEffect(() => {
    initSocketClient();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* REPORTER PORTAL ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['reporter', 'admin']} />}>
              <Route path="/reporter" element={<ReporterLayout />}>
                <Route index element={<ReporterDashboard />} />
                <Route path="dashboard" element={<ReporterDashboard />} />
                <Route path="submit" element={<SubmitNews />} />
                <Route path="articles" element={<MyArticles />} />
                <Route path="goals" element={<ReporterGoals />} />
                <Route path="press-card" element={<PressCardPage />} />
                <Route path="leaves" element={<LeaveManagement />} />
              </Route>
            </Route>

            {/* ADMIN ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                
                {/* News & Editorial Review Routes */}
                <Route path="news/reviews" element={<PendingReviews />} />
                <Route path="news" element={<NewsList />} />
                <Route path="leaves" element={<LeaveManagement />} />
                <Route path="ads" element={<AdsList />} />
                <Route path="news/create" element={<NewsForm />} />
                <Route path="news/:id/edit" element={<NewsForm />} />
                <Route path="news/:id/view" element={<NewsDetail />} />
                
                {/* Videos Routes */}
                <Route path="videos" element={<VideosList />} />
                <Route path="videos/create" element={<VideoForm />} />
                <Route path="videos/:id/edit" element={<VideoForm />} />

                {/* Team & Journalists Route */}
                <Route path="team" element={<TeamManagement />} />

                {/* Settings Route */}
                <Route path="settings" element={<Settings />} />

                {/* Push Notifications */}
                <Route path="notifications" element={<PushNotify />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Login />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;