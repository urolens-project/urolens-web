/// <reference types="vitest/globals" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { NotificationsPage } from '../components/NotificationsPage';
import apiClient from '../../../lib/apiClient';

vi.mock('../../../lib/apiClient', () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}));

vi.mock('../../../lib/auth/useAuthContext', () => ({
  useAuthContext: () => ({ token: 'fake-token', role: 'supervisor' }),
}));

function item(id: string, overrides: Partial<Record<string, unknown>> = {}) {
  return {
    notification_id: id,
    message: `Message ${id}`,
    notification_type: 'RESULT_RELEASED',
    entity_id: null,
    is_read: false,
    created_at: '2026-10-08T10:00:00Z',
    ...overrides,
  };
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/notifications/unread-count') {
        return Promise.resolve({ data: { unread_count: 0 } });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it('shows "No notifications yet." on the All tab when empty', async () => {
    renderPage();
    expect(await screen.findByText('No notifications yet.')).toBeInTheDocument();
  });

  it('shows "You\'re all caught up." on the Unread tab when empty', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('No notifications yet.');

    await user.click(screen.getByRole('button', { name: /unread/i }));
    expect(await screen.findByText("You're all caught up.")).toBeInTheDocument();
  });

  it('requests unread_only=true when the Unread tab is selected', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('No notifications yet.');
    vi.mocked(apiClient.get).mockClear();

    await user.click(screen.getByRole('button', { name: /unread/i }));

    await waitFor(() =>
      expect(apiClient.get).toHaveBeenCalledWith(
        '/notifications',
        expect.objectContaining({ params: expect.objectContaining({ unread_only: true }) }),
      ),
    );
  });

  it('shows a Load more button when a full page comes back, and fetches the next page on click', async () => {
    const fullPage = Array.from({ length: 20 }, (_, i) => item(`n-${i}`));
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/notifications/unread-count') return Promise.resolve({ data: { unread_count: 0 } });
      return Promise.resolve({ data: fullPage });
    });

    const user = userEvent.setup();
    renderPage();

    const loadMore = await screen.findByRole('button', { name: /load more/i });
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/notifications/unread-count') return Promise.resolve({ data: { unread_count: 0 } });
      return Promise.resolve({ data: [item('n-20')] });
    });

    await user.click(loadMore);

    await waitFor(() =>
      expect(apiClient.get).toHaveBeenCalledWith(
        '/notifications',
        expect.objectContaining({ params: expect.objectContaining({ before: 'n-19' }) }),
      ),
    );
  });

  it('does not show Load more once a short page comes back', async () => {
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/notifications/unread-count') return Promise.resolve({ data: { unread_count: 0 } });
      return Promise.resolve({ data: [item('n-1')] });
    });

    renderPage();
    await screen.findByText('Message n-1');
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
  });
});
