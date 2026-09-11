import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../lib/auth/useAuthContext';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationsApi';

// Keyed by the caller's own token, not just ['notifications'] — a bare,
// user-agnostic key meant every login on the same tab shared one cache
// entry, so the previous user's notifications could flash on screen for
// whoever logged in next (e.g. a shared front-desk machine) before the
// first refetch landed. logout() also clears the whole cache as a second
// layer, but this key keeps two different logged-in users from ever
// colliding on the same entry in the first place.
export const notificationKeys = {
  all: (token: string | null) => ['notifications', token] as const,
};

export function useNotifications() {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: notificationKeys.all(token),
    queryFn: fetchNotifications,
    enabled: token !== null,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  const { token } = useAuthContext();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all(token) });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  const { token } = useAuthContext();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all(token) });
    },
  });
}
