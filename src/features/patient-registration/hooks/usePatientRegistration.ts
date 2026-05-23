import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '../api/patientApi';

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patientApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
