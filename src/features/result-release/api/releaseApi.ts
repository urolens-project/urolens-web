import apiClient from '../../../lib/apiClient';
import type { ApprovedResultsResponse, ReleaseMethod, ResultReleaseResponse } from '../types';

export const releaseApi = {
  getApprovedResults: (limit = 20, cursor?: string): Promise<ApprovedResultsResponse> =>
    apiClient
      .get('/results/approved', { params: { limit, ...(cursor ? { cursor } : {}) } })
      .then((res) => res.data),

  releaseResult: (resultId: string, releaseMethod: ReleaseMethod): Promise<ResultReleaseResponse> =>
    apiClient
      .post(`/results/${resultId}/release`, { release_method: releaseMethod })
      .then((res) => res.data),
};
