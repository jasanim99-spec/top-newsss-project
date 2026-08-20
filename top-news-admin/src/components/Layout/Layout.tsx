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
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#0058be] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
        title="Quick Create"
      >
        <Plus className="w-7 h-7" />
        <span className="absolute right-full mr-4 bg-[#2e3132] text-white px-3 py-1.5 rounded-md text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
          Quick Create News
        </span>
      </button>

      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;