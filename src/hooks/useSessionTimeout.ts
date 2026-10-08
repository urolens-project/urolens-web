import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../lib/auth/useAuthContext';
import { authApi } from '../features/auth/api/authApi';
import { patientAuthApi } from '../features/auth/api/patientAuthApi';

// The patient portal has no refresh endpoint and no server-side idle
// timeout (see patient_auth.py) — it keeps this flat client-side default,
// unrelated to the role-based values staff sessions get from the server.
const PATIENT_TIMEOUT_MINUTES = Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES ?? 30);
const PATIENT_WARNING_MINUTES = 2;

// How long before the access token's own expiry to proactively refresh it.
const REFRESH_BUFFER_MS = 60_000;
// A couple of silent retries on a failed refresh (e.g. a flaky connection)
// before giving up — one failure shouldn't be treated as a hard logout.
// If every retry fails, the token just expires naturally and the next API
// call's 401 triggers the existing onUnauthorized logout flow.
const REFRESH_RETRY_DELAYS_MS = [5_000, 15_000];

export function useSessionTimeout() {
  const { isAuthenticated, role, session, logout, updateSession } = useAuthContext();
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isWarningVisible, setIsWarningVisible] = useState(false);

  const isPatient = role === 'patient';

  const timeoutMinutes = isPatient
    ? PATIENT_TIMEOUT_MINUTES
    : (session.idleTimeoutMinutes ?? PATIENT_TIMEOUT_MINUTES);
  const warningMs =
    (isPatient
      ? PATIENT_WARNING_MINUTES * 60
      : (session.idleWarningSeconds ?? PATIENT_WARNING_MINUTES * 60)) * 1000;
  const timeoutMs = timeoutMinutes * 60 * 1000;

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const doInactivityLogout = useCallback(() => {
    const logoutFn = isPatient ? patientAuthApi.logout : () => authApi.logout('INACTIVITY');
    const loginPath = isPatient ? '/patient/login?reason=timeout' : '/login?reason=timeout';
    logoutFn().finally(() => {
      logout();
      navigate(loginPath, { replace: true });
    });
  }, [isPatient, logout, navigate]);

  const resetTimer = useCallback(() => {
    clearTimers();

    if (timeoutMs > 0) {
      warningTimerRef.current = setTimeout(
        () => {
          setIsWarningVisible(true);
        },
        Math.max(timeoutMs - warningMs, 0),
      );

      timerRef.current = setTimeout(doInactivityLogout, timeoutMs);
    }
  }, [clearTimers, timeoutMs, warningMs, doInactivityLogout]);

  // Staff only — schedules a silent token refresh shortly before the
  // current access token expires, so an active session never dies mid-use
  // waiting on a refresh that was never attempted. Recurses through a ref
  // (rather than calling itself by name) since a useCallback referencing
  // its own binding inside its own initializer is a lint violation — the
  // ref always resolves to the latest version anyway, which is what we
  // want here.
  const scheduleRefreshRef = useRef<(expiresAt: string | null, attempt?: number) => void>(() => {});

  const scheduleRefresh = useCallback(
    (expiresAt: string | null, attempt = 0) => {
      clearRefreshTimer();
      if (isPatient || !expiresAt) return;

      const delay = Math.max(new Date(expiresAt).getTime() - Date.now() - REFRESH_BUFFER_MS, 0);

      refreshTimerRef.current = setTimeout(() => {
        authApi
          .refresh()
          .then((data) => {
            updateSession({
              expiresAt: data.expires_at,
              sessionExpiresAt: data.session_expires_at,
              idleTimeoutMinutes: data.idle_timeout_minutes,
              idleWarningSeconds: data.idle_warning_seconds,
            });
            scheduleRefreshRef.current(data.expires_at, 0);
          })
          .catch(() => {
            if (attempt < REFRESH_RETRY_DELAYS_MS.length) {
              refreshTimerRef.current = setTimeout(
                () => scheduleRefreshRef.current(expiresAt, attempt + 1),
                REFRESH_RETRY_DELAYS_MS[attempt],
              );
            }
            // Otherwise give up silently — see REFRESH_RETRY_DELAYS_MS note.
          });
      }, delay);
    },
    [isPatient, clearRefreshTimer, updateSession],
  );

  useEffect(() => {
    scheduleRefreshRef.current = scheduleRefresh;
  }, [scheduleRefresh]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      clearRefreshTimer();
      return;
    }

    resetTimer();
    scheduleRefresh(session.expiresAt);

    const events = ['mousemove', 'keydown', 'click', 'scroll'] as const;

    function handleActivity() {
      setIsWarningVisible(false);
      resetTimer();
    }

    for (const event of events) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      clearTimers();
      clearRefreshTimer();
      for (const event of events) {
        window.removeEventListener(event, handleActivity);
      }
    };
    // scheduleRefresh intentionally omitted: it only needs to run once per
    // auth/resetTimer change here, then re-schedules itself recursively on
    // each successful refresh — including it would restart the refresh
    // chain (and the idle clock, via resetTimer) on every token refresh,
    // which must not count as user activity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, resetTimer, clearTimers, clearRefreshTimer]);

  return {
    isWarningVisible: isAuthenticated && isWarningVisible,
    // Dismissing the warning counts as activity (UAC: dismissing it
    // directly must cancel the expiration, not just hide the dialog) — so
    // this has to reset the timer too, not only hide it.
    dismissWarning: () => {
      setIsWarningVisible(false);
      resetTimer();
    },
  };
}
