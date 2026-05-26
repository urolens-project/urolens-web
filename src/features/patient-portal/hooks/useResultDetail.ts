import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { patientPortalApi } from '../api/patientPortalApi';

export function useResultDetail(resultId: string) {
  return useQuery({
    queryKey: ['patient', 'results', resultId],
    queryFn: () => patientPortalApi.getResultDetail(resultId),
    enabled: !!resultId,
  });
}

export function useDownloadResultPdf() {
  return useMutation({
    mutationFn: (resultId: string) => patientPortalApi.downloadPdf(resultId),
    onSuccess: () => {
      toast.success('PDF downloaded successfully.');
    },
    onError: () => {
      toast.error('Failed to download PDF. Please try again.');
    },
  });
}
