// Dependency-free on purpose: imported by both the app (apiClient, readiness)
// and vite.config.ts (build-time check), so it must not touch import.meta.env
// or any browser/app module.

/**
 * VITE_API_BASE_URL is the backend ORIGIN only (e.g. https://api.example.com).
 * Returns the validated origin, or throws a clear error.
 */
export function resolveApiOrigin(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) {
    throw new Error(
      'VITE_API_BASE_URL is not set. Set it to the backend origin (e.g. https://api.example.com) at build time.',
    );
  }
  if (!/^https?:\/\/[^/\s]+/i.test(value)) {
    throw new Error(
      'VITE_API_BASE_URL must be an absolute http(s) origin (e.g. https://api.example.com).',
    );
  }
  if (value.endsWith('/')) {
    throw new Error('VITE_API_BASE_URL must not end with a trailing slash.');
  }
  if (/\/api\/v1/i.test(value)) {
    throw new Error(
      'VITE_API_BASE_URL must be the origin only; "/api/v1" is appended by the client.',
    );
  }
  if (/^https?:\/\/[^/]+\/./i.test(value)) {
    throw new Error('VITE_API_BASE_URL must be the origin only (no path).');
  }
  return value;
}

/** Origin + `/api/v1` — the axios baseURL. */
export function resolveApiBaseUrl(raw: string | undefined): string {
  return `${resolveApiOrigin(raw)}/api/v1`;
}
