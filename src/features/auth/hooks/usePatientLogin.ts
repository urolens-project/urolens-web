import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { patientAuthApi } from '../api/patientAuthApi';
import { useAuthContext } from '../../../lib/auth/useAuthContext';
import type { ApiError } from '../types';

export function usePatientLogin() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: patientAuthApi.login,
    onSuccess: (data) => {
      login(data.access_token, data.role);
      navigate('/dashboard/patient/results', { replace: true });
    },
    onError: (_error: AxiosError<ApiError>) => {
      // error code surfaced to caller via mutation.error
    },
  });
}
