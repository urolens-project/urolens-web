import apiClient from '../../../lib/apiClient';
import type {
  AssignSpecimenRequest,
  MedTechWorkloadItem,
  PendingSpecimenItem,
  QueueAssignmentResponse,
} from '../types';

export const queueApi = {
  getPendingSpecimens: (): Promise<PendingSpecimenItem[]> =>
    apiClient.get('/queue/pending').then((res) => res.data),

  getMedTechWorkloads: (): Promise<MedTechWorkloadItem[]> =>
    apiClient.get('/queue/workloads').then((res) => res.data),

  assignSpecimen: (data: AssignSpecimenRequest): Promise<QueueAssignmentResponse> =>
    apiClient.post('/queue/assign', data).then((res) => res.data),
};
