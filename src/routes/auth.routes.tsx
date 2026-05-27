import { useSearchParams, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthContext } from '../lib/auth/useAuthContext';
import LoginForm from '../features/auth/components/LoginForm';

const roleToDashboard: Record<string, string> = {
  receptionist: '/dashboard/receptionist',
  supervisor: '/dashboard/supervisor',
  physician: '/dashboard/physician',
  patient: '/dashboard/patient',
  administrator: '/dashboard/administrator',
};

export default function LoginPage() {
  const { isAuthenticated, role } = useAuthContext();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  if (isAuthenticated && role) {
    const dashboard = roleToDashboard[role] ?? '/dashboard/receptionist';
    return <Navigate to={dashboard} replace />;
  }

  return (
    <div>
      {reason === 'timeout' && !bannerDismissed && (
        <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-4 border-b border-amber-200 bg-amber-50/95 backdrop-blur-sm px-6 py-2.5">
          <p className="text-xs font-medium text-amber-800">
            You were signed out due to inactivity. Please sign in again to continue.
          </p>
          <button
            onClick={() => setBannerDismissed(true)}
            className="shrink-0 text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
      <LoginForm />
    </div>
  );
}
