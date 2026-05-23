import { createContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import type { UserRole } from '../../types/enums';
import { setTokenGetter, setOnUnauthorized } from '../apiClient';

export interface AuthState {
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (token: string, role: string) => void;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  const login = useCallback((newToken: string, newRole: string) => {
    const normalized = newRole.toLowerCase() as UserRole;
    setToken(newToken);
    setRole(normalized);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setRole(null);
  }, []);

  useEffect(() => {
    setTokenGetter(() => token);
    setOnUnauthorized(logout);
  }, [token, logout]);

  const value = useMemo<AuthState>(
    () => ({
      token,
      role,
      isAuthenticated: token !== null,
      login,
      logout,
    }),
    [token, role, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
