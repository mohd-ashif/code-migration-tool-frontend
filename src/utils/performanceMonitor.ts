import { logger } from './logger';

export function initPerformanceMonitoring() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  try {
    // 1. Observe First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          logger.info(`Web Vital: FCP = ${entry.startTime.toFixed(2)} ms`);
        }
      }
    });
    fcpObserver.observe({ type: 'paint', buffered: true });

    // 2. Observe Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        logger.info(`Web Vital: LCP = ${lastEntry.startTime.toFixed(2)} ms`);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // 3. Observe Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      logger.info(`Web Vital: CLS = ${clsValue.toFixed(4)}`);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // 4. Observe Interaction to Next Paint (INP) / First Input Delay (FID)
    const fidObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as any[]) {
        logger.info(`Web Vital: FID = ${(entry.processingStart - entry.startTime).toFixed(2)} ms`);
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

  } catch (err: any) {
    logger.warn(`PerformanceObserver initialization warning: ${err.message}`);
  }
}
