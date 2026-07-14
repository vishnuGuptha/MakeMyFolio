import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { authApi, type AuthUser } from '@/api';
import { setUnauthorizedHandler } from '@/lib/apiError';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  userRegister: (name: string, email: string, password: string) => Promise<void>;
  userLogin: (email: string, password: string) => Promise<void>;
  platformLogin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function redirectToLogin() {
  const path = window.location.pathname;
  if (
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password') ||
    path.startsWith('/platform/login') ||
    path.startsWith('/try') ||
    path.startsWith('/examples') ||
    path.startsWith('/privacy') ||
    path.startsWith('/terms')
  ) {
    return;
  }
  const isPlatform = path.startsWith('/platform');
  window.location.assign(isPlatform ? '/platform/login' : '/login');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      redirectToLogin();
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    authApi
      .me()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const userRegister = useCallback(async (name: string, email: string, password: string) => {
    const data = await authApi.userRegister(name, email, password);
    setUser({ email: data.email, name: data.name, role: 'user' });
  }, []);

  const userLogin = useCallback(async (email: string, password: string) => {
    const data = await authApi.userLogin(email, password);
    setUser(data);
  }, []);

  const platformLogin = useCallback(async (email: string, password: string) => {
    const data = await authApi.platformLogin(email, password);
    setUser(data);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, userRegister, userLogin, platformLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
