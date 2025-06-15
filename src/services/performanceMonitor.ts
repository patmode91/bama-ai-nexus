interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceThresholds {
  pageLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  bundleSize: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private thresholds: PerformanceThresholds = {
    pageLoadTime: 3000, // 3 seconds
    apiResponseTime: 1000, // 1 second
    memoryUsage: 100, // 100MB
    bundleSize: 2000 // 2MB
  };

  // Core Web Vitals monitoring
  initializeWebVitals() {
    // Largest Contentful Paint (LCP)
    this.observeLCP();
    
    // First Input Delay (FID) 
    this.observeFID();
    
    // Cumulative Layout Shift (CLS)
    this.observeCLS();
    
    // Time to First Byte (TTFB)
    this.observeTTFB();
  }

  private observeLCP() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('LCP', entry.startTime, {
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
        this.recordMetric('FID', (entry as any).processingStart - entry.startTime, {
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
          this.recordMetric('CLS', clsValue);
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
      this.recordMetric('TTFB', ttfb);
    }
  }

  // API performance monitoring
  monitorAPICall(url: string, startTime: number, endTime: number, status: number) {
    const duration = endTime - startTime;
    this.recordMetric('API_Response_Time', duration, {
      url,
      status,
      method: 'GET' // Could be enhanced to track method
    });

    // Alert if API is slow
    if (duration > this.thresholds.apiResponseTime) {
      console.warn(`Slow API detected: ${url} took ${duration}ms`);
    }
  }

  // Memory usage monitoring
  monitorMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.recordMetric('Memory_Used', memory.usedJSHeapSize / 1024 / 1024, {
        total: memory.totalJSHeapSize / 1024 / 1024,
        limit: memory.jsHeapSizeLimit / 1024 / 1024
      });
    }
  }

  // Bundle size analysis
  analyzeBundlePerformance() {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let totalBundleSize = 0;
    
    resources.forEach(resource => {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        totalBundleSize += resource.transferSize || 0;
      }
    });

    this.recordMetric('Bundle_Size', totalBundleSize / 1024, {
      resourceCount: resources.length
    });
  }

  // Component render time tracking
  trackComponentRender(componentName: string, renderTime: number) {
    this.recordMetric('Component_Render', renderTime, {
      component: componentName
    });
  }

  // Database query performance
  trackDatabaseQuery(queryName: string, duration: number, recordCount?: number) {
    this.recordMetric('DB_Query_Time', duration, {
      query: queryName,
      records: recordCount
    });
  }

  private recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata
    });

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  // Analytics and reporting
  getMetricsSummary(timeRange: number = 300000) { // 5 minutes default
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < timeRange);
    
    const summary: Record<string, any> = {};
    
    recentMetrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity,
          avg: 0
        };
      }
      
      const stats = summary[metric.name];
      stats.count++;
      stats.total += metric.value;
      stats.min = Math.min(stats.min, metric.value);
      stats.max = Math.max(stats.max, metric.value);
      stats.avg = stats.total / stats.count;
    });

    return summary;
  }

  // Performance score calculation
  calculatePerformanceScore(): number {
    const summary = this.getMetricsSummary();
    let score = 100;

    // Deduct points for poor metrics
    if (summary.LCP?.avg > 2500) score -= 20;
    if (summary.FID?.avg > 100) score -= 15;
    if (summary.CLS?.avg > 0.1) score -= 15;
    if (summary.TTFB?.avg > 600) score -= 10;
    if (summary.API_Response_Time?.avg > this.thresholds.apiResponseTime) score -= 20;
    if (summary.Memory_Used?.avg > this.thresholds.memoryUsage) score -= 10;
    if (summary.Bundle_Size?.avg > this.thresholds.bundleSize) score -= 10;

    return Math.max(0, score);
  }

  // Export metrics for external analysis
  exportMetrics() {
    return {
      metrics: this.metrics,
      summary: this.getMetricsSummary(),
      score: this.calculatePerformanceScore(),
      timestamp: Date.now()
    };
  }

  // Real-time performance alerts
  setupAlerts() {
    setInterval(() => {
      this.monitorMemoryUsage();
      const score = this.calculatePerformanceScore();
      
      if (score < 70) {
        console.warn(`Performance score is low: ${score}/100`);
        // Could trigger notifications or alerts here
      }
    }, 30000); // Check every 30 seconds
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.initializeWebVitals();
  performanceMonitor.setupAlerts();
}
