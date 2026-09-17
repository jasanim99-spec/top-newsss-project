import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, Settings, Plus, LogOut, FileText, Video, Globe, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { settingsService } from '@/services/settingsService';
import { ThemeToggle } from '@/components/ThemeToggle';

interface HeaderProps {
  title?: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [mainWebsiteUrl, setMainWebsiteUrl] = useState('http://localhost:8080');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    settingsService.getSettings().then(s => {
      if (s.mainWebsiteUrl) setMainWebsiteUrl(s.mainWebsiteUrl);
    });

    const handleUpdate = (e: any) => {
      if (e.detail?.mainWebsiteUrl) {
        setMainWebsiteUrl(e.detail.mainWebsiteUrl);
      }
    };
    window.addEventListener('topnews_settings_updated', handleUpdate);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCreateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('topnews_settings_updated', handleUpdate);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 flex justify-between items-center px-4 md:px-8 h-16 shadow-2xs transition-colors">
      {/* Left: Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xs sm:max-w-md">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex-shrink-0"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input Pill */}
        <div className="flex items-center bg-slate-50/90 dark:bg-slate-800/90 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl w-full border border-slate-200/80 dark:border-slate-700 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/40 focus-within:border-indigo-500 transition-all shadow-2xs">
          <Search className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search news, videos..."
            className="bg-transparent border-none focus:outline-none text-xs font-semibold w-full placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        <a
          href={mainWebsiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-900 dark:hover:text-white text-xs font-bold transition-all border border-slate-200/80 dark:border-slate-700 shadow-2xs group"
          title="Open Main News Website"
        >
          <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform" />
          <span>View Website</span>
          <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
        </a>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Notification Icon with Pulsing Dot */}
        <button 
          onClick={() => navigate('/notifications')}
          className="relative hover:bg-indigo-50/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl p-2 sm:p-2.5 transition-all hidden sm:flex items-center justify-center cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        </button>

        {/* Settings Icon */}
        <button 
          onClick={() => navigate('/settings')}
          className="hover:bg-indigo-50/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl p-2 sm:p-2.5 transition-all hidden sm:flex items-center justify-center cursor-pointer"
          title="Site Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
        
        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

        {/* Create New Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
            title="Create New"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Create New</span>
          </button>

          {createDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  navigate('/news/create');
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-900 dark:hover:text-white flex items-center gap-3 font-bold transition-colors"
              >
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Create News Article
              </button>
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  navigate('/videos/create');
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-900 dark:hover:text-white flex items-center gap-3 font-bold transition-colors"
              >
                <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Create Short Video
              </button>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 sm:p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;