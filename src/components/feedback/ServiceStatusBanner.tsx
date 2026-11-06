import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { startReadinessMonitor, useReadinessStatus } from '../../lib/readiness';

/**
 * Mounts the readiness monitor and shows a "service starting" banner while
 * the backend is not ready. When the backend recovers, active queries are
 * refetched so paused polling resumes.
 */
export default function ServiceStatusBanner() {
  const status = useReadinessStatus();
  const queryClient = useQueryClient();
  const wasUnavailable = useRef(false);

  useEffect(() => startReadinessMonitor(), []);

  useEffect(() => {
    if (status === 'unavailable') {
      wasUnavailable.current = true;
    } else if (status === 'ready' && wasUnavailable.current) {
      wasUnavailable.current = false;
      void queryClient.refetchQueries({ type: 'active' });
    }
  }, [status, queryClient]);

  if (status !== 'unavailable') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 border-b border-amber-200 bg-amber-50/95 px-6 py-2.5 text-center backdrop-blur-sm"
    >
      <p className="text-xs font-medium text-amber-800">
        UroLens is starting up or being updated. This is temporary and usually takes about two
        minutes. This page will reconnect automatically.
      </p>
    </div>
  );
}
