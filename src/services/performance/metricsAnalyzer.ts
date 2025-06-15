import { PerformanceThresholds } from './performanceThresholds';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class MetricsAnalyzer {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  addMetric(name: string, value: number, metadata?: Record<string, any>) {
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

  getMetricsSummary(timeRange = 300000) { // 5 minutes default
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < timeRange);

    const summary: Record<string, any> = {};

    // Group metrics by name
    const groupedMetrics = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    // Calculate statistics for each metric
    Object.entries(groupedMetrics).forEach(([name, values]) => {
      summary[name] = {
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        latest: values[values.length - 1]
      };
    });

    return summary;
  }

  calculatePerformanceScore(thresholds: PerformanceThresholds): number {
    const summary = this.getMetricsSummary();
    let score = 100;
    let factors = 0;

    // Check Core Web Vitals
    if (summary.LCP) {
      factors++;
      if (summary.LCP.latest > thresholds.webVitals.LCP.poor) {
        score -= 30;
      } else if (summary.LCP.latest > thresholds.webVitals.LCP.warning) {
        score -= 15;
      }
    }

    if (summary.FID) {
      factors++;
      if (summary.FID.latest > thresholds.webVitals.FID.poor) {
        score -= 30;
      } else if (summary.FID.latest > thresholds.webVitals.FID.warning) {
        score -= 15;
      }
    }

    if (summary.CLS) {
      factors++;
      if (summary.CLS.latest > thresholds.webVitals.CLS.poor) {
        score -= 30;
      } else if (summary.CLS.latest > thresholds.webVitals.CLS.warning) {
        score -= 15;
      }
    }

    // Check API performance
    if (summary.API_CALL_DURATION) {
      factors++;
      if (summary.API_CALL_DURATION.average > thresholds.apiCall.poor) {
        score -= 20;
      } else if (summary.API_CALL_DURATION.average > thresholds.apiCall.warning) {
        score -= 10;
      }
    }

    // Check memory usage
    if (summary.MEMORY_USAGE_PERCENT) {
      factors++;
      if (summary.MEMORY_USAGE_PERCENT.latest > 90) {
        score -= 25;
      } else if (summary.MEMORY_USAGE_PERCENT.latest > 75) {
        score -= 10;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  exportMetrics() {
    return {
      metrics: [...this.metrics],
      summary: this.getMetricsSummary(),
      exportTime: new Date().toISOString()
    };
  }

  clearMetrics() {
    this.metrics = [];
  }
}
