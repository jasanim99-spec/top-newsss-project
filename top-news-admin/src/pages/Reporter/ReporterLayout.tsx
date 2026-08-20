import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Award, 
  LogOut, 
  Radio, 
  User, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ReporterLayout: React.FC = () => {
  const { user, admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (e) {
      toast.error('Logout failed');
    }
  };

  const navItems = [
    { path: '/reporter/dashboard', icon: LayoutDashboard, label: 'Dashboard', shortLabel: 'Home' },
    { path: '/reporter/submit', icon: PlusCircle, label: 'Submit News', shortLabel: 'Post News', primary: true },
    { path: '/reporter/articles', icon: FileText, label: 'My Articles', shortLabel: 'Articles' },
    { path: '/reporter/press-card', icon: Award, label: 'Press Card', shortLabel: 'ID Card' },
  ];

  const displayName = admin?.name || user?.email?.split('@')[0] || 'Reporter';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-6 flex flex-col font-sans">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo & Reporter Title */}
          <Link to="/reporter/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-[#0058be] text-white flex items-center justify-center font-black text-sm shadow-md">
              TN
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">TOP NEWS</span>
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider flex items-center gap-0.5">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  REPORTER
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">Field Reporting Desk</p>
            </div>
          </Link>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2">
            <Link
              to="/reporter/press-card"
              className="hidden sm:flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Press ID</span>
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#0058be] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-bold text-gray-800 leading-tight truncate max-w-[120px]">{displayName}</p>
                <p className="text-[10px] text-gray-500">{admin?.city || 'Correspondent'}</p>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* DESKTOP SUB-HEADER NAVIGATION */}
      <div className="hidden md:block bg-white border-b border-gray-200 py-2 px-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    item.primary
                      ? 'bg-[#0058be] hover:bg-blue-700 text-white shadow-md'
                      : isActive
                      ? 'bg-blue-50 text-[#0058be]'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Accredited Press Account Active</span>
          </div>
        </div>
      </div>

      {/* MAIN BODY OUTLET */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl py-1 px-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                item.primary
                  ? '-mt-5 bg-gradient-to-tr from-red-600 to-[#0058be] text-white p-3 rounded-full shadow-lg scale-110 active:scale-95 border-2 border-white'
                  : isActive
                  ? 'text-[#0058be] font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className={item.primary ? 'w-6 h-6' : 'w-5 h-5'} />
              {!item.primary && (
                <span className="text-[10px] mt-0.5 font-semibold leading-none">{item.shortLabel}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default ReporterLayout;
