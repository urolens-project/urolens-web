/// <reference types="vitest/globals" />

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApproveResult, useEscalateResult, useReturnResult } from '../hooks/useResultReview';
import { approveResult, escalateResult, returnResult } from '../api/resultReviewApi';

vi.mock('../api/resultReviewApi', () => ({
  approveResult: vi.fn(),
  escalateResult: vi.fn(),
  returnResult: vi.fn(),
}));

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useApproveResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalidates the pending and approved-today queues on success', async () => {
    vi.mocked(approveResult).mockResolvedValue({
      result_id: 'r-1',
      status: 'APPROVED',
      approved_at: '2026-09-30T10:00:00Z',
    });
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useApproveResult('r-1'), {
      wrapper: makeWrapper(queryClient),
    });
    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const invalidatedKeys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey);
    expect(invalidatedKeys).toContainEqual(['results', 'pending']);
    expect(invalidatedKeys).toContainEqual(['results', 'approved-today']);
  });
});

describe('useEscalateResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalidates the pending and escalated queues on success', async () => {
    vi.mocked(escalateResult).mockResolvedValue({
      result_id: 'r-1',
      status: 'CRITICAL_ESCALATED',
      escalation_path: 'MARK_CRITICAL',
      escalated_at: '2026-09-30T10:00:00Z',
    });
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useEscalateResult('r-1'), {
      wrapper: makeWrapper(queryClient),
    });
    result.current.mutate({ escalationPath: 'MARK_CRITICAL' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const invalidatedKeys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey);
    expect(invalidatedKeys).toContainEqual(['results', 'pending']);
    expect(invalidatedKeys).toContainEqual(['results', 'escalated']);
  });
});

describe('useReturnResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalidates the pending queue on success', async () => {
    vi.mocked(returnResult).mockResolvedValue({
      result_id: 'r-1',
      status: 'RETURNED_FOR_CORRECTION',
      returned_at: '2026-09-30T10:00:00Z',
    });
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useReturnResult('r-1'), {
      wrapper: makeWrapper(queryClient),
    });
    result.current.mutate('Please recount the WBC field.');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const invalidatedKeys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey);
    expect(invalidatedKeys).toContainEqual(['results', 'pending']);
  });
});
