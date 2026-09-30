/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import SpecimenReceivingForm from '../components/SpecimenReceivingForm';
import { specimenReceivingApi } from '../api/specimenReceivingApi';
import { getReceiveErrorMessage } from '../utils';

vi.mock('../api/specimenReceivingApi', () => ({
  specimenReceivingApi: {
    searchLabRequests: vi.fn(),
    receiveSpecimen: vi.fn(),
  },
}));

const handedOff = {
  labRequest: {
    lab_request_id: 'lr-1',
    request_uid: 'REQ-20260924-12345',
    test_type: 'URINALYSIS_-_ROUTINE',
    physician_name: 'dr.reyes',
    patient_id: 'p-1',
    patient_uid: 'PAT-000042',
    patient_name: 'Juan Dela Cruz',
  },
};

function LabelProbe() {
  const location = useLocation();
  return <div data-testid="label-state">{JSON.stringify(location.state)}</div>;
}

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[{ pathname: '/intake/receive', state: handedOff }]}>
          <Routes>
            <Route path="/intake/receive" element={<SpecimenReceivingForm />} />
            <Route path="/intake/label" element={<LabelProbe />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

describe('SpecimenReceivingForm receiving', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(specimenReceivingApi.searchLabRequests).mockResolvedValue([]);
  });

  it('shows the patient name and UID for the label check when the request carries them', () => {
    renderForm();
    expect(screen.getByText('Juan Dela Cruz')).toBeInTheDocument();
    expect(screen.getByText('PAT-000042')).toBeInTheDocument();
  });

  it('shows a readable message instead of the raw server error', async () => {
    vi.mocked(specimenReceivingApi.receiveSpecimen).mockRejectedValueOnce({
      message: 'Request failed with status code 404',
      response: { data: { error: { code: 'LAB_REQUEST_NOT_FOUND' } } },
    });
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /Confirm Specimen Receipt/i }));

    expect(await screen.findByText(/could not be found/i)).toBeInTheDocument();
    expect(screen.queryByText(/status code/i)).not.toBeInTheDocument();
  });

  it('ticks the checklist again after Clear Form', () => {
    renderForm();
    const volume = screen.getByLabelText(/Adequate Volume/i);
    fireEvent.click(volume);
    expect(volume).not.toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: 'Clear Form' }));
    expect(screen.getByLabelText(/Adequate Volume/i)).toBeChecked();
  });

  it('carries the received specimen into Sample Labeling', async () => {
    vi.mocked(specimenReceivingApi.receiveSpecimen).mockResolvedValueOnce({
      success: true,
      specimen_id: 'sp-1',
      sample_uid: 'SMP-20260924-00001',
      status: 'RECEIVED',
      message: 'ok',
      patient_uid: 'PAT-000042',
    });
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /Confirm Specimen Receipt/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Continue to Labeling/i }));

    await waitFor(() => expect(screen.getByTestId('label-state')).toBeInTheDocument());
    expect(JSON.parse(screen.getByTestId('label-state').textContent ?? '{}')).toEqual({
      specimen: {
        specimen_id: 'sp-1',
        sample_uid: 'SMP-20260924-00001',
        lab_request_id: 'lr-1',
        request_uid: 'REQ-20260924-12345',
        test_type: 'URINALYSIS_-_ROUTINE',
        patient_uid: 'PAT-000042',
      },
    });
  });
});

describe('getReceiveErrorMessage', () => {
  it('explains a missing rejection reason', () => {
    expect(
      getReceiveErrorMessage({
        response: { data: { error: { code: 'REJECTION_REASON_REQUIRED' } } },
      }),
    ).toMatch(/select a reason/i);
  });

  it('reports a lost connection when there was no response', () => {
    expect(getReceiveErrorMessage({ message: 'Network Error' })).toMatch(/could not reach/i);
  });

  it('falls back to a generic message for unknown codes', () => {
    expect(getReceiveErrorMessage({ response: { data: { error: { code: 'NOPE' } } } })).toBe(
      'Something went wrong. Please try again.',
    );
  });
});
