import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  Settings,
  X,
  Clock,
  Users,
  Award
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { settingsService } from '@/services/settingsService';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { user, admin } = useAuth();
  const [logoUrl, setLogoUrl] = React.useState('/logo.png');

  React.useEffect(() => {
    settingsService.getSettings().then(s => {
      if (s.logoUrl) setLogoUrl(s.logoUrl);
    });

    const handleUpdate = (e: any) => {
      if (e.detail?.logoUrl) {
        setLogoUrl(e.detail.logoUrl);
      }
    };
    window.addEventListener('topnews_settings_updated', handleUpdate);
    return () => window.removeEventListener('topnews_settings_updated', handleUpdate);
  }, []);

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/news/reviews', icon: Clock, label: 'Review Submissions', badge: 'New' },
    { path: '/news', icon: FileText, label: 'All News Articles' },
    { path: '/videos', icon: Video, label: 'Short Videos' },
    { path: '/team', icon: Users, label: 'Reporters & Team' },
    { path: '/settings', icon: Settings, label: 'Site Settings' },
  ];

  const displayName = admin?.name || user?.email?.split('@')[0] || 'admin';
  const roleName = (admin?.role || 'admin').toUpperCase();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-[280px] bg-white border-r border-gray-200 z-50 lg:hidden flex flex-col justify-between p-6 shadow-2xl"
      >
        <div>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img 
                src={logoUrl} 
                alt="TOP NEWS Logo" 
                className="w-10 h-10 rounded-xl object-cover shadow-sm border border-gray-100"
                onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
              />
              <div>
                <h1 className="text-xl font-bold text-[#0058be] tracking-tight uppercase leading-none">TOP NEWS</h1>
                <p className="text-[11px] text-gray-500 font-medium mt-1">Admin Console</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onToggle}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#0058be]/10 text-[#0058be] border-l-4 border-[#0058be]'
                      : 'text-[#424754] hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#0058be]' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Pill at Bottom */}
        <div className="pt-4 border-t border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0058be] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{roleName}</p>
          </div>
        </div>
      </motion.aside>

      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[280px] bg-white border-r border-gray-200 flex-col justify-between p-6 z-30 shadow-[0px_1px_3px_rgba(0,0,0,0.05),0px_10px_15px_-3px_rgba(0,0,0,0.02)]">
        <div>
          {/* Logo Header with Image */}
          <div className="mb-10 px-2 flex items-center gap-3">
            <img 
              src={logoUrl} 
              alt="TOP NEWS Logo" 
              className="w-10 h-10 rounded-xl object-cover shadow-sm border border-gray-100 flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
            />
            <div>
              <h1 className="text-xl font-bold text-[#0058be] tracking-tight uppercase leading-none">TOP NEWS</h1>
              <p className="text-[11px] text-gray-500 font-medium mt-1">Admin Console</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-[#0058be]/10 text-[#0058be] border-l-4 border-[#0058be]'
                      : 'text-[#424754] hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#0058be]' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Pill at Bottom */}
        <div className="pt-4 border-t border-gray-200 flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-[#0058be] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{roleName}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;