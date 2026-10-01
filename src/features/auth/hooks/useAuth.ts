import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthContext } from '../../../lib/auth/useAuthContext';
import { roleToDashboard } from '../../../lib/auth/roleToDashboard';
import type { UserRole } from '../../../types/enums';
import type { AxiosError } from 'axios';
import type { ApiError } from '../types';

export function useLogin() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Backend sends the role uppercase (e.g. "PHYSICIAN") — authContext
      // normalizes it for its own state, but this lookup needs the same
      // normalization, or it never matches and every login falls through
      // to the fallback dashboard regardless of actual role.
      const normalizedRole = data.role.toLowerCase() as UserRole;
      login(data.access_token, data.role);
      const dashboard = roleToDashboard[normalizedRole] ?? '/dashboard/receptionist';
      navigate(dashboard, { replace: true });
    },
    onError: (error: AxiosError<ApiError>) => {
      const code = error.response?.data?.error?.code;
      return code;
    },
  });
}
