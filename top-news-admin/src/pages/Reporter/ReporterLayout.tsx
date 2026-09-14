import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Award, 
  LogOut, 
  Radio, 
  ShieldCheck,
  Menu,
  X,
  FileCheck,
  Globe,
  ExternalLink,
  Calendar,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const ReporterLayout: React.FC = () => {
  const { user, admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (e) {
      toast.error('Logout failed');
    }
  };

  const displayName = admin?.name || user?.name || user?.email?.split('@')[0] || 'Reporter';
  const displayRole = admin?.role === 'admin' ? 'Chief Editor & Admin' : 'Accredited Journalist';

  const menuItems = [
    { path: '/reporter/dashboard', icon: FileCheck, label: 'My Report', iconColor: 'text-blue-500', activeGradient: 'from-blue-600 via-indigo-600 to-cyan-600' },
    { path: '/reporter/submit', icon: PlusCircle, label: 'Submit News Report', iconColor: 'text-emerald-500', activeGradient: 'from-emerald-600 to-teal-600' },
    { path: '/reporter/articles', icon: FileText, label: 'My Submissions', iconColor: 'text-indigo-500', activeGradient: 'from-indigo-600 to-purple-600' },
    { path: '/reporter/goals', icon: Target, label: 'Goals & Badges', iconColor: 'text-rose-500', activeGradient: 'from-rose-600 via-red-600 to-pink-600' },
    { path: '/reporter/leaves', icon: Calendar, label: 'Leave Applications', iconColor: 'text-amber-500', activeGradient: 'from-amber-600 to-orange-600' },
    { path: '/reporter/press-card', icon: Award, label: 'Digital Press Card', iconColor: 'text-purple-500', activeGradient: 'from-purple-600 to-pink-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col lg:flex-row">
      {/* DESKTOP PERMANENT SIDEBAR */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[290px] bg-white border-r border-slate-200/80 flex-col justify-between p-5 z-30 shadow-[2px_0_12px_rgba(0,0,0,0.03)] overflow-y-auto">
        <div>
          {/* LOGO HEADER */}
          <div className="mb-6 px-1 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="TOP NEWS Logo" 
                className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-100 flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none">TOP NEWS</h1>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] font-extrabold text-indigo-600 tracking-wider uppercase mt-0.5">Reporter Desk</p>
              </div>
            </div>
          </div>

          {/* TOP PROFILE CARD */}
          <div className="mb-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/40 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white font-black text-base flex items-center justify-center shadow-md shadow-indigo-500/30 flex-shrink-0 border border-white/20 group-hover:scale-105 transition-transform">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 relative z-10">
              <h2 className="text-sm font-extrabold text-white truncate leading-tight">{displayName}</h2>
              <span className="inline-block text-[10px] font-extrabold text-indigo-200 bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-full mt-1 truncate">
                {displayRole}
              </span>
            </div>
          </div>

          {/* MENU ITEMS WITH VIBRANT GRADIENTS */}
          <nav className="space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Reporter Management
            </div>

            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/reporter/dashboard' && location.pathname === '/reporter');
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                    isActive
                      ? `bg-gradient-to-r ${item.activeGradient} text-white shadow-md shadow-indigo-500/20 font-black scale-[1.02]`
                      : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : item.iconColor}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {admin?.role === 'admin' && (
              <Link
                to="/"
                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all border border-indigo-200/80 mt-4 shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Admin Main Console</span>
              </Link>
            )}
          </nav>
        </div>

        {/* LOGOUT & WEBSITE LINK AT BOTTOM */}
        <div className="pt-4 border-t border-slate-200/80 space-y-2">
          <a
            href="http://localhost:8080"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-indigo-50/80 hover:text-indigo-900 transition-all border border-slate-200/80 bg-slate-50/50 group"
          >
            <span className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-indigo-600 group-hover:rotate-12 transition-transform" /> View Website
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-100 border border-rose-200/80 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-extrabold text-base text-slate-900 tracking-tight">TOP NEWS</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white font-black text-xs flex items-center justify-center border border-slate-700">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-bold text-slate-800">{displayName}</span>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: -280 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -280 }}
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white p-5 shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-lg">Reporter Desk</span>
                <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5" /></button>
              </div>

              <div className="mb-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{displayName}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{displayRole}</p>
                </div>
              </div>

              <nav className="space-y-1.5">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold ${
                      location.pathname === item.path
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-2.5 text-xs font-bold text-rose-700 bg-rose-50 rounded-xl"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-[290px] p-4 sm:p-6 lg:p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default ReporterLayout;
