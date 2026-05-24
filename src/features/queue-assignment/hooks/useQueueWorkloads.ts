import { useQuery } from '@tanstack/react-query';
import { queueApi } from '../api/queueApi';

export function useQueueWorkloads() {
  return useQuery({
    queryKey: ['queue', 'workloads'],
    queryFn: queueApi.getWorkloads,
    refetchInterval: 30_000,
  });
}

export function useLabeledSpecimens() {
  return useQuery({
    queryKey: ['specimens', 'labeled'],
    queryFn: queueApi.getLabeledSpecimens,
    refetchInterval: 30_000,
  });
}
