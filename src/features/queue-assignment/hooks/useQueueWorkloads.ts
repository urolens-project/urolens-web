import { useQuery } from '@tanstack/react-query';
import { pollInterval } from '../../../lib/polling';
import { queueApi } from '../api/queueApi';

export function usePendingSpecimens() {
  return useQuery({
    queryKey: ['queue', 'pending'],
    queryFn: queueApi.getPendingSpecimens,
    refetchInterval: pollInterval(30_000),
  });
}

export function useMedTechWorkloads() {
  return useQuery({
    queryKey: ['queue', 'workloads'],
    queryFn: queueApi.getMedTechWorkloads,
    refetchInterval: pollInterval(30_000),
  });
}
