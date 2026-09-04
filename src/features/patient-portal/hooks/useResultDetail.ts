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
  const mutation = useMutation({
    mutationFn: (resultId: string) => patientPortalApi.downloadPdf(resultId),
    onSuccess: () => {
      toast.success('Your PDF is opening in a new tab.');
    },
    onError: () => {
      toast.error('Failed to download PDF. Please try again.');
    },
  });
  return mutation;
}
