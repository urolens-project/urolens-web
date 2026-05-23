import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../lib/auth/useAuthContext';
import { authApi } from '../features/auth/api/authApi';

const WARNING_MINUTES = 2;

export function useSessionTimeout() {
  const { isAuthenticated, logout } = useAuthContext();
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningShownRef = useRef(false);

  const timeoutMinutes = Number(
    import.meta.env.VITE_SESSION_TIMEOUT_MINUTES ?? 30,
  );
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = WARNING_MINUTES * 60 * 1000;

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    warningShownRef.current = false;
  }, []);

  const resetTimer = useCallback(() => {
    clearTimers();

    if (timeoutMs > 0) {
      warningTimerRef.current = setTimeout(() => {
        warningShownRef.current = true;
      }, timeoutMs - warningMs);

      timerRef.current = setTimeout(() => {
        authApi.logout().finally(() => {
          logout();
          navigate('/login?reason=timeout', { replace: true });
        });
      }, timeoutMs);
    }
  }, [clearTimers, logout, navigate, timeoutMs, warningMs]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      return;
    }

    resetTimer();

    const events = ['mousemove', 'keydown', 'click', 'scroll'] as const;

    function handleActivity() {
      resetTimer();
    }

    for (const event of events) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      clearTimers();
      for (const event of events) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [isAuthenticated, resetTimer, clearTimers]);
}
