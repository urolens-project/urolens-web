/// <reference types="vitest/globals" />

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePatientResults } from '../hooks/usePatientResults';
import { patientPortalApi } from '../api/patientPortalApi';
import type { PatientResultSummary } from '../types';

vi.mock('../api/patientPortalApi', () => ({
  patientPortalApi: {
    getResults: vi.fn(),
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

const mockResults: PatientResultSummary[] = [
  {
    result_id: 'abc12345-6789',
    specimen_id: 'spec-001',
    status: 'RELEASED',
    released_at: '2026-05-20T10:00:00Z',
    created_at: '2026-05-15T08:00:00Z',
  },
  {
    result_id: 'def67890-1234',
    specimen_id: 'spec-002',
    status: 'PENDING',
    released_at: null,
    created_at: '2026-05-16T09:00:00Z',
  },
];

describe('usePatientResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns results on success', async () => {
    vi.mocked(patientPortalApi.getResults).mockResolvedValueOnce(mockResults);

    const { result } = renderHook(() => usePatientResults(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResults);
  });

  it('handles error state', async () => {
    vi.mocked(patientPortalApi.getResults).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => usePatientResults(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
