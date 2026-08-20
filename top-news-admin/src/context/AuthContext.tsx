import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/auth';
import { authService } from '@/services/authService';
import { AdminUser } from '@/types';

const ADMIN_SESSION_KEY = 'topnews_admin_session';

const getStoredSession = () => {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY) || sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
};

const saveStoredSession = (user: any, admin: any) => {
  try {
    const payload = JSON.stringify({ user, admin });
    localStorage.setItem(ADMIN_SESSION_KEY, payload);
    sessionStorage.setItem(ADMIN_SESSION_KEY, payload);
  } catch (e) {}
};

const clearStoredSession = () => {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (e) {}
};

interface AuthContextType {
  user: User | null;
  admin: AdminUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ user: User; admin: AdminUser }>;
  logout: () => Promise<void>;
  refetchAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = getStoredSession();
    return cached?.user || null;
  });

  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const cached = getStoredSession();
    return cached?.admin || null;
  });

  const [loading, setLoading] = useState<boolean>(true);

  const fetchAdminProfile = async (currentUser: User) => {
    try {
      const profile = await authService.getAdminProfile(currentUser.uid, currentUser.email || undefined);
      setAdmin(profile);
      saveStoredSession(currentUser, profile);
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.warn('AuthContext: User admin verification failed:', err.message);
      }
      if (!admin) {
        const fallbackAdmin: AdminUser = {
          _id: currentUser.uid,
          id: currentUser.uid,
          email: currentUser.email || 'jasanim99@gmail.com',
          name: (currentUser.email || 'Admin').split('@')[0],
          role: 'admin',
          active: true,
          createdAt: new Date().toISOString()
        };
        setAdmin(fallbackAdmin);
        saveStoredSession(currentUser, fallbackAdmin);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchAdminProfile(currentUser);
      } else {
        const cached = getStoredSession();
        if (cached && cached.user && cached.admin) {
          setUser(cached.user);
          const normalizedRole = String(cached.admin.role || '').toLowerCase() === 'reporter' ? 'reporter' : 'admin';
          setAdmin({ ...cached.admin, role: normalizedRole as any });
        } else {
          setUser(null);
          setAdmin(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const result = await authService.login(email, pass);
      setUser(result.user);
      setAdmin(result.admin);
      saveStoredSession(result.user, result.admin);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      clearStoredSession();
      await authService.logout();
      setUser(null);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const refetchAdmin = async () => {
    if (user) {
      await fetchAdminProfile(user);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = !!admin && admin.active === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        refetchAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
