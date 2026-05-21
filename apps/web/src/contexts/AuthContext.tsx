'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiLogin, apiLogout, apiMe } from '@/lib/api';
import type { AuthUser } from '@/lib/types';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: check for existing token and validate it
  useEffect(() => {
    const token = localStorage.getItem('crm_access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    apiMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('crm_access_token');
        localStorage.removeItem('crm_refresh_token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, refreshToken } = await apiLogin(email, password);
    localStorage.setItem('crm_access_token', accessToken);
    localStorage.setItem('crm_refresh_token', refreshToken);
    const profile = await apiMe();
    setUser(profile);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    localStorage.removeItem('crm_access_token');
    localStorage.removeItem('crm_refresh_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
