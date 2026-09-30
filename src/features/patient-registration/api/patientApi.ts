import apiClient from '../../../lib/apiClient';
import type { PatientCreateRequest, PatientResponse, PatientSearchItem } from '../types';

export const patientApi = {
  create: (data: PatientCreateRequest): Promise<PatientResponse> =>
    apiClient.post('/patients', data).then((res) => res.data),

  // Backend route is GET /api/v1/patients?q=... (src/api/patients.py), not
  // /intake/patients/search — that path doesn't exist and would 404. Not
  // currently called from any screen, so this was a latent bug rather than
  // an observed break. Returns the slim PatientSearchItem shape, not a full
  // PatientResponse — see the type's own comment.
  search: (q: string): Promise<PatientSearchItem[]> =>
    apiClient.get('/patients', { params: { q } }).then((res) => res.data),
};
