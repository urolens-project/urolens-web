/// <reference types="vitest/globals" />

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useNotificationsPage,
  useUnreadCount,
  useMarkNotificationRead,
} from '../hooks/useNotifications';
import apiClient from '../../../lib/apiClient';

vi.mock('../../../lib/apiClient', () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}));

vi.mock('../../../lib/auth/useAuthContext', () => ({
  useAuthContext: () => ({ token: 'fake-token' }),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function makeItem(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    notification_id: 'n-1',
    message: 'Something happened',
    notification_type: 'RESULT_RELEASED',
    entity_id: null,
    is_read: false,
    created_at: '2026-10-08T10:00:00Z',
    ...overrides,
  };
}

describe('useUnreadCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads the dedicated unread-count endpoint, not the notification list', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { unread_count: 7 } });

    const { result } = renderHook(() => useUnreadCount(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.data).toBe(7));
    expect(apiClient.get).toHaveBeenCalledWith('/notifications/unread-count');
  });
});

describe('useNotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes unread_only through as a query param', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

    renderHook(() => useNotificationsPage(true), { wrapper: makeWrapper() });

    await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
    expect(apiClient.get).toHaveBeenCalledWith(
      '/notifications',
      expect.objectContaining({
        params: expect.objectContaining({ unread_only: true, limit: 20 }),
      }),
    );
  });

  it('offers a next page when a full page comes back, using the last item as the cursor', async () => {
    const fullPage = Array.from({ length: 20 }, (_, i) => makeItem({ notification_id: `n-${i}` }));
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: fullPage });

    const { result } = renderHook(() => useNotificationsPage(false), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [makeItem({ notification_id: 'n-20' })] });
    await result.current.fetchNextPage();

    await waitFor(() =>
      expect(apiClient.get).toHaveBeenLastCalledWith(
        '/notifications',
        expect.objectContaining({ params: expect.objectContaining({ before: 'n-19' }) }),
      ),
    );
  });

  it('reports no next page once a short page comes back', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [makeItem()] });

    const { result } = renderHook(() => useNotificationsPage(false), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });
});

describe('useMarkNotificationRead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.patch).mockResolvedValue({ data: undefined });
  });

  it('invalidates every notification-related query, not just the list it was read from', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper });
    result.current.mutate('n-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notifications', 'fake-token'] });
  });
});
