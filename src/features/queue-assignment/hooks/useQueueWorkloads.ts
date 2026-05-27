import { useQuery } from '@tanstack/react-query';
import { queueApi } from '../api/queueApi';

export function usePendingSpecimens() {
  return useQuery({
    queryKey: ['queue', 'pending'],
    queryFn: queueApi.getPendingSpecimens,
    refetchInterval: 30_000,
  });
}

export function useMedTechWorkloads() {
  return useQuery({
    queryKey: ['queue', 'workloads'],
    queryFn: queueApi.getMedTechWorkloads,
    refetchInterval: 30_000,
  });
}
