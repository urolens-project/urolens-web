import apiClient from '../../../lib/apiClient';
import type { ReceivedSpecimenResult } from '../types';
import type {
  PrintLabelResponse,
  PrintJobResponse,
  ConfirmAffixedResponse,
} from '../../../types/types';

export const sampleLabelingApi = {
  searchReceivedSpecimens: (q: string) =>
    apiClient
      .get<ReceivedSpecimenResult[]>('/specimens/search-received', { params: { q } })
      .then((r) => r.data),

  // Generates (or regenerates) the label content and preview — does not
  // print anything. Printing is the separate call below.
  generateLabel: (specimenId: string) =>
    apiClient.post<PrintLabelResponse>(`/specimens/${specimenId}/label`).then((r) => r.data),

  printLabel: (specimenId: string) =>
    apiClient
      .post<PrintJobResponse>(`/specimens/${specimenId}/label/print`)
      .then((r) => r.data),

  confirmAffixed: (specimenId: string, offlineOverride: boolean) =>
    apiClient
      .post<ConfirmAffixedResponse>(`/specimens/${specimenId}/label/confirm`, {
        offline_override: offlineOverride,
      })
      .then((r) => r.data),
};
