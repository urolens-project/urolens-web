import axios from 'axios';
import { useSyncExternalStore } from 'react';
import { resolveApiOrigin } from './apiBaseUrl';

// Backend readiness: GET /health/ready at the API ORIGIN (not under /api/v1).
// Expected body: { db: boolean, model: boolean }. Not ready => "service
// starting" banner. Probing backs off 5s -> 30s (cap) and stops once ready.
// A redeploy takes ~1.5 min, so a failed API call re-arms the probe.

export type ReadinessStatus = 'unknown' | 'ready' | 'unavailable';

const BASE_DELAY_MS = 5_000;
const MAX_DELAY_MS = 30_000;
const PROBE_TIMEOUT_MS = 10_000;

/** Delay before the next probe after `failures` consecutive failures (1-based). */
export function nextProbeDelay(failures: number): number {
  return Math.min(BASE_DELAY_MS * 2 ** Math.max(failures - 1, 0), MAX_DELAY_MS);
}

export function isReadyBody(data: unknown): boolean {
  const d = data as { db?: unknown; model?: unknown } | null;
  return d?.db === true && d?.model === true;
}

let status: ReadinessStatus = 'unknown';
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;
let probing = false;
let failures = 0;
let active = false;

function setStatus(next: ReadinessStatus) {
  if (status === next) return;
  status = next;
  listeners.forEach((l) => l());
}

export function getReadinessStatus(): ReadinessStatus {
  return status;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useReadinessStatus(): ReadinessStatus {
  return useSyncExternalStore(subscribe, getReadinessStatus, getReadinessStatus);
}

export async function probeReadiness(): Promise<boolean> {
  try {
    const origin = resolveApiOrigin(import.meta.env.VITE_API_BASE_URL);
    // Plain axios: no auth header, no case conversion, no global 401 handling.
    const res = await axios.get(`${origin}/health/ready`, { timeout: PROBE_TIMEOUT_MS });
    return res.status >= 200 && res.status < 300 && isReadyBody(res.data);
  } catch {
    return false;
  }
}

async function runProbe(): Promise<void> {
  if (!active || probing) return;
  probing = true;
  timer = null;
  const ok = await probeReadiness();
  probing = false;
  if (!active) return;
  if (ok) {
    failures = 0;
    setStatus('ready');
    return; // ready: stop polling entirely
  }
  failures += 1;
  setStatus('unavailable');
  timer = setTimeout(() => void runProbe(), nextProbeDelay(failures));
}

/** Start monitoring (idempotent). Returns a stop function. */
export function startReadinessMonitor(): () => void {
  active = true;
  if (!probing && timer === null) void runProbe();
  return () => {
    active = false;
    if (timer) clearTimeout(timer);
    timer = null;
  };
}

/** Called when an API call fails in a way that suggests the backend is down: re-arm the probe. */
export function reportServiceUnavailable(): void {
  if (!active || probing || timer !== null) return;
  failures = 0;
  void runProbe();
}

/** Test helper. */
export function resetReadinessForTests(): void {
  active = false;
  probing = false;
  failures = 0;
  if (timer) clearTimeout(timer);
  timer = null;
  status = 'unknown';
  listeners.clear();
}
