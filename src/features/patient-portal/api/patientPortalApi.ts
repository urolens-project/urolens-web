import apiClient from '../../../lib/apiClient';
import type { PatientResultItem, PatientResultDetail } from '../types';

export const patientPortalApi = {
  getPatientResults: (): Promise<PatientResultItem[]> =>
    apiClient.get('/patient/results').then(res => res.data),

  getResultDetail: (resultId: string): Promise<PatientResultDetail> =>
    apiClient.get(`/patient/results/${resultId}`).then(res => res.data),

  downloadPdf: async (resultId: string): Promise<void> => {
    // Backend returns { url: "<signed Supabase URL>" } — open directly in new tab
    const response = await apiClient.get(`/patient/results/${resultId}/pdf`);
    const signedUrl: string | undefined = response.data?.url;
    if (signedUrl) {
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    // Fallback: backend returned raw PDF bytes (Storage unavailable)
    const blobRes = await apiClient.get(`/patient/results/${resultId}/pdf`, {
      responseType: 'blob',
    });
    const blobUrl = window.URL.createObjectURL(
      new Blob([blobRes.data], { type: 'application/pdf' })
    );
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', `result_${resultId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  },
};
