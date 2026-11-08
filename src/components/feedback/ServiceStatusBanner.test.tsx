/// <reference types="vitest/globals" />

import axios from 'axios';
import { render, screen, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ServiceStatusBanner from './ServiceStatusBanner';
import SessionReasonBanner from './SessionReasonBanner';
import { resetReadinessForTests } from '../../lib/readiness';

vi.mock('axios', async (orig) => {
  const actual = await orig<typeof import('axios')>();
  return { ...actual, default: { ...actual.default, get: vi.fn() } };
});
const get = vi.mocked(axios.get);

function renderBanner() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ServiceStatusBanner />
    </QueryClientProvider>,
  );
}

describe('ServiceStatusBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetReadinessForTests();
    get.mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it('shows a temporary "starting" banner while not ready, then hides when ready', async () => {
    get
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValue({ status: 200, data: { db: true, model: true } });
    renderBanner();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByRole('status')).toHaveTextContent(/temporary/i);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders nothing when ready on first probe', async () => {
    get.mockResolvedValue({ status: 200, data: { db: true, model: true } });
    renderBanner();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('SessionReasonBanner', () => {
  it('shows timeout and expired messages, nothing otherwise', () => {
    const { rerender } = render(<SessionReasonBanner reason="timeout" />);
    expect(screen.getByText(/inactivity/i)).toBeInTheDocument();
    rerender(<SessionReasonBanner reason="expired" />);
    expect(screen.getByText(/session has expired/i)).toBeInTheDocument();
    rerender(<SessionReasonBanner reason="other" />);
    expect(screen.queryByText(/signed out|expired/i)).not.toBeInTheDocument();
    rerender(<SessionReasonBanner reason={null} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
