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

export async function confirmResult(resultId: string): Promise<ConfirmResultResponse> {
  const { data } = await apiClient.post<ConfirmResultResponse>(`/results/${resultId}/confirm`);
  return data;
}
