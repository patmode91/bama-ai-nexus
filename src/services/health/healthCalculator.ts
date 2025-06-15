
import { performanceMonitor } from '../performanceMonitor';
import { cacheService } from '../cacheService';
import { SystemHealth } from './types';

export class HealthCalculator {
  private startTime = Date.now();
  private errorCount = 0;
  private totalRequests = 0;

  calculatePerformanceHealth(): number {
    const score = performanceMonitor.calculatePerformanceScore();
    return Math.max(0, Math.min(100, score));
  }

  calculateMemoryHealth(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
      const usage = (usedMB / limitMB) * 100;
      return Math.max(0, 100 - usage);
    }
    return 100;
  }

  calculateCacheHealth(): number {
    const stats = cacheService.getStats();
    // Simple cache health based on size
    return stats.size < 1000 ? 100 : Math.max(0, 100 - (stats.size / 1000) * 10);
  }

  calculateAPIHealth(): number {
    const metrics = performanceMonitor.getMetricsSummary();
    const avgTime = metrics.API_Response_Time?.avg || 0;
    
    if (avgTime < 300) return 100;
    if (avgTime < 500) return 80;
    if (avgTime < 1000) return 60;
    if (avgTime < 2000) return 40;
    return 20;
  }

  calculateErrorRate(): number {
    const errorRate = this.totalRequests > 0 ? this.errorCount / this.totalRequests : 0;
    return Math.max(0, 100 - (errorRate * 100));
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }

  determineOverallHealth(scores: number[]): SystemHealth['overall'] {
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    if (average >= 80) return 'healthy';
    if (average >= 60) return 'warning';
    return 'critical';
  }

  recordError() {
    this.errorCount++;
  }

  recordRequest() {
    this.totalRequests++;
  }
}
