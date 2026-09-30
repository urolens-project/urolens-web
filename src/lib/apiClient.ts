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

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
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
