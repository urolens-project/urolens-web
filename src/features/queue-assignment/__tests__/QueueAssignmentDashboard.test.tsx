/// <reference types="vitest/globals" />

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QueueAssignmentDashboard } from '../components/QueueAssignmentDashboard';
import { queueApi } from '../api/queueApi';
import { toast } from 'sonner';
import type { MedTechWorkloadItem, PendingSpecimenItem, QueueAssignmentResponse } from '../types';

vi.mock('../api/queueApi', () => ({
  queueApi: {
    getPendingSpecimens: vi.fn(),
    getMedTechWorkloads: vi.fn(),
    assignSpecimen: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={makeQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

const mockWorkloads: MedTechWorkloadItem[] = [
  { user_id: 'mt-1', full_name: 'Alice Med', active_count: 1 },
  { user_id: 'mt-2', full_name: 'Bob Tech', active_count: 3 },
];

const mockSpecimens: PendingSpecimenItem[] = [
  {
    specimen_id: 'spec-1',
    sample_uid: 'SAM-000001',
    patient_uid: 'PAT-00001',
    test_type: 'Urinalysis',
    received_at: '2026-05-20T10:00:00Z',
    status: 'LABELED',
  },
];

const mockAssignResponse: QueueAssignmentResponse = {
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
    vi.mocked(queueApi.getPendingSpecimens).mockResolvedValue(mockSpecimens);
    vi.mocked(queueApi.getMedTechWorkloads).mockResolvedValue(mockWorkloads);
    vi.mocked(queueApi.assignSpecimen).mockResolvedValue(mockAssignResponse);
  });

  it('shows Assign button disabled when nothing is selected', async () => {
    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Alice Med')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Assign Specimen/i })).toBeDisabled();
  });

  it('shows Assign button disabled when only specimen is selected', async () => {
    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SAM-000001'));

    expect(screen.getByRole('button', { name: /Assign Specimen/i })).toBeDisabled();
  });

  it('shows Assign button disabled when only MedTech is selected', async () => {
    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Alice Med')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Alice Med'));

    expect(screen.getByRole('button', { name: /Assign Specimen/i })).toBeDisabled();
  });

  it('enables Assign button when both specimen and MedTech are selected', async () => {
    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SAM-000001'));
    fireEvent.click(screen.getByText('Alice Med'));

    expect(screen.getByRole('button', { name: /Assign Specimen/i })).toBeEnabled();
  });

  it('opens confirmation modal when Assign button is clicked', async () => {
    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SAM-000001'));
    fireEvent.click(screen.getByText('Alice Med'));
    fireEvent.click(screen.getByRole('button', { name: /Assign Specimen/i }));

    expect(screen.getByRole('heading', { name: 'Confirm Assignment' })).toBeInTheDocument();
    expect(screen.getByText('PAT-00001 · Urinalysis')).toBeInTheDocument();
  });

  it('calls queueApi.assignSpecimen with correct payload on modal confirm', async () => {
    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SAM-000001'));
    fireEvent.click(screen.getByText('Alice Med'));
    fireEvent.click(screen.getByRole('button', { name: /Assign Specimen/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Confirm Assignment' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Confirm Assignment/i }));

    await waitFor(() => {
      expect(queueApi.assignSpecimen).toHaveBeenCalledWith({
        specimen_id: 'spec-1',
        medtech_id: 'mt-1',
      });
    });
  });

  it('calls toast.success after successful assignment', async () => {
    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SAM-000001'));
    fireEvent.click(screen.getByText('Alice Med'));
    fireEvent.click(screen.getByRole('button', { name: /Assign Specimen/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Confirm Assignment' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Confirm Assignment/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Specimen assigned successfully.');
    });
  });

  it('closes modal and clears selection after successful assignment', async () => {
    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SAM-000001'));
    fireEvent.click(screen.getByText('Alice Med'));
    fireEvent.click(screen.getByRole('button', { name: /Assign Specimen/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Confirm Assignment' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Confirm Assignment/i }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Confirm Assignment' })).not.toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Assign Specimen/i })).toBeDisabled();
  });

  it('calls toast.error with SPECIMEN_NOT_FOUND message', async () => {
    vi.mocked(queueApi.assignSpecimen).mockRejectedValueOnce({
      response: { data: { error: { code: 'SPECIMEN_NOT_FOUND' } } },
    });

    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SAM-000001'));
    fireEvent.click(screen.getByText('Alice Med'));
    fireEvent.click(screen.getByRole('button', { name: /Assign Specimen/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Confirm Assignment' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Confirm Assignment/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Specimen not found.');
    });
  });

  it('calls toast.error with SPECIMEN_ALREADY_ASSIGNED message', async () => {
    vi.mocked(queueApi.assignSpecimen).mockRejectedValueOnce({
      response: { data: { error: { code: 'SPECIMEN_ALREADY_ASSIGNED' } } },
    });

    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SAM-000001'));
    fireEvent.click(screen.getByText('Alice Med'));
    fireEvent.click(screen.getByRole('button', { name: /Assign Specimen/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Confirm Assignment' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Confirm Assignment/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('This specimen has already been assigned.');
    });
  });

  it('calls toast.error with generic message for unknown error codes', async () => {
    vi.mocked(queueApi.assignSpecimen).mockRejectedValueOnce({
      response: { data: { error: { code: 'UNKNOWN_CODE' } } },
    });

    render(<QueueAssignmentDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('SAM-000001'));
    fireEvent.click(screen.getByText('Alice Med'));
    fireEvent.click(screen.getByRole('button', { name: /Assign Specimen/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Confirm Assignment' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Confirm Assignment/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to assign specimen. Please try again.');
    });
  });
});