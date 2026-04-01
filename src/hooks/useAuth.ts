import { useState, useCallback } from 'react';
import type { User, UserRole } from '../types';

const AUTH_KEY = 'dhs_field_user';

function loadUser(): User | null {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(loadUser);

  const login = useCallback((name: string, role: UserRole) => {
    const u: User = {
      id: crypto.randomUUID(),
      name,
      email: '',
      role,
    };
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  const isTech = user?.role === 'tech';
  const isEstimator = user?.role === 'estimator' || user?.role === 'admin';

  return { user, login, logout, isTech, isEstimator, isLoggedIn: !!user };
}
