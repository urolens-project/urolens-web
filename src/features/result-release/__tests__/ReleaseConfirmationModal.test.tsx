/// <reference types="vitest/globals" />

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReleaseConfirmationModal } from '../components/ReleaseConfirmationModal';
import { releaseApi } from '../api/releaseApi';
import type { ApprovedResultItem } from '../types';

vi.mock('../api/releaseApi', () => ({
  releaseApi: {
    releaseResult: vi.fn(),
    getApprovedResults: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function makeClient() {
  return new QueryClient({ defaultOptions: { mutations: { retry: false } } });
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={makeClient()}>{children}</QueryClientProvider>;
}

const mockResult: ApprovedResultItem = {
  result_id: 'result-123',
  patient_name: 'Juan Dela Cruz',
  sample_uid: 'SMP-2026-00001',
  test_type: 'URINALYSIS',
  approved_at: '2026-05-26T10:00:00Z',
};

describe('ReleaseConfirmationModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders patient details', () => {
    render(
      <ReleaseConfirmationModal result={mockResult} onClose={vi.fn()} />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Juan Dela Cruz')).toBeInTheDocument();
    expect(screen.getByText('SMP-2026-00001')).toBeInTheDocument();
    expect(screen.getByText('URINALYSIS')).toBeInTheDocument();
  });

  it('Confirm Release button is disabled when no method selected', () => {
    render(
      <ReleaseConfirmationModal result={mockResult} onClose={vi.fn()} />,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('button', { name: /Confirm Release/i })).toBeDisabled();
  });

  it('Confirm Release button becomes enabled after selecting a method', () => {
    render(
      <ReleaseConfirmationModal result={mockResult} onClose={vi.fn()} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByLabelText('Physical Printout'));
    expect(screen.getByRole('button', { name: /Confirm Release/i })).toBeEnabled();
  });

  it('calls releaseApi.releaseResult with correct args on confirm', async () => {
    vi.mocked(releaseApi.releaseResult).mockResolvedValueOnce({
      release_id: 'rel-1',
      result_id: 'result-123',
      released_by: 'user-1',
      release_method: 'PHYSICAL',
      released_at: '2026-05-26T10:01:00Z',
    });

    render(
      <ReleaseConfirmationModal result={mockResult} onClose={vi.fn()} />,
      { wrapper: Wrapper },
    );

    fireEvent.click(screen.getByLabelText('Physical Printout'));
    fireEvent.click(screen.getByRole('button', { name: /Confirm Release/i }));

    await waitFor(() => {
      expect(releaseApi.releaseResult).toHaveBeenCalledWith('result-123', 'PHYSICAL');
    });
  });

  it('calls onClose after successful release', async () => {
    vi.mocked(releaseApi.releaseResult).mockResolvedValueOnce({
      release_id: 'rel-1',
      result_id: 'result-123',
      released_by: 'user-1',
      release_method: 'DIGITAL',
      released_at: '2026-05-26T10:01:00Z',
    });

    const onClose = vi.fn();
    render(
      <ReleaseConfirmationModal result={mockResult} onClose={onClose} />,
      { wrapper: Wrapper },
    );

    fireEvent.click(screen.getByLabelText('Digital Delivery'));
    fireEvent.click(screen.getByRole('button', { name: /Confirm Release/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it('Cancel button closes modal without calling mutation', () => {
    const onClose = vi.fn();
    render(
      <ReleaseConfirmationModal result={mockResult} onClose={onClose} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(releaseApi.releaseResult).not.toHaveBeenCalled();
  });
});
