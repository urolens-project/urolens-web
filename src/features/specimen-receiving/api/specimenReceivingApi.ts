import apiClient from '../../../lib/apiClient';
import type { LabRequestSearchResult } from '../types';
import type { SpecimenReceivePayload, SpecimenReceiveResponse } from '../../../types/types';

export const specimenReceivingApi = {
  searchLabRequests: (q: string) =>
    apiClient.get<LabRequestSearchResult[]>('/specimens/search-request', { params: { q } }).then((r) => r.data),

  receiveSpecimen: (payload: SpecimenReceivePayload) =>
    apiClient.post<SpecimenReceiveResponse>('/specimens/receive', payload).then((r) => r.data),
};
