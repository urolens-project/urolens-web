import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { confirmResult, fetchMedtechPending } from '../api/medtechConfirmationApi';
import { resultReviewKeys } from '../../result-review/hooks/useResultReview';

export const medtechConfirmationKeys = {
  pending: (page: number, pageSize: number) => ['medtech', 'pending', page, pageSize] as const,
};

export function useMedtechPending(page: number, pageSize: number) {
  return useQuery({
    queryKey: medtechConfirmationKeys.pending(page, pageSize),
    queryFn: () => fetchMedtechPending(page, pageSize),
    staleTime: 30_000,
  });
}

export function useConfirmResult(resultId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => confirmResult(resultId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resultReviewKeys.detail(resultId) });
      qc.invalidateQueries({ queryKey: ['medtech', 'pending'] });
    },
  });
}
