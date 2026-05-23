import apiClient from '../../../lib/apiClient';
import type { PatientCreateRequest, PatientResponse } from '../types';

export const patientApi = {
  create: (data: PatientCreateRequest): Promise<PatientResponse> =>
    apiClient.post('/patients', data).then((res) => res.data),

  search: (q: string): Promise<PatientResponse[]> =>
    apiClient.get('/patients', { params: { q } }).then((res) => res.data),
};
