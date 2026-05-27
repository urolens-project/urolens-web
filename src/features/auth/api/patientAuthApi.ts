import apiClient from '../../../lib/apiClient';

export interface PatientLoginResponse {
  access_token: string;
  token_type: string;
  role: string;
}

export const patientAuthApi = {
  login: (patientUid: string, password: string): Promise<PatientLoginResponse> =>
    apiClient
      .post<PatientLoginResponse>('/auth/patient-login', {
        patient_uid: patientUid,
        password,
      })
      .then((res) => res.data),

  logout: (): Promise<void> =>
    apiClient.post('/auth/patient-logout').then(() => undefined),
};
