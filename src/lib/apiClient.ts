import axios from 'axios';
import { keysToCamel, keysToSnake } from './caseConvert';

let tokenGetter: (() => string | null) | null = null;
let onUnauthorized: (() => void) | null = null;

export function setTokenGetter(getter: () => string | null) {
  tokenGetter = getter;
}

export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler;
}

/**
 * VITE_API_BASE_URL is the backend ORIGIN only (e.g. https://api.example.com).
 * The `/api/v1` prefix is appended here. Fails fast on a misconfigured value
 * rather than silently sending requests to `undefined/api/v1` or `/api/v1/api/v1`.
 */
export function resolveApiBaseUrl(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) {
    throw new Error(
      'VITE_API_BASE_URL is not set. Set it to the backend origin (e.g. https://api.example.com) at build time.',
    );
  }
  if (!/^https?:\/\/[^/\s]+/i.test(value)) {
    throw new Error('VITE_API_BASE_URL must be an absolute http(s) origin (e.g. https://api.example.com).');
  }
  if (value.endsWith('/')) {
    throw new Error('VITE_API_BASE_URL must not end with a trailing slash.');
  }
  if (/\/api\/v1/i.test(value)) {
    throw new Error('VITE_API_BASE_URL must be the origin only; "/api/v1" is appended by the client.');
  }
  if (/^https?:\/\/[^/]+\/./i.test(value)) {
    throw new Error('VITE_API_BASE_URL must be the origin only (no path).');
  }
  return `${value}/api/v1`;
}

const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenGetter?.();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // The frontend is written in snake_case; the backend expects camelCase.
  // Translate outbound bodies and query params at the edge. Binary payloads
  // (FormData / Blob) are left untouched by keysToCamel.
  if (config.data !== undefined && !(typeof FormData !== 'undefined' && config.data instanceof FormData)) {
    config.data = keysToCamel(config.data);
  }
  if (config.params !== undefined) {
    config.params = keysToCamel(config.params);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Translate camelCase responses back to the snake_case the frontend uses.
    if (response.data !== undefined) {
      response.data = keysToSnake(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
