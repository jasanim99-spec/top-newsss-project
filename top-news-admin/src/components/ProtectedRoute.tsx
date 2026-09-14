import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'reporter')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, admin, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Enforce account active status (Block inactive reporters/admins)
  if (admin && admin.active === false) {
    const handleLogoutAndRedirect = async () => {
      try {
        sessionStorage.removeItem('topnews_admin_session');
        localStorage.removeItem('topnews_admin_session');
        await logout();
      } catch (e) {}
      window.location.href = '/login';
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-rose-500/30 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl" />
          <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-3xl font-black border border-rose-500/30 shadow-lg shadow-rose-500/20">
            🚫
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Account Deactivated</h2>
            <p className="text-xs text-rose-300 font-bold uppercase tracking-wider mt-1">Status: INACTIVE</p>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
            Your account has been set to <strong className="text-rose-400">INACTIVE</strong> by the Chief Editor / Admin. Access to the reporter portal is blocked until reactivated.
          </p>
          <button
            type="button"
            onClick={handleLogoutAndRedirect}
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs rounded-2xl transition-all cursor-pointer shadow-lg shadow-rose-600/30 active:scale-95 uppercase tracking-wider"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const rawRole = (admin?.role || 'admin').toLowerCase();
  // Normalize role: Any non-reporter role ('superadmin', 'editor', 'admin', etc.) is mapped to 'admin'
  const role = rawRole === 'reporter' ? 'reporter' : 'admin';

  // If specific roles are required
  if (allowedRoles && allowedRoles.length > 0) {
    const isAllowed = allowedRoles.some(r => {
      const target = r.toLowerCase();
      if (target === 'admin') return role === 'admin';
      return target === role;
    });

    if (!isAllowed) {
      if (role === 'reporter') {
        return <Navigate to="/reporter/dashboard" replace />;
      }
      return <Navigate to="/login" replace />;
    }
  } else {
    // Default Admin routes: Reporters should be sent to their reporter dashboard
    if (role === 'reporter') {
      return <Navigate to="/reporter/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
