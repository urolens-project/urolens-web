import { useQuery, useMutation } from '@tanstack/react-query';
import { specimenReceivingApi } from '../api/specimenReceivingApi';
import type { SpecimenReceivePayload } from '../../../types/types';

export function useLabRequestSearch(query: string) {
  return useQuery({
    queryKey: ['lab-requests', 'search', query],
    queryFn: () => specimenReceivingApi.searchLabRequests(query),
    enabled: query.trim().length > 0,
  });
}

export function useReceiveSpecimen() {
  return useMutation({
    mutationFn: (payload: SpecimenReceivePayload) => specimenReceivingApi.receiveSpecimen(payload),
  });
}
