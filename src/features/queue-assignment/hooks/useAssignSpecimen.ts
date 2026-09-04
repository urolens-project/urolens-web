import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queueApi } from '../api/queueApi';
import type { ApiError } from '../../../types/domain';
import type { AssignSpecimenRequest } from '../types';

const ERROR_MESSAGES: Record<string, string> = {
  SPECIMEN_NOT_FOUND: 'Specimen not found.',
  MEDTECH_NOT_FOUND: 'Medical Technologist not found or inactive.',
  INVALID_SPECIMEN_STATUS: 'This specimen is not ready for assignment.',
  SPECIMEN_ALREADY_ASSIGNED: 'This specimen has already been assigned.',
};

export function useAssignSpecimen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignSpecimenRequest) => queueApi.assignSpecimen(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['queue', 'workloads'] });
      toast.success('Specimen assigned successfully.');
    },
    onError: (err: ApiError) => {
      const code = err.response?.data?.error?.code;
      const message =
        (code && ERROR_MESSAGES[code]) ?? 'Failed to assign specimen. Please try again.';
      toast.error(message);
    },
  });
}
