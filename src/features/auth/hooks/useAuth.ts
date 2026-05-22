import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthContext } from '../../../lib/auth/useAuthContext';
import type { AxiosError } from 'axios';
import type { ApiError } from '../types';

const roleToDashboard: Record<string, string> = {
  receptionist: '/dashboard/receptionist',
  supervisor: '/dashboard/supervisor',
  physician: '/dashboard/physician',
  patient: '/dashboard/patient',
  administrator: '/dashboard/administrator',
};

export function useLogin() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.access_token, data.role);
      const dashboard = roleToDashboard[data.role] ?? '/dashboard/receptionist';
      navigate(dashboard, { replace: true });
    },
    onError: (error: AxiosError<ApiError>) => {
      const code = error.response?.data?.error?.code;
      return code;
    },
  });
}
