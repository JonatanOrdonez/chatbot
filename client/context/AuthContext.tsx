'use client';

import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { api } from '@/lib/axios';
import { AUTH_STORAGE_KEY, getStoredAuth, parseStoredUser } from '@/lib/authStorage';
import { User } from '@/lib/types';

const listeners = new Set<() => void>();

const getServerSnapshot = () => null;

const subscribeNoop = () => () => {};
const getHydrated = () => true;
const getServerHydrated = () => false;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const notify = () => listeners.forEach((listener) => listener());

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const raw = useSyncExternalStore(subscribe, getStoredAuth, getServerSnapshot);
  const isReady = useSyncExternalStore(subscribeNoop, getHydrated, getServerHydrated);
  const user = useMemo(() => parseStoredUser(raw), [raw]);

  const saveUser = (value: User) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
    notify();
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<User>('/auth/login', { email, password });
    saveUser(res.data);
  };

  // With email confirmation enabled the API returns an empty token: no session yet
  const register = async (email: string, password: string, name: string) => {
    const res = await api.post<User>('/auth/register', { email, password, name });

    if (res.data.token) {
      saveUser(res.data);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    notify();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isReady, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
