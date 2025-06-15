
interface ErrorEvent {
  id: string;
  message: string;
  stack?: string;
  url: string;
  lineNumber?: number;
  columnNumber?: number;
  timestamp: number;
  userAgent: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class ErrorTracker {
  private errors: ErrorEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private maxErrors = 1000;
  private maxMetrics = 1000;

  constructor() {
    this.setupGlobalErrorHandlers();
    this.setupPerformanceMonitoring();
  }

  private setupGlobalErrorHandlers() {
    if (typeof window !== 'undefined') {
      // Handle JavaScript errors
      window.addEventListener('error', (event) => {
        this.captureError({
          message: event.message,
          stack: event.error?.stack,
          url: event.filename || window.location.href,
          lineNumber: event.lineno,
          columnNumber: event.colno,
          metadata: { type: 'javascript' }
        });
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.captureError({
          message: `Unhandled Promise Rejection: ${event.reason}`,
          stack: event.reason?.stack,
          url: window.location.href,
          metadata: { type: 'promise_rejection' }
        });
      });
    }
  }

  private setupPerformanceMonitoring() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Fix: Check if entry has value property, otherwise use startTime
          const value = 'value' in entry ? (entry as any).value : entry.startTime;
          this.recordMetric(entry.name, value || 0, {
            entryType: entry.entryType,
            startTime: entry.startTime
          });
        }
      });

      try {
        observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
      } catch (e) {
        console.warn('Performance monitoring not supported');
      }
    }
  }

  captureError(error: Partial<ErrorEvent>) {
    const errorEvent: ErrorEvent = {
      id: `error-${Date.now()}-${Math.random()}`,
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      lineNumber: error.lineNumber,
      columnNumber: error.columnNumber,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      userId: error.userId,
      metadata: error.metadata
    };

    this.errors.push(errorEvent);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // In production, send to external service
    if (import.meta.env.PROD) {
      this.sendToErrorService(errorEvent);
    }

    console.error('Error captured:', errorEvent);
  }

  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  private async sendToErrorService(error: ErrorEvent) {
    try {
      // This would typically send to Sentry, LogRocket, or similar
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      });
    } catch (e) {
      console.warn('Failed to send error to service:', e);
    }
  }

  getErrors(limit = 50): ErrorEvent[] {
    return this.errors.slice(-limit);
  }

  getMetrics(name?: string, timeRange = 300000): PerformanceMetric[] {
    const now = Date.now();
    let filtered = this.metrics.filter(m => now - m.timestamp < timeRange);
    
    if (name) {
      filtered = filtered.filter(m => m.name === name);
    }
    
    return filtered;
  }

  getErrorRate(timeRange = 300000): number {
    const now = Date.now();
    const recentErrors = this.errors.filter(e => now - e.timestamp < timeRange);
    return recentErrors.length / (timeRange / 60000); // errors per minute
  }

  clearErrors() {
    this.errors = [];
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export const errorTracker = new ErrorTracker();
