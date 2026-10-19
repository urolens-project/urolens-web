/// <reference types="vitest/globals" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PatientLoginPage from '../components/PatientLoginPage';

vi.mock('../hooks/usePatientLogin', () => ({
  usePatientLogin: vi.fn(),
}));

import { usePatientLogin } from '../hooks/usePatientLogin';

const mockMutate = vi.fn();

function setupMutation(isPending = false) {
  vi.mocked(usePatientLogin).mockReturnValue({
    mutate: mockMutate,
    isPending,
    isError: false,
    isSuccess: false,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    data: undefined,
    error: null,
    status: 'idle',
    failureCount: 0,
    failureReason: null,
    isIdle: !isPending,
    isPaused: false,
    variables: undefined,
    submittedAt: undefined,
    context: undefined,
  } as unknown as ReturnType<typeof usePatientLogin>);
}

beforeEach(() => {
  vi.clearAllMocks();
  setupMutation();
});

describe('PatientLoginPage', () => {
  it('renders Patient ID and Password fields', () => {
    render(
      <MemoryRouter>
        <PatientLoginPage />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Patient ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view my results/i })).toBeInTheDocument();
  });

  it('renders the portal heading', () => {
    render(
      <MemoryRouter>
        <PatientLoginPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /urolens patient portal/i })).toBeInTheDocument();
  });

  it('shows field-level validation errors on empty submit', async () => {
    render(
      <MemoryRouter>
        <PatientLoginPage />
      </MemoryRouter>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /view my results/i }));

    expect(screen.getByText('Patient ID is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('clears field error when user types in Patient ID', async () => {
    render(
      <MemoryRouter>
        <PatientLoginPage />
      </MemoryRouter>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /view my results/i }));
    expect(screen.getByText('Patient ID is required.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Patient ID'), 'PAT-001');
    expect(screen.queryByText('Patient ID is required.')).not.toBeInTheDocument();
  });

  it('calls mutate with credentials on valid submit', async () => {
    render(
      <MemoryRouter>
        <PatientLoginPage />
      </MemoryRouter>,
    );
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Patient ID'), 'PAT-001');
    await user.type(screen.getByLabelText('Password'), 'SANTOS01011990');
    await user.click(screen.getByRole('button', { name: /view my results/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      { patient_uid: 'PAT-001', password: 'SANTOS01011990' },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });

  it('trims whitespace from Patient ID before submitting', async () => {
    render(
      <MemoryRouter>
        <PatientLoginPage />
      </MemoryRouter>,
    );
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Patient ID'), '  PAT-001  ');
    await user.type(screen.getByLabelText('Password'), 'SANTOS01011990');
    await user.click(screen.getByRole('button', { name: /view my results/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      { patient_uid: 'PAT-001', password: 'SANTOS01011990' },
      expect.anything(),
    );
  });

  it('disables the submit button while submitting', () => {
    setupMutation(true);
    render(
      <MemoryRouter>
        <PatientLoginPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /verifying/i })).toBeDisabled();
  });

  it('displays INVALID_CREDENTIALS error message', async () => {
    render(
      <MemoryRouter>
        <PatientLoginPage />
      </MemoryRouter>,
    );
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Patient ID'), 'PAT-001');
    await user.type(screen.getByLabelText('Password'), 'WRONG01011990');

    mockMutate.mockImplementation(
      (_vars: unknown, options: { onError?: (error: unknown) => void }) => {
        options.onError?.({
          response: { data: { error: { code: 'INVALID_CREDENTIALS' } } },
        });
      },
    );

    await user.click(screen.getByRole('button', { name: /view my results/i }));
    await waitFor(() => {
      expect(
        screen.getByText('Patient ID or password is incorrect. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  it('displays ACCOUNT_LOCKED error message', async () => {
    render(
      <MemoryRouter>
        <PatientLoginPage />
      </MemoryRouter>,
    );
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Patient ID'), 'PAT-001');
    await user.type(screen.getByLabelText('Password'), 'SANTOS01011990');

    mockMutate.mockImplementation(
      (_vars: unknown, options: { onError?: (error: unknown) => void }) => {
        options.onError?.({
          response: { data: { error: { code: 'ACCOUNT_LOCKED' } } },
        });
      },
    );

    await user.click(screen.getByRole('button', { name: /view my results/i }));
    await waitFor(() => {
      expect(
        screen.getByText('Your account has been locked. Please contact the laboratory.'),
      ).toBeInTheDocument();
    });
  });

  it('displays generic error for unknown codes', async () => {
    render(
      <MemoryRouter>
        <PatientLoginPage />
      </MemoryRouter>,
    );
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Patient ID'), 'PAT-001');
    await user.type(screen.getByLabelText('Password'), 'SANTOS01011990');

    mockMutate.mockImplementation(
      (_vars: unknown, options: { onError?: (error: unknown) => void }) => {
        options.onError?.({});
      },
    );

    await user.click(screen.getByRole('button', { name: /view my results/i }));
    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows password format hint', () => {
    render(
      <MemoryRouter>
        <PatientLoginPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/last name.*uppercase.*no spaces.*date of birth/i)).toBeInTheDocument();
  });

  it('shows an inactivity banner when redirected with ?reason=timeout', () => {
    render(
      <MemoryRouter initialEntries={['/patient/login?reason=timeout']}>
        <PatientLoginPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByText('You were signed out due to inactivity. Please sign in again to continue.'),
    ).toBeInTheDocument();
  });

  it('does not show the inactivity banner on a normal visit', () => {
    render(
      <MemoryRouter>
        <PatientLoginPage />
      </MemoryRouter>,
    );
    expect(
      screen.queryByText(
        'You were signed out due to inactivity. Please sign in again to continue.',
      ),
    ).not.toBeInTheDocument();
  });

  it('dismisses the inactivity banner', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/patient/login?reason=timeout']}>
        <PatientLoginPage />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(
      screen.queryByText(
        'You were signed out due to inactivity. Please sign in again to continue.',
      ),
    ).not.toBeInTheDocument();
  });
});
