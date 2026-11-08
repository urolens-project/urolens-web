import { isAxiosError } from 'axios';

export type ApiErrorKind =
  | 'timeout'
  | 'network'
  | 'unavailable' // 502 / 503 / 504
  | 'unauthorized' // 401
  | 'forbidden' // 403
  | 'server' // other 5xx
  | 'other';

export interface NormalizedApiError {
  kind: ApiErrorKind;
  status?: number;
  /** Backend error code (`error.code`), when the response carried one. */
  code?: string;
  /** Safe, user-facing message. Never includes server-provided text. */
  message: string;
}

export const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export const ERROR_MESSAGES: Record<Exclude<ApiErrorKind, 'other'>, string> = {
  timeout: 'The server took too long to respond. Please try again in a moment.',
  network: 'Cannot reach the server. Check your internet connection and try again.',
  unavailable:
    'UroLens is temporarily unavailable while it starts up or is updated. This usually clears within a couple of minutes. Please try again shortly.',
  unauthorized: 'Your session has expired. Please sign in again.',
  forbidden: 'You do not have permission to do that.',
  server:
    'The server ran into a problem. Please try again; if it keeps happening, contact support.',
};

export function classifyError(err: unknown): ApiErrorKind {
  if (!isAxiosError(err)) return 'other';
  if (!err.response) {
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') return 'timeout';
    if (err.code === 'ERR_CANCELED') return 'other';
    return 'network';
  }
  const status = err.response.status;
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 502 || status === 503 || status === 504) return 'unavailable';
  if (status >= 500) return 'server';
  return 'other';
}

/** True for failures that suggest the backend itself is down/starting, not a bad request. */
export function isServiceUnavailableKind(kind: ApiErrorKind): boolean {
  return kind === 'timeout' || kind === 'network' || kind === 'unavailable';
}

export function normalizeApiError(
  err: unknown,
  fallback = DEFAULT_ERROR_MESSAGE,
): NormalizedApiError {
  const kind = classifyError(err);
  const response = isAxiosError(err) ? err.response : undefined;
  const data = response?.data as { error?: { code?: unknown } } | undefined;
  const code = typeof data?.error?.code === 'string' ? data.error.code : undefined;
  return {
    kind,
    status: response?.status,
    code,
    message: kind === 'other' ? fallback : ERROR_MESSAGES[kind],
  };
}

export function getUserMessage(err: unknown, fallback = DEFAULT_ERROR_MESSAGE): string {
  return normalizeApiError(err, fallback).message;
}

/**
 * Message for a login failure: a known backend code wins, a 401 means bad
 * credentials, otherwise fall back to the mapped network/5xx message.
 */
export function getLoginErrorMessage(err: unknown, codeMessages: Record<string, string>): string {
  const n = normalizeApiError(err);
  const rawCode = (err as { response?: { data?: { error?: { code?: string } } } } | null)?.response
    ?.data?.error?.code;
  const code = n.code ?? rawCode;
  if (code && codeMessages[code]) return codeMessages[code];
  if (n.kind === 'unauthorized') return codeMessages.INVALID_CREDENTIALS ?? n.message;
  return n.message;
}
