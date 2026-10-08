import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { patientAuthApi } from '../api/patientAuthApi';
import type { PatientLoginRequest } from '../api/patientAuthApi';
import { useAuthContext } from '../../../lib/auth/useAuthContext';
import type { ApiError, PatientLoginResponse } from '../types';

export function usePatientLogin() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  return useMutation<PatientLoginResponse, AxiosError<ApiError>, PatientLoginRequest>({
    mutationFn: patientAuthApi.login,
    onSuccess: (data) => {
      login(data.access_token, data.role);
      navigate('/dashboard/patient/results', { replace: true });
    },
    // error code surfaced to caller via mutation.error, see PatientLoginPage's mutate() onError override
  });
}
