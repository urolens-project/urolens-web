/// <reference types="vitest/globals" />

import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import apiClient, {
  API_TIMEOUT_MS,
  isAuthRequestUrl,
  resolveApiBaseUrl,
  setOnUnauthorized,
} from './apiClient';
import { resolveApiOrigin } from './apiBaseUrl';

describe('resolveApiBaseUrl', () => {
  it('appends /api/v1 to a bare origin', () => {
    expect(resolveApiBaseUrl('https://api.example.com')).toBe('https://api.example.com/api/v1');
    expect(resolveApiBaseUrl('http://localhost:8000')).toBe('http://localhost:8000/api/v1');
  });

  it.each([undefined, '', '   '])('throws when unset/empty (%j)', (v) => {
    expect(() => resolveApiBaseUrl(v)).toThrow(/not set/);
  });

  it('throws on a trailing slash', () => {
    expect(() => resolveApiBaseUrl('https://api.example.com/')).toThrow(/trailing slash/);
  });

  it('throws when the value already contains /api/v1', () => {
    expect(() => resolveApiBaseUrl('http://localhost:8000/api/v1')).toThrow(/origin only/);
  });

  it('throws on a path or a non-absolute value', () => {
    expect(() => resolveApiBaseUrl('https://api.example.com/v2')).toThrow(/origin only/);
    expect(() => resolveApiBaseUrl('api.example.com')).toThrow(/absolute/);
  });
});

describe('resolveApiOrigin', () => {
  it('returns the origin without /api/v1', () => {
    expect(resolveApiOrigin('https://api.example.com')).toBe('https://api.example.com');
  });
});

describe('isAuthRequestUrl', () => {
  it.each(['/auth/login', '/auth/patient-login', 'auth/refresh', '/auth/logout'])(
    '%s is auth',
    (u) => {
      expect(isAuthRequestUrl(u)).toBe(true);
    },
  );
  it.each(['/patients', '/patient/results', '/notifications', undefined])('%s is not auth', (u) => {
    expect(isAuthRequestUrl(u)).toBe(false);
  });
});

describe('apiClient defaults and 401 handling', () => {
  function failWith(status: number | null, code?: string) {
    apiClient.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
      const response =
        status === null ? undefined : { status, data: {}, statusText: '', headers: {}, config };
      throw new AxiosError('boom', code, config, null, response);
    };
  }

  afterEach(() => {
    setOnUnauthorized(() => {});
  });

  it('has a 30s timeout and no credentials', () => {
    expect(API_TIMEOUT_MS).toBe(30000);
    expect(apiClient.defaults.timeout).toBe(30000);
    expect(apiClient.defaults.withCredentials).toBeFalsy();
  });

  it('401 on a normal request triggers the unauthorized handler', async () => {
    const handler = vi.fn();
    setOnUnauthorized(handler);
    failWith(401);
    await expect(apiClient.get('/patient/results')).rejects.toBeTruthy();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('401 on /auth/* (failed login) does NOT trigger the handler', async () => {
    const handler = vi.fn();
    setOnUnauthorized(handler);
    failWith(401);
    await expect(apiClient.post('/auth/login', {})).rejects.toBeTruthy();
    await expect(apiClient.post('/auth/patient-login', {})).rejects.toBeTruthy();
    expect(handler).not.toHaveBeenCalled();
  });

  it('non-401 errors do not trigger the handler', async () => {
    const handler = vi.fn();
    setOnUnauthorized(handler);
    failWith(503);
    await expect(apiClient.get('/patient/results')).rejects.toBeTruthy();
    expect(handler).not.toHaveBeenCalled();
  });
});
