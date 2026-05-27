import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveResult,
  escalateResult,
  fetchApprovedToday,
  fetchEscalated,
  fetchFullResult,
  fetchPendingResults,
  returnResult,
  saveAnnotation,
  saveOverride,
} from '../api/resultReviewApi';
import type { BoundingBox } from '../types';

export const resultReviewKeys = {
  pending: (page: number, pageSize: number) => ['results', 'pending', page, pageSize] as const,
  detail: (resultId: string) => ['results', 'detail', resultId] as const,
};

export const resultReviewKeys2 = {
  approvedToday: (page: number, pageSize: number) => ['results', 'approved-today', page, pageSize] as const,
  escalated: (page: number, pageSize: number) => ['results', 'escalated', page, pageSize] as const,
};

export function usePendingResults(page: number, pageSize: number) {
  return useQuery({
    queryKey: resultReviewKeys.pending(page, pageSize),
    queryFn: () => fetchPendingResults(page, pageSize),
    staleTime: 30_000,
  });
}

export function useApprovedToday(page: number, pageSize: number) {
  return useQuery({
    queryKey: resultReviewKeys2.approvedToday(page, pageSize),
    queryFn: () => fetchApprovedToday(page, pageSize),
    staleTime: 30_000,
  });
}

export function useEscalated(page: number, pageSize: number) {
  return useQuery({
    queryKey: resultReviewKeys2.escalated(page, pageSize),
    queryFn: () => fetchEscalated(page, pageSize),
    staleTime: 30_000,
  });
}

export function useFullResult(resultId: string) {
  return useQuery({
    queryKey: resultReviewKeys.detail(resultId),
    queryFn: () => fetchFullResult(resultId),
    enabled: !!resultId,
    staleTime: 60_000,
  });
}

export function useSaveAnnotation(resultId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ notes, boxes }: { notes: string; boxes?: BoundingBox[] }) =>
      saveAnnotation(resultId, notes, boxes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resultReviewKeys.detail(resultId) });
    },
  });
}

export function useSaveOverride(resultId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ parameter, corrected_value, rationale, original_ai_value }: { parameter: string; corrected_value: number; rationale: string; original_ai_value: number }) =>
      saveOverride(resultId, parameter, corrected_value, rationale, original_ai_value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resultReviewKeys.detail(resultId) });
    },
  });
}

export function useApproveResult(resultId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notes?: string) => approveResult(resultId, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resultReviewKeys.detail(resultId) });
      qc.invalidateQueries({ queryKey: ['results', 'pending'] });
    },
  });
}

export function useReturnResult(resultId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => returnResult(resultId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resultReviewKeys.detail(resultId) });
      qc.invalidateQueries({ queryKey: ['results', 'pending'] });
    },
  });
}

export function useEscalateResult(resultId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ escalationPath, escalationNote }: { escalationPath: string; escalationNote?: string }) =>
      escalateResult(resultId, escalationPath, escalationNote),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resultReviewKeys.detail(resultId) });
      qc.invalidateQueries({ queryKey: ['results', 'pending'] });
    },
  });
}
