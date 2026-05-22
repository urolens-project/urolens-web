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
        <div className="fixed top-0 left-0 right-0 z-20 bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-sm text-amber-800">
              You were logged out due to inactivity.
            </p>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-amber-600 hover:text-amber-800 text-sm font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <LoginForm />
    </div>
  );
}
