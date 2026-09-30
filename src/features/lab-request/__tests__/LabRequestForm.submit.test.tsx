/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import LabRequestForm from '../components/LabRequestForm';
import { labRequestApi } from '../api/labRequestApi';

vi.mock('../api/labRequestApi', () => ({
  labRequestApi: {
    searchPatients: vi.fn(),
    getPhysicians: vi.fn(),
    createLabRequest: vi.fn(),
  },
}));

const createdRequest = {
  lab_request_id: 'lr-1',
  request_uid: 'REQ-20260924-12345',
  patient_id: 'p-1',
  physician_id: 'ph-1',
  physician_name: 'dr.reyes',
  test_type: 'URINALYSIS_-_ROUTINE',
  clinical_notes: null,
  special_instructions: null,
  status: 'PENDING_SAMPLE',
  created_at: '2026-09-24T00:00:00Z',
};

function ReceiveProbe() {
  const location = useLocation();
  return <div data-testid="receive-state">{JSON.stringify(location.state)}</div>;
}

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/intake/request']}>
          <Routes>
            <Route path="/intake/request" element={<LabRequestForm />} />
            <Route path="/intake/receive" element={<ReceiveProbe />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

async function selectPatientAndPhysician() {
  fireEvent.change(screen.getByPlaceholderText(/Search by Patient ID/i), {
    target: { value: 'PAT-000042' },
  });
  fireEvent.click(await screen.findByRole('button', { name: /PAT-000042/ }));
  fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'ph-1' } });
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }));
}

describe('LabRequestForm submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(labRequestApi.getPhysicians).mockResolvedValue([
      { user_id: 'ph-1', username: 'dr.reyes' },
    ]);
    vi.mocked(labRequestApi.searchPatients).mockResolvedValue([
      { patient_id: 'p-1', patient_uid: 'PAT-000042' },
    ]);
    vi.mocked(labRequestApi.createLabRequest).mockResolvedValue(createdRequest);
  });

  it('shows the selected patient in the search field', async () => {
    renderForm();
    await screen.findByRole('option', { name: 'dr.reyes' });
    await selectPatientAndPhysician();

    expect(screen.getByPlaceholderText(/Search by Patient ID/i)).toHaveValue('PAT-000042');
  });

  it('sends no notes at all when the receptionist typed none', async () => {
    renderForm();
    await screen.findByRole('option', { name: 'dr.reyes' });
    await selectPatientAndPhysician();
    submit();

    await screen.findByText('Lab Request Submitted');
    const payload = vi.mocked(labRequestApi.createLabRequest).mock.calls[0][0];
    expect(payload.clinical_notes).toBeUndefined();
    expect(payload.special_instructions).toBeUndefined();
    expect(payload.patient_id).toBe('p-1');
    expect(payload.physician_id).toBe('ph-1');
  });

  it('sends clinical notes and special instructions as separate fields', async () => {
    renderForm();
    await screen.findByRole('option', { name: 'dr.reyes' });
    await selectPatientAndPhysician();
    fireEvent.change(screen.getByPlaceholderText(/Relevant symptoms/i), {
      target: { value: 'Dysuria for 3 days' },
    });
    fireEvent.change(screen.getByPlaceholderText(/keep refrigerated/i), {
      target: { value: 'STAT' },
    });
    submit();

    await screen.findByText('Lab Request Submitted');
    const payload = vi.mocked(labRequestApi.createLabRequest).mock.calls[0][0];
    expect(payload.clinical_notes).toBe('Dysuria for 3 days');
    expect(payload.special_instructions).toBe('STAT');
  });

  it('shows a readable message and keeps the entries when the server rejects the request', async () => {
    vi.mocked(labRequestApi.createLabRequest).mockRejectedValueOnce({
      response: { data: { error: { code: 'PATIENT_NOT_FOUND' } } },
    });
    renderForm();
    await screen.findByRole('option', { name: 'dr.reyes' });
    await selectPatientAndPhysician();
    submit();

    expect(await screen.findByText(/could not be found/i)).toBeInTheDocument();
    expect(screen.queryByText(/status code/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by Patient ID/i)).toHaveValue('PAT-000042');
  });

  it('carries the submitted request into the Receive Specimen step', async () => {
    renderForm();
    await screen.findByRole('option', { name: 'dr.reyes' });
    await selectPatientAndPhysician();
    submit();

    fireEvent.click(await screen.findByRole('button', { name: /Next: Receive Specimen/i }));

    await waitFor(() => {
      expect(screen.getByTestId('receive-state')).toBeInTheDocument();
    });
    expect(JSON.parse(screen.getByTestId('receive-state').textContent ?? '{}')).toEqual({
      labRequest: {
        lab_request_id: 'lr-1',
        request_uid: 'REQ-20260924-12345',
        test_type: 'URINALYSIS_-_ROUTINE',
        physician_name: 'dr.reyes',
        patient_id: 'p-1',
      },
    });
  });
});
