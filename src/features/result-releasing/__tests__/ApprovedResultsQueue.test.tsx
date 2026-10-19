/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApprovedResultsQueue } from '../components/ApprovedResultsQueue';
import { resultReleasingApi } from '../api/resultReleasingApi';

vi.mock('../api/resultReleasingApi', () => ({
  resultReleasingApi: {
    getApproved: vi.fn(),
    release: vi.fn(),
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const pageOne = {
  data: [
    {
      result_id: 'r-1',
      patient_uid: 'PAT-000001',
      sample_uid: 'SMP-1',
      test_type: 'URINALYSIS_-_ROUTINE',
      approved_at: '2026-09-28T09:00:00Z',
    },
    {
      result_id: 'r-2',
      patient_uid: 'PAT-000002',
      sample_uid: 'SMP-2',
      test_type: 'URINALYSIS',
      approved_at: '2026-09-28T08:00:00Z',
    },
  ],
  pagination: { next_cursor: '2026-09-28T08:00:00Z', has_more: true },
};

const pageTwo = {
  data: [
    {
      result_id: 'r-3',
      patient_uid: 'PAT-000003',
      sample_uid: 'SMP-3',
      test_type: 'URINALYSIS',
      approved_at: '2026-09-27T08:00:00Z',
    },
  ],
  pagination: { next_cursor: null, has_more: false },
};

function renderQueue() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ApprovedResultsQueue />
    </QueryClientProvider>,
  );
}

describe('ApprovedResultsQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the patient UID, not a nonexistent name field', async () => {
    vi.mocked(resultReleasingApi.getApproved).mockResolvedValue(pageOne);
    renderQueue();

    expect(await screen.findByText('PAT-000001')).toBeInTheDocument();
    expect(screen.getByText('PAT-000002')).toBeInTheDocument();
  });

  it('formats the raw test type for display', async () => {
    vi.mocked(resultReleasingApi.getApproved).mockResolvedValue(pageOne);
    renderQueue();

    expect(await screen.findByText('URINALYSIS - ROUTINE')).toBeInTheDocument();
  });

  it('adds the next page to the list instead of replacing it', async () => {
    vi.mocked(resultReleasingApi.getApproved)
      .mockResolvedValueOnce(pageOne)
      .mockResolvedValueOnce(pageTwo);
    renderQueue();

    await screen.findByText('PAT-000001');
    fireEvent.click(screen.getByRole('button', { name: /Load more/i }));

    await screen.findByText('PAT-000003');
    expect(screen.getByText('PAT-000001')).toBeInTheDocument();
    expect(screen.getByText('PAT-000002')).toBeInTheDocument();
    expect(resultReleasingApi.getApproved).toHaveBeenCalledWith(20, '2026-09-28T08:00:00Z');
  });

  it('removes a result from the queue once it is released', async () => {
    vi.mocked(resultReleasingApi.getApproved).mockResolvedValue(pageOne);
    vi.mocked(resultReleasingApi.release).mockResolvedValue({
      release_id: 'rel-1',
      result_id: 'r-1',
      released_by: 'u-1',
      release_method: 'DIGITAL',
      released_at: '2026-09-28T10:00:00Z',
    });
    renderQueue();

    await screen.findByText('PAT-000001');
    fireEvent.click(screen.getAllByRole('button', { name: /Release/i })[0]);
    fireEvent.click(screen.getByText('Digital Delivery'));
    fireEvent.click(screen.getByRole('button', { name: /Confirm Release/i }));

    await waitFor(() => expect(screen.queryByText('PAT-000001')).not.toBeInTheDocument());
    expect(screen.getByText('PAT-000002')).toBeInTheDocument();
  });

  it('starts over from page one on refresh', async () => {
    vi.mocked(resultReleasingApi.getApproved)
      .mockResolvedValueOnce(pageOne)
      .mockResolvedValueOnce(pageTwo)
      .mockResolvedValueOnce(pageOne);
    renderQueue();

    await screen.findByText('PAT-000001');
    fireEvent.click(screen.getByRole('button', { name: /Load more/i }));
    await screen.findByText('PAT-000003');

    fireEvent.click(screen.getByRole('button', { name: /Refresh/i }));

    await waitFor(() =>
      expect(resultReleasingApi.getApproved).toHaveBeenLastCalledWith(20, undefined),
    );
    expect(screen.queryByText('PAT-000003')).not.toBeInTheDocument();
  });

  it('shows an empty state explaining when results will appear', async () => {
    vi.mocked(resultReleasingApi.getApproved).mockResolvedValue({
      data: [],
      pagination: { next_cursor: null, has_more: false },
    });
    renderQueue();

    expect(await screen.findByText('No approved results')).toBeInTheDocument();
    expect(screen.getByText(/once the Supervisor approves them/i)).toBeInTheDocument();
  });

  it('shows an error message rather than an empty screen when the list fails to load', async () => {
    vi.mocked(resultReleasingApi.getApproved).mockRejectedValue(new Error('network down'));
    renderQueue();

    expect(await screen.findByText(/Failed to load approved results/i)).toBeInTheDocument();
  });

  it('renders loading-skeleton bars with an actual width, not a width-less `w-${n}` class', () => {
    // getApproved never resolves, so the component stays in its loading state.
    vi.mocked(resultReleasingApi.getApproved).mockReturnValue(new Promise(() => {}));
    const { container } = renderQueue();

    const bars = container.querySelectorAll('tbody tr.animate-pulse div.h-3');
    expect(bars.length).toBeGreaterThan(0);
    for (const bar of bars) {
      expect((bar as HTMLElement).style.width).not.toBe('');
    }
  });
});
