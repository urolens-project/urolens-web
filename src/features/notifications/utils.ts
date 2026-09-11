import type { UserRole } from '../../types/enums';

/**
 * Where clicking a notification should take the viewer, given its type and
 * the viewer's own role — the same notification_type means different
 * destinations for different roles (RESULT_RELEASED goes to a patient's own
 * result, or to a physician's view of their patient's result).
 * Returns null when there's nowhere sensible to send them (still marks read).
 */
export function getNotificationLink(
  notificationType: string,
  entityId: string | null,
  role: UserRole | null,
): string | null {
  if (!entityId) return null;

  switch (notificationType) {
    case 'RESULT_READY_FOR_REVIEW':
    case 'SMART_DIAGNOSIS_UNAVAILABLE':
      return role === 'supervisor' ? `/supervisor/results/${entityId}` : null;
    case 'RESULT_RELEASED':
      if (role === 'patient') return `/dashboard/patient/results/${entityId}`;
      if (role === 'physician') return `/physician/results/${entityId}`;
      return null;
    case 'SAMPLE_ASSIGNED':
      return role === 'medtech' ? '/medtech/results' : null;
    case 'LAB_REQUEST_SUBMITTED':
      return role === 'receptionist' ? '/intake/queue' : null;
    default:
      return null;
  }
}

export function formatNotificationTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}
