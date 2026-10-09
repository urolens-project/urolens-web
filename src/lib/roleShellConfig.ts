import {
  AlertOctagon,
  Barcode,
  CheckSquare,
  ClipboardCheck,
  ClipboardList,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Send,
  UserPlus,
} from 'lucide-react';
import { UserRole } from '../types/enums';
import type { RoleShellNavItem } from '../components/layout/RoleShell';

// Shared by App.tsx (each role's own routes) and NotificationsShell (the
// one route every role reaches through a single shared guard) so a given
// role's sidebar nav is defined in exactly one place, never two lists that
// can drift apart.
export const ROLE_SHELL_CONFIG: Record<UserRole, RoleShellNavItem[]> = {
  [UserRole.RECEPTIONIST]: [
    {
      to: '/intake/register',
      label: 'Register Patient',
      description: 'New patient account registration',
      icon: UserPlus,
    },
    {
      to: '/intake/request',
      label: 'Lab Requests',
      description: 'Clinical laboratory requests',
      icon: FileText,
    },
    {
      to: '/intake/receive',
      label: 'Specimen Intake',
      description: 'Specimen receiving & validation',
      icon: FlaskConical,
    },
    {
      to: '/intake/label',
      label: 'Sample Labeling',
      description: 'Barcode label printing & affixing',
      icon: Barcode,
    },
    {
      to: '/intake/queue',
      label: 'Queue Assignment',
      description: 'Specimen to MedTech queue assignment',
      icon: ClipboardList,
    },
    {
      to: '/receptionist/results/approved',
      label: 'Release Results',
      description: 'Release approved results to patients',
      icon: Send,
    },
  ],

  [UserRole.MEDTECH]: [
    {
      to: '/medtech/results',
      label: 'Pending Confirmations',
      description: 'Results awaiting your confirmation',
      icon: ClipboardCheck,
      end: true,
    },
  ],

  [UserRole.SUPERVISOR]: [
    {
      to: '/dashboard/supervisor',
      label: 'Dashboard',
      description: 'Supervisor overview',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/supervisor/results',
      label: 'Lab Results Queue',
      description: 'Pending result review queue',
      icon: ClipboardList,
      end: true,
    },
    {
      to: '/supervisor/results/approved',
      label: 'Approved Results',
      description: 'Reviewed and approved results',
      icon: CheckSquare,
    },
    {
      to: '/supervisor/results/escalated',
      label: 'Escalated Results',
      description: 'Results flagged for further review',
      icon: AlertOctagon,
    },
  ],

  [UserRole.PHYSICIAN]: [
    {
      to: '/dashboard/physician',
      label: 'Dashboard',
      description: 'Physician portal overview',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/physician/lab-request/new',
      label: 'New Lab Request',
      description: 'Submit a specimen collection request',
      icon: ClipboardList,
      end: true,
    },
    {
      to: '/physician/results',
      label: "My Patients' Results",
      description: 'Retrieve results for your patients',
      icon: ClipboardCheck,
    },
  ],

  [UserRole.PATIENT]: [
    {
      to: '/dashboard/patient',
      label: 'Dashboard',
      description: 'Patient portal overview',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/dashboard/patient/results',
      label: 'My Results',
      description: 'View your lab test results',
      icon: FileText,
    },
  ],

  [UserRole.ADMINISTRATOR]: [
    {
      to: '/dashboard/administrator',
      label: 'Dashboard',
      description: 'System administration overview',
      icon: LayoutDashboard,
      end: true,
    },
  ],
};
