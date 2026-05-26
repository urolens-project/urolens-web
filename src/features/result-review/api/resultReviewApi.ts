import apiClient from '../../../lib/apiClient';
import type {
  AnnotationResponse,
  ApproveResponse,
  EscalateResponse,
  FullResultDetail,
  PendingResultListResponse,
  ReturnResponse,
} from '../types';

export async function fetchPendingResults(page: number, pageSize: number): Promise<PendingResultListResponse> {
  const { data } = await apiClient.get<PendingResultListResponse>('/results/pending', {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function fetchFullResult(resultId: string): Promise<FullResultDetail> {
  const { data } = await apiClient.get<FullResultDetail>(`/results/${resultId}`);
  return data;
}

export async function saveAnnotation(resultId: string, annotationNotes: string): Promise<AnnotationResponse> {
  const { data } = await apiClient.patch<AnnotationResponse>(`/results/${resultId}/annotate`, {
    annotation_notes: annotationNotes,
  });
  return data;
}

export async function approveResult(resultId: string, notes?: string): Promise<ApproveResponse> {
  const { data } = await apiClient.post<ApproveResponse>(`/results/${resultId}/approve`, { notes: notes ?? null });
  return data;
}

export async function returnResult(resultId: string, reason: string): Promise<ReturnResponse> {
  const { data } = await apiClient.post<ReturnResponse>(`/results/${resultId}/return`, { reason });
  return data;
}

export async function escalateResult(
  resultId: string,
  escalationPath: string,
  escalationNote?: string,
): Promise<EscalateResponse> {
  const { data } = await apiClient.post<EscalateResponse>(`/results/${resultId}/escalate`, {
    escalation_path: escalationPath,
    escalation_note: escalationNote ?? null,
  });
  return data;
}
