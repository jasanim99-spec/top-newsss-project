import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'reporter')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, admin, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
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
