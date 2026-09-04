import apiClient from '../../../lib/apiClient';
import type {
  AnnotationResponse,
  ApproveResponse,
  ApprovedTodayListResponse,
  BoundingBox,
  EscalateResponse,
  EscalatedListResponse,
  FullResultDetail,
  OverrideResponse,
  PendingResultListResponse,
  ReturnResponse,
  SupervisorStats,
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

export async function saveAnnotation(
  resultId: string,
  annotationNotes: string,
  spatialAnnotations?: BoundingBox[],
): Promise<AnnotationResponse> {
  const body: Record<string, unknown> = { annotation_notes: annotationNotes };
  if (spatialAnnotations !== undefined) {
    body.spatial_annotations = spatialAnnotations;
  }
  const { data } = await apiClient.patch<AnnotationResponse>(`/results/${resultId}/annotate`, body);
  return data;
}

export async function saveOverride(
  resultId: string,
  parameter: string,
  corrected_value: number,
  rationale: string,
  original_ai_value: number,
): Promise<OverrideResponse> {
  const { data } = await apiClient.post<OverrideResponse>(`/results/${resultId}/override`, {
    parameter_name: parameter,
    corrected_value,
    rationale,
    original_ai_value,
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

export async function fetchSupervisorStats(): Promise<SupervisorStats> {
  const { data } = await apiClient.get<SupervisorStats>('/results/supervisor/stats');
  return data;
}

export async function fetchApprovedToday(page: number, pageSize: number): Promise<ApprovedTodayListResponse> {
  const { data } = await apiClient.get<ApprovedTodayListResponse>('/results/approved-today', {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function fetchEscalated(page: number, pageSize: number): Promise<EscalatedListResponse> {
  const { data } = await apiClient.get<EscalatedListResponse>('/results/escalated', {
    params: { page, page_size: pageSize },
  });
  return data;
}
