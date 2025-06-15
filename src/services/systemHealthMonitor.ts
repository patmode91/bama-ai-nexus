
import { performanceMonitor } from './performanceMonitor';
import { cacheService } from './cacheService';
import { logger } from './loggerService';

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  performance: number;
  memory: number;
  cache: number;
  api: number;
  errors: number;
  uptime: number;
}

interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  value?: number;
  threshold?: number;
  message?: string;
}

class SystemHealthMonitor {
  private startTime = Date.now();
  private errorCount = 0;
  private totalRequests = 0;

  async getSystemHealth(): Promise<SystemHealth> {
    const checks = await this.runHealthChecks();
    
    const performance = this.calculatePerformanceHealth();
    const memory = this.calculateMemoryHealth();
    const cache = this.calculateCacheHealth();
    const api = this.calculateAPIHealth();
    const errors = this.calculateErrorRate();
    const uptime = this.getUptime();

    const overall = this.determineOverallHealth([
      performance, memory, cache, api, errors
    ]);

    return {
      overall,
      performance,
      memory,
      cache,
      api,
      errors,
      uptime
    };
  }

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

    // Cache check
    const cacheStats = cacheService.getStats();
    const cacheHitRate = cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0;
    checks.push({
      name: 'Cache Hit Rate',
      status: cacheHitRate > 0.8 ? 'pass' : cacheHitRate > 0.6 ? 'warn' : 'fail',
      value: cacheHitRate * 100,
      threshold: 80,
      message: `Cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%`
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

  private calculatePerformanceHealth(): number {
    const score = performanceMonitor.calculatePerformanceScore();
    return Math.max(0, Math.min(100, score));
  }

  private calculateMemoryHealth(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
      const usage = (usedMB / limitMB) * 100;
      return Math.max(0, 100 - usage);
    }
    return 100;
  }

  private calculateCacheHealth(): number {
    const stats = cacheService.getStats();
    const hitRate = stats.hits / (stats.hits + stats.misses) || 0;
    return hitRate * 100;
  }

  private calculateAPIHealth(): number {
    const metrics = performanceMonitor.getMetricsSummary();
    const avgTime = metrics.API_Response_Time?.avg || 0;
    
    if (avgTime < 300) return 100;
    if (avgTime < 500) return 80;
    if (avgTime < 1000) return 60;
    if (avgTime < 2000) return 40;
    return 20;
  }

  private calculateErrorRate(): number {
    const errorRate = this.totalRequests > 0 ? this.errorCount / this.totalRequests : 0;
    return Math.max(0, 100 - (errorRate * 100));
  }

  private getUptime(): number {
    return Date.now() - this.startTime;
  }

  private determineOverallHealth(scores: number[]): SystemHealth['overall'] {
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

  generateHealthReport() {
    return {
      timestamp: Date.now(),
      health: this.getSystemHealth(),
      recommendations: this.getHealthRecommendations()
    };
  }

  private getHealthRecommendations(): string[] {
    const recommendations: string[] = [];
    const health = this.calculatePerformanceHealth();
    
    if (health < 70) {
      recommendations.push('Consider optimizing component rendering');
      recommendations.push('Review and optimize database queries');
      recommendations.push('Implement code splitting for better performance');
    }
    
    const memoryHealth = this.calculateMemoryHealth();
    if (memoryHealth < 70) {
      recommendations.push('Monitor memory leaks in components');
      recommendations.push('Optimize large data structures');
      recommendations.push('Consider implementing virtual scrolling');
    }
    
    const cacheHealth = this.calculateCacheHealth();
    if (cacheHealth < 70) {
      recommendations.push('Review cache strategies');
      recommendations.push('Optimize cache TTL settings');
      recommendations.push('Consider implementing cache warming');
    }
    
    return recommendations;
  }
}

export const systemHealthMonitor = new SystemHealthMonitor();

// Auto-start monitoring
if (typeof window !== 'undefined') {
  // Track window errors
  window.addEventListener('error', () => {
    systemHealthMonitor.recordError();
  });
  
  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', () => {
    systemHealthMonitor.recordError();
  });
}
