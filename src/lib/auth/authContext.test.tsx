/// <reference types="vitest/globals" />

import { useEffect } from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './authContext';
import { useAuthContext } from './useAuthContext';
import { RequireRole } from '../rbac';
import { UserRole } from '../../types/enums';

type Ctx = ReturnType<typeof useAuthContext>;
const holder: { current: Ctx | null } = { current: null };
const ctx = new Proxy({} as Ctx, {
  get: (_t, key) => (holder.current as Ctx)[key as keyof Ctx],
});
function Capture() {
  const c = useAuthContext();
  useEffect(() => {
    holder.current = c;
  });
  return null;
}
function LoginProbe() {
  const loc = useLocation();
  return <div>login{loc.search}</div>;
}

function tree(withRouter: boolean) {
  return (
    <AuthProvider>
      <Capture />
      {withRouter && (
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginProbe />} />
            <Route
              path="/protected"
              element={
                <RequireRole roles={[UserRole.SUPERVISOR]}>
                  <div>secret</div>
                </RequireRole>
              }
            />
          </Routes>
        </MemoryRouter>
      )}
    </AuthProvider>
  );
}

// Mount the provider alone first so tests can sign in BEFORE the router
// (and its redirect) exists, then mount the router at /protected.
function setup(signedIn: boolean) {
  const utils = render(tree(false));
  if (signedIn) act(() => ctx.login('tok', 'SUPERVISOR', 'u1'));
  utils.rerender(tree(true));
}

describe('session expiry', () => {
  it('expireSession while signed in logs out and redirects to /login?reason=expired', () => {
    setup(true);
    expect(screen.getByText('secret')).toBeInTheDocument();

    act(() => ctx.expireSession());
    expect(ctx.isAuthenticated).toBe(false);
    expect(ctx.token).toBeNull();
    expect(ctx.sessionEndReason).toBe('expired');
    expect(screen.getByText('login?reason=expired')).toBeInTheDocument();
  });

  it('expireSession while signed out is a no-op (no stale reason)', () => {
    setup(false);
    act(() => ctx.expireSession());
    expect(ctx.sessionEndReason).toBeNull();
    expect(screen.getByText('login')).toBeInTheDocument();
  });

  it('a deliberate logout carries no reason, and login clears it', () => {
    setup(true);
    act(() => ctx.expireSession());
    expect(ctx.sessionEndReason).toBe('expired');
    act(() => ctx.login('tok2', 'SUPERVISOR', 'u1'));
    expect(ctx.sessionEndReason).toBeNull();
    act(() => ctx.logout());
    expect(ctx.sessionEndReason).toBeNull();
  });
});
