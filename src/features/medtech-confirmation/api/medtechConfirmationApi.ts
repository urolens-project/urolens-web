import apiClient from '../../../lib/apiClient';
import type { ConfirmResultResponse, MedtechPendingListResponse } from '../types';

export async function fetchMedtechPending(
  page: number,
  pageSize: number,
): Promise<MedtechPendingListResponse> {
  const { data } = await apiClient.get<MedtechPendingListResponse>('/results/medtech/pending', {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function confirmResult(
  resultId: string,
  interpretationNotes?: string,
): Promise<ConfirmResultResponse> {
  const body = interpretationNotes?.trim()
    ? { interpretation_notes: interpretationNotes.trim() }
    : undefined;
  const { data } = await apiClient.post<ConfirmResultResponse>(
    `/results/${resultId}/confirm`,
    body,
  );
  return data;
}
