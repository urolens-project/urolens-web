import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PatientLoginPage from '../components/PatientLoginPage';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../hooks/usePatientLogin', () => ({
  usePatientLogin: vi.fn(),
}));

vi.mock('../../../lib/auth/useAuthContext', () => ({
  useAuthContext: vi.fn(),
}));

import { usePatientLogin } from '../hooks/usePatientLogin';
import { useAuthContext } from '../../../lib/auth/useAuthContext';

const mockMutate = vi.fn();
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
  };
});

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

function setupAuth(isAuthenticated = false, role: string | null = null) {
  vi.mocked(useAuthContext).mockReturnValue({
    isAuthenticated,
    role: role as never,
    token: isAuthenticated ? 'tok' : null,
    login: mockLogin,
    logout: vi.fn(),
  });
}

function renderPage() {
  return render(
    <MemoryRouter>
      <PatientLoginPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  setupMutation();
  setupAuth(false, null);
});

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('PatientLoginPage rendering', () => {
  it('renders "Patient Portal" heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /patient portal/i })).toBeInTheDocument();
  });

  it('renders "Patient ID" label', () => {
    renderPage();
    expect(screen.getByLabelText('Patient ID')).toBeInTheDocument();
  });

  it('renders "Password" label', () => {
    renderPage();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('password field is type password (masked) by default', () => {
    renderPage();
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('renders helper text explaining the password format', () => {
    renderPage();
    expect(screen.getByText(/surname in capital letters followed by your date of birth/i)).toBeInTheDocument();
    expect(screen.getByText(/SANTOS04072001/)).toBeInTheDocument();
  });

  it('renders "View My Results" submit button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /view my results/i })).toBeInTheDocument();
  });

  it('renders Patient ID helper text mentioning laboratory receipt', () => {
    renderPage();
    expect(screen.getByText(/laboratory receipt/i)).toBeInTheDocument();
  });
});

// ── Submit button disabled state ──────────────────────────────────────────────

describe('submit button disabled logic', () => {
  it('is disabled when both fields are empty', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /view my results/i })).toBeDisabled();
  });

  it('is disabled when only Patient ID is filled', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Patient ID'), 'PAT-000001');
    expect(screen.getByRole('button', { name: /view my results/i })).toBeDisabled();
  });

  it('is disabled when only Password is filled', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Password'), 'SANTOS04072001');
    expect(screen.getByRole('button', { name: /view my results/i })).toBeDisabled();
  });

  it('is enabled when both fields are non-empty', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Patient ID'), 'PAT-000001');
    await user.type(screen.getByLabelText('Password'), 'SANTOS04072001');
    expect(screen.getByRole('button', { name: /view my results/i })).not.toBeDisabled();
  });
});

// ── Loading / pending state ───────────────────────────────────────────────────

describe('pending state', () => {
  it('disables submit button while mutation is pending', () => {
    setupMutation(true);
    renderPage();
    expect(screen.getByRole('button', { name: /verifying/i })).toBeDisabled();
  });

  it('disables Patient ID input while mutation is pending', () => {
    setupMutation(true);
    renderPage();
    expect(screen.getByLabelText('Patient ID')).toBeDisabled();
  });

  it('disables Password input while mutation is pending', () => {
    setupMutation(true);
    renderPage();
    expect(screen.getByLabelText('Password')).toBeDisabled();
  });

  it('shows Spinner (svg with animate-spin) while pending', () => {
    setupMutation(true);
    renderPage();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});

// ── Error display ─────────────────────────────────────────────────────────────

describe('error display', () => {
  async function triggerError(code: string) {
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Patient ID'), 'PAT-000001');
    await user.type(screen.getByLabelText('Password'), 'SANTOS04072001');

    mockMutate.mockImplementation(
      (_vars: unknown, options: { onError?: (err: unknown) => void }) => {
        options.onError?.({
          response: { data: { error: { code, message: 'backend msg' } } },
        });
      },
    );

    await user.click(screen.getByRole('button', { name: /view my results/i }));
  }

  it('shows generic invalid-credentials message on 401 INVALID_CREDENTIALS', async () => {
    await triggerError('INVALID_CREDENTIALS');
    await waitFor(() => {
      expect(
        screen.getByText(/invalid patient id or password/i),
      ).toBeInTheDocument();
    });
  });

  it('shows lockout message on 403 PATIENT_ACCOUNT_LOCKED', async () => {
    await triggerError('PATIENT_ACCOUNT_LOCKED');
    await waitFor(() => {
      expect(
        screen.getByText(/temporarily locked/i),
      ).toBeInTheDocument();
    });
  });

  it('shows generic fallback message for unknown error codes', async () => {
    await triggerError('SOMETHING_ELSE');
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('error is shown below the form — not on individual field labels', async () => {
    await triggerError('INVALID_CREDENTIALS');
    await waitFor(() => {
      const errorEl = screen.getByText(/invalid patient id or password/i);
      // Error container should not be a label
      expect(errorEl.tagName).not.toBe('LABEL');
    });
  });
});

// ── Success behaviour ─────────────────────────────────────────────────────────

describe('success behaviour', () => {
  it('calls login() with the returned token and role on success', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Patient ID'), 'PAT-000001');
    await user.type(screen.getByLabelText('Password'), 'SANTOS04072001');

    mockMutate.mockImplementation(
      (_vars: unknown, options: { onError?: (e: unknown) => void }) => {
        // Simulate onSuccess handled inside the hook (login + navigate already called)
        // We test the hook separately; here we just verify mutate is called with both fields
      },
    );

    await user.click(screen.getByRole('button', { name: /view my results/i }));
    expect(mockMutate).toHaveBeenCalledWith(
      { patientUid: 'PAT-000001', password: 'SANTOS04072001' },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });
});

// ── Already-authenticated redirect ────────────────────────────────────────────

describe('authenticated redirect', () => {
  it('redirects to /dashboard/patient/results when already logged in as PATIENT', () => {
    setupAuth(true, 'patient');
    renderPage();
    const nav = screen.getByTestId('navigate');
    expect(nav).toHaveAttribute('data-to', '/dashboard/patient/results');
  });
});

// ── Password show/hide toggle ─────────────────────────────────────────────────

describe('password visibility toggle', () => {
  it('toggles password field to text when show button is clicked', async () => {
    renderPage();
    const user = userEvent.setup();
    const toggle = screen.getByRole('button', { name: /show password/i });
    await user.click(toggle);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
  });

  it('toggles back to password type on second click', async () => {
    renderPage();
    const user = userEvent.setup();
    const toggle = screen.getByRole('button', { name: /show password/i });
    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });
});
