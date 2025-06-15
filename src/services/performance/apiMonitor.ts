
export class APIMonitor {
  private onMetric: (name: string, value: number, metadata?: Record<string, any>) => void;
  private thresholds: { apiResponseTime: number };

  constructor(
    onMetric: (name: string, value: number, metadata?: Record<string, any>) => void,
    thresholds: { apiResponseTime: number }
  ) {
    this.onMetric = onMetric;
    this.thresholds = thresholds;
  }

  monitorAPICall(url: string, startTime: number, endTime: number, status: number) {
    const duration = endTime - startTime;
    this.onMetric('API_Response_Time', duration, {
      url,
      status,
      method: 'GET' // Could be enhanced to track method
    });

    // Alert if API is slow
    if (duration > this.thresholds.apiResponseTime) {
      console.warn(`Slow API detected: ${url} took ${duration}ms`);
    }
  }

  trackDatabaseQuery(queryName: string, duration: number, recordCount?: number) {
    this.onMetric('DB_Query_Time', duration, {
      query: queryName,
      records: recordCount
    });
  }
}
