import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuthContext } from '../lib/auth/useAuthContext';
import { roleToDashboard } from '../lib/auth/roleToDashboard';
import SessionReasonBanner from '../components/feedback/SessionReasonBanner';
import LoginForm from '../features/auth/components/LoginForm';

export default function LoginPage() {
  const { isAuthenticated, role } = useAuthContext();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');

  if (isAuthenticated && role) {
    const dashboard = roleToDashboard[role] ?? '/dashboard/receptionist';
    return <Navigate to={dashboard} replace />;
  }

  return (
    <div>
      <SessionReasonBanner reason={reason} />
      <LoginForm />
    </div>
  );
}
