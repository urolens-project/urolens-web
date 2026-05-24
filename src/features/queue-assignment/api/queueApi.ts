import apiClient from '../../../lib/apiClient';
import type { MedTechWorkload, QueueAssignRequest, QueueAssignResponse, SpecimenResponse } from '../types';

export const queueApi = {
  getWorkloads: (): Promise<MedTechWorkload[]> =>
    apiClient.get('/queue/pending').then((res) => res.data),

  getLabeledSpecimens: (): Promise<SpecimenResponse[]> =>
    apiClient.get('/specimens', { params: { status: 'LABELED' } }).then((res) => res.data),

  assign: (data: QueueAssignRequest): Promise<QueueAssignResponse> =>
    apiClient.post('/queue/assign', data).then((res) => res.data),
};
