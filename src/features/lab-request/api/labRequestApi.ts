import apiClient from '../../../lib/apiClient';
import type { PatientSearchResult, Physician } from '../types';
import type { LabRequestPayload, LabRequestResponse } from '../../../types/types';

export const labRequestApi = {
  // Backend route is GET /api/v1/patients?q=... (src/api/patients.py), not
  // /intake/patients/search — that path doesn't exist and 404s. This is the
  // live search-as-you-type used by LabRequestForm, so this 404'd on every
  // keystroke — a receptionist could never find a patient to attach a lab
  // request to.
  searchPatients: (q: string) =>
    apiClient.get<PatientSearchResult[]>('/patients', { params: { q } }).then((r) => r.data),

  getPhysicians: () => apiClient.get<Physician[]>('/lab-requests/physicians').then((r) => r.data),

  createLabRequest: (payload: LabRequestPayload) =>
    apiClient.post<LabRequestResponse>('/lab-requests', payload).then((r) => r.data),
};
