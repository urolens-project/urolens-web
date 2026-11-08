/// <reference types="vitest/globals" />

import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider, type Query } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useVerificationQueue,
  useResultFields,
  useVerificationSummary,
} from '../features/field-verification/hooks/useFieldVerification';
import { useApprovedResults } from '../features/result-releasing/hooks/useResultReleasing';
import {
  useMedTechWorkloads,
  usePendingSpecimens,
} from '../features/queue-assignment/hooks/useQueueWorkloads';

const readiness = vi.hoisted(() => ({ status: 'ready' as string }));
vi.mock('./readiness', () => ({ getReadinessStatus: () => readiness.status }));

vi.mock('../features/field-verification/api/fieldVerificationApi', () => ({
  fetchVerificationQueue: vi.fn(() => new Promise(() => {})),
  fetchResultFields: vi.fn(() => new Promise(() => {})),
  fetchVerificationSummary: vi.fn(() => new Promise(() => {})),
}));
vi.mock('../features/result-releasing/api/resultReleasingApi', () => ({
  resultReleasingApi: { getApproved: vi.fn(() => new Promise(() => {})) },
}));
vi.mock('../features/queue-assignment/api/queueApi', () => ({
  queueApi: {
    getPendingSpecimens: vi.fn(() => new Promise(() => {})),
    getMedTechWorkloads: vi.fn(() => new Promise(() => {})),
  },
}));

type IntervalFn = (q: Query) => number | false;

function observedInterval(useHook: () => unknown): IntervalFn {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  renderHook(useHook, { wrapper });
  const query = client.getQueryCache().getAll()[0];
  const fn = query.observers[0].options.refetchInterval;
  expect(typeof fn).toBe('function');
  return (q) => (fn as IntervalFn)(q);
}

const fakeQuery = (status: 'success' | 'error', errorUpdateCount = 0) =>
  ({
    state: { status, errorUpdateCount, error: status === 'error' ? new Error('x') : null },
  }) as unknown as Query;

const cases: [string, () => unknown, number][] = [
  ['useVerificationQueue', () => useVerificationQueue(1, 20), 30_000],
  ['useResultFields', () => useResultFields('r1'), 15_000],
  ['useVerificationSummary', () => useVerificationSummary('r1'), 15_000],
  ['useApprovedResults', () => useApprovedResults(), 30_000],
  ['usePendingSpecimens', () => usePendingSpecimens(), 30_000],
  ['useMedTechWorkloads', () => useMedTechWorkloads(), 30_000],
];

describe.each(cases)('%s polling', (_name, hook, base) => {
  beforeEach(() => {
    readiness.status = 'ready';
  });

  it('polls at its base interval when healthy', () => {
    expect(observedInterval(hook)(fakeQuery('success'))).toBe(base);
  });
  it('backs off after errors', () => {
    expect(observedInterval(hook)(fakeQuery('error', 2))).toBe(base * 4);
  });
  it('pauses while the tab is hidden', () => {
    const spy = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    expect(observedInterval(hook)(fakeQuery('success'))).toBe(false);
    spy.mockRestore();
  });
  it('pauses while the readiness probe reports down', () => {
    readiness.status = 'unavailable';
    expect(observedInterval(hook)(fakeQuery('success'))).toBe(false);
  });
});
