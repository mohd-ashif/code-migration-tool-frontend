// ── Performance Monitor ───────────────────────────────────────────────────────
// Uses native PerformanceObserver to capture Web Vitals (FCP, LCP, CLS, INP)
// without any additional bundle cost. Results are logged via the app logger.

import { logger } from './logger';

export interface VitalsReport {
  FCP?: number;  // First Contentful Paint  (ms)
  LCP?: number;  // Largest Contentful Paint (ms)
  CLS?: number;  // Cumulative Layout Shift  (score)
  INP?: number;  // Interaction to Next Paint (ms)
  TTFB?: number; // Time to First Byte       (ms)
}

const report: VitalsReport = {};

// ── Helpers ──────────────────────────────────────────────────────────────────

function round(n: number, decimals = 2): number {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}

function logVital(name: string, value: number) {
  const formatted = name === 'CLS' ? round(value, 4) : Math.round(value);
  const unit = name === 'CLS' ? '' : ' ms';
  logger.info(`[Web Vital] ${name}: ${formatted}${unit}`, { metric: name, value });
}

// ── Observers ────────────────────────────────────────────────────────────────

function observePaint() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          report.FCP = entry.startTime;
          logVital('FCP', entry.startTime);
        }
      }
    });
    po.observe({ type: 'paint', buffered: true });
  } catch { /* browser may not support */ }
}

function observeLCP() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const po = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as any;
      if (last) {
        report.LCP = last.startTime;
        logVital('LCP', last.startTime);
      }
    });
    po.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch { /* browser may not support */ }
}

function observeCLS() {
  if (!('PerformanceObserver' in window)) return;

  try {
    let clsScore = 0;
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      }
      report.CLS = clsScore;
      logVital('CLS', clsScore);
    });
    po.observe({ type: 'layout-shift', buffered: true });
  } catch { /* browser may not support */ }
}

function observeINP() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        const value = entry.duration ?? entry.processingEnd - entry.startTime;
        if (value !== undefined) {
          report.INP = Math.max(report.INP ?? 0, value);
          logVital('INP', report.INP);
        }
      }
    });
    po.observe({ type: 'event', buffered: true, durationThreshold: 16 } as any);
  } catch { /* browser may not support */ }
}

function observeTTFB() {
  if (!('performance' in window && 'getEntriesByType' in performance)) return;

  try {
    const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntry) {
      const ttfb = navEntry.responseStart;
      report.TTFB = ttfb;
      logVital('TTFB', ttfb);
    }
  } catch { /* browser may not support */ }
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Bootstrap all performance observers. Call once on app init. */
export function initPerformanceMonitor(): void {
  observePaint();
  observeLCP();
  observeCLS();
  observeINP();
  observeTTFB();
  logger.info('[PerfMonitor] Web Vitals observers initialised.');
}

/** Returns the latest captured vitals snapshot. */
export function getVitalsReport(): VitalsReport {
  return { ...report };
}
