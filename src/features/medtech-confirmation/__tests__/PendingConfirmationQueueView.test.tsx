/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { PendingConfirmationQueueView } from '../components/PendingConfirmationQueueView';
import { fetchMedtechPending } from '../api/medtechConfirmationApi';

vi.mock('../api/medtechConfirmationApi', () => ({
  fetchMedtechPending: vi.fn(),
  confirmResult: vi.fn(),
}));

function makeItem(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    result_id: 'r-1',
    specimen_id: 'e937971f-451e-4cb9-80dc-85deb9482a98',
    sample_uid: 'SMP-20261109-47580',
    patient_uid: 'PAT-000001',
    patient_name: '',
    patient_age: 36,
    patient_sex: 'MALE',
    status: 'PENDING_CONFIRM' as const,
    return_reason: null,
    ...overrides,
  };
}

function renderView() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PendingConfirmationQueueView />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('PendingConfirmationQueueView sample ID', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the human-facing sample ID, not the specimen UUID', async () => {
    vi.mocked(fetchMedtechPending).mockResolvedValue({
      items: [makeItem()],
      total: 1,
      page: 1,
      page_size: 20,
    });
    renderView();

    expect(await screen.findByText('SMP-20261109-47580')).toBeInTheDocument();
    expect(screen.queryByText('E937971F')).not.toBeInTheDocument();
  });

  it('falls back to the short specimen ID when the API sends no sample ID', async () => {
    vi.mocked(fetchMedtechPending).mockResolvedValue({
      items: [makeItem({ sample_uid: null })],
      total: 1,
      page: 1,
      page_size: 20,
    });
    renderView();

    expect(await screen.findByText('E937971F')).toBeInTheDocument();
  });
});
