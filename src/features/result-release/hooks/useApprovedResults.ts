import { useQuery } from '@tanstack/react-query';
import { releaseApi } from '../api/releaseApi';

export const releaseKeys = {
  all: ['results', 'release'] as const,
  approved: () => [...releaseKeys.all, 'approved'] as const,
};

export function useApprovedResults(limit = 20, cursor?: string) {
  return useQuery({
    queryKey: [...releaseKeys.approved(), { limit, cursor }],
    queryFn: () => releaseApi.getApprovedResults(limit, cursor),
  });
}
