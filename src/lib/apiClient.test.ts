/// <reference types="vitest/globals" />

import { resolveApiBaseUrl } from './apiClient';

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
