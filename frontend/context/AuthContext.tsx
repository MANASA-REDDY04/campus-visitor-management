'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '@/types/auth';
import { loginUser } from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string; user?: AuthUser }>;
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'cbit_visitor_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rehydrate user from localStorage
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse stored user', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await loginUser(username, password);
      if (res.success && res.user) {
        setUser(res.user);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.user));
        } catch (e) {
          console.error('Failed to store auth user', e);
        }
        return { success: true, message: res.message, user: res.user };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (err instanceof Error ? err.message : 'Invalid credentials');
      return { success: false, message: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove auth user', e);
    }
  };

  const hasRole = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
