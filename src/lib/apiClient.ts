import axios from 'axios';
import { keysToCamel, keysToSnake } from './caseConvert';
import { resolveApiBaseUrl } from './apiBaseUrl';
import { classifyError, isServiceUnavailableKind } from './apiErrors';
import { reportServiceUnavailable } from './readiness';

export { resolveApiBaseUrl };

export const API_TIMEOUT_MS = 30_000;

// Requests under /auth/* (login, patient-login, refresh, logout) must never
// trigger the global 401 handler: a failed login is not an expired session.
export function isAuthRequestUrl(url: string | undefined): boolean {
  return /^\/?auth\//.test(url ?? '');
}

let tokenGetter: (() => string | null) | null = null;
let onUnauthorized: (() => void) | null = null;

export function setTokenGetter(getter: () => string | null) {
  tokenGetter = getter;
}

export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler;
}

const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
  headers: { 'Content-Type': 'application/json' },
  timeout: API_TIMEOUT_MS,
});

apiClient.interceptors.request.use((config) => {
  const token = tokenGetter?.();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // The frontend is written in snake_case; the backend expects camelCase.
  // Translate outbound bodies and query params at the edge. Binary payloads
  // (FormData / Blob) are left untouched by keysToCamel.
  if (
    config.data !== undefined &&
    !(typeof FormData !== 'undefined' && config.data instanceof FormData)
  ) {
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
    if (error.response?.status === 401 && !isAuthRequestUrl(error.config?.url)) {
      onUnauthorized?.();
    } else if (isServiceUnavailableKind(classifyError(error))) {
      // Timeout / network / 502-504: re-arm the readiness probe (banner if confirmed down).
      reportServiceUnavailable();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
