import apiClient from '../../../lib/apiClient';
import type { PatientSearchResult, Physician } from '../types';
import type { LabRequestPayload, LabRequestResponse } from '../../../types/types';

export const labRequestApi = {
  searchPatients: (q: string) =>
    apiClient.get<PatientSearchResult[]>('/intake/patients/search', { params: { q } }).then((r) => r.data),

  getPhysicians: () =>
    apiClient.get<Physician[]>('/lab-requests/physicians').then((r) => r.data),

  createLabRequest: (payload: LabRequestPayload) =>
    apiClient.post<LabRequestResponse>('/lab-requests', payload).then((r) => r.data),
};
