/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import LabRequestForm from '../components/LabRequestForm';
import { labRequestApi } from '../api/labRequestApi';

vi.mock('../api/labRequestApi', () => ({
  labRequestApi: {
    searchPatients: vi.fn(),
    getPhysicians: vi.fn(),
    createLabRequest: vi.fn(),
  },
}));

function renderForm(state?: unknown) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[{ pathname: '/intake/request', state }]}>
          <LabRequestForm />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

describe('LabRequestForm patient pre-selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(labRequestApi.getPhysicians).mockResolvedValue([]);
    vi.mocked(labRequestApi.searchPatients).mockResolvedValue([]);
  });

  it('starts with the patient just registered already selected', () => {
    renderForm({ patient: { patient_id: 'p-1', patient_uid: 'PAT-000042' } });

    expect(screen.getByText('PAT-000042')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument();
  });

  it('starts with no patient when opened directly', () => {
    renderForm();

    expect(screen.getByText('No patient selected yet')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Change' })).not.toBeInTheDocument();
  });
});
