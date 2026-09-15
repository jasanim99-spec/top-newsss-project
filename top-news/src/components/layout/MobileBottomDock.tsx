import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Video, Search, Megaphone } from 'lucide-react';
import { AdSubmissionModal } from '@/components/ads/AdSubmissionModal';
import { useNewsStore } from '@/store/newsStore';

export function MobileBottomDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const [adModalOpen, setAdModalOpen] = useState(false);
  const { setSearchQuery } = useNewsStore();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Videos', icon: Video, path: '/videos' },
    {
      label: 'Advertise',
      icon: Megaphone,
      action: () => setAdModalOpen(true),
      highlight: true
    },
    {
      label: 'Search',
      icon: Search,
      action: () => {
        const query = prompt('Enter search keywords:');
        if (query && query.trim()) {
          setSearchQuery(query.trim());
          navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
      }
    }
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 shadow-2xl px-2 py-1.5 transition-all">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = item.path ? isActive(item.path) : false;

            if (item.action) {
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all cursor-pointer ${
                    item.highlight
                      ? 'text-red-400 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-full ${
                      item.highlight
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-400/40'
                        : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={idx}
                to={item.path!}
                className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all ${
                  active
                    ? 'text-blue-400 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div
                  className={`p-1.5 rounded-full ${
                    active ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/40' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <AdSubmissionModal
        isOpen={adModalOpen}
        onClose={() => setAdModalOpen(false)}
      />
    </>
  );
}
