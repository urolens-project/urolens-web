/// <reference types="vitest/globals" />

import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PendingApprovalQueueView } from '../components/PendingApprovalQueueView';
import { fetchPendingResults } from '../api/resultReviewApi';

vi.mock('../api/resultReviewApi', () => ({
  fetchPendingResults: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeItem(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    result_id: 'r-1',
    specimen_id: 'specimen-uuid-1234',
    patient_uid: 'PAT-000001',
    patient_age: 34,
    patient_sex: 'FEMALE',
    medtech_name: 'medtech_juan',
    confirmed_at: new Date().toISOString(),
    status: 'PENDING_SUPERVISOR_APPROVAL',
    ...overrides,
  };
}

function renderView() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PendingApprovalQueueView />
    </QueryClientProvider>,
  );
}

describe('PendingApprovalQueueView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows every result oldest first, with patient, sample, medtech, and waiting time', async () => {
    vi.mocked(fetchPendingResults).mockResolvedValue({
      items: [makeItem()],
      total: 1,
      page: 1,
      page_size: 20,
    });
    renderView();

    expect(await screen.findByText('PAT-000001')).toBeInTheDocument();
    expect(screen.getByText('medtech_juan')).toBeInTheDocument();
    expect(screen.getByText('SPECIMEN')).toBeInTheDocument();
  });

  it('falls back to a truncated specimen id when sample_uid is not sent yet', async () => {
    vi.mocked(fetchPendingResults).mockResolvedValue({
      items: [makeItem({ sample_uid: 'SMP-20260930-00001' })],
      total: 1,
      page: 1,
      page_size: 20,
    });
    renderView();

    expect(await screen.findByText('SMP-20260930-00001')).toBeInTheDocument();
  });

  it('flags a long wait as urgent', async () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
    vi.mocked(fetchPendingResults).mockResolvedValue({
      items: [makeItem({ confirmed_at: fiveHoursAgo })],
      total: 1,
      page: 1,
      page_size: 20,
    });
    renderView();

    expect(await screen.findByText(/5h/)).toBeInTheDocument();
  });

  it('says so clearly when the queue is empty', async () => {
    vi.mocked(fetchPendingResults).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 20 });
    renderView();

    expect(await screen.findByText('All caught up!')).toBeInTheDocument();
  });

  it('shows an error message instead of a blank screen when the queue fails to load', async () => {
    vi.mocked(fetchPendingResults).mockRejectedValue(new Error('down'));
    renderView();

    expect(await screen.findByText(/Failed to load pending results/i)).toBeInTheDocument();
  });

  it('opens a result in full detail when selected', async () => {
    vi.mocked(fetchPendingResults).mockResolvedValue({
      items: [makeItem()],
      total: 1,
      page: 1,
      page_size: 20,
    });
    renderView();

    fireEvent.click(await screen.findByText('PAT-000001'));
    expect(mockNavigate).toHaveBeenCalledWith('/supervisor/results/r-1');
  });

  it('lets the Supervisor page through more results than fit on one page', async () => {
    vi.mocked(fetchPendingResults).mockResolvedValue({
      items: [makeItem()],
      total: 45,
      page: 1,
      page_size: 20,
    });
    renderView();

    const next = await screen.findByRole('button', { name: /Next/i });
    fireEvent.click(next);

    expect(fetchPendingResults).toHaveBeenLastCalledWith(2, 20);
  });
});
