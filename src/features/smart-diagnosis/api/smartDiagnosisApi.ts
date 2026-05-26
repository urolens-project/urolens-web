import apiClient from '../../../lib/apiClient';
import type { SmartDiagnosisResponse } from '../types';

export const smartDiagnosisApi = {
  getByResultId: (resultId: string): Promise<SmartDiagnosisResponse> =>
    apiClient.get(`/results/${resultId}/smart-diagnosis`).then((res) => res.data),
};
