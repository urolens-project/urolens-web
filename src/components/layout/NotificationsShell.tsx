import { useAuthContext } from '../../lib/auth/useAuthContext';
import AppShell from './AppShell';
import DashboardShell from './DashboardShell';
import SupervisorShell from './SupervisorShell';
import PhysicianShell from './PhysicianShell';

/**
 * The full "View all notifications" page is reachable from every role, but
 * each role already lives inside its own shell with its own nav (or, for
 * MedTech/Patient/Administrator, the shared bare AppShell) — this just
 * renders whichever one the logged-in user already sees elsewhere, so
 * "View all" doesn't drop them into an unfamiliar layout.
 *
 * A single shared route (guarded for any authenticated role) is used here
 * rather than repeating `path="/notifications"` inside each role's own
 * `RequireRole` block: React Router resolves same-path route ties to
 * whichever block is registered first, so duplicating the path across
 * six separate guards would silently lock every role but the first out.
 */
export default function NotificationsShell() {
  const { role } = useAuthContext();

  switch (role) {
    case 'receptionist':
      return <DashboardShell />;
    case 'supervisor':
      return <SupervisorShell />;
    case 'physician':
      return <PhysicianShell />;
    default:
      return <AppShell />;
  }
}
