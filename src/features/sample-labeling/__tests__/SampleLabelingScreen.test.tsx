/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import SampleLabelingScreen from '../components/SampleLabelingScreen';
import { sampleLabelingApi } from '../api/sampleLabelingApi';
import { formatTestType, getLabelErrorMessage } from '../utils';

vi.mock('../api/sampleLabelingApi', () => ({
  sampleLabelingApi: {
    searchReceivedSpecimens: vi.fn(),
    generateLabel: vi.fn(),
    printLabel: vi.fn(),
    confirmAffixed: vi.fn(),
  },
}));

const specimen = {
  specimen_id: 'sp-1',
  sample_uid: 'SMP-20260924-00001',
  patient_uid: 'PAT-000042',
  test_type: 'URINALYSIS_-_ROUTINE',
  status: 'RECEIVED',
  label_count: 0,
};

const preview = {
  patient_name: 'Juan Dela Cruz',
  patient_uid: 'PAT-000042',
  sample_uid: 'SMP-20260924-00001',
  test_type: 'URINALYSIS_-_ROUTINE',
  date: '2026-09-24 10:00:00',
};

function QueueProbe() {
  const location = useLocation();
  return <div data-testid="queue-state">{JSON.stringify(location.state)}</div>;
}

function renderScreen(state?: unknown) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[{ pathname: '/intake/label', state }]}>
          <Routes>
            <Route path="/intake/label" element={<SampleLabelingScreen />} />
            <Route path="/intake/queue" element={<QueueProbe />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

const handoff = {
  specimen: {
    specimen_id: 'sp-1',
    sample_uid: 'SMP-20260924-00001',
    lab_request_id: 'lr-1',
    request_uid: 'REQ-1',
    test_type: 'URINALYSIS_-_ROUTINE',
  },
};

describe('SampleLabelingScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sampleLabelingApi.searchReceivedSpecimens).mockResolvedValue([specimen]);
    vi.mocked(sampleLabelingApi.generateLabel).mockResolvedValue({
      success: true,
      label_id: 'l-1',
      print_job_id: null,
      label_count: 1,
      preview,
    });
  });

  it('starts with the specimen just received already selected', async () => {
    renderScreen(handoff);

    expect(await screen.findByRole('button', { name: 'Change' })).toBeInTheDocument();
    expect(screen.getAllByText('PAT-000042').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Generate Label/i })).toBeEnabled();
    expect(sampleLabelingApi.searchReceivedSpecimens).toHaveBeenCalledWith('SMP-20260924-00001');
  });

  it('starts with nothing selected when opened directly', () => {
    renderScreen();
    expect(screen.getByText('No specimen selected yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Label/i })).toBeDisabled();
  });

  it('lets the receptionist change the specimen picked up from the hand-off', async () => {
    renderScreen(handoff);
    fireEvent.click(await screen.findByRole('button', { name: 'Change' }));
    expect(screen.getByText('No specimen selected yet')).toBeInTheDocument();
  });

  it('shows a readable message when the specimen is not ready for a label', async () => {
    vi.mocked(sampleLabelingApi.generateLabel).mockRejectedValueOnce({
      message: 'Request failed with status code 422',
      response: { data: { error: { code: 'SPECIMEN_NOT_RECEIVED' } } },
    });
    renderScreen(handoff);
    await screen.findByRole('button', { name: 'Change' });
    fireEvent.click(screen.getByRole('button', { name: /Generate Label/i }));

    expect(await screen.findByText(/not been received yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/status code/i)).not.toBeInTheDocument();
  });

  it('does not send the offline flag once the label has been generated', async () => {
    vi.mocked(sampleLabelingApi.confirmAffixed).mockResolvedValue({
      success: true,
      message: 'ok',
      updated_status: 'LABELED',
      offline_override_used: false,
    });
    renderScreen(handoff);
    await screen.findByRole('button', { name: 'Change' });
    fireEvent.click(screen.getByLabelText(/Printer Offline/i));
    fireEvent.click(screen.getByRole('button', { name: /Generate Label/i }));
    await screen.findByText(/Label Preview/i);
    fireEvent.click(screen.getByRole('button', { name: /Confirm Label Affixed/i }));

    await screen.findByText('Label Confirmed');
    expect(sampleLabelingApi.confirmAffixed).toHaveBeenCalledWith('sp-1', false);
  });
});

describe('SampleLabelingScreen additions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sampleLabelingApi.searchReceivedSpecimens).mockResolvedValue([specimen]);
    vi.mocked(sampleLabelingApi.generateLabel).mockResolvedValue({
      success: true,
      label_id: 'l-1',
      print_job_id: null,
      label_count: 3,
      preview,
    });
    vi.mocked(sampleLabelingApi.printLabel).mockResolvedValue({
      success: true,
      print_job_id: 'j-1',
      label_id: 'l-1',
      status: 'SENT',
    });
    vi.mocked(sampleLabelingApi.confirmAffixed).mockResolvedValue({
      success: true,
      message: 'ok',
      updated_status: 'LABELED',
      offline_override_used: false,
    });
  });

  it('sends a print job before triggering the browser print dialog', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    renderScreen(handoff);
    await screen.findByRole('button', { name: 'Change' });
    fireEvent.click(screen.getByRole('button', { name: /Generate Label/i }));

    await screen.findByText(/Label Preview/i);
    expect(screen.getByText('Juan Dela Cruz')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Print Label/i }));

    await waitFor(() => expect(printSpy).toHaveBeenCalled());
    expect(sampleLabelingApi.printLabel).toHaveBeenCalledWith('sp-1');
    printSpy.mockRestore();
  });

  it('shows a readable message when the label cannot be printed yet', async () => {
    vi.mocked(sampleLabelingApi.printLabel).mockRejectedValueOnce({
      message: 'Request failed with status code 400',
      response: { data: { error: { code: 'LABEL_NOT_FOUND' } } },
    });
    renderScreen(handoff);
    await screen.findByRole('button', { name: 'Change' });
    fireEvent.click(screen.getByRole('button', { name: /Generate Label/i }));
    await screen.findByText(/Label Preview/i);
    fireEvent.click(screen.getByRole('button', { name: /Print Label/i }));

    expect(await screen.findByText(/generate the label first/i)).toBeInTheDocument();
  });

  it('shows the regenerate count the server reports', async () => {
    renderScreen(handoff);
    await screen.findByRole('button', { name: 'Change' });
    fireEvent.click(screen.getByRole('button', { name: /Generate Label/i }));

    expect(await screen.findByText(/Regenerated ×2/)).toBeInTheDocument();
  });

  it('carries the labeled specimen into Queue Assignment', async () => {
    renderScreen(handoff);
    await screen.findByRole('button', { name: 'Change' });
    fireEvent.click(screen.getByRole('button', { name: /Generate Label/i }));
    await screen.findByText(/Label Preview/i);
    fireEvent.click(screen.getByRole('button', { name: /Confirm Label Affixed/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Assign to Queue/i }));

    expect(JSON.parse((await screen.findByTestId('queue-state')).textContent ?? '{}')).toEqual({
      specimen: {
        specimen_id: 'sp-1',
        sample_uid: 'SMP-20260924-00001',
        patient_uid: 'PAT-000042',
        test_type: 'URINALYSIS_-_ROUTINE',
      },
    });
  });
});

describe('label helpers', () => {
  it('formats a test type for display and tolerates a missing one', () => {
    expect(formatTestType('URINALYSIS_-_ROUTINE')).toBe('URINALYSIS - ROUTINE');
    expect(formatTestType(null)).toBe('Not specified');
  });

  it('maps server codes, lost connections and unknown errors', () => {
    expect(
      getLabelErrorMessage({ response: { data: { error: { code: 'LABEL_NOT_FOUND' } } } }),
    ).toMatch(/generate the label first/i);
    expect(getLabelErrorMessage({ message: 'Network Error' })).toMatch(/could not reach/i);
    expect(getLabelErrorMessage({ response: { data: { error: { code: 'X' } } } })).toBe(
      'Something went wrong. Please try again.',
    );
  });
});
