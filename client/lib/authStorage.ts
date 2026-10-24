import { User } from './types';

export const AUTH_STORAGE_KEY = 'auth';

export const getStoredAuth = () => localStorage.getItem(AUTH_STORAGE_KEY);

export const parseStoredUser = (raw: string | null): User | null => {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};
