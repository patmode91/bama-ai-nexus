
type MetricCallback = (name: string, value: number, metadata?: Record<string, any>) => void;

export class WebVitalsMonitor {
  constructor(private onMetric: MetricCallback) {}

  initialize() {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    this.initializeLCP();
    this.initializeFID();
    this.initializeCLS();
    this.initializeTTFB();
    this.initializeFCP();
  }

  private initializeLCP() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.onMetric('LCP', entry.startTime, {
            entryType: 'largest-contentful-paint'
          });
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP monitoring not supported');
    }
  }

  private initializeFID() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any;
          this.onMetric('FID', fidEntry.processingStart - entry.startTime, {
            entryType: 'first-input'
          });
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID monitoring not supported');
    }
  }

  private initializeCLS() {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as any;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
            this.onMetric('CLS', clsValue, {
              entryType: 'layout-shift'
            });
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS monitoring not supported');
    }
  }

  private initializeTTFB() {
    window.addEventListener('load', () => {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry) {
        this.onMetric('TTFB', navEntry.responseStart - navEntry.requestStart, {
          entryType: 'navigation'
        });
      }
    });
  }

  private initializeFCP() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.onMetric('FCP', entry.startTime, {
              entryType: 'paint'
            });
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('FCP monitoring not supported');
    }
  }
}
