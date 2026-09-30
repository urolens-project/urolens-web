/// <reference types="vitest/globals" />

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useReleaseResult } from '../hooks/useResultReleasing';
import { resultReleasingApi } from '../api/resultReleasingApi';

vi.mock('../api/resultReleasingApi', () => ({
  resultReleasingApi: {
    getApproved: vi.fn(),
    release: vi.fn(),
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useReleaseResult error messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the specific message for the code the backend actually sends', async () => {
    vi.mocked(resultReleasingApi.release).mockRejectedValue({
      response: { data: { error: { code: 'RESULT_NOT_FOUND' } } },
    });
    const { result } = renderHook(() => useReleaseResult(), { wrapper });

    result.current.mutate({ resultId: 'r-1', releaseMethod: 'DIGITAL' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Result not found.');
  });

  it('falls back to a generic message for an unmapped code', async () => {
    vi.mocked(resultReleasingApi.release).mockRejectedValue({
      response: { data: { error: { code: 'VALIDATION_ERROR' } } },
    });
    const { result } = renderHook(() => useReleaseResult(), { wrapper });

    result.current.mutate({ resultId: 'r-1', releaseMethod: 'PHYSICAL' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Failed to release result. Please try again.');
  });
});
