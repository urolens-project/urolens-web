import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queueApi } from '../api/queueApi';

export function useAssignSpecimen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: queueApi.assign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue', 'workloads'] });
      queryClient.invalidateQueries({ queryKey: ['specimens', 'labeled'] });
    },
    onError: () => {
      // error handling is done in the component using mutation.error
    },
  });
}
