import apiClient from '../../../lib/apiClient';
import type { NotificationItem } from '../types';

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const { data } = await apiClient.get<NotificationItem[]>('/notifications');
  return data;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiClient.patch(`/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch('/notifications/read-all');
}
