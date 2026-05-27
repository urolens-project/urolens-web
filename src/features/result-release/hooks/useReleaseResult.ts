import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { releaseApi } from '../api/releaseApi';
import { releaseKeys } from './useApprovedResults';
import type { ReleaseMethod } from '../types';

export function useReleaseResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resultId, releaseMethod }: { resultId: string; releaseMethod: ReleaseMethod }) =>
      releaseApi.releaseResult(resultId, releaseMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.approved() });
      toast.success('Result released successfully');
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast.error(message);
    },
  });
}
