import apiClient from '../../../lib/apiClient';
import type { NotificationItem, UnreadCountResponse } from '../types';

export interface FetchNotificationsParams {
  unreadOnly?: boolean;
  before?: string;
  limit?: number;
}

export async function fetchNotifications(
  params: FetchNotificationsParams = {},
): Promise<NotificationItem[]> {
  const { data } = await apiClient.get<NotificationItem[]>('/notifications', {
    params: {
      unread_only: params.unreadOnly || undefined,
      before: params.before,
      limit: params.limit,
    },
  });
  return data;
}

export async function fetchUnreadCount(): Promise<UnreadCountResponse> {
  const { data } = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
  return data;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiClient.patch(`/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch('/notifications/read-all');
}
