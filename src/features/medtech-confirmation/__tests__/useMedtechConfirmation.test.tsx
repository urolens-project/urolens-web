/// <reference types="vitest/globals" />

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConfirmResult } from '../hooks/useMedtechConfirmation';
import apiClient from '../../../lib/apiClient';

vi.mock('../../../lib/apiClient', () => ({
  default: { post: vi.fn(), get: vi.fn() },
}));

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useConfirmResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { id: 'c-1', result_id: 'r-1', confirmed_by: 'u-1', confirmed_at: '2026-10-08T00:00:00Z' },
    });
  });

  it('sends interpretation_notes when the MedTech provides one', async () => {
    const { result } = renderHook(() => useConfirmResult('r-1'), { wrapper: makeWrapper() });
    result.current.mutate('Findings within normal range.');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith('/results/r-1/confirm', {
      interpretation_notes: 'Findings within normal range.',
    });
  });

  it('sends no body when interpretation notes are left blank', async () => {
    const { result } = renderHook(() => useConfirmResult('r-1'), { wrapper: makeWrapper() });
    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith('/results/r-1/confirm', undefined);
  });

  it('trims whitespace-only notes down to no body', async () => {
    const { result } = renderHook(() => useConfirmResult('r-1'), { wrapper: makeWrapper() });
    result.current.mutate('   ');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith('/results/r-1/confirm', undefined);
  });
});
