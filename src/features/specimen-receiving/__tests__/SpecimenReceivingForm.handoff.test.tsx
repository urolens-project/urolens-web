/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import SpecimenReceivingForm from '../components/SpecimenReceivingForm';
import { specimenReceivingApi } from '../api/specimenReceivingApi';

vi.mock('../api/specimenReceivingApi', () => ({
  specimenReceivingApi: {
    searchLabRequests: vi.fn(),
    receiveSpecimen: vi.fn(),
  },
}));

function renderForm(state?: unknown) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[{ pathname: '/intake/receive', state }]}>
          <SpecimenReceivingForm />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

describe('SpecimenReceivingForm lab request hand-off', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(specimenReceivingApi.searchLabRequests).mockResolvedValue([]);
  });

  it('starts with the request just submitted already selected', () => {
    renderForm({
      labRequest: {
        lab_request_id: 'lr-1',
        request_uid: 'REQ-20260924-12345',
        test_type: 'URINALYSIS_-_ROUTINE',
        physician_name: 'dr.reyes',
        patient_id: 'p-1',
      },
    });

    expect(screen.getByText('REQ-20260924-12345')).toBeInTheDocument();
    expect(screen.getByText('Dr. dr.reyes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm Specimen Receipt/i })).toBeEnabled();
  });

  it('starts with nothing selected when opened directly', () => {
    renderForm();

    expect(screen.getByText('No request selected yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm Specimen Receipt/i })).toBeDisabled();
  });
});
