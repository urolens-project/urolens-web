import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthContext } from './auth/useAuthContext';
import type { UserRole } from '../types/enums';

export function RequireRole({
  roles,
  children,
  loginPath = '/login',
}: {
  roles: UserRole[];
  children: ReactNode;
  loginPath?: string;
}) {
  const { isAuthenticated, role } = useAuthContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (!role || !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
