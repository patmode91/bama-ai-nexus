interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface PerformanceReport {
  score: number;
  vitals: WebVital[];
  recommendations: string[];
  timestamp: number;
}

class PerformanceAnalyzer {
  private vitals: WebVital[] = [];
  private thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    TTFB: { good: 800, poor: 1800 },
    FCP: { good: 1800, poor: 3000 }
  };

  constructor() {
    this.initializeWebVitalsTracking();
  }

  private initializeWebVitalsTracking() {
    if (typeof window === 'undefined') return;

    // Track Largest Contentful Paint (LCP)
    this.observePerformanceEntry('largest-contentful-paint', (entry) => {
      this.recordVital('LCP', entry.startTime);
    });

    // Track First Input Delay (FID)
    this.observePerformanceEntry('first-input', (entry) => {
      this.recordVital('FID', entry.processingStart - entry.startTime);
    });

    // Track Cumulative Layout Shift (CLS)
    this.observePerformanceEntry('layout-shift', (entry) => {
      if (!entry.hadRecentInput) {
        this.recordVital('CLS', entry.value);
      }
    });

    // Track Time to First Byte (TTFB)
    window.addEventListener('load', () => {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry) {
        this.recordVital('TTFB', navEntry.responseStart - navEntry.requestStart);
      }
    });

    // Track First Contentful Paint (FCP)
    this.observePerformanceEntry('paint', (entry) => {
      if (entry.name === 'first-contentful-paint') {
        this.recordVital('FCP', entry.startTime);
      }
    });
  }

  private observePerformanceEntry(entryType: string, callback: (entry: any) => void) {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry);
        }
      });
      observer.observe({ type: entryType, buffered: true });
    } catch (e) {
      console.warn(`Could not observe ${entryType}:`, e);
    }
  }

  private recordVital(name: string, value: number) {
    const threshold = this.thresholds[name as keyof typeof this.thresholds];
    let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
    
    if (threshold) {
      if (value > threshold.poor) {
        rating = 'poor';
      } else if (value > threshold.good) {
        rating = 'needs-improvement';
      }
    }

    const vital: WebVital = {
      name,
      value,
      rating,
      timestamp: Date.now()
    };

    this.vitals.push(vital);
    
    // Keep only latest vital for each metric
    this.vitals = this.vitals.filter((v, index, arr) => 
      arr.findLastIndex(vital => vital.name === v.name) === index
    );
  }

  getPerformanceScore(): number {
    if (this.vitals.length === 0) return 100;

    const scores = this.vitals.map(vital => {
      switch (vital.rating) {
        case 'good': return 100;
        case 'needs-improvement': return 75;
        case 'poor': return 50;
        default: return 100;
      }
    });

    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  getPerformanceReport(): PerformanceReport {
    const score = this.getPerformanceScore();
    const recommendations: string[] = [];

    this.vitals.forEach(vital => {
      if (vital.rating === 'poor') {
        switch (vital.name) {
          case 'LCP':
            recommendations.push('Optimize images and remove unused CSS to improve Largest Contentful Paint');
            break;
          case 'FID':
            recommendations.push('Reduce JavaScript execution time to improve First Input Delay');
            break;
          case 'CLS':
            recommendations.push('Set size attributes on images to prevent Cumulative Layout Shift');
            break;
          case 'TTFB':
            recommendations.push('Optimize server response time and consider using a CDN');
            break;
          case 'FCP':
            recommendations.push('Minimize render-blocking resources for faster First Contentful Paint');
            break;
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Performance looks good! Continue monitoring for any regressions.');
    }

    return {
      score,
      vitals: [...this.vitals],
      recommendations,
      timestamp: Date.now()
    };
  }

  getVitals(): WebVital[] {
    return [...this.vitals];
  }

  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.recordVital(`Function_${name}`, end - start);
    return result;
  }

  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.recordVital(`Async_${name}`, end - start);
    return result;
  }
}

export const performanceAnalyzer = new PerformanceAnalyzer();
