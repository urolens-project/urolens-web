import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardShell from './components/layout/DashboardShell';
import PatientRegistration from './features/intake/PatientRegistration';
import LabRequestForm from './features/lab-request/LabRequestForm';
import SpecimenReceivingForm from './features/lab-request/SpecimenReceivingForm';

const Queue = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium max-w-xl">
    Labeling & Workload Queue Setup (Sprint 4)
  </div>
);

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
            
            <Route path="queue" element={<Queue />} />
          </Route>
          
          {/* Global Fallback Route catches broken URLs and points securely back to Patient Intake */}
          <Route path="*" element={<Navigate to="/intake/register" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}