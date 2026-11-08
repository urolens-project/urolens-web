/// <reference types="vitest/globals" />

import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import {
  classifyError,
  ERROR_MESSAGES,
  getLoginErrorMessage,
  getUserMessage,
  isServiceUnavailableKind,
  normalizeApiError,
} from './apiErrors';

const config = {} as InternalAxiosRequestConfig;

function httpError(status: number, data: unknown = {}) {
  return new AxiosError('x', 'ERR_BAD_RESPONSE', config, null, {
    status,
    data,
    statusText: '',
    headers: {},
    config,
  });
}

describe('classifyError', () => {
  it('maps timeouts', () => {
    expect(classifyError(new AxiosError('t', 'ECONNABORTED', config))).toBe('timeout');
    expect(classifyError(new AxiosError('t', 'ETIMEDOUT', config))).toBe('timeout');
  });
  it('maps network errors (no response)', () => {
    expect(classifyError(new AxiosError('n', 'ERR_NETWORK', config))).toBe('network');
  });
  it('maps statuses to distinct kinds', () => {
    expect(classifyError(httpError(401))).toBe('unauthorized');
    expect(classifyError(httpError(403))).toBe('forbidden');
    expect(classifyError(httpError(502))).toBe('unavailable');
    expect(classifyError(httpError(503))).toBe('unavailable');
    expect(classifyError(httpError(504))).toBe('unavailable');
    expect(classifyError(httpError(500))).toBe('server');
    expect(classifyError(httpError(422))).toBe('other');
  });
  it('treats cancellations and non-axios errors as other', () => {
    expect(classifyError(new AxiosError('c', 'ERR_CANCELED', config))).toBe('other');
    expect(classifyError(new Error('x'))).toBe('other');
    expect(classifyError({})).toBe('other');
  });
});

describe('normalizeApiError / messages', () => {
  it('gives each kind a distinct message', () => {
    const msgs = Object.values(ERROR_MESSAGES);
    expect(new Set(msgs).size).toBe(msgs.length);
  });
  it('uses the fallback only for kind other', () => {
    expect(getUserMessage(httpError(422), 'custom')).toBe('custom');
    expect(getUserMessage(httpError(503), 'custom')).toBe(ERROR_MESSAGES.unavailable);
  });
  it('never leaks server-provided text and extracts the backend code', () => {
    const n = normalizeApiError(
      httpError(500, { error: { code: 'BOOM', message: 'secret detail' } }),
    );
    expect(n.code).toBe('BOOM');
    expect(n.message).toBe(ERROR_MESSAGES.server);
    expect(n.message).not.toContain('secret');
  });
  it('flags unavailable kinds', () => {
    expect(isServiceUnavailableKind('timeout')).toBe(true);
    expect(isServiceUnavailableKind('network')).toBe(true);
    expect(isServiceUnavailableKind('unavailable')).toBe(true);
    expect(isServiceUnavailableKind('server')).toBe(false);
    expect(isServiceUnavailableKind('forbidden')).toBe(false);
  });
});

describe('getLoginErrorMessage', () => {
  const codes = { INVALID_CREDENTIALS: 'bad creds', ACCOUNT_LOCKED: 'locked' };
  it('prefers a known backend code', () => {
    expect(getLoginErrorMessage(httpError(403, { error: { code: 'ACCOUNT_LOCKED' } }), codes)).toBe(
      'locked',
    );
  });
  it('treats a bare 401 as invalid credentials', () => {
    expect(getLoginErrorMessage(httpError(401), codes)).toBe('bad creds');
  });
  it('maps network/timeout/503/500 to distinct messages', () => {
    expect(getLoginErrorMessage(new AxiosError('n', 'ERR_NETWORK', config), codes)).toBe(
      ERROR_MESSAGES.network,
    );
    expect(getLoginErrorMessage(new AxiosError('t', 'ECONNABORTED', config), codes)).toBe(
      ERROR_MESSAGES.timeout,
    );
    expect(getLoginErrorMessage(httpError(503), codes)).toBe(ERROR_MESSAGES.unavailable);
    expect(getLoginErrorMessage(httpError(500), codes)).toBe(ERROR_MESSAGES.server);
  });
  it('keeps the generic message for unknown non-HTTP errors', () => {
    expect(getLoginErrorMessage({}, codes)).toBe('Something went wrong. Please try again.');
  });
});
