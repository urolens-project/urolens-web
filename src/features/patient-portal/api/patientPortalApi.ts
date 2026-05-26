import apiClient from '../../../lib/apiClient';
import type { PatientResultSummary, PatientResultDetail } from '../types';

export const patientPortalApi = {
  getResults: (): Promise<PatientResultSummary[]> =>
    apiClient.get('/patient/results').then(res => res.data),

  getResultDetail: (resultId: string): Promise<PatientResultDetail> =>
    apiClient.get(`/patient/results/${resultId}`).then(res => res.data),

  downloadPdf: async (resultId: string): Promise<void> => {
    const response = await apiClient.get(
      `/patient/results/${resultId}/pdf`,
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `result_${resultId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
