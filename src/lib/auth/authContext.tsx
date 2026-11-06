import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
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
  userId: string | null;
  isAuthenticated: boolean;
  session: SessionMeta;
  login: (token: string, role: string, userId?: string, session?: Partial<SessionMeta>) => void;
  // Called after a silent token refresh succeeds, to update the stored
  // expiry/idle-timeout values without touching token/role.
  updateSession: (session: Partial<SessionMeta>) => void;
  // Called after a silent token refresh succeeds, to swap in the new
  // access token so subsequent requests stop using the one that's about
  // to expire.
  updateToken: (token: string) => void;
  logout: () => void;
  // Why the last session ended without the user asking (set by the global
  // 401 handler); RequireRole forwards it as /login?reason=expired.
  sessionEndReason: 'expired' | null;
  // Global 401 handler: logout + remember that the session expired.
  expireSession: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [session, setSession] = useState<SessionMeta>(EMPTY_SESSION);
  const [sessionEndReason, setSessionEndReason] = useState<'expired' | null>(null);
  const tokenRef = useRef<string | null>(null);

  const login = useCallback(
    (newToken: string, newRole: string, newUserId?: string, sessionMeta?: Partial<SessionMeta>) => {
      const normalized = newRole.toLowerCase() as UserRole;
      setToken(newToken);
      setRole(normalized);
      setUserId(newUserId ?? null);
      setSession({ ...EMPTY_SESSION, ...sessionMeta });
      setSessionEndReason(null);
    },
    [],
  );

  const updateSession = useCallback((patch: Partial<SessionMeta>) => {
    setSession((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateToken = useCallback((newToken: string) => {
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setRole(null);
    setUserId(null);
    setSession(EMPTY_SESSION);
    setSessionEndReason(null);
    // Every cached query (notifications especially — see notificationKeys)
    // is scoped to whoever was logged in. Without this, the next person to
    // log in on the same tab (a shared front-desk machine, say) can see the
    // previous user's cached data flash on screen before it refetches —
    // real exposure for role-restricted data like notifications.
    queryClient.clear();
  }, []);

  // Called by the global 401 handler. No-op when nobody is signed in, so a
  // late 401 from an in-flight request after a deliberate logout can't flag
  // the next login screen as "expired".
  const expireSession = useCallback(() => {
    if (tokenRef.current === null) return;
    logout();
    setSessionEndReason('expired');
  }, [logout]);

  useEffect(() => {
    tokenRef.current = token;
    setTokenGetter(() => token);
    setOnUnauthorized(expireSession);
  }, [token, expireSession]);

  const value = useMemo<AuthState>(
    () => ({
      token,
      role,
      userId,
      isAuthenticated: token !== null,
      session,
      login,
      updateSession,
      updateToken,
      logout,
      sessionEndReason,
      expireSession,
    }),
    [
      token,
      role,
      userId,
      session,
      login,
      updateSession,
      updateToken,
      logout,
      sessionEndReason,
      expireSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
