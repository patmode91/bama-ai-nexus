
import { PerformanceThresholds } from './performanceThresholds';

type MetricCallback = (name: string, value: number, metadata?: Record<string, any>) => void;

export class APIMonitor {
  constructor(
    private onMetric: MetricCallback,
    private thresholds: PerformanceThresholds
  ) {}

  monitorAPICall(url: string, startTime: number, endTime: number, status: number) {
    const duration = endTime - startTime;
    
    this.onMetric('API_CALL_DURATION', duration, {
      url,
      status,
      timestamp: Date.now()
    });

    // Check if API call is slow
    if (duration > this.thresholds.apiCall.warning) {
      console.warn(`Slow API call detected: ${url} took ${duration}ms`);
    }

    // Track error rates
    if (status >= 400) {
      this.onMetric('API_ERROR', 1, {
        url,
        status,
        timestamp: Date.now()
      });
    }
  }

  trackDatabaseQuery(queryName: string, duration: number, recordCount?: number) {
    this.onMetric('DB_QUERY_DURATION', duration, {
      queryName,
      recordCount,
      timestamp: Date.now()
    });

    if (duration > this.thresholds.databaseQuery.warning) {
      console.warn(`Slow database query: ${queryName} took ${duration}ms`);
    }
  }
}
