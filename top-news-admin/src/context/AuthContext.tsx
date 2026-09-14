import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/auth';
import { authService } from '@/services/authService';
import { AdminUser } from '@/types';

const ADMIN_SESSION_KEY = 'topnews_admin_session';

const getStoredSession = () => {
  try {
    // 1. Check sessionStorage FIRST for strict tab-isolated session
    const sessionRaw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (sessionRaw) {
      return JSON.parse(sessionRaw);
    }
    // 2. Fallback to localStorage ONLY if sessionStorage is empty
    const localRaw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      sessionStorage.setItem(ADMIN_SESSION_KEY, localRaw);
      return parsed;
    }
  } catch (e) {}
  return null;
};

const saveStoredSession = (user: any, admin: any) => {
  try {
    const payload = JSON.stringify({ user, admin });
    sessionStorage.setItem(ADMIN_SESSION_KEY, payload);
    localStorage.setItem(ADMIN_SESSION_KEY, payload);
  } catch (e) {}
};

const clearStoredSession = () => {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
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
      const cached = getStoredSession();
      if (cached && cached.admin) {
        setAdmin(cached.admin);
      } else if (!admin) {
        const fallbackAdmin: AdminUser = {
          _id: currentUser.uid,
          id: currentUser.uid,
          email: currentUser.email || 'jasanim99@gmail.com',
          name: (currentUser.email || 'Admin').split('@')[0],
          role: (currentUser.email || '').includes('reporter') ? 'reporter' : 'admin',
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
          setAdmin(cached.admin);
          try {
            const freshProfile = await authService.getAdminProfile(cached.user.uid, cached.user.email);
            setAdmin(freshProfile);
            saveStoredSession(cached.user, freshProfile);
          } catch (e) {}
        } else {
          setUser(null);
          setAdmin(null);
        }
      }
      setLoading(false);
    });

    // Real-time status update channel listener
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('topnews_user_status_channel');
      bc.onmessage = (event) => {
        if (event.data && event.data.uid) {
          const { uid, active } = event.data;
          setAdmin(prev => {
            if (prev && (prev.uid === uid || prev.id === uid || prev._id === uid)) {
              const updated = { ...prev, active };
              saveStoredSession(user, updated);
              return updated;
            }
            return prev;
          });
        }
      };
    } catch (e) {}

    return () => {
      unsubscribe();
      if (bc) bc.close();
    };
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
