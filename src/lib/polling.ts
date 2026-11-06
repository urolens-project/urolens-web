import { getReadinessStatus } from './readiness';
import { classifyError } from './apiErrors';

const MAX_BACKOFF_MS = 5 * 60 * 1000;

export interface PollInput {
  baseMs: number;
  /** Consecutive failures so far. */
  errorCount: number;
  hidden: boolean;
  /** False when the last error was a 401 (session over). */
  authorized: boolean;
  serviceReady: boolean;
}

/** Next poll delay in ms, or false to stop polling. Pure, for testing. */
export function nextPollDelay(i: PollInput): number | false {
  if (i.hidden || !i.authorized || !i.serviceReady) return false;
  if (i.errorCount <= 0) return i.baseMs;
  return Math.min(i.baseMs * 2 ** i.errorCount, MAX_BACKOFF_MS);
}

export function isDocumentHidden(): boolean {
  return typeof document !== 'undefined' && document.visibilityState === 'hidden';
}

export function isServiceReadyForPolling(): boolean {
  return getReadinessStatus() !== 'unavailable';
}

/** `refetchInterval` for react-query: pauses when hidden / 401 / service down, backs off on error. */
export function pollInterval(baseMs: number) {
  return (query: { state: { status: string; errorUpdateCount: number; error: unknown } }) =>
    nextPollDelay({
      baseMs,
      errorCount: query.state.status === 'error' ? query.state.errorUpdateCount : 0,
      hidden: isDocumentHidden(),
      authorized: classifyError(query.state.error) !== 'unauthorized',
      serviceReady: isServiceReadyForPolling(),
    });
}
