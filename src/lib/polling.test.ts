/// <reference types="vitest/globals" />

import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { nextPollDelay, pollInterval } from './polling';
import { resetReadinessForTests } from './readiness';

const base = { baseMs: 30000, errorCount: 0, hidden: false, authorized: true, serviceReady: true };

describe('nextPollDelay', () => {
  it('polls at the base interval when healthy', () => {
    expect(nextPollDelay(base)).toBe(30000);
  });
  it('stops when hidden, unauthorized or service not ready', () => {
    expect(nextPollDelay({ ...base, hidden: true })).toBe(false);
    expect(nextPollDelay({ ...base, authorized: false })).toBe(false);
    expect(nextPollDelay({ ...base, serviceReady: false })).toBe(false);
  });
  it('backs off exponentially on errors, capped at 5 minutes', () => {
    expect(nextPollDelay({ ...base, errorCount: 1 })).toBe(60000);
    expect(nextPollDelay({ ...base, errorCount: 2 })).toBe(120000);
    expect(nextPollDelay({ ...base, errorCount: 10 })).toBe(300000);
  });
});

describe('pollInterval (react-query)', () => {
  beforeEach(() => resetReadinessForTests());
  const ok = { state: { status: 'success', errorUpdateCount: 0, error: null } };

  it('returns the base interval on success', () => {
    expect(pollInterval(30000)(ok)).toBe(30000);
  });
  it('backs off after errors', () => {
    const err = { state: { status: 'error', errorUpdateCount: 2, error: new Error('x') } };
    expect(pollInterval(30000)(err)).toBe(120000);
  });
  it('stops after a 401', () => {
    const cfg = {} as InternalAxiosRequestConfig;
    const e = new AxiosError('u', 'ERR_BAD_REQUEST', cfg, null, {
      status: 401,
      data: {},
      statusText: '',
      headers: {},
      config: cfg,
    });
    expect(pollInterval(30000)({ state: { status: 'error', errorUpdateCount: 1, error: e } })).toBe(
      false,
    );
  });
  it('stops while the document is hidden', () => {
    const spy = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    expect(pollInterval(30000)(ok)).toBe(false);
    spy.mockRestore();
  });
});
