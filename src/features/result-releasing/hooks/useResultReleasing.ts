import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { resultReleasingApi } from '../api/resultReleasingApi';
import type { ApprovedResultsResponse, ReleaseMethod } from '../types';
import type { ApiError } from '../../../types/domain';

const APPROVED_RESULTS_KEY = ['results', 'approved'];

// Infinite query owns page accumulation, so "Load more" adds to the list
// instead of replacing it, without hand-rolled useEffect+useState merging.
export function useApprovedResults() {
  return useInfiniteQuery({
    queryKey: APPROVED_RESULTS_KEY,
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      resultReleasingApi.getApproved(20, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: ApprovedResultsResponse) =>
      lastPage.pagination.has_more ? (lastPage.pagination.next_cursor ?? undefined) : undefined,
    refetchInterval: 30_000,
  });
}

export function useReleaseResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ resultId, releaseMethod }: { resultId: string; releaseMethod: ReleaseMethod }) =>
      resultReleasingApi.release(resultId, releaseMethod),
    onSuccess: (_, { resultId, releaseMethod }) => {
      // Removes the released result from the cached pages immediately,
      // rather than waiting on the next 30s poll to notice it's gone.
      qc.setQueryData<InfiniteData<ApprovedResultsResponse>>(APPROVED_RESULTS_KEY, (old) =>
        old
          ? {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.filter((item) => item.result_id !== resultId),
              })),
            }
          : old,
      );
      toast.success(
        releaseMethod === 'DIGITAL'
          ? 'Result released digitally. Patient and physician notified.'
          : 'Result marked as released via physical printout.',
      );
    },
    onError: (err: ApiError) => {
      const code = err.response?.data?.error?.code;
      const messages: Record<string, string> = {
        RESULT_NOT_FOUND: 'Result not found.',
        RESULT_NOT_APPROVED: 'Result is not in APPROVED status.',
        ALREADY_RELEASED: 'This result has already been released.',
      };
      toast.error((code && messages[code]) ?? 'Failed to release result. Please try again.');
    },
  });
}
