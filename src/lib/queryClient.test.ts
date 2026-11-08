/// <reference types="vitest/globals" />

import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { ERROR_MESSAGES } from './apiErrors';
import { notifyGlobalError, queryClient, resetGlobalErrorDedupeForTests } from './queryClient';

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

const config = {} as InternalAxiosRequestConfig;
const http = (status: number) =>
  new AxiosError('x', 'ERR_BAD_RESPONSE', config, null, {
    status,
    data: {},
    statusText: '',
    headers: {},
    config,
  });

describe('global error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetGlobalErrorDedupeForTests();
  });

  it('toasts the mapped message', () => {
    notifyGlobalError(http(503));
    expect(toast.error).toHaveBeenCalledWith(ERROR_MESSAGES.unavailable, {
      id: 'api-error-unavailable',
    });
  });

  it('dedupes the same kind inside the window, allows it after', () => {
    notifyGlobalError(http(503), 1000);
    notifyGlobalError(http(503), 2000);
    expect(toast.error).toHaveBeenCalledTimes(1);
    notifyGlobalError(http(503), 1000 + 16000);
    expect(toast.error).toHaveBeenCalledTimes(2);
  });

  it('does not dedupe across different kinds', () => {
    notifyGlobalError(http(503), 1000);
    notifyGlobalError(http(403), 1001);
    expect(toast.error).toHaveBeenCalledTimes(2);
  });

  it('never toasts a 401 (the auth handler redirects)', () => {
    notifyGlobalError(http(401));
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('QueryCache onError toasts, unless meta.suppressGlobalError', async () => {
    await queryClient
      .fetchQuery({ queryKey: ['a'], queryFn: () => Promise.reject(http(500)), retry: false })
      .catch(() => {});
    expect(toast.error).toHaveBeenCalledTimes(1);

    await queryClient
      .fetchQuery({
        queryKey: ['b'],
        queryFn: () => Promise.reject(http(403)),
        retry: false,
        meta: { suppressGlobalError: true },
      })
      .catch(() => {});
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('MutationCache toasts only when the mutation has no own onError', async () => {
    const m1 = queryClient.getMutationCache().build(queryClient, {
      mutationFn: () => Promise.reject(http(403)),
    });
    await m1.execute(undefined).catch(() => {});
    expect(toast.error).toHaveBeenCalledTimes(1);

    const m2 = queryClient.getMutationCache().build(queryClient, {
      mutationFn: () => Promise.reject(http(500)),
      onError: () => {},
    });
    await m2.execute(undefined).catch(() => {});
    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
