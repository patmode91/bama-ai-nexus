import { performanceMonitor } from '../performanceMonitor';
import { logger } from '../loggerService';

interface HealthCheck {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  lastChecked: number;
  responseTime?: number;
  message?: string;
  details?: Record<string, any>;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  score: number;
  checks: HealthCheck[];
  timestamp: number;
}

class SystemHealthService {
  private healthChecks: Map<string, HealthCheck> = new Map();
  private healthHistory: SystemHealth[] = [];
  private checkInterval: number = 30000; // 30 seconds
  private intervalId?: NodeJS.Timeout;
  private isInitialized: boolean = false;

  constructor() {
    this.safeInitialize();
  }

  private safeInitialize(): void {
    try {
      this.initializeHealthChecks();
      this.isInitialized = true;
      // Start monitoring with a delay to ensure all services are ready
      setTimeout(() => {
        this.startMonitoring();
      }, 1000);
    } catch (error) {
      console.error('Failed to initialize SystemHealthService:', error);
      this.isInitialized = false;
    }
  }

  private initializeHealthChecks(): void {
    const defaultChecks: Omit<HealthCheck, 'lastChecked' | 'status'>[] = [
      {
        id: 'performance',
        name: 'Performance Score',
      },
      {
        id: 'memory',
        name: 'Memory Usage',
      },
      {
        id: 'api_response',
        name: 'API Response Time',
      },
      {
        id: 'core_vitals',
        name: 'Core Web Vitals',
      },
      {
        id: 'error_rate',
        name: 'Error Rate',
      }
    ];

    defaultChecks.forEach(check => {
      this.healthChecks.set(check.id, {
        ...check,
        status: 'unknown',
        lastChecked: 0
      });
    });
  }

  private startMonitoring(): void {
    if (!this.isInitialized) {
      console.warn('SystemHealthService not initialized, skipping monitoring start');
      return;
    }

    this.runHealthChecks();
    this.intervalId = setInterval(() => {
      this.runHealthChecks();
    }, this.checkInterval);
  }

  private async runHealthChecks(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      logger.debug('Running system health checks', {}, 'SystemHealth');

      await Promise.all([
        this.checkPerformanceScore(),
        this.checkMemoryUsage(),
        this.checkAPIResponseTime(),
        this.checkCoreWebVitals(),
        this.checkErrorRate()
      ]);

      this.updateSystemHealth();
    } catch (error) {
      console.error('Error running health checks:', error);
      logger.error('Error running health checks', { error }, 'SystemHealth');
    }
  }

  private async checkPerformanceScore(): Promise<void> {
    const check = this.healthChecks.get('performance');
    if (!check) return;

    try {
      const score = performanceMonitor?.calculatePerformanceScore() || 0;
      
      check.status = score >= 90 ? 'healthy' : score >= 70 ? 'warning' : 'critical';
      check.lastChecked = Date.now();
      check.details = { score };
      check.message = `Performance score: ${score}/100`;
    } catch (error) {
      check.status = 'critical';
      check.message = 'Failed to check performance score';
      console.error('Performance score check failed:', error);
    }
  }

  private async checkMemoryUsage(): Promise<void> {
    const check = this.healthChecks.get('memory');
    if (!check) return;

    try {
      const metrics = performanceMonitor?.getMetricsSummary() || {};
      const memoryUsage = metrics.MEMORY_USAGE_PERCENT?.latest || 0;
      
      check.status = memoryUsage < 75 ? 'healthy' : memoryUsage < 90 ? 'warning' : 'critical';
      check.lastChecked = Date.now();
      check.details = { memoryUsage };
      check.message = `Memory usage: ${memoryUsage.toFixed(1)}%`;
    } catch (error) {
      check.status = 'critical';
      check.message = 'Failed to check memory usage';
      console.error('Memory usage check failed:', error);
    }
  }

  private async checkAPIResponseTime(): Promise<void> {
    const check = this.healthChecks.get('api_response');
    if (!check) return;

    try {
      const metrics = performanceMonitor?.getMetricsSummary() || {};
      const avgResponseTime = metrics.API_CALL_DURATION?.average || 0;
      
      check.status = avgResponseTime < 1000 ? 'healthy' : avgResponseTime < 3000 ? 'warning' : 'critical';
      check.lastChecked = Date.now();
      check.responseTime = avgResponseTime;
      check.details = { avgResponseTime };
      check.message = `Average API response: ${avgResponseTime.toFixed(0)}ms`;
    } catch (error) {
      check.status = 'critical';
      check.message = 'Failed to check API response time';
      console.error('API response time check failed:', error);
    }
  }

  private async checkCoreWebVitals(): Promise<void> {
    const check = this.healthChecks.get('core_vitals');
    if (!check) return;

    try {
      const metrics = performanceMonitor?.getMetricsSummary() || {};
      const lcp = metrics.LCP?.latest || 0;
      const fid = metrics.FID?.latest || 0;
      const cls = metrics.CLS?.latest || 0;

      const vitalsHealthy = lcp < 2500 && fid < 100 && cls < 0.1;
      const vitalsWarning = lcp < 4000 && fid < 300 && cls < 0.25;

      check.status = vitalsHealthy ? 'healthy' : vitalsWarning ? 'warning' : 'critical';
      check.lastChecked = Date.now();
      check.details = { lcp, fid, cls };
      check.message = `LCP: ${lcp.toFixed(0)}ms, FID: ${fid.toFixed(0)}ms, CLS: ${cls.toFixed(3)}`;
    } catch (error) {
      check.status = 'critical';
      check.message = 'Failed to check Core Web Vitals';
      console.error('Core Web Vitals check failed:', error);
    }
  }

  private async checkErrorRate(): Promise<void> {
    const check = this.healthChecks.get('error_rate');
    if (!check) return;

    try {
      // Simulate error rate monitoring
      const errorRate = Math.random() * 5; // 0-5% error rate simulation
      
      check.status = errorRate < 1 ? 'healthy' : errorRate < 3 ? 'warning' : 'critical';
      check.lastChecked = Date.now();
      check.details = { errorRate };
      check.message = `Error rate: ${errorRate.toFixed(2)}%`;
    } catch (error) {
      check.status = 'critical';
      check.message = 'Failed to check error rate';
      console.error('Error rate check failed:', error);
    }
  }

  private updateSystemHealth(): void {
    if (!this.isInitialized) return;

    try {
      const checks = Array.from(this.healthChecks.values());
      const healthyCount = checks.filter(c => c.status === 'healthy').length;
      const warningCount = checks.filter(c => c.status === 'warning').length;
      const criticalCount = checks.filter(c => c.status === 'critical').length;

      let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
      let score = 100;

      if (criticalCount > 0) {
        overall = 'critical';
        score = Math.max(0, 100 - (criticalCount * 30) - (warningCount * 15));
      } else if (warningCount > 0) {
        overall = 'warning';
        score = Math.max(50, 100 - (warningCount * 20));
      }

      const systemHealth: SystemHealth = {
        overall,
        score,
        checks: [...checks],
        timestamp: Date.now()
      };

      this.healthHistory.push(systemHealth);

      // Keep only last 100 health records
      if (this.healthHistory.length > 100) {
        this.healthHistory = this.healthHistory.slice(-100);
      }

      logger.debug('System health updated', { 
        overall, 
        score, 
        healthyCount, 
        warningCount, 
        criticalCount 
      }, 'SystemHealth');
    } catch (error) {
      console.error('Failed to update system health:', error);
    }
  }

  // Public API
  getCurrentHealth(): SystemHealth | null {
    if (!this.isInitialized) return null;
    return this.healthHistory[this.healthHistory.length - 1] || null;
  }

  getHealthHistory(count = 50): SystemHealth[] {
    if (!this.isInitialized) return [];
    return this.healthHistory.slice(-count);
  }

  getHealthCheck(id: string): HealthCheck | undefined {
    if (!this.isInitialized) return undefined;
    return this.healthChecks.get(id);
  }

  getAllHealthChecks(): HealthCheck[] {
    if (!this.isInitialized) return [];
    return Array.from(this.healthChecks.values());
  }

  setCheckInterval(intervalMs: number): void {
    this.checkInterval = intervalMs;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    if (this.isInitialized) {
      this.startMonitoring();
    }
  }

  async runManualCheck(): Promise<SystemHealth | null> {
    if (!this.isInitialized) return null;
    
    await this.runHealthChecks();
    return this.getCurrentHealth();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const systemHealthService = new SystemHealthService();
export default systemHealthService;
