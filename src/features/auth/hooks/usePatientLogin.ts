import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { patientAuthApi } from '../api/patientAuthApi';
import { useAuthContext } from '../../../lib/auth/useAuthContext';

export function usePatientLogin() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ patientUid, password }: { patientUid: string; password: string }) =>
      patientAuthApi.login(patientUid, password),
    onSuccess: (data) => {
      login(data.access_token, data.role);
      navigate('/dashboard/patient/results', { replace: true });
    },
  });
}
