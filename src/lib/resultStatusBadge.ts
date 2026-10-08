import type { BadgeVariant } from '../components/ui/Badge';

/**
 * Canonical status -> Badge color mapping for lab result statuses. Shared
 * across physician, supervisor, and patient-facing views so the same status
 * never renders in a different color depending on which page you're on.
 * Label text is left to each call site — "Pending Approval" (supervisor) vs
 * "Under Review" (physician) for the same status is a perspective
 * difference, not an inconsistency.
 */
const RESULT_STATUS_VARIANT: Record<string, BadgeVariant> = {
  PENDING_CONFIRM: 'default',
  PENDING_SUPERVISOR_APPROVAL: 'warning',
  APPROVED: 'success',
  RETURNED_FOR_CORRECTION: 'info',
  CRITICAL_ESCALATED: 'danger',
  RELEASED: 'success',
  CONFIRMED: 'warning',
  PENDING: 'default',
};

export function getResultStatusVariant(status: string): BadgeVariant {
  return RESULT_STATUS_VARIANT[status] ?? 'default';
}
