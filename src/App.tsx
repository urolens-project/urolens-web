import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './lib/auth/authContext';
import { RequireRole } from './lib/rbac';
import { UserRole } from './types/enums';

import AppShell from './components/layout/AppShell';
import DashboardShell from './components/layout/DashboardShell';

import PatientRegistration from './features/intake/PatientRegistration';
import LabRequestForm from './features/lab-request/LabRequestForm';
import PatientRegistrationPage from './features/patient-registration';
import SpecimenReceivingForm from './features/lab-request/SpecimenReceivingForm';
import SampleLabelingScreen from './features/lab-request/SampleLabelingScreen';

import LoginPage from './routes/auth.routes';
import ReceptionistDashboard from './routes/receptionist.routes';
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
            {/* Swapped layout wrapper here to match your custom design system shell framework */}
            <Route
              element={
                <RequireRole roles={[UserRole.RECEPTIONIST]}>
                  <DashboardShell />
                </RequireRole>
              }
            >
              {/* Intercepts background hook redirections and points cleanly to your active workspace layout forms */}
              <Route path="/dashboard/receptionist" element={<Navigate to="/intake/register" replace />} />
            </Route>

            {/* 2. LABORATORY WORKFLOW SUPERVISOR PROTECTED BOUNDARIES */}
            <Route
              element={
                <RequireRole roles={[UserRole.SUPERVISOR]}>
                  <AppShell />
                </RequireRole>
              }
            >
              <Route path="/dashboard/supervisor" element={<SupervisorDashboard />} />
            </Route>

            {/* 3. CLINICAL PRACTITIONER / PHYSICIAN SEGMENTED BOUNDARIES */}
            <Route
              element={
                <RequireRole roles={[UserRole.PHYSICIAN]}>
                  <AppShell />
                </RequireRole>
              }
            >
              <Route path="/dashboard/physician" element={<PhysicianDashboard />} />
            </Route>

            {/* 4. HEALTHCARE RECIPIENT / PATIENT ENVELOPE BOUNDARIES */}
            <Route
              element={
                <RequireRole roles={[UserRole.PATIENT]}>
                  <AppShell />
                </RequireRole>
              }
            >
              <Route path="/dashboard/patient" element={<PatientDashboard />} />
            </Route>

            {/* 5. SYSTEM SECURITY ROOT / ADMINISTRATOR BOUNDARIES */}
            <Route
              element={
                <RequireRole roles={[UserRole.ADMINISTRATOR]}>
                  <AppShell />
                </RequireRole>
              }
            >
              <Route path="/dashboard/administrator" element={<AdminDashboard />} />
            </Route>

            {/* 6. COMPREHENSIVE PATIENT INTAKE STREAM CORE ROUTER WRAPPER */}
            <Route
              element={
                <RequireRole roles={[UserRole.RECEPTIONIST, UserRole.SUPERVISOR, UserRole.ADMINISTRATOR]}>
                  <DashboardShell />
                </RequireRole>
              }
              path="/intake"
            >
              <Route path="register" element={<PatientRegistration />} />
              <Route path="request" element={<LabRequestForm />} />
              <Route path="receive" element={<SpecimenReceivingForm />} />
              <Route path="queue" element={<SampleLabelingScreen />} />
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