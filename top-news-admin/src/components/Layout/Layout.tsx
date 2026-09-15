import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Plus, LayoutDashboard, Newspaper, Megaphone, Settings } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] font-sans antialiased overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area */}
      <div className="lg:ml-[280px] min-h-screen flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 lg:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile App Bottom Dock (visible on mobile < lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 shadow-2xl px-2 py-1.5">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
              isActive('/dashboard') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Home</span>
          </Link>

          <Link
            to="/news"
            className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
              isActive('/news') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Newspaper className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Articles</span>
          </Link>

          <button
            onClick={() => navigate('/news/create')}
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center border-2 border-slate-900 active:scale-95 transition-all">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-[10px] mt-0.5 text-blue-400 font-bold">New</span>
          </button>

          <Link
            to="/ads"
            className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
              isActive('/ads') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Ads</span>
          </Link>

          <Link
            to="/settings"
            className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
              isActive('/settings') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Settings</span>
          </Link>
        </div>
      </div>

      {/* Quick Create Floating Action Button (FAB for desktop) */}
      <button
        onClick={() => navigate('/news/create')}
        className="hidden lg:flex fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-full shadow-2xl shadow-indigo-600/40 items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group border-2 border-white/30 cursor-pointer"
        title="Quick Create News"
      >
        <Plus className="w-7 h-7" />
        <span className="absolute right-full mr-4 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-xl border border-slate-700">
          Quick Create News Article
        </span>
      </button>

      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;