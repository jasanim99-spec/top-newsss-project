import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  Settings,
  X,
  Clock,
  UserCheck,
  Globe,
  ExternalLink,
  Megaphone,
  Bell,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { settingsService } from '@/services/settingsService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { user, admin } = useAuth();
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const [mainWebsiteUrl, setMainWebsiteUrl] = useState('http://localhost:8080');

  // Dynamic notification counts for menu items with pending action items
  const { data: notificationCounts } = useQuery<Record<string, number>>({
    queryKey: ['sidebar-notification-counts'],
    queryFn: async () => {
      try {
        const [newsRes, leavesRes, adsRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/news/stats/dashboard`).then(r => r.json()),
          fetch(`${API_BASE_URL}/leaves?status=pending`).then(r => r.json()),
          fetch(`${API_BASE_URL}/ads/requests?status=pending`).then(r => r.json()),
        ]);

        const pendingReviews = newsRes.status === 'fulfilled' && newsRes.value?.pending ? Number(newsRes.value.pending) : 0;
        const pendingLeaves = leavesRes.status === 'fulfilled' && Array.isArray(leavesRes.value?.leaves) ? leavesRes.value.leaves.length : 0;
        const pendingAds = adsRes.status === 'fulfilled' && Array.isArray(adsRes.value?.requests) ? adsRes.value.requests.length : 0;

        return {
          '/news/reviews': pendingReviews,
          '/leaves': pendingLeaves,
          '/ads': pendingAds,
        };
      } catch (e) {
        return {};
      }
    },
    refetchInterval: 8000,
  });

  React.useEffect(() => {
    settingsService.getSettings().then(s => {
      if (s?.logoUrl) setLogoUrl(s.logoUrl);
      if (s?.mainWebsiteUrl) setMainWebsiteUrl(s.mainWebsiteUrl);
    });

    const handleUpdate = (e: any) => {
      if (e.detail?.logoUrl) setLogoUrl(e.detail.logoUrl);
      if (e.detail?.mainWebsiteUrl) setMainWebsiteUrl(e.detail.mainWebsiteUrl);
    };
    window.addEventListener('topnews_settings_updated', handleUpdate);
    return () => window.removeEventListener('topnews_settings_updated', handleUpdate);
  }, []);

  const displayName = admin?.name || user?.name || user?.email?.split('@')[0] || 'Admin';
  const roleName = admin?.role === 'admin' ? 'Chief Editor & Admin' : 'Admin Console';

  const menuSections = [
    {
      title: 'MAIN',
      items: [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard', iconColor: 'text-blue-500', activeGradient: 'from-blue-600 via-indigo-600 to-cyan-600' },
      ]
    },
    {
      title: 'EDITORIAL & CONTENT',
      items: [
        { path: '/news/reviews', icon: Clock, label: 'Review Submissions', iconColor: 'text-amber-500', activeGradient: 'from-amber-600 to-orange-600' },
        { path: '/news', icon: FileText, label: 'All News Articles', iconColor: 'text-indigo-500', activeGradient: 'from-indigo-600 to-purple-600' },
        { path: '/videos', icon: Video, label: 'Short Videos', iconColor: 'text-purple-500', activeGradient: 'from-purple-600 to-pink-600' },
      ]
    },
    {
      title: 'TEAM & REPORTERS',
      items: [
        { path: '/team', icon: UserCheck, label: 'Reporters & Team', iconColor: 'text-cyan-500', activeGradient: 'from-cyan-600 to-blue-600' },
        { path: '/leaves', icon: Calendar, label: 'Reporter Leaves', iconColor: 'text-emerald-500', activeGradient: 'from-emerald-600 to-teal-600' },
      ]
    },
    {
      title: 'MARKETING & SYSTEM',
      items: [
        { path: '/ads', icon: Megaphone, label: 'Advertisement Manager', iconColor: 'text-rose-500', activeGradient: 'from-rose-600 to-pink-600' },
        { path: '/notifications', icon: Bell, label: 'Push Notifications', iconColor: 'text-orange-500', activeGradient: 'from-orange-600 to-amber-600' },
        { path: '/settings', icon: Settings, label: 'Site Settings', iconColor: 'text-slate-600', activeGradient: 'from-slate-800 to-slate-900' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-[290px] bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-50 lg:hidden flex flex-col justify-between p-5 shadow-2xl overflow-y-auto transition-colors"
      >
        <div>
          {/* Logo Header */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img 
                src={logoUrl} 
                alt="TOP NEWS Logo" 
                className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-100 dark:border-slate-800 flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">TOP NEWS</h1>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mt-0.5">Admin Console</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card Header */}
          <div className="mb-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/40 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white font-black text-base flex items-center justify-center shadow-md shadow-indigo-500/30 flex-shrink-0 border border-white/20 group-hover:scale-105 transition-transform">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 relative z-10">
              <p className="text-sm font-extrabold text-white truncate leading-snug">{displayName}</p>
              <span className="text-[10px] font-extrabold text-indigo-200 bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-full mt-1 truncate inline-block">
                {roleName}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-6">
            {menuSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <p className="px-3 text-[10px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-2">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  const pendingCount = notificationCounts?.[item.path] || 0;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onToggle}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive 
                          ? `bg-gradient-to-r ${item.activeGradient} text-white shadow-md shadow-indigo-500/20 font-black scale-[1.02]` 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : item.iconColor}`} />
                        <span>{item.label}</span>
                      </div>
                      {pendingCount > 0 && (
                        <span className="relative flex h-2.5 w-2.5 ml-auto">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-sm shadow-rose-500 ring-2 ring-white/30"></span>
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <a
            href={mainWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-50/80 dark:hover:bg-slate-800 hover:text-indigo-900 dark:hover:text-white transition-all border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>View Main Website</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </a>
        </div>
      </motion.aside>

      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[290px] bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex-col justify-between p-5 z-30 shadow-[2px_0_12px_rgba(0,0,0,0.03)] overflow-y-auto transition-colors">
        <div>
          {/* Logo Header */}
          <div className="mb-6 px-1 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={logoUrl} 
                alt="TOP NEWS Logo" 
                className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-100 dark:border-slate-800 flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">TOP NEWS</h1>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mt-0.5">Admin Console</p>
              </div>
            </div>
          </div>

          {/* User Profile Card Header */}
          <div className="mb-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/40 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white font-black text-base flex items-center justify-center shadow-md shadow-indigo-500/30 flex-shrink-0 border border-white/20 group-hover:scale-105 transition-transform">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 relative z-10">
              <p className="text-sm font-extrabold text-white truncate leading-snug">{displayName}</p>
              <span className="text-[10px] font-extrabold text-indigo-200 bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-full mt-1 truncate inline-block">
                {roleName}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-6">
            {menuSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <p className="px-3 text-[10px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-2">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  const pendingCount = notificationCounts?.[item.path] || 0;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive 
                          ? `bg-gradient-to-r ${item.activeGradient} text-white shadow-md shadow-indigo-500/20 font-black scale-[1.02]` 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : item.iconColor}`} />
                        <span>{item.label}</span>
                      </div>
                      {pendingCount > 0 && (
                        <span className="relative flex h-2.5 w-2.5 ml-auto">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-sm shadow-rose-500 ring-2 ring-white/30"></span>
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <a
            href={mainWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-50/80 dark:hover:bg-slate-800 hover:text-indigo-900 dark:hover:text-white transition-all border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 group"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span>View Main Website</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
          </a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;