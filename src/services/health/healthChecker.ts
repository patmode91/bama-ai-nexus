
import { performanceMonitor } from '../performanceMonitor';
import { cacheService } from '../cacheService';
import { HealthCheck } from './types';

export class HealthChecker {
  async runHealthChecks(): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    // Performance check
    const perfScore = performanceMonitor.calculatePerformanceScore();
    checks.push({
      name: 'Performance Score',
      status: perfScore > 80 ? 'pass' : perfScore > 60 ? 'warn' : 'fail',
      value: perfScore,
      threshold: 80,
      message: `Current performance score: ${perfScore}/100`
    });

    // Memory check
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      checks.push({
        name: 'Memory Usage',
        status: usedMB < 100 ? 'pass' : usedMB < 150 ? 'warn' : 'fail',
        value: usedMB,
        threshold: 100,
        message: `Memory usage: ${usedMB.toFixed(1)}MB`
      });
    }

    // Cache check - using simple size-based health metric
    const cacheStats = cacheService.getStats();
    const cacheHealth = cacheStats.size < 1000 ? 100 : Math.max(0, 100 - (cacheStats.size / 1000) * 10);
    checks.push({
      name: 'Cache Health',
      status: cacheHealth > 80 ? 'pass' : cacheHealth > 60 ? 'warn' : 'fail',
      value: cacheHealth,
      threshold: 80,
      message: `Cache entries: ${cacheStats.size}`
    });

    // API health check
    const apiMetrics = performanceMonitor.getMetricsSummary();
    const avgApiTime = apiMetrics.API_Response_Time?.avg || 0;
    checks.push({
      name: 'API Response Time',
      status: avgApiTime < 500 ? 'pass' : avgApiTime < 1000 ? 'warn' : 'fail',
      value: avgApiTime,
      threshold: 500,
      message: `Average API response time: ${avgApiTime.toFixed(0)}ms`
    });

    return checks;
  }
}
