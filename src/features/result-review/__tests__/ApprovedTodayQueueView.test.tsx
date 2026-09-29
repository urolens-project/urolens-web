/// <reference types="vitest/globals" />

import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApprovedTodayQueueView } from '../components/ApprovedTodayQueueView';
import { fetchApprovedToday } from '../api/resultReviewApi';

vi.mock('../api/resultReviewApi', () => ({
  fetchApprovedToday: vi.fn(),
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
    approved_at: new Date().toISOString(),
    status: 'APPROVED',
    ...overrides,
  };
}

function renderView() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ApprovedTodayQueueView />
    </QueryClientProvider>,
  );
}

describe('ApprovedTodayQueueView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows every result approved today, with patient, sample, medtech, and time', async () => {
    vi.mocked(fetchApprovedToday).mockResolvedValue({
      items: [makeItem()],
      total: 1,
      page: 1,
      page_size: 20,
    });
    renderView();

    expect(await screen.findByText('PAT-000001')).toBeInTheDocument();
    expect(screen.getByText('medtech_juan')).toBeInTheDocument();
  });

  it('says so clearly when nothing has been approved yet today', async () => {
    vi.mocked(fetchApprovedToday).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 20 });
    renderView();

    expect(await screen.findByText('No approvals yet today')).toBeInTheDocument();
  });

  it('shows an error message instead of a blank screen when the queue fails to load', async () => {
    vi.mocked(fetchApprovedToday).mockRejectedValue(new Error('down'));
    renderView();

    expect(await screen.findByText(/Failed to load approved results/i)).toBeInTheDocument();
  });

  it('opens a result in full detail when selected', async () => {
    vi.mocked(fetchApprovedToday).mockResolvedValue({
      items: [makeItem()],
      total: 1,
      page: 1,
      page_size: 20,
    });
    renderView();

    fireEvent.click(await screen.findByText('PAT-000001'));
    expect(mockNavigate).toHaveBeenCalledWith('/supervisor/results/r-1');
  });

  it('lets the Supervisor refresh the queue manually', async () => {
    vi.mocked(fetchApprovedToday).mockResolvedValue({
      items: [makeItem()],
      total: 1,
      page: 1,
      page_size: 20,
    });
    renderView();

    await screen.findByText('PAT-000001');
    fireEvent.click(screen.getByRole('button', { name: /Refresh/i }));

    expect(fetchApprovedToday).toHaveBeenCalledTimes(2);
  });

  it('lets the Supervisor page through more results than fit on one page', async () => {
    vi.mocked(fetchApprovedToday).mockResolvedValue({
      items: [makeItem()],
      total: 45,
      page: 1,
      page_size: 20,
    });
    renderView();

    const next = await screen.findByRole('button', { name: /Next/i });
    fireEvent.click(next);

    expect(fetchApprovedToday).toHaveBeenLastCalledWith(2, 20);
  });
});
