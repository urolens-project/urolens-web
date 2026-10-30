// TanStack Query hooks for the multi-field verification workspace.
// Same pattern as result-review/hooks/useResultReview.ts and
// medtech-confirmation/hooks/useMedtechConfirmation.ts. Every mutation
// here will 404/501 against the real backend until a lane implements
// its stub (see api/fieldVerificationApi.ts) — the hooks are correct
// now so wiring up later is a backend change only.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  discardField,
  fetchFieldDetail,
  fetchResultFields,
  fetchVerificationQueue,
  fetchVerificationSummary,
  overrideFieldParameter,
  reopenCapture,
  revertFieldOverride,
  saveFieldAnnotations,
  verifyField,
} from '../api/fieldVerificationApi';
import type {
  DiscardFieldRequest,
  FieldActionResponse,
  FieldOverrideRequest,
  ResultStatusResponse,
  RevertOverrideRequest,
  SaveFieldAnnotationsRequest,
} from '../types';
import type { ApiError } from '../../../types/domain';

export const fieldVerificationKeys = {
  queue: (page: number, pageSize: number) =>
    ['field-verification', 'queue', page, pageSize] as const,
  fields: (resultId: string) => ['field-verification', 'fields', resultId] as const,
  field: (fieldId: string) => ['field-verification', 'field', fieldId] as const,
  summary: (resultId: string) => ['field-verification', 'summary', resultId] as const,
};

export function useVerificationQueue(page: number, pageSize: number) {
  return useQuery({
    queryKey: fieldVerificationKeys.queue(page, pageSize),
    queryFn: () => fetchVerificationQueue(page, pageSize),
    staleTime: 30_000,
  });
}

export function useResultFields(resultId: string) {
  return useQuery({
    queryKey: fieldVerificationKeys.fields(resultId),
    queryFn: () => fetchResultFields(resultId),
    enabled: !!resultId,
    staleTime: 30_000,
  });
}

export function useFieldDetail(fieldId: string) {
  return useQuery({
    queryKey: fieldVerificationKeys.field(fieldId),
    queryFn: () => fetchFieldDetail(fieldId),
    enabled: !!fieldId,
    // Opening a field is a meaningful action server-side (lets the
    // opener later verify it) — avoid an unintended re-open from a
    // background refetch.
    staleTime: 60_000,
  });
}

export function useVerificationSummary(resultId: string) {
  return useQuery({
    queryKey: fieldVerificationKeys.summary(resultId),
    queryFn: () => fetchVerificationSummary(resultId),
    enabled: !!resultId,
    staleTime: 10_000,
  });
}

// Shared invalidation for any mutation that changes one field: the
// field's own detail, the result's field list (counts/flags change),
// and the verification summary (averages shift).
function invalidateFieldAndResult(
  qc: ReturnType<typeof useQueryClient>,
  resultId: string,
  fieldId: string,
) {
  qc.invalidateQueries({ queryKey: fieldVerificationKeys.field(fieldId) });
  qc.invalidateQueries({ queryKey: fieldVerificationKeys.fields(resultId) });
  qc.invalidateQueries({ queryKey: fieldVerificationKeys.summary(resultId) });
}

export function useSaveFieldAnnotations(resultId: string, fieldId: string) {
  const qc = useQueryClient();
  return useMutation<FieldActionResponse, ApiError, SaveFieldAnnotationsRequest>({
    mutationFn: (request) => saveFieldAnnotations(fieldId, request),
    onSuccess: () => invalidateFieldAndResult(qc, resultId, fieldId),
  });
}

export function useOverrideFieldParameter(resultId: string, fieldId: string) {
  const qc = useQueryClient();
  return useMutation<FieldActionResponse, ApiError, FieldOverrideRequest>({
    mutationFn: (request) => overrideFieldParameter(fieldId, request),
    onSuccess: () => invalidateFieldAndResult(qc, resultId, fieldId),
  });
}

export function useRevertFieldOverride(resultId: string, fieldId: string) {
  const qc = useQueryClient();
  return useMutation<FieldActionResponse, ApiError, RevertOverrideRequest>({
    mutationFn: (request) => revertFieldOverride(fieldId, request),
    onSuccess: () => invalidateFieldAndResult(qc, resultId, fieldId),
  });
}

export function useVerifyField(resultId: string, fieldId: string) {
  const qc = useQueryClient();
  return useMutation<FieldActionResponse, ApiError, void>({
    mutationFn: () => verifyField(fieldId),
    onSuccess: () => invalidateFieldAndResult(qc, resultId, fieldId),
  });
}

export function useDiscardField(resultId: string, fieldId: string) {
  const qc = useQueryClient();
  return useMutation<FieldActionResponse, ApiError, DiscardFieldRequest>({
    mutationFn: (request) => discardField(fieldId, request),
    onSuccess: () => invalidateFieldAndResult(qc, resultId, fieldId),
  });
}

export function useReopenCapture(resultId: string) {
  const qc = useQueryClient();
  return useMutation<ResultStatusResponse, ApiError, void>({
    mutationFn: () => reopenCapture(resultId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fieldVerificationKeys.fields(resultId) });
      qc.invalidateQueries({ queryKey: fieldVerificationKeys.summary(resultId) });
      qc.invalidateQueries({ queryKey: ['medtech', 'pending'] });
    },
  });
}
