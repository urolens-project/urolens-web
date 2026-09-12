import { useQuery, useMutation } from '@tanstack/react-query';
import { labRequestApi } from '../api/labRequestApi';
import type { LabRequestPayload } from '../../../types/types';

export function usePhysicians() {
  return useQuery({
    queryKey: ['physicians'],
    queryFn: labRequestApi.getPhysicians,
  });
}

export function usePatientSearch(query: string) {
  return useQuery({
    queryKey: ['patients', 'search', query],
    queryFn: () => labRequestApi.searchPatients(query),
    enabled: query.trim().length > 0,
    // No staleTime override here inherits the app-wide 5-minute default,
    // which is wrong for a live search: re-typing the same text after
    // registering a patient (a very normal duplicate-check habit) would
    // silently replay the earlier "not found" result for up to 5 minutes.
    staleTime: 0,
  });
}

export function useCreateLabRequest() {
  return useMutation({
    mutationFn: (payload: LabRequestPayload) => labRequestApi.createLabRequest(payload),
  });
}
