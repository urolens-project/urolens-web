import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../lib/auth/useAuthContext';
import { authApi } from '../features/auth/api/authApi';
import { patientAuthApi } from '../features/auth/api/patientAuthApi';

const WARNING_MINUTES = 2;

export function useSessionTimeout() {
  const { isAuthenticated, role, logout } = useAuthContext();
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isWarningVisible, setIsWarningVisible] = useState(false);

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
  }, []);

  const resetTimer = useCallback(() => {
    clearTimers();

    if (timeoutMs > 0) {
      warningTimerRef.current = setTimeout(() => {
        setIsWarningVisible(true);
      }, timeoutMs - warningMs);

      timerRef.current = setTimeout(() => {
        const isPatient = role === 'patient';
        const logoutFn = isPatient ? patientAuthApi.logout : authApi.logout;
        const loginPath = isPatient ? '/patient/login?reason=timeout' : '/login?reason=timeout';
        logoutFn().finally(() => {
          logout();
          navigate(loginPath, { replace: true });
        });
      }, timeoutMs);
    }
  }, [clearTimers, logout, navigate, role, timeoutMs, warningMs]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      return;
    }

    resetTimer();

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
      for (const event of events) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [isAuthenticated, resetTimer, clearTimers]);

  return {
    isWarningVisible: isAuthenticated && isWarningVisible,
    dismissWarning: () => setIsWarningVisible(false),
  };
}
