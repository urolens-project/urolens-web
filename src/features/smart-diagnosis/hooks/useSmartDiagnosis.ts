import { useQuery } from '@tanstack/react-query';
import { smartDiagnosisApi } from '../api/smartDiagnosisApi';

export function useSmartDiagnosis(resultId: string | undefined) {
  return useQuery({
    queryKey: ['smart-diagnosis', resultId],
    queryFn: () => smartDiagnosisApi.getByResultId(resultId!),
    enabled: !!resultId,
    staleTime: 5 * 60 * 1000,
  });
}
