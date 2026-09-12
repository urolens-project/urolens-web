export interface NotificationItem {
  notification_id: string;
  message: string;
  notification_type: string;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
}
