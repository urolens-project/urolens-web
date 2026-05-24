/// <reference types="vitest/globals" />

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QueueAssignmentDashboard } from '../components/QueueAssignmentDashboard';
import { queueApi } from '../api/queueApi';
import type { MedTechWorkload, SpecimenResponse, QueueAssignResponse } from '../types';

vi.mock('../api/queueApi', () => ({
  queueApi: {
    getWorkloads: vi.fn(),
    getLabeledSpecimens: vi.fn(),
    assign: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const mockWorkloads: MedTechWorkload[] = [
  { medtech_id: 'mt-1', username: 'Alice Med', queue_count: 1 },
  { medtech_id: 'mt-2', username: 'Bob Tech', queue_count: 3 },
];

const mockSpecimens: SpecimenResponse[] = [
  { specimen_id: 'spec-1', sample_uid: 'SAM-000001', status: 'LABELED', received_at: '2026-05-20T10:00:00Z' },
];

const mockAssignResponse: QueueAssignResponse = {
  assignment_id: 'asgn-1',
  specimen_id: 'spec-1',
  medtech_id: 'mt-1',
  assigned_by: 'receptionist-1',
  assigned_at: '2026-05-23T12:00:00Z',
  status: 'ASSIGNED',
};

describe('QueueAssignmentDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    vi.mocked(queueApi.getWorkloads).mockResolvedValue(mockWorkloads);
    vi.mocked(queueApi.getLabeledSpecimens).mockResolvedValue(mockSpecimens);
    vi.mocked(queueApi.assign).mockResolvedValue(mockAssignResponse);
  });

  it('shows Assign button disabled when nothing is selected', async () => {
    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Alice Med')).toBeInTheDocument();
    });

    const assignButton = screen.getByRole('button', { name: /Assign Specimen/i });
    expect(assignButton).toBeDisabled();
  });

  it('shows Assign button disabled when only specimen is selected', async () => {
    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SAM-000001'));

    const assignButton = screen.getByRole('button', { name: /Assign Specimen/i });
    expect(assignButton).toBeDisabled();
  });

  it('shows Assign button disabled when only MedTech is selected', async () => {
    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Alice Med')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Alice Med'));

    const assignButton = screen.getByRole('button', { name: /Assign Specimen/i });
    expect(assignButton).toBeDisabled();
  });

  it('enables Assign button when both specimen and MedTech are selected', async () => {
    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SAM-000001'));
    fireEvent.click(screen.getByText('Alice Med'));

    const assignButton = screen.getByRole('button', { name: /Assign Specimen/i });
    expect(assignButton).toBeEnabled();
  });

  it('calls queueApi.assign with correct payload on Assign click', async () => {
    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SAM-000001'));
    fireEvent.click(screen.getByText('Alice Med'));

    fireEvent.click(screen.getByRole('button', { name: /Assign Specimen/i }));

    await waitFor(() => {
      expect(queueApi.assign).toHaveBeenCalledWith(
        expect.objectContaining({
          specimen_id: 'spec-1',
          medtech_id: 'mt-1',
        }),
        expect.anything(),
      );
    });
  });

  it('shows success message after successful assignment', async () => {
    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SAM-000001'));
    fireEvent.click(screen.getByText('Alice Med'));
    fireEvent.click(screen.getByRole('button', { name: /Assign Specimen/i }));

    await waitFor(() => {
      expect(screen.getByText('Specimen assigned successfully.')).toBeInTheDocument();
    });
  });

  it('shows SPECIMEN_NOT_FOUND error message', async () => {
    vi.mocked(queueApi.assign).mockRejectedValueOnce({
      response: { data: { error: { code: 'SPECIMEN_NOT_FOUND', message: 'Not found.' } } },
    });

    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SAM-000001'));
    fireEvent.click(screen.getByText('Alice Med'));
    fireEvent.click(screen.getByRole('button', { name: /Assign Specimen/i }));

    await waitFor(() => {
      expect(screen.getByText('Specimen not found.')).toBeInTheDocument();
    });
  });

  it('shows SPECIMEN_ALREADY_ASSIGNED error message', async () => {
    vi.mocked(queueApi.assign).mockRejectedValueOnce({
      response: { data: { error: { code: 'SPECIMEN_ALREADY_ASSIGNED', message: 'Already assigned.' } } },
    });

    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SAM-000001'));
    fireEvent.click(screen.getByText('Alice Med'));
    fireEvent.click(screen.getByRole('button', { name: /Assign Specimen/i }));

    await waitFor(() => {
      expect(screen.getByText('This specimen has already been assigned.')).toBeInTheDocument();
    });
  });

  it('shows generic error for unknown error codes', async () => {
    vi.mocked(queueApi.assign).mockRejectedValueOnce({
      response: { data: { error: { code: 'UNKNOWN', message: 'Unknown error.' } } },
    });

    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SAM-000001'));
    fireEvent.click(screen.getByText('Alice Med'));
    fireEvent.click(screen.getByRole('button', { name: /Assign Specimen/i }));

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });
});
