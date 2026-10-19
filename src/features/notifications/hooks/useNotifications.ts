import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../lib/auth/useAuthContext';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationsApi';
import type { NotificationItem } from '../types';

// The bell's preview is a small, fixed window — it only ever needs "a
// handful of recent ones," not the full page's "everything."
const PREVIEW_LIMIT = 10;
const PAGE_SIZE = 20;

// Keyed by the caller's own token, not just ['notifications'] — a bare,
// user-agnostic key meant every login on the same tab shared one cache
// entry, so the previous user's notifications could flash on screen for
// whoever logged in next (e.g. a shared front-desk machine) before the
// first refetch landed. logout() also clears the whole cache as a second
// layer, but this key keeps two different logged-in users from ever
// colliding on the same entry in the first place.
//
// Every variant below shares the ['notifications', token] prefix so one
// invalidateQueries call after a mutation catches the bell preview, the
// badge count, and both filter tabs' paginated lists at once — nothing
// goes stale waiting on the next 30s poll.
export const notificationKeys = {
  base: (token: string | null) => ['notifications', token] as const,
  preview: (token: string | null) => ['notifications', token, 'preview'] as const,
  unreadCount: (token: string | null) => ['notifications', token, 'unread-count'] as const,
  list: (token: string | null, unreadOnly: boolean) =>
    ['notifications', token, 'list', unreadOnly] as const,
};

// The bell's preview — most-recent-only, no pagination; see the full page
// (useNotificationsPage) for "see everything."
export function useNotifications() {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: notificationKeys.preview(token),
    queryFn: () => fetchNotifications({ limit: PREVIEW_LIMIT }),
    enabled: token !== null,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

// The bell badge — a dedicated lightweight endpoint, not derived from
// whatever happens to be in the preview fetch above. Deriving it from the
// preview's capped list would undercount whenever there are unread
// notifications older than the most recent PREVIEW_LIMIT.
export function useUnreadCount() {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: notificationKeys.unreadCount(token),
    queryFn: fetchUnreadCount,
    enabled: token !== null,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    select: (data) => data.unread_count,
  });
}

// The full Notifications page — real cursor pagination via `before`, so
// "see everything" isn't capped at one page's worth, and `unreadOnly` is
// filtered server-side so the Unread tab can't miss anything older than
// whatever's currently loaded client-side.
export function useNotificationsPage(unreadOnly: boolean) {
  const { token } = useAuthContext();
  return useInfiniteQuery({
    queryKey: notificationKeys.list(token, unreadOnly),
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      fetchNotifications({ unreadOnly, before: pageParam, limit: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    // No explicit has-more flag from the API — a full page suggests there
    // may be another; a short one means we've reached the end.
    getNextPageParam: (lastPage: NotificationItem[]) =>
      lastPage.length === PAGE_SIZE ? lastPage[lastPage.length - 1].notification_id : undefined,
    enabled: token !== null,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  const { token } = useAuthContext();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.base(token) });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  const { token } = useAuthContext();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.base(token) });
    },
  });
}
