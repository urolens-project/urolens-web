/// <reference types="vitest/globals" />

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAssignSpecimen } from '../hooks/useAssignSpecimen';
import { queueApi } from '../api/queueApi';
import type { QueueAssignRequest, QueueAssignResponse } from '../types';

vi.mock('../api/queueApi', () => ({
  queueApi: {
    getWorkloads: vi.fn(),
    getLabeledSpecimens: vi.fn(),
    assign: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const mockPayload: QueueAssignRequest = {
  specimen_id: 'spec-1',
  medtech_id: 'mt-1',
};

const mockResponse: QueueAssignResponse = {
  assignment_id: 'asgn-1',
  specimen_id: 'spec-1',
  medtech_id: 'mt-1',
  assigned_by: 'receptionist-1',
  assigned_at: '2026-05-23T12:00:00Z',
  status: 'ASSIGNED',
};

describe('useAssignSpecimen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('calls queueApi.assign and returns assignment data on success', async () => {
    vi.mocked(queueApi.assign).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAssignSpecimen(), { wrapper: Wrapper });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(queueApi.assign).toHaveBeenCalledWith(
      expect.objectContaining(mockPayload),
      expect.anything(),
    );
    expect(result.current.data).toEqual(mockResponse);
  });

  it('invalidates workloads and specimens queries on success', async () => {
    vi.mocked(queueApi.assign).mockResolvedValueOnce(mockResponse);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useAssignSpecimen(), { wrapper: Wrapper });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['queue', 'workloads'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['specimens', 'labeled'] });
  });

  it('sets error state when queueApi.assign fails', async () => {
    vi.mocked(queueApi.assign).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAssignSpecimen(), { wrapper: Wrapper });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
