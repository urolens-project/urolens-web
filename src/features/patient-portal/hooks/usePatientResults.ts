import { useQuery } from '@tanstack/react-query';
import { patientPortalApi } from '../api/patientPortalApi';

export function usePatientResults() {
  return useQuery({
    queryKey: ['patient', 'results'],
    queryFn: patientPortalApi.getResults,
  });
}
