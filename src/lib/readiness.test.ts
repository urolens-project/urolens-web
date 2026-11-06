/// <reference types="vitest/globals" />

import axios from 'axios';
import {
  getReadinessStatus,
  isReadyBody,
  nextProbeDelay,
  reportServiceUnavailable,
  resetReadinessForTests,
  startReadinessMonitor,
} from './readiness';

vi.mock('axios', async (orig) => {
  const actual = await orig<typeof import('axios')>();
  return { ...actual, default: { ...actual.default, get: vi.fn() } };
});

const get = vi.mocked(axios.get);

describe('readiness helpers', () => {
  it('backs off 5s -> 10s -> 20s -> 30s (cap)', () => {
    expect([1, 2, 3, 4, 5, 9].map(nextProbeDelay)).toEqual([
      5000, 10000, 20000, 30000, 30000, 30000,
    ]);
  });
  it('requires db and model both true', () => {
    expect(isReadyBody({ db: true, model: true })).toBe(true);
    expect(isReadyBody({ db: true, model: false })).toBe(false);
    expect(isReadyBody({ db: false, model: true })).toBe(false);
    expect(isReadyBody({})).toBe(false);
    expect(isReadyBody(null)).toBe(false);
  });
});

describe('readiness monitor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetReadinessForTests();
    get.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('probes the API origin /health/ready (not /api/v1)', async () => {
    get.mockResolvedValue({ status: 200, data: { db: true, model: true } });
    const stop = startReadinessMonitor();
    await vi.advanceTimersByTimeAsync(0);
    expect(get.mock.calls[0][0]).toBe('http://localhost:8000/health/ready');
    stop();
  });

  it('goes unavailable on failure, retries with backoff, then stops polling once ready', async () => {
    get
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce({ status: 200, data: { db: true, model: false } })
      .mockResolvedValue({ status: 200, data: { db: true, model: true } });
    const stop = startReadinessMonitor();

    await vi.advanceTimersByTimeAsync(0);
    expect(getReadinessStatus()).toBe('unavailable');
    expect(get).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(5000); // 1st retry: model still false
    expect(get).toHaveBeenCalledTimes(2);
    expect(getReadinessStatus()).toBe('unavailable');

    await vi.advanceTimersByTimeAsync(10000); // 2nd retry (10s backoff): ready
    expect(get).toHaveBeenCalledTimes(3);
    expect(getReadinessStatus()).toBe('ready');

    await vi.advanceTimersByTimeAsync(120000); // no polling while ready
    expect(get).toHaveBeenCalledTimes(3);
    stop();
  });

  it('reportServiceUnavailable re-arms a probe after ready', async () => {
    get.mockResolvedValue({ status: 200, data: { db: true, model: true } });
    const stop = startReadinessMonitor();
    await vi.advanceTimersByTimeAsync(0);
    expect(get).toHaveBeenCalledTimes(1);

    get.mockRejectedValueOnce(new Error('down'));
    reportServiceUnavailable();
    await vi.advanceTimersByTimeAsync(0);
    expect(get).toHaveBeenCalledTimes(2);
    expect(getReadinessStatus()).toBe('unavailable');
    stop();
  });

  it('does nothing when the monitor is not running', async () => {
    reportServiceUnavailable();
    await vi.advanceTimersByTimeAsync(0);
    expect(get).not.toHaveBeenCalled();
  });
});
