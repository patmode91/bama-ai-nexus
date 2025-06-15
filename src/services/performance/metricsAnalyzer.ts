export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class MetricsAnalyzer {
  private metrics: PerformanceMetric[] = [];

  addMetric(name: string, value: number, metadata?: Record<string, any>) {
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

  calculatePerformanceScore(thresholds: any): number {
    const summary = this.getMetricsSummary();
    let score = 100;

    // Deduct points for poor metrics
    if (summary.LCP?.avg > 2500) score -= 20;
    if (summary.FID?.avg > 100) score -= 15;
    if (summary.CLS?.avg > 0.1) score -= 15;
    if (summary.TTFB?.avg > 600) score -= 10;
    if (summary.API_Response_Time?.avg > thresholds.apiResponseTime) score -= 20;
    if (summary.Memory_Used?.avg > thresholds.memoryUsage) score -= 10;
    if (summary.Bundle_Size?.avg > thresholds.bundleSize) score -= 10;

    return Math.max(0, score);
  }

  exportMetrics() {
    return {
      metrics: this.metrics,
      summary: this.getMetricsSummary(),
      score: this.calculatePerformanceScore({
        apiResponseTime: 1000,
        memoryUsage: 100,
        bundleSize: 2000
      }),
      timestamp: Date.now()
    };
  }
}
