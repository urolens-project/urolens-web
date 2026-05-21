import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardShell from './components/layout/DashboardShell';
import PatientRegistration from './features/intake/components/PatientRegistration';

// Temporary minimalist placeholders for upcoming sprints
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
          {/* Base path redirect forces the app straight into your primary workspace core */}
          <Route path="/" element={<Navigate to="/intake/register" replace />} />
          
          {/* Main Layout Container Wrapper */}
          <Route path="/intake" element={<DashboardShell />}>
            {/* By keeping these relative, React Router accurately pieces together 
               '/intake/register', '/intake/request', etc. seamlessly.
            */}
            <Route path="register" element={<PatientRegistration />} />
            <Route path="request" element={<Request />} />
            <Route path="receive" element={<Receive />} />
            <Route path="queue" element={<Queue />} />
          </Route>
          
          {/* Global Fallback Route catches broken URLs and points securely back to Patient Intake */}
          <Route path="*" element={<Navigate to="/intake/register" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}