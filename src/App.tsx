import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
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
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './lib/auth/authContext';
import { RequireRole } from './lib/rbac';
import { UserRole } from './types/enums';

import RoleShell, { type RoleShellNavItem } from './components/layout/RoleShell';

import PatientRegistrationPage from './features/patient-registration';
import LabRequestForm from './features/lab-request';
import SpecimenReceivingForm from './features/specimen-receiving';
import SampleLabelingScreen from './features/sample-labeling';
import QueueAssignmentPage from './features/queue-assignment';
import PatientPortalPage, { PatientResultDetailPage } from './features/patient-portal';
import { ApprovedResultsQueue } from './features/result-releasing/components/ApprovedResultsQueue';

import {
  PendingApprovalQueueView,
  FullResultDetailView,
  ApprovedTodayQueueView,
  EscalatedQueueView,
} from './features/result-review';
import { NewLabRequestForm, MyResultsList, PhysicianResultDetailView } from './features/physician';
import {
  PendingConfirmationQueueView,
  ResultConfirmationDetailView,
} from './features/medtech-confirmation';

import LoginPage from './routes/auth.routes';
import PatientLoginPage from './features/auth/components/PatientLoginPage';
import SupervisorDashboard from './routes/supervisor.routes';
import PhysicianDashboard from './routes/physician.routes';
import PatientDashboard from './routes/patient.routes';
import AdminDashboard from './routes/admin.routes';

const receptionistNavItems: RoleShellNavItem[] = [
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
];

const medtechNavItems: RoleShellNavItem[] = [
  {
    to: '/medtech/results',
    label: 'Pending Confirmations',
    description: 'Results awaiting your confirmation',
    icon: ClipboardCheck,
    end: true,
  },
];

const supervisorNavItems: RoleShellNavItem[] = [
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
];

const physicianNavItems: RoleShellNavItem[] = [
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
];

const patientNavItems: RoleShellNavItem[] = [
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
];

const administratorNavItems: RoleShellNavItem[] = [
  {
    to: '/dashboard/administrator',
    label: 'Dashboard',
    description: 'System administration overview',
    icon: LayoutDashboard,
    end: true,
  },
];

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
      <h1 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h1>
      <p className="text-slate-500 text-sm">You do not have permission to access this page.</p>
    </div>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            {/* Global Unauthenticated Public Core Routing Nodes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/patient/login" element={<PatientLoginPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* 1. RECEPTIONIST ACTIVE SECURE WORKSPACE BOUNDARIES */}
            <Route
              element={
                <RequireRole roles={[UserRole.RECEPTIONIST]}>
                  <RoleShell
                    navItems={receptionistNavItems}
                    navSectionLabel="Main Operations"
                    workspaceLabel="Intake Workspace"
                    title="Reception Management Node"
                  />
                </RequireRole>
              }
            >
              <Route
                path="/dashboard/receptionist"
                element={<Navigate to="/intake/register" replace />}
              />
              <Route path="/dashboard/receptionist/queue" element={<QueueAssignmentPage />} />
              <Route path="/receptionist/results/approved" element={<ApprovedResultsQueue />} />
            </Route>

            {/* 2. MEDICAL TECHNOLOGIST PROTECTED BOUNDARIES */}
            <Route
              element={
                <RequireRole roles={[UserRole.MEDTECH]}>
                  <RoleShell
                    navItems={medtechNavItems}
                    navSectionLabel="MedTech Workspace"
                    workspaceLabel="Processing Workspace"
                    title="Specimen Processing Console"
                  />
                </RequireRole>
              }
            >
              <Route
                path="/dashboard/medtech"
                element={<Navigate to="/medtech/results" replace />}
              />
              <Route path="/medtech/results" element={<PendingConfirmationQueueView />} />
              <Route path="/medtech/results/:resultId" element={<ResultConfirmationDetailView />} />
            </Route>

            {/* 2. LABORATORY WORKFLOW SUPERVISOR PROTECTED BOUNDARIES */}
            <Route
              element={
                <RequireRole roles={[UserRole.SUPERVISOR]}>
                  <RoleShell
                    navItems={supervisorNavItems}
                    navSectionLabel="Supervisor Workspace"
                    workspaceLabel="Supervisor Workspace"
                    title="Laboratory Review Console"
                  />
                </RequireRole>
              }
            >
              <Route path="/dashboard/supervisor" element={<SupervisorDashboard />} />
              <Route path="/supervisor/results" element={<PendingApprovalQueueView />} />
              <Route path="/supervisor/results/approved" element={<ApprovedTodayQueueView />} />
              <Route path="/supervisor/results/escalated" element={<EscalatedQueueView />} />
              <Route path="/supervisor/results/:resultId" element={<FullResultDetailView />} />
            </Route>

            {/* 5. CLINICAL PRACTITIONER / PHYSICIAN SEGMENTED BOUNDARIES */}
            <Route
              element={
                <RequireRole roles={[UserRole.PHYSICIAN]}>
                  <RoleShell
                    navItems={physicianNavItems}
                    navSectionLabel="Physician Workspace"
                    workspaceLabel="Physician Workspace"
                    title="Clinical Request Portal"
                  />
                </RequireRole>
              }
            >
              <Route path="/dashboard/physician" element={<PhysicianDashboard />} />
              <Route path="/physician/lab-request/new" element={<NewLabRequestForm />} />
              <Route path="/physician/results" element={<MyResultsList />} />
              <Route path="/physician/results/:resultId" element={<PhysicianResultDetailView />} />
            </Route>

            {/* 6. HEALTHCARE RECIPIENT / PATIENT ENVELOPE BOUNDARIES */}
            <Route
              element={
                <RequireRole roles={[UserRole.PATIENT]} loginPath="/patient/login">
                  <RoleShell
                    navItems={patientNavItems}
                    navSectionLabel="Patient Workspace"
                    workspaceLabel="Patient Workspace"
                    title="My Results Portal"
                  />
                </RequireRole>
              }
            >
              <Route path="/dashboard/patient" element={<PatientDashboard />} />
              <Route path="/dashboard/patient/results" element={<PatientPortalPage />} />
              <Route
                path="/dashboard/patient/results/:resultId"
                element={<PatientResultDetailPage />}
              />
            </Route>

            {/* 7. SYSTEM SECURITY ROOT / ADMINISTRATOR BOUNDARIES */}
            <Route
              element={
                <RequireRole roles={[UserRole.ADMINISTRATOR]}>
                  <RoleShell
                    navItems={administratorNavItems}
                    navSectionLabel="Admin Workspace"
                    workspaceLabel="Admin Workspace"
                    title="System Administration"
                  />
                </RequireRole>
              }
            >
              <Route path="/dashboard/administrator" element={<AdminDashboard />} />
            </Route>

            {/* 8. COMPREHENSIVE PATIENT INTAKE STREAM CORE ROUTER WRAPPER */}
            <Route
              element={
                <RequireRole roles={[UserRole.RECEPTIONIST]}>
                  <RoleShell
                    navItems={receptionistNavItems}
                    navSectionLabel="Main Operations"
                    workspaceLabel="Intake Workspace"
                    title="Reception Management Node"
                  />
                </RequireRole>
              }
              path="/intake"
            >
              <Route path="register" element={<PatientRegistrationPage />} />
              <Route path="request" element={<LabRequestForm />} />
              <Route path="receive" element={<SpecimenReceivingForm />} />
              <Route path="label" element={<SampleLabelingScreen />} />
              <Route path="queue" element={<QueueAssignmentPage />} />
            </Route>

            {/* Universal Root Fallback Redirection Sequence Safeguards */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
