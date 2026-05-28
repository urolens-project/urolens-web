import apiClient from '../../../lib/apiClient';
import type { LoginResponse } from '../types';

export interface PatientLoginRequest {
  patient_uid: string;
  password: string;
}

export const patientAuthApi = {
  login: (data: PatientLoginRequest): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>('/auth/patient-login', data).then((res) => res.data),

  logout: (): Promise<void> =>
    apiClient.post('/auth/patient-logout').then(() => undefined),
};
