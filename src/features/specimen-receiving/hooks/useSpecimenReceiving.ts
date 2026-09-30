import { useQuery, useMutation } from '@tanstack/react-query';
import { specimenReceivingApi } from '../api/specimenReceivingApi';
import type { SpecimenReceivePayload } from '../../../types/types';

export function useLabRequestSearch(query: string) {
  return useQuery({
    queryKey: ['lab-requests', 'search', query],
    queryFn: () => specimenReceivingApi.searchLabRequests(query),
    enabled: query.trim().length > 0,
    // Same reasoning as usePatientSearch — a live search must not serve a
    // 5-minute-old cached result for the same text after the underlying
    // lab request was just created.
    staleTime: 0,
  });
}

export function useReceiveSpecimen() {
  return useMutation({
    mutationFn: (payload: SpecimenReceivePayload) => specimenReceivingApi.receiveSpecimen(payload),
  });
}
