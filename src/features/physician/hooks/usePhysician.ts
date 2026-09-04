import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createLabRequest,
  fetchMyResults,
  fetchResultDetail,
  searchPatients,
} from '../api/physicianApi';
import type { LabRequestCreatePayload, LabRequestCreateResponse } from '../types';
import type { ApiError } from '../../../types/domain';

export const physicianKeys = {
  patientSearch: (q: string) => ['physician', 'patients', q] as const,
  results: (page: number, pageSize: number) => ['physician', 'results', page, pageSize] as const,
  resultDetail: (resultId: string) => ['physician', 'results', 'detail', resultId] as const,
};

export function usePatientSearch(q: string) {
  return useQuery({
    queryKey: physicianKeys.patientSearch(q),
    queryFn: () => searchPatients(q),
    enabled: q.trim().length >= 2,
    staleTime: 30_000,
  });
}

export function useMyResults(page: number, pageSize: number) {
  return useQuery({
    queryKey: physicianKeys.results(page, pageSize),
    queryFn: () => fetchMyResults(page, pageSize),
    staleTime: 30_000,
  });
}

export function useResultDetail(resultId: string) {
  return useQuery({
    queryKey: physicianKeys.resultDetail(resultId),
    queryFn: () => fetchResultDetail(resultId),
    enabled: !!resultId,
    staleTime: 60_000,
  });
}

export function useCreateLabRequest() {
  return useMutation<LabRequestCreateResponse, ApiError, LabRequestCreatePayload>({
    mutationFn: (payload: LabRequestCreatePayload) => createLabRequest(payload),
  });
}
