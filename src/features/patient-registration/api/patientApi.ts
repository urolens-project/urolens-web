import apiClient from '../../../lib/apiClient';
import type { PatientCreateRequest, PatientResponse } from '../types';

export const patientApi = {
  create: (data: PatientCreateRequest): Promise<PatientResponse> =>
    apiClient.post('/patients', data).then((res) => res.data),

  // Backend route is GET /api/v1/patients?q=... (src/api/patients.py), not
  // /intake/patients/search — that path doesn't exist and would 404. Not
  // currently called from any screen, so this was a latent bug rather than
  // an observed break.
  search: (q: string): Promise<PatientResponse[]> =>
    apiClient.get('/patients', { params: { q } }).then((res) => res.data),
};
