/// <reference types="vitest/globals" />

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { authApi } from '../api/authApi';
import { AuthProvider } from '../../../lib/auth/authContext';
import type { UserRole } from '../../../types/enums';

vi.mock('../api/authApi', () => ({
  authApi: { login: vi.fn() },
}));

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['PHYSICIAN', '/dashboard/physician'],
    ['SUPERVISOR', '/dashboard/supervisor'],
    ['RECEPTIONIST', '/dashboard/receptionist'],
    ['PATIENT', '/dashboard/patient'],
    ['ADMINISTRATOR', '/dashboard/administrator'],
    ['MEDTECH', '/dashboard/medtech'],
  ])(
    'redirects a %s login to %s, not the receptionist fallback',
    async (backendRole, expectedPath) => {
      // The type claims `role: UserRole` (the normalized lowercase shape),
      // but the real backend sends it uppercase, straight from the DB
      // column (see seed_users.py) — that mismatch is exactly what this
      // test guards against, so the cast is deliberate, not a shortcut.
      vi.mocked(authApi.login).mockResolvedValue({
        access_token: 'token',
        token_type: 'bearer',
        role: backendRole as unknown as UserRole,
        expires_at: '2026-10-08T01:00:00Z',
        session_expires_at: '2026-10-08T08:00:00Z',
        idle_timeout_minutes: 30,
        idle_warning_seconds: 120,
      });

      const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() });
      result.current.mutate({ username: 'user', password: 'pass' });

      await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
      expect(mockNavigate).toHaveBeenCalledWith(expectedPath, { replace: true });
    },
  );
});
