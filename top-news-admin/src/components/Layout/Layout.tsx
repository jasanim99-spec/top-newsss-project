import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] font-sans antialiased overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area */}
      <div className="lg:ml-[280px] min-h-screen flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Quick Create Floating Action Button (FAB) */}
      <button
        onClick={() => navigate('/news/create')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-full shadow-2xl shadow-indigo-600/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group border-2 border-white/30 cursor-pointer"
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