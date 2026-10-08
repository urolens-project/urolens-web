import apiClient from '../../../lib/apiClient';
import type { PatientLoginResponse } from '../types';

export interface PatientLoginRequest {
  patient_uid: string;
  password: string;
}

export const patientAuthApi = {
  login: (data: PatientLoginRequest): Promise<PatientLoginResponse> =>
    apiClient.post<PatientLoginResponse>('/auth/patient-login', data).then((res) => res.data),

  logout: (): Promise<void> => apiClient.post('/auth/patient-logout').then(() => undefined),
};
