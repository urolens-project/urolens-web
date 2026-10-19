/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { NotificationBell } from '../components/NotificationBell';
import apiClient from '../../../lib/apiClient';

vi.mock('../../../lib/apiClient', () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}));

vi.mock('../../../lib/auth/useAuthContext', () => ({
  useAuthContext: () => ({ token: 'fake-token', role: 'supervisor' }),
}));

function renderBell() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the badge count from the dedicated unread-count endpoint, not the preview list length', async () => {
    // Preview list has only 2 items, but the real unread count (across
    // everything, not just the preview window) is higher — the badge must
    // reflect the latter, not however many happen to be in the preview.
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/notifications/unread-count') {
        return Promise.resolve({ data: { unread_count: 12 } });
      }
      return Promise.resolve({
        data: [
          { notification_id: 'n-1', message: 'A', notification_type: 'RESULT_RELEASED', entity_id: null, is_read: false, created_at: '2026-10-08T10:00:00Z' },
          { notification_id: 'n-2', message: 'B', notification_type: 'RESULT_RELEASED', entity_id: null, is_read: false, created_at: '2026-10-08T09:00:00Z' },
        ],
      });
    });

    renderBell();

    expect(await screen.findByText('9+')).toBeInTheDocument();
  });
});
