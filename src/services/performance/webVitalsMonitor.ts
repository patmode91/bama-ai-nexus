
interface WebVitalsMetrics {
  LCP?: number;
  FID?: number;
  CLS?: number;
  TTFB?: number;
}

export class WebVitalsMonitor {
  private onMetric: (name: string, value: number, metadata?: Record<string, any>) => void;

  constructor(onMetric: (name: string, value: number, metadata?: Record<string, any>) => void) {
    this.onMetric = onMetric;
  }

  initialize() {
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeTTFB();
  }

  private observeLCP() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.onMetric('LCP', entry.startTime, {
          element: (entry as any).element?.tagName,
          url: (entry as any).url
        });
      }
    });
    
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observation not supported');
    }
  }

  private observeFID() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.onMetric('FID', (entry as any).processingStart - entry.startTime, {
          eventType: (entry as any).name
        });
      }
    });
    
    try {
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observation not supported');
    }
  }

  private observeCLS() {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          this.onMetric('CLS', clsValue);
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observation not supported');
    }
  }

  private observeTTFB() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.fetchStart;
      this.onMetric('TTFB', ttfb);
    }
  }
}
