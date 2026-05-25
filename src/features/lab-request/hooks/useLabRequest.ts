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
  });
}

export function useCreateLabRequest() {
  return useMutation({
    mutationFn: (payload: LabRequestPayload) => labRequestApi.createLabRequest(payload),
  });
}
