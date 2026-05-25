import { useQuery, useMutation } from '@tanstack/react-query';
import { sampleLabelingApi } from '../api/sampleLabelingApi';

export function useSpecimenSearch(query: string) {
  return useQuery({
    queryKey: ['specimens', 'search', query],
    queryFn: () => sampleLabelingApi.searchReceivedSpecimens(query),
    enabled: query.trim().length > 0,
  });
}

export function usePrintLabel() {
  return useMutation({
    mutationFn: (specimenId: string) => sampleLabelingApi.printLabel(specimenId),
  });
}

export function useConfirmAffixed() {
  return useMutation({
    mutationFn: ({ specimenId, offlineOverride }: { specimenId: string; offlineOverride: boolean }) =>
      sampleLabelingApi.confirmAffixed(specimenId, offlineOverride),
  });
}
