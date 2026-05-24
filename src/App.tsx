import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './lib/auth/authContext';
import { RequireRole } from './lib/rbac';
import { UserRole } from './types/enums';
import DashboardShell from './components/layout/DashboardShell';
import LabRequestForm from './features/lab-request/LabRequestForm';
import PatientRegistrationPage from './features/patient-registration';
import SpecimenReceivingForm from './features/lab-request/SpecimenReceivingForm';
import AppShell from './components/layout/AppShell';
import PatientRegistration from './features/intake/PatientRegistration';
import LoginPage from './routes/auth.routes';
import ReceptionistDashboard from './routes/receptionist.routes';
import SupervisorDashboard from './routes/supervisor.routes';
import PhysicianDashboard from './routes/physician.routes';
import PatientDashboard from './routes/patient.routes';
import AdminDashboard from './routes/admin.routes';
import QueueAssignmentPage from './features/queue-assignment';

const Request = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium max-w-xl">
    Lab Request Encoding Form (Sprint 3)
  </div>
);

const Receive = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium max-w-xl">
    Specimen Receiving Module (Sprint 3)
  </div>
);

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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route
              element={
                <RequireRole roles={[UserRole.RECEPTIONIST]}>
                  <AppShell />
                </RequireRole>
              }
            >
              <Route path="/dashboard/receptionist" element={<ReceptionistDashboard />} />
              <Route path="/dashboard/receptionist/queue" element={<QueueAssignmentPage />} />
            </Route>

            <Route
              element={
                <RequireRole roles={[UserRole.SUPERVISOR]}>
                  <AppShell />
                </RequireRole>
              }
            >
              <Route path="/dashboard/supervisor" element={<SupervisorDashboard />} />
            </Route>

            <Route
              element={
                <RequireRole roles={[UserRole.PHYSICIAN]}>
                  <AppShell />
                </RequireRole>
              }
            >
              <Route path="/dashboard/physician" element={<PhysicianDashboard />} />
            </Route>

            <Route
              element={
                <RequireRole roles={[UserRole.PATIENT]}>
                  <AppShell />
                </RequireRole>
              }
            >
              <Route path="/dashboard/patient" element={<PatientDashboard />} />
            </Route>

            <Route
              element={
                <RequireRole roles={[UserRole.ADMINISTRATOR]}>
                  <AppShell />
                </RequireRole>
              }
            >
              <Route path="/dashboard/administrator" element={<AdminDashboard />} />
            </Route>

            <Route path="/intake" element={<DashboardShell />}>
              <Route path="register" element={<PatientRegistration />} />
              <Route path="request" element={<Request />} />
              <Route path="receive" element={<Receive />} />
              <Route path="queue" element={<QueueAssignmentPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/intake/register" replace />} />
          
          {/* Main Layout Container Wrapper */}
          <Route path="/intake" element={<DashboardShell />}>
            {/* By keeping these relative, React Router accurately pieces together 
                '/intake/register', '/intake/request', etc. seamlessly.
            */}
            <Route path="register" element={<PatientRegistration />} />
            <Route path="request" element={<LabRequestForm />} />
            
            {/* MOUNT THE LIVE SPECIMEN RECEIVING FORM HERE */}
            <Route path="receive" element={<SpecimenReceivingForm />} />
            
            <Route path="queue" element={<QueueAssignmentPage />} />
            <Route path="patients/new" element={<PatientRegistrationPage />} />
          </Route>
          
          {/* Global Fallback Route catches broken URLs and points securely back to Patient Intake */}
          <Route path="*" element={<Navigate to="/intake/register" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
