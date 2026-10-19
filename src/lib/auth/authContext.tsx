import { createContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import type { UserRole } from '../../types/enums';
import { setTokenGetter, setOnUnauthorized } from '../apiClient';
import { queryClient } from '../queryClient';

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
    // Every cached query (notifications especially — see notificationKeys)
    // is scoped to whoever was logged in. Without this, the next person to
    // log in on the same tab (a shared front-desk machine, say) can see the
    // previous user's cached data flash on screen before it refetches —
    // real exposure for role-restricted data like notifications.
    queryClient.clear();
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
