import { UserRole } from '../../types/enums';

// Record<UserRole, ...> rather than Record<string, ...> deliberately — this
// used to be duplicated (once in useAuth.ts, once in auth.routes.tsx), and
// both copies had independently drifted to be missing `medtech`. Typing it
// against the full UserRole union means TS refuses to compile if a role is
// ever left out again.
export const roleToDashboard: Record<UserRole, string> = {
  [UserRole.RECEPTIONIST]: '/dashboard/receptionist',
  [UserRole.MEDTECH]: '/dashboard/medtech',
  [UserRole.SUPERVISOR]: '/dashboard/supervisor',
  [UserRole.PHYSICIAN]: '/dashboard/physician',
  [UserRole.PATIENT]: '/dashboard/patient',
  [UserRole.ADMINISTRATOR]: '/dashboard/administrator',
};
