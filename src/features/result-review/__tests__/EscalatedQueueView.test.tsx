/// <reference types="vitest/globals" />

import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EscalatedQueueView } from '../components/EscalatedQueueView';
import { fetchEscalated } from '../api/resultReviewApi';

vi.mock('../api/resultReviewApi', () => ({
  fetchEscalated: vi.fn(),
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
    sample_uid: 'SMP-20260930-00001',
    patient_uid: 'PAT-000001',
    patient_age: 34,
    patient_sex: 'FEMALE',
    medtech_name: 'medtech_juan',
    escalated_at: new Date().toISOString(),
    escalation_path: 'MARK_CRITICAL',
    status: 'CRITICAL_ESCALATED',
    ...overrides,
  };
}

function renderView() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <EscalatedQueueView />
    </QueryClientProvider>,
  );
}

describe('EscalatedQueueView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows every escalated result, with patient, sample, medtech, path, and time', async () => {
    vi.mocked(fetchEscalated).mockResolvedValue({
      items: [makeItem()],
      total: 1,
      page: 1,
      page_size: 20,
    });
    renderView();

    expect(await screen.findByText('PAT-000001')).toBeInTheDocument();
    expect(screen.getByText('medtech_juan')).toBeInTheDocument();
    expect(screen.getByText('Mark Critical')).toBeInTheDocument();
    expect(screen.getByText('SMP-20260930-00001')).toBeInTheDocument();
  });

  it('shows a dash when the specimen has no sample UID yet', async () => {
    vi.mocked(fetchEscalated).mockResolvedValue({
      items: [makeItem({ sample_uid: null })],
      total: 1,
      page: 1,
      page_size: 20,
    });
    renderView();

    await screen.findByText('PAT-000001');
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('falls back to a generic chip for an unrecognised escalation path', async () => {
    vi.mocked(fetchEscalated).mockResolvedValue({
      items: [makeItem({ escalation_path: 'SOMETHING_NEW' })],
      total: 1,
      page: 1,
      page_size: 20,
    });
    renderView();

    await screen.findByText('PAT-000001');
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('says so clearly when there are no active escalations', async () => {
    vi.mocked(fetchEscalated).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 20 });
    renderView();

    expect(await screen.findByText('No active escalations')).toBeInTheDocument();
  });

  it('shows an error message instead of a blank screen when the queue fails to load', async () => {
    vi.mocked(fetchEscalated).mockRejectedValue(new Error('down'));
    renderView();

    expect(await screen.findByText(/Failed to load escalated cases/i)).toBeInTheDocument();
  });

  it('opens a result in full detail when selected', async () => {
    vi.mocked(fetchEscalated).mockResolvedValue({
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
    vi.mocked(fetchEscalated).mockResolvedValue({
      items: [makeItem()],
      total: 45,
      page: 1,
      page_size: 20,
    });
    renderView();

    const next = await screen.findByRole('button', { name: /Next/i });
    fireEvent.click(next);

    expect(fetchEscalated).toHaveBeenLastCalledWith(2, 20);
  });
});
