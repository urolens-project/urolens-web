import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockLogout = vi.fn();
const mockAuthApiLogout = vi.fn();
const mockNavigate = vi.fn();

const mockIsAuthenticated = vi.fn(() => true);

vi.mock('../lib/auth/useAuthContext', () => ({
  useAuthContext: () => ({
    isAuthenticated: mockIsAuthenticated(),
    logout: mockLogout,
    token: mockIsAuthenticated() ? 'fake-token' : null,
    role: 'receptionist',
    login: vi.fn(),
  }),
}));

vi.mock('../features/auth/api/authApi', () => ({
  authApi: {
    logout: () => mockAuthApiLogout(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { useSessionTimeout } from './useSessionTimeout';

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <MemoryRouter>{children}</MemoryRouter>;
  };
}

describe('useSessionTimeout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockIsAuthenticated.mockReturnValue(true);
    mockAuthApiLogout.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not set timers when user is not authenticated', () => {
    mockIsAuthenticated.mockReturnValue(false);
    renderHook(() => useSessionTimeout(), { wrapper: createWrapper() });

    act(() => {
      vi.advanceTimersByTime(31 * 60 * 1000);
    });

    expect(mockAuthApiLogout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('calls logout API and navigates to /login?reason=timeout after timeout', async () => {
    renderHook(() => useSessionTimeout(), { wrapper: createWrapper() });

    act(() => {
      vi.advanceTimersByTime(31 * 60 * 1000);
    });

    await vi.runAllTimersAsync();

    expect(mockAuthApiLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login?reason=timeout', { replace: true });
  });

  it('resets timer on mousemove event', () => {
    renderHook(() => useSessionTimeout(), { wrapper: createWrapper() });

    act(() => {
      vi.advanceTimersByTime(20 * 60 * 1000);
    });

    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove'));
    });

    act(() => {
      vi.advanceTimersByTime(20 * 60 * 1000);
    });

    expect(mockAuthApiLogout).not.toHaveBeenCalled();
  });

  it('resets timer on keydown event', () => {
    renderHook(() => useSessionTimeout(), { wrapper: createWrapper() });

    act(() => {
      vi.advanceTimersByTime(20 * 60 * 1000);
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown'));
    });

    act(() => {
      vi.advanceTimersByTime(20 * 60 * 1000);
    });

    expect(mockAuthApiLogout).not.toHaveBeenCalled();
  });

  it('resets timer on click event', () => {
    renderHook(() => useSessionTimeout(), { wrapper: createWrapper() });

    act(() => {
      vi.advanceTimersByTime(20 * 60 * 1000);
    });

    act(() => {
      window.dispatchEvent(new MouseEvent('click'));
    });

    act(() => {
      vi.advanceTimersByTime(20 * 60 * 1000);
    });

    expect(mockAuthApiLogout).not.toHaveBeenCalled();
  });

  it('resets timer on scroll event', () => {
    renderHook(() => useSessionTimeout(), { wrapper: createWrapper() });

    act(() => {
      vi.advanceTimersByTime(20 * 60 * 1000);
    });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    act(() => {
      vi.advanceTimersByTime(20 * 60 * 1000);
    });

    expect(mockAuthApiLogout).not.toHaveBeenCalled();
  });

  it('clears timers and removes listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useSessionTimeout(), { wrapper: createWrapper() });

    unmount();

    const eventTypes = ['mousemove', 'keydown', 'click', 'scroll'];
    for (const eventType of eventTypes) {
      expect(removeEventListenerSpy).toHaveBeenCalledWith(eventType, expect.any(Function));
    }
  });

  it('clears timers when isAuthenticated becomes false', () => {
    mockIsAuthenticated.mockReturnValue(true);
    const { rerender } = renderHook(() => useSessionTimeout(), { wrapper: createWrapper() });

    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000);
    });

    mockIsAuthenticated.mockReturnValue(false);
    rerender();

    act(() => {
      vi.advanceTimersByTime(31 * 60 * 1000);
    });

    expect(mockAuthApiLogout).not.toHaveBeenCalled();
  });

  it('shows the warning 2 minutes before the timeout fires', () => {
    const { result } = renderHook(() => useSessionTimeout(), { wrapper: createWrapper() });

    act(() => {
      vi.advanceTimersByTime(28 * 60 * 1000);
    });

    expect(result.current.isWarningVisible).toBe(true);
  });

  it('dismissWarning cancels the expiration, not just hides the dialog', async () => {
    const { result } = renderHook(() => useSessionTimeout(), { wrapper: createWrapper() });

    // Let the warning appear (28 min in, 2 min before the 30 min timeout).
    act(() => {
      vi.advanceTimersByTime(28 * 60 * 1000);
    });
    expect(result.current.isWarningVisible).toBe(true);

    // Dismissing it must count as activity — the warning hides AND the
    // clock restarts, not just the former.
    act(() => {
      result.current.dismissWarning();
    });
    expect(result.current.isWarningVisible).toBe(false);

    // Advance past the original timeout instant (2 more minutes = the
    // moment the un-reset timer would have fired at 30 min). If dismiss
    // only hid the dialog, logout would already have fired here.
    //
    // Deliberately advanceTimersByTimeAsync (not advanceTimersByTime +
    // runAllTimersAsync) — runAllTimersAsync drains every pending timer
    // regardless of how far out it's scheduled, which would also fire the
    // freshly-reset future timers and produce a false pass/fail either way.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2 * 60 * 1000);
    });
    expect(mockAuthApiLogout).not.toHaveBeenCalled();

    // The timer only actually restarted (full 30 min from the dismiss),
    // so it should now fire after the remaining time elapses.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(28 * 60 * 1000);
    });
    await vi.runAllTimersAsync();
    expect(mockAuthApiLogout).toHaveBeenCalled();
  });

  it('uses default timeout of 30 minutes when env var is not set', () => {
    const original = import.meta.env.VITE_SESSION_TIMEOUT_MINUTES;
    vi.stubEnv('VITE_SESSION_TIMEOUT_MINUTES', undefined as unknown as string);

    renderHook(() => useSessionTimeout(), { wrapper: createWrapper() });

    act(() => {
      vi.advanceTimersByTime(29 * 60 * 1000);
    });

    expect(mockAuthApiLogout).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2 * 60 * 1000);
    });

    vi.stubEnv('VITE_SESSION_TIMEOUT_MINUTES', original as unknown as string);
  });
});
