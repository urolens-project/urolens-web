/// <reference types="vitest/globals" />

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QueueAssignmentDashboard } from '../components/QueueAssignmentDashboard';
import { queueApi } from '../api/queueApi';

vi.mock('../api/queueApi', () => ({
  queueApi: {
    getPendingSpecimens: vi.fn(),
    getMedTechWorkloads: vi.fn(),
    assignSpecimen: vi.fn(),
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const specimens = [
  {
    specimen_id: 'spec-1',
    sample_uid: 'SMP-000001',
    patient_name: 'Juan Dela Cruz',
    test_type: 'Urinalysis',
    received_at: '2026-05-20T10:00:00Z',
    status: 'LABELED',
  },
];
const workloads = [
  { user_id: 'mt-1', full_name: 'Alice Med', active_count: 1 },
  { user_id: 'mt-2', full_name: 'Bob Tech', active_count: 8 },
];

function renderDashboard(preselectedSpecimenId?: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <QueueAssignmentDashboard preselectedSpecimenId={preselectedSpecimenId} />
    </QueryClientProvider>,
  );
}

const assignButton = () => screen.getByRole('button', { name: /Assign Specimen/i });

describe('QueueAssignmentDashboard hand-off and stale selections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queueApi.getPendingSpecimens).mockResolvedValue(specimens);
    vi.mocked(queueApi.getMedTechWorkloads).mockResolvedValue(workloads);
  });

  it('has the just-labeled specimen already selected, so only a technologist is needed', async () => {
    renderDashboard('spec-1');
    await screen.findByText('SMP-000001');
    expect(assignButton()).toBeDisabled();

    screen.getByText('Alice Med').click();
    await waitFor(() => expect(assignButton()).toBeEnabled());
  });

  it('keeps Assign disabled when the preselected specimen is not in the pending list', async () => {
    renderDashboard('gone-specimen');
    await screen.findByText('SMP-000001');
    screen.getByText('Alice Med').click();

    expect(assignButton()).toBeDisabled();
  });

  it('labels each technologist as light, moderate or heavy in words', async () => {
    renderDashboard();
    expect(await screen.findByText('Light workload')).toBeInTheDocument();
    expect(screen.getByText('Heavy workload')).toBeInTheDocument();
  });

  it('shows the error screen with Try again only when a list has no data', async () => {
    vi.mocked(queueApi.getPendingSpecimens).mockRejectedValue(new Error('down'));
    renderDashboard();

    expect(await screen.findByText('Failed to load queue data')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  });
});
