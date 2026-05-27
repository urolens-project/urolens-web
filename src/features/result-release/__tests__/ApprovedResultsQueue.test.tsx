/// <reference types="vitest/globals" />

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApprovedResultsQueue } from '../components/ApprovedResultsQueue';
import { releaseApi } from '../api/releaseApi';
import type { ApprovedResultsResponse } from '../types';

vi.mock('../api/releaseApi', () => ({
  releaseApi: {
    getApprovedResults: vi.fn(),
    releaseResult: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={makeClient()}>{children}</QueryClientProvider>;
}

const mockResponse: ApprovedResultsResponse = {
  data: [
    {
      result_id: 'result-001',
      patient_name: 'Maria Santos',
      sample_uid: 'SMP-2026-00001',
      test_type: 'URINALYSIS',
      approved_at: '2026-05-26T09:00:00Z',
    },
    {
      result_id: 'result-002',
      patient_name: 'Pedro Reyes',
      sample_uid: 'SMP-2026-00002',
      test_type: 'CBC',
      approved_at: '2026-05-26T09:30:00Z',
    },
  ],
  pagination: { next_cursor: null, has_more: false },
};

describe('ApprovedResultsQueue', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders table rows from query data', async () => {
    vi.mocked(releaseApi.getApprovedResults).mockResolvedValue(mockResponse);

    render(<ApprovedResultsQueue />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('Pedro Reyes')).toBeInTheDocument();
    });

    expect(screen.getByText('SMP-2026-00001')).toBeInTheDocument();
    expect(screen.getByText('URINALYSIS')).toBeInTheDocument();
  });

  it('shows empty state when there are no results', async () => {
    vi.mocked(releaseApi.getApprovedResults).mockResolvedValue({
      data: [],
      pagination: { next_cursor: null, has_more: false },
    });

    render(<ApprovedResultsQueue />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('No approved results awaiting release.')).toBeInTheDocument();
    });
  });

  it('opens the confirmation modal when Release is clicked', async () => {
    vi.mocked(releaseApi.getApprovedResults).mockResolvedValue(mockResponse);

    render(<ApprovedResultsQueue />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });

    const releaseButtons = screen.getAllByRole('button', { name: /Release result for/i });
    fireEvent.click(releaseButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Release Result')).toBeInTheDocument();
    });
  });

  it('modal closes without submitting when Cancel is clicked', async () => {
    vi.mocked(releaseApi.getApprovedResults).mockResolvedValue(mockResponse);

    render(<ApprovedResultsQueue />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Maria Santos')).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('button', { name: /Release result for/i })[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
