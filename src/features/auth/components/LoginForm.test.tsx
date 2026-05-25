import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

vi.mock('../hooks/useAuth', () => ({
  useLogin: vi.fn(),
}));

import { useLogin } from '../hooks/useAuth';

const mockMutate = vi.fn();

function setupUseLogin(isPending = false) {
  vi.mocked(useLogin).mockReturnValue({
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
  } as unknown as ReturnType<typeof useLogin>);
}

beforeEach(() => {
  vi.clearAllMocks();
  setupUseLogin();
});

describe('LoginForm', () => {
  it('renders username and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows field-level validation errors on empty submit', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows username validation error when only username is empty', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Password'), 'pass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    expect(screen.queryByText('Password is required.')).not.toBeInTheDocument();
  });

  it('clears field errors when user types', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText('Username is required.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Username'), 'test');
    expect(screen.queryByText('Username is required.')).not.toBeInTheDocument();
  });

  it('calls mutate with credentials on valid submit', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'testpass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      { username: 'testuser', password: 'testpass' },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });

  it('disables button and shows loading state when submitting', () => {
    setupUseLogin(true);
    render(<LoginForm />);

    const button = screen.getByRole('button', { name: /verifying identity parameters/i });
    expect(button).toBeDisabled();
  });

  it('displays INVALID_CREDENTIALS error message', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'testpass');

    mockMutate.mockImplementation((_vars: unknown, options: { onError?: (error: unknown) => void }) => {
      options.onError?.({
        response: { data: { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password.' } } },
      });
    });

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText('Invalid username or password. Please try again.')).toBeInTheDocument();
    });
  });

  it('displays ACCOUNT_LOCKED error message', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'testpass');

    mockMutate.mockImplementation((_vars: unknown, options: { onError?: (error: unknown) => void }) => {
      options.onError?.({
        response: { data: { error: { code: 'ACCOUNT_LOCKED', message: 'Your account is locked.' } } },
      });
    });

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText('Your account has been locked. Please contact the administrator.')).toBeInTheDocument();
    });
  });

  it('displays ACCOUNT_INACTIVE error message', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'testpass');

    mockMutate.mockImplementation((_vars: unknown, options: { onError?: (error: unknown) => void }) => {
      options.onError?.({
        response: { data: { error: { code: 'ACCOUNT_INACTIVE', message: 'Your account is inactive.' } } },
      });
    });

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText('Your account is inactive. Please contact the administrator.')).toBeInTheDocument();
    });
  });

  it('displays generic error for unknown error codes', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'testpass');

    mockMutate.mockImplementation((_vars: unknown, options: { onError?: (error: unknown) => void }) => {
      options.onError?.({
        response: { data: { error: { code: 'UNKNOWN_ERROR', message: 'Something happened.' } } },
      });
    });

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });

  it('displays generic error when no error code is provided', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'testpass');

    mockMutate.mockImplementation((_vars: unknown, options: { onError?: (error: unknown) => void }) => {
      options.onError?.({});
    });

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });

  it('trims whitespace from username before submitting', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Username'), '  testuser  ');
    await user.type(screen.getByLabelText('Password'), 'testpass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      { username: 'testuser', password: 'testpass' },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });
});
