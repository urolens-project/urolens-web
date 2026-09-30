/// <reference types="vitest/globals" />

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { PatientRegistrationForm } from '../components/PatientRegistrationForm';
import { patientApi } from '../api/patientApi';
import type { PatientResponse } from '../types';

vi.mock('../api/patientApi', () => ({
  patientApi: {
    create: vi.fn(),
    search: vi.fn(),
  },
}));

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderForm() {
  const queryClient = createQueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  return render(<PatientRegistrationForm />, { wrapper });
}

const mockSuccessResponse: PatientResponse = {
  patient_id: '1',
  patient_uid: 'PAT-000001',
  first_name: 'Juan',
  middle_name: '', // add this
  last_name: 'Dela Cruz',
  date_of_birth: '1990-01-01',
  sex: 'MALE', // add this
  contact_no: '',
  address: '',
  is_walkin: false,
  record_flag: '',
  created_at: '2026-01-01T00:00:00Z',
  portal_username: 'PAT-000001',
  portal_password: 'X7K9M2PQRT',
};

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/First Name/), {
    target: { value: 'Juan' },
  });
  fireEvent.change(screen.getByLabelText(/Last Name/), {
    target: { value: 'Dela Cruz' },
  });
  fireEvent.change(screen.getByLabelText(/Date of Birth/), {
    target: { value: '1990-01-01' },
  });
  fireEvent.change(screen.getByLabelText(/Sex/), {
    target: { value: 'MALE' },
  });
}

function checkAllConsents() {
  const checkboxes = screen.getAllByRole('checkbox');
  fireEvent.click(checkboxes[0]);
  fireEvent.click(checkboxes[1]);
  fireEvent.click(checkboxes[2]);
}

describe('PatientRegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the submit button enabled on an empty form so errors can explain what is missing', async () => {
    renderForm();

    const submitButton = screen.getByRole('button', { name: /Register Patient/i });
    expect(submitButton).toBeEnabled();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('First name is required.')).toBeInTheDocument();
      expect(screen.getByText('Last name is required.')).toBeInTheDocument();
      expect(screen.getByText('Date of birth is required.')).toBeInTheDocument();
      expect(screen.getByText('Sex is required.')).toBeInTheDocument();
      expect(screen.getAllByText('This consent is required.')).toHaveLength(3);
    });
    expect(patientApi.create).not.toHaveBeenCalled();
  });

  it('does not allow selecting today or a future date of birth', async () => {
    renderForm();
    const dobInput = screen.getByLabelText(/Date of Birth/);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    const yesterdayIso = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;
    expect(dobInput).toHaveAttribute('max', yesterdayIso);

    fillRequiredFields();
    checkAllConsents();
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    fireEvent.change(dobInput, { target: { value: todayIso } });
    fireEvent.click(screen.getByRole('button', { name: /Register Patient/i }));

    await waitFor(() => {
      expect(screen.getByText('Date of birth must be a past date.')).toBeInTheDocument();
    });
    expect(patientApi.create).not.toHaveBeenCalled();
  });

  it('carries the registered patient into the lab request step', async () => {
    vi.mocked(patientApi.create).mockResolvedValueOnce(mockSuccessResponse);

    function LocationProbe() {
      const location = useLocation();
      return <div data-testid="probe">{JSON.stringify(location.state)}</div>;
    }
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={['/intake/register']}>
          <Routes>
            <Route path="/intake/register" element={children} />
            <Route path="/intake/request" element={<LocationProbe />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    render(<PatientRegistrationForm />, { wrapper });

    fillRequiredFields();
    checkAllConsents();
    fireEvent.click(screen.getByRole('button', { name: /Register Patient/i }));

    await waitFor(() => {
      expect(screen.getByText(/Patient UID: PAT-000001/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Next: Create Lab Request/i }));

    const state = JSON.parse((await screen.findByTestId('probe')).textContent ?? '{}');
    expect(state).toEqual({
      patient: {
        patient_id: '1',
        patient_uid: 'PAT-000001',
        portal_username: 'PAT-000001',
        portal_password: 'X7K9M2PQRT',
      },
    });
  });

  it('shows the one-time portal credentials on the success screen', async () => {
    vi.mocked(patientApi.create).mockResolvedValueOnce(mockSuccessResponse);
    renderForm();

    fillRequiredFields();
    checkAllConsents();
    fireEvent.click(screen.getByRole('button', { name: /Register Patient/i }));

    await waitFor(() => {
      expect(screen.getByText(/Patient UID: PAT-000001/)).toBeInTheDocument();
    });
    expect(screen.getByText('PAT-000001', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('X7K9M2PQRT')).toBeInTheDocument();
    expect(screen.getByText(/cannot be shown again/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields on submit', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/First Name/), {
      target: { value: 'Juan' },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/), {
      target: { value: 'Dela Cruz' },
    });
    checkAllConsents();

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(screen.getByText('Date of birth is required.')).toBeInTheDocument();
    });
  });

  it('shows consent errors when submitting with unchecked consents', async () => {
    renderForm();
    fillRequiredFields();

    const submitButton = screen.getByRole('button', { name: /Register Patient/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errors = screen.getAllByText('This consent is required.');
      expect(errors).toHaveLength(3);
    });
  });

  it('shows success banner with patient_uid on successful registration', async () => {
    vi.mocked(patientApi.create).mockResolvedValueOnce(mockSuccessResponse);

    renderForm();
    fillRequiredFields();
    checkAllConsents();

    const submitButton = screen.getByRole('button', { name: /Register Patient/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Patient Registered Successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/Patient UID: PAT-000001/)).toBeInTheDocument();
    });
  });

  it('shows duplicate patient error without resetting form', async () => {
    const duplicateError = {
      response: {
        data: {
          error: {
            code: 'DUPLICATE_PATIENT',
            message: 'A patient with this name already exists.',
          },
        },
      },
    };

    vi.mocked(patientApi.create).mockRejectedValueOnce(duplicateError);

    renderForm();
    fillRequiredFields();
    checkAllConsents();

    const submitButton = screen.getByRole('button', { name: /Register Patient/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('A patient with this name and date of birth already exists.'),
      ).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/First Name/)).toHaveValue('Juan');
    expect(screen.getByLabelText(/Last Name/)).toHaveValue('Dela Cruz');
  });

  it('shows generic error on unexpected API failure', async () => {
    vi.mocked(patientApi.create).mockRejectedValueOnce(new Error('Network error'));

    renderForm();
    fillRequiredFields();
    checkAllConsents();

    const submitButton = screen.getByRole('button', { name: /Register Patient/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows date-of-birth validation error for future dates', async () => {
    renderForm();
    fillRequiredFields();
    checkAllConsents();

    fireEvent.change(screen.getByLabelText(/Date of Birth/), {
      target: { value: '2099-01-01' },
    });

    const submitButton = screen.getByRole('button', { name: /Register Patient/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Date of birth must be a past date.')).toBeInTheDocument();
    });
  });

  it('resets form and shows success banner on successful submission', async () => {
    vi.mocked(patientApi.create).mockResolvedValueOnce(mockSuccessResponse);

    renderForm();
    fillRequiredFields();
    checkAllConsents();

    const submitButton = screen.getByRole('button', { name: /Register Patient/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Patient UID: PAT-000001/)).toBeInTheDocument();
    });

    const registerAnother = screen.getByRole('button', { name: /Register Another Patient/i });
    fireEvent.click(registerAnother);

    expect(screen.getByLabelText(/First Name/)).toHaveValue('');
    expect(screen.getByLabelText(/Last Name/)).toHaveValue('');
  });

  it('clears field validation error when user starts typing in that field', async () => {
    renderForm();
    fillRequiredFields();
    checkAllConsents();

    fireEvent.change(screen.getByLabelText(/First Name/), {
      target: { value: '' },
    });

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(screen.getByText('First name is required.')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/First Name/), {
      target: { value: 'Juan' },
    });

    await waitFor(() => {
      expect(screen.queryByText('First name is required.')).not.toBeInTheDocument();
    });
  });

  it('clears inline errors when user starts typing in a field with errors', async () => {
    renderForm();
    fillRequiredFields();
    checkAllConsents();

    fireEvent.change(screen.getByLabelText(/First Name/), {
      target: { value: '' },
    });

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(screen.getByText('First name is required.')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/First Name/), {
      target: { value: 'J' },
    });

    await waitFor(() => {
      expect(screen.queryByText('First name is required.')).not.toBeInTheDocument();
    });
  });
});
