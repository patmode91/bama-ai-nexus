
import { WebVitalsMonitor } from './webVitalsMonitor';
import { APIMonitor } from './apiMonitor';
import { MemoryMonitor } from './memoryMonitor';
import { MetricsAnalyzer } from './metricsAnalyzer';
import { defaultThresholds, PerformanceThresholds } from './performanceThresholds';

class PerformanceMonitor {
  private webVitalsMonitor: WebVitalsMonitor;
  private apiMonitor: APIMonitor;
  private memoryMonitor: MemoryMonitor;
  private metricsAnalyzer: MetricsAnalyzer;
  private thresholds: PerformanceThresholds;

  constructor() {
    this.thresholds = defaultThresholds;
    this.metricsAnalyzer = new MetricsAnalyzer();
    
    const onMetric = (name: string, value: number, metadata?: Record<string, any>) => {
      this.metricsAnalyzer.addMetric(name, value, metadata);
    };

    this.webVitalsMonitor = new WebVitalsMonitor(onMetric);
    this.apiMonitor = new APIMonitor(onMetric, this.thresholds);
    this.memoryMonitor = new MemoryMonitor(onMetric);
  }

  // Core Web Vitals monitoring
  initializeWebVitals() {
    this.webVitalsMonitor.initialize();
  }

  // API performance monitoring
  monitorAPICall(url: string, startTime: number, endTime: number, status: number) {
    this.apiMonitor.monitorAPICall(url, startTime, endTime, status);
  }

  // Memory usage monitoring
  monitorMemoryUsage() {
    this.memoryMonitor.monitorMemoryUsage();
  }

  // Bundle size analysis
  analyzeBundlePerformance() {
    this.memoryMonitor.analyzeBundlePerformance();
  }

  // Component render time tracking
  trackComponentRender(componentName: string, renderTime: number) {
    this.memoryMonitor.trackComponentRender(componentName, renderTime);
  }

  // Database query performance
  trackDatabaseQuery(queryName: string, duration: number, recordCount?: number) {
    this.apiMonitor.trackDatabaseQuery(queryName, duration, recordCount);
  }

  // Analytics and reporting
  getMetricsSummary(timeRange?: number) {
    return this.metricsAnalyzer.getMetricsSummary(timeRange);
  }

  // Performance score calculation
  calculatePerformanceScore(): number {
    return this.metricsAnalyzer.calculatePerformanceScore(this.thresholds);
  }

  // Export metrics for external analysis
  exportMetrics() {
    return this.metricsAnalyzer.exportMetrics();
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
