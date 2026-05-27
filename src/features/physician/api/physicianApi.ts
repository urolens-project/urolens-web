import apiClient from '../../../lib/apiClient';
import type {
  LabRequestCreatePayload,
  LabRequestCreateResponse,
  PhysicianPatient,
  PhysicianResultDetail,
  PhysicianResultListResponse,
} from '../types';

export async function searchPatients(q: string): Promise<PhysicianPatient[]> {
  const { data } = await apiClient.get<PhysicianPatient[]>('/physician/patients/search', {
    params: { q },
  });
  return data;
}

export async function createLabRequest(
  payload: LabRequestCreatePayload,
): Promise<LabRequestCreateResponse> {
  const { data } = await apiClient.post<LabRequestCreateResponse>(
    '/physician/lab-requests',
    payload,
  );
  return data;
}

export async function fetchMyResults(
  page: number,
  pageSize: number,
): Promise<PhysicianResultListResponse> {
  const { data } = await apiClient.get<PhysicianResultListResponse>('/physician/results', {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function fetchResultDetail(resultId: string): Promise<PhysicianResultDetail> {
  const { data } = await apiClient.get<PhysicianResultDetail>(`/physician/results/${resultId}`);
  return data;
}
