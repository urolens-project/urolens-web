import { createContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import type { UserRole } from '../../types/enums';
import { setTokenGetter, setOnUnauthorized } from '../apiClient';
import { queryClient } from '../queryClient';

// Staff-only session metadata from the login/refresh response — stays all
// null for a patient session, since the patient portal has no refresh
// endpoint and no server-side idle timeout (see useSessionTimeout).
export interface SessionMeta {
  expiresAt: string | null;
  sessionExpiresAt: string | null;
  idleTimeoutMinutes: number | null;
  idleWarningSeconds: number | null;
}

const EMPTY_SESSION: SessionMeta = {
  expiresAt: null,
  sessionExpiresAt: null,
  idleTimeoutMinutes: null,
  idleWarningSeconds: null,
};

export interface AuthState {
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  session: SessionMeta;
  login: (token: string, role: string, session?: Partial<SessionMeta>) => void;
  // Called after a silent token refresh succeeds, to update the stored
  // expiry/idle-timeout values without touching token/role.
  updateSession: (session: Partial<SessionMeta>) => void;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [session, setSession] = useState<SessionMeta>(EMPTY_SESSION);

  const login = useCallback(
    (newToken: string, newRole: string, sessionMeta?: Partial<SessionMeta>) => {
      const normalized = newRole.toLowerCase() as UserRole;
      setToken(newToken);
      setRole(normalized);
      setSession({ ...EMPTY_SESSION, ...sessionMeta });
    },
    [],
  );

  const updateSession = useCallback((patch: Partial<SessionMeta>) => {
    setSession((prev) => ({ ...prev, ...patch }));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setRole(null);
    setSession(EMPTY_SESSION);
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
      session,
      login,
      updateSession,
      logout,
    }),
    [token, role, session, login, updateSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
