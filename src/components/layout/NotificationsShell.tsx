import { useAuthContext } from '../../lib/auth/useAuthContext';
import { ROLE_SHELL_CONFIG } from '../../lib/roleShellConfig';
import RoleShell from './RoleShell';

/**
 * The full "View all notifications" page is reachable from every role, but
 * each role already lives inside its own RoleShell with its own nav — this
 * just renders that same shell (same sidebar, same accent) with the current
 * role's config, so "View all" doesn't drop them into an unfamiliar layout.
 *
 * A single shared route (guarded for any authenticated role) is used here
 * rather than repeating `path="/notifications"` inside each role's own
 * `RequireRole` block: React Router resolves same-path route ties to
 * whichever block is registered first, so duplicating the path across six
 * separate guards would silently lock every role but the first out.
 */
export default function NotificationsShell() {
  const { role } = useAuthContext();
  const navItems = role ? ROLE_SHELL_CONFIG[role] : null;

  if (!navItems) return null;

  return <RoleShell navItems={navItems} title="Notifications" />;
}
