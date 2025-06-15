
import { SystemHealth, HealthCheck, HealthReport } from './types';
import { HealthChecker } from './healthChecker';
import { HealthCalculator } from './healthCalculator';
import { RecommendationsGenerator } from './recommendationsGenerator';

class SystemHealthMonitor {
  private healthChecker: HealthChecker;
  private healthCalculator: HealthCalculator;
  private recommendationsGenerator: RecommendationsGenerator;

  constructor() {
    this.healthChecker = new HealthChecker();
    this.healthCalculator = new HealthCalculator();
    this.recommendationsGenerator = new RecommendationsGenerator(this.healthCalculator);
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const checks = await this.runHealthChecks();
    
    const performance = this.healthCalculator.calculatePerformanceHealth();
    const memory = this.healthCalculator.calculateMemoryHealth();
    const cache = this.healthCalculator.calculateCacheHealth();
    const api = this.healthCalculator.calculateAPIHealth();
    const errors = this.healthCalculator.calculateErrorRate();
    const uptime = this.healthCalculator.getUptime();

    const overall = this.healthCalculator.determineOverallHealth([
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
    return this.healthChecker.runHealthChecks();
  }

  recordError() {
    this.healthCalculator.recordError();
  }

  recordRequest() {
    this.healthCalculator.recordRequest();
  }

  generateHealthReport(): HealthReport {
    return {
      timestamp: Date.now(),
      health: this.getSystemHealth(),
      recommendations: this.recommendationsGenerator.getHealthRecommendations()
    };
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
