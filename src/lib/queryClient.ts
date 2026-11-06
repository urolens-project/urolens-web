import { QueryCache, QueryClient, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import { normalizeApiError } from './apiErrors';

// Global error surfacing. Per-screen error UI still wins where it exists:
//  - queries can opt out with `meta: { suppressGlobalError: true }`
//  - mutations that define their own `onError` are not toasted again.
// 401 is never toasted (the auth handler logs out and redirects), and the
// same message is shown at most once per DEDUPE_WINDOW_MS so a polling
// query failing every cycle does not stack toasts.

const DEDUPE_WINDOW_MS = 15_000;
const lastShown = new Map<string, number>();

export function resetGlobalErrorDedupeForTests() {
  lastShown.clear();
}

export function notifyGlobalError(error: unknown, now = Date.now()): void {
  const n = normalizeApiError(error);
  if (n.kind === 'unauthorized') return;
  const key = n.kind;
  const last = lastShown.get(key);
  if (last !== undefined && now - last < DEDUPE_WINDOW_MS) return;
  lastShown.set(key, now);
  toast.error(n.message, { id: `api-error-${key}` });
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.suppressGlobalError) return;
      notifyGlobalError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.onError) return;
      notifyGlobalError(error);
    },
  }),
  defaultOptions: {
    // NOTE: staleTime is 5 minutes for all queries, PHI included. Left
    // unchanged on purpose (flagged for review, not clearly wrong).
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});
