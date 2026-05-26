import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './lib/auth/authContext';
import { RequireRole } from './lib/rbac';
import { UserRole } from './types/enums';

import AppShell from './components/layout/AppShell';
import DashboardShell from './components/layout/DashboardShell';
import SupervisorShell from './components/layout/SupervisorShell';

import PatientRegistrationPage from './features/patient-registration';
import LabRequestForm from './features/lab-request';
import SpecimenReceivingForm from './features/specimen-receiving';
import SampleLabelingScreen from './features/sample-labeling';
import QueueAssignmentPage from './features/queue-assignment';

import { PendingApprovalQueueView, FullResultDetailView } from './features/result-review';

import LoginPage from './routes/auth.routes';
import MedTechDashboard from './routes/medtech.routes';
import SupervisorDashboard from './routes/supervisor.routes';
import PhysicianDashboard from './routes/physician.routes';
import PatientDashboard from './routes/patient.routes';
import AdminDashboard from './routes/admin.routes';

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
        <BrowserRouter>
          <Routes>
            {/* Global Unauthenticated Public Core Routing Nodes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* 1. RECEPTIONIST ACTIVE SECURE WORKSPACE BOUNDARIES */}
            <Route
              element={
                <RequireRole roles={[UserRole.RECEPTIONIST]}>
                  <DashboardShell />
                </RequireRole>
              }
            >
              <Route path="/dashboard/receptionist" element={<Navigate to="/intake/register" replace />} />
              <Route path="/dashboard/receptionist/queue" element={<QueueAssignmentPage />} />
            </Route>

            {/* 2. MEDICAL TECHNOLOGIST PROTECTED BOUNDARIES */}
            <Route
              element={
                <RequireRole roles={[UserRole.MEDTECH]}>
                  <AppShell />
                </RequireRole>
              }
            >
              <Route path="/dashboard/medtech" element={<MedTechDashboard />} />
            </Route>

            {/* 2. LABORATORY WORKFLOW SUPERVISOR PROTECTED BOUNDARIES */}
            <Route
              element={
                <RequireRole roles={[UserRole.SUPERVISOR]}>
                  <SupervisorShell />
                </RequireRole>
              }
            >
              <Route path="/dashboard/supervisor" element={<SupervisorDashboard />} />
              <Route path="/supervisor/results" element={<PendingApprovalQueueView />} />
              <Route path="/supervisor/results/:resultId" element={<FullResultDetailView />} />
            </Route>

            {/* 5. CLINICAL PRACTITIONER / PHYSICIAN SEGMENTED BOUNDARIES */}
            <Route
              element={
                <RequireRole roles={[UserRole.PHYSICIAN]}>
                  <AppShell />
                </RequireRole>
              }
            >
              <Route path="/dashboard/physician" element={<PhysicianDashboard />} />
            </Route>

            {/* 6. HEALTHCARE RECIPIENT / PATIENT ENVELOPE BOUNDARIES */}
            <Route
              element={
                <RequireRole roles={[UserRole.PATIENT]}>
                  <AppShell />
                </RequireRole>
              }
            >
              <Route path="/dashboard/patient" element={<PatientDashboard />} />
            </Route>

            {/* 7. SYSTEM SECURITY ROOT / ADMINISTRATOR BOUNDARIES */}
            <Route
              element={
                <RequireRole roles={[UserRole.ADMINISTRATOR]}>
                  <AppShell />
                </RequireRole>
              }
            >
              <Route path="/dashboard/administrator" element={<AdminDashboard />} />
            </Route>

            {/* 8. COMPREHENSIVE PATIENT INTAKE STREAM CORE ROUTER WRAPPER */}
            <Route
              element={
                <RequireRole roles={[UserRole.RECEPTIONIST, UserRole.SUPERVISOR, UserRole.ADMINISTRATOR]}>
                  <DashboardShell />
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
