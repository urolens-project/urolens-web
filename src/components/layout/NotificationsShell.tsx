import { useAuthContext } from '../../lib/auth/useAuthContext';
import { ROLE_SHELL_CONFIG } from '../../lib/roleShellConfig';
import { UserRole } from '../../types/enums';
import RoleShell from './RoleShell';

const SHELL_PROPS: Record<
  UserRole,
  { navSectionLabel: string; workspaceLabel: string; title: string }
> = {
  [UserRole.RECEPTIONIST]: {
    navSectionLabel: 'Main Operations',
    workspaceLabel: 'Intake Workspace',
    title: 'Reception Management Node',
  },
  [UserRole.MEDTECH]: {
    navSectionLabel: 'MedTech Workspace',
    workspaceLabel: 'Processing Workspace',
    title: 'Specimen Processing Console',
  },
  [UserRole.SUPERVISOR]: {
    navSectionLabel: 'Supervisor Workspace',
    workspaceLabel: 'Supervisor Workspace',
    title: 'Laboratory Review Console',
  },
  [UserRole.PHYSICIAN]: {
    navSectionLabel: 'Physician Workspace',
    workspaceLabel: 'Physician Workspace',
    title: 'Clinical Request Portal',
  },
  [UserRole.PATIENT]: {
    navSectionLabel: 'Patient Workspace',
    workspaceLabel: 'Patient Workspace',
    title: 'My Results Portal',
  },
  [UserRole.ADMINISTRATOR]: {
    navSectionLabel: 'Admin Workspace',
    workspaceLabel: 'Admin Workspace',
    title: 'System Administration',
  },
};

/**
 * The full "View all notifications" page is reachable from every role, but
 * each role already lives inside its own RoleShell with its own nav — this
 * just renders the same shell configuration the logged-in user already
 * sees elsewhere, so "View all" doesn't drop them into an unfamiliar layout.
 *
 * A single shared route (guarded for any authenticated role) is used here
 * rather than repeating `path="/notifications"` inside each role's own
 * `RequireRole` block: React Router resolves same-path route ties to
 * whichever block is registered first, so duplicating the path across
 * six separate guards would silently lock every role but the first out.
 */
export default function NotificationsShell() {
  const { role } = useAuthContext();
  if (!role) return null;

  const navItems = ROLE_SHELL_CONFIG[role];
  const shellProps = SHELL_PROPS[role];

  return <RoleShell navItems={navItems} {...shellProps} />;
}
