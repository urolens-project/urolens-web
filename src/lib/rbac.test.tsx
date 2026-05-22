import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const mockUseAuthContext = vi.fn();

vi.mock('./auth/useAuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

import { RequireRole } from './rbac';
import { UserRole } from '../types/enums';

function renderRequireRole(roles: UserRole[], initialRoute = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
        <Route
          path="/protected"
          element={
            <RequireRole roles={roles}>
              <div>Protected Content</div>
            </RequireRole>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setAuth(overrides: { isAuthenticated?: boolean; role?: string | null }) {
    mockUseAuthContext.mockReturnValue({
      isAuthenticated: overrides.isAuthenticated ?? false,
      role: overrides.role ?? null,
      token: overrides.isAuthenticated ? 'token' : null,
      login: vi.fn(),
      logout: vi.fn(),
    });
  }

  it('redirects to /login when user is not authenticated', () => {
    setAuth({ isAuthenticated: false, role: null });
    renderRequireRole([UserRole.RECEPTIONIST]);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /unauthorized when user has wrong role', () => {
    setAuth({ isAuthenticated: true, role: UserRole.PATIENT });
    renderRequireRole([UserRole.RECEPTIONIST]);
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user has correct role', () => {
    setAuth({ isAuthenticated: true, role: UserRole.RECEPTIONIST });
    renderRequireRole([UserRole.RECEPTIONIST]);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when user role is in allowed roles list', () => {
    setAuth({ isAuthenticated: true, role: UserRole.ADMINISTRATOR });
    renderRequireRole([UserRole.RECEPTIONIST, UserRole.ADMINISTRATOR]);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /unauthorized when role is null but authenticated', () => {
    setAuth({ isAuthenticated: true, role: null });
    renderRequireRole([UserRole.RECEPTIONIST]);
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
  });

  it('allows supervisor role', () => {
    setAuth({ isAuthenticated: true, role: UserRole.SUPERVISOR });
    renderRequireRole([UserRole.SUPERVISOR]);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('allows physician role', () => {
    setAuth({ isAuthenticated: true, role: UserRole.PHYSICIAN });
    renderRequireRole([UserRole.PHYSICIAN]);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('allows patient role', () => {
    setAuth({ isAuthenticated: true, role: UserRole.PATIENT });
    renderRequireRole([UserRole.PATIENT]);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('allows administrator role', () => {
    setAuth({ isAuthenticated: true, role: UserRole.ADMINISTRATOR });
    renderRequireRole([UserRole.ADMINISTRATOR]);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
