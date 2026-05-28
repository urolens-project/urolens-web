import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { resultReleasingApi } from '../api/resultReleasingApi';
import type { ReleaseMethod } from '../types';

export function useApprovedResults(limit = 20, cursor?: string) {
  return useQuery({
    queryKey: ['results', 'approved', limit, cursor],
    queryFn: () => resultReleasingApi.getApproved(limit, cursor),
    refetchInterval: 30_000,
  });
}

export function useReleaseResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ resultId, releaseMethod }: { resultId: string; releaseMethod: ReleaseMethod }) =>
      resultReleasingApi.release(resultId, releaseMethod),
    onSuccess: (_, { releaseMethod }) => {
      qc.invalidateQueries({ queryKey: ['results', 'approved'] });
      toast.success(
        releaseMethod === 'DIGITAL'
          ? 'Result released digitally. Patient and physician notified.'
          : 'Result marked as released via physical printout.',
      );
    },
    onError: (err: any) => {
      const code = err?.response?.data?.error?.code;
      const messages: Record<string, string> = {
        NOT_FOUND: 'Result not found.',
        RESULT_NOT_APPROVED: 'Result is not in APPROVED status.',
        ALREADY_RELEASED: 'This result has already been released.',
      };
      toast.error(messages[code] ?? 'Failed to release result. Please try again.');
    },
  });
}