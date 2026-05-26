/// <reference types="vitest/globals" />

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDownloadResultPdf } from '../hooks/useResultDetail';
import { patientPortalApi } from '../api/patientPortalApi';
import { toast } from 'sonner';

vi.mock('../api/patientPortalApi', () => ({
  patientPortalApi: {
    downloadPdf: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper() {
  const queryClient = createQueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return wrapper;
}

describe('useDownloadResultPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls downloadPdf and triggers success toast', async () => {
    vi.mocked(patientPortalApi.downloadPdf).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDownloadResultPdf(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('abc12345');

    await waitFor(() => {
      expect(patientPortalApi.downloadPdf).toHaveBeenCalledWith('abc12345');
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('PDF downloaded successfully.');
    });
  });

  it('triggers error toast on failure', async () => {
    vi.mocked(patientPortalApi.downloadPdf).mockRejectedValueOnce(
      new Error('Download failed')
    );

    const { result } = renderHook(() => useDownloadResultPdf(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('def67890');

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to download PDF. Please try again.'
      );
    });
  });
});
