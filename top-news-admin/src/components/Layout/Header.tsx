import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, Settings, Plus, LogOut, FileText, Video } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCreateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 flex justify-between items-center px-6 h-16 shadow-sm">
      {/* Left: Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input Pill */}
        <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full w-64 sm:w-96 border border-gray-200/60 focus-within:ring-2 focus-within:ring-[#0058be]/20 focus-within:border-[#0058be] transition-all">
          <Search className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search news, videos or analytics..."
            className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-gray-400 text-gray-900"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button className="hover:bg-gray-100 rounded-full p-2.5 text-gray-600 transition-colors hidden sm:block">
          <Bell className="w-5 h-5" />
        </button>
        <button 
          onClick={() => navigate('/settings')}
          className="hover:bg-gray-100 rounded-full p-2.5 text-gray-600 transition-colors hidden sm:block"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>

        {/* Create New Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
            className="bg-[#0058be] text-white px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 hover:bg-[#004395] active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New</span>
          </button>

          {createDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  navigate('/news/create');
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 font-medium transition-colors"
              >
                <FileText className="w-4 h-4 text-[#0058be]" />
                Create News
              </button>
              <button
                onClick={() => {
                  setCreateDropdownOpen(false);
                  navigate('/videos/create');
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 font-medium transition-colors"
              >
                <Video className="w-4 h-4 text-[#0058be]" />
                Create Video
              </button>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;