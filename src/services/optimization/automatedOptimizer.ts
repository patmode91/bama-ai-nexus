
import { performanceMonitor } from '../performanceMonitor';
import { systemOptimizer } from './systemOptimizer';
import { systemHealthService } from '../monitoring/systemHealthService';
import { logger } from '../loggerService';

interface OptimizationTrigger {
  id: string;
  name: string;
  condition: () => boolean;
  action: () => Promise<void>;
  cooldown: number; // Minimum time between executions in ms
  lastExecuted: number;
  enabled: boolean;
}

interface AutomatedOptimizationConfig {
  enabled: boolean;
  checkInterval: number;
  maxOptimizationsPerHour: number;
  emergencyMode: boolean;
}

class AutomatedOptimizer {
  private triggers: Map<string, OptimizationTrigger> = new Map();
  private config: AutomatedOptimizationConfig = {
    enabled: true,
    checkInterval: 60000, // 1 minute
    maxOptimizationsPerHour: 10,
    emergencyMode: false
  };
  private intervalId?: NodeJS.Timeout;
  private optimizationCount = 0;
  private lastHourReset = Date.now();

  constructor() {
    this.initializeTriggers();
    this.startAutomatedOptimization();
  }

  private initializeTriggers(): void {
    const triggers: OptimizationTrigger[] = [
      {
        id: 'low_performance',
        name: 'Low Performance Score',
        condition: () => performanceMonitor.calculatePerformanceScore() < 70,
        action: async () => {
          logger.info('Triggered automatic optimization due to low performance', {}, 'AutoOptimizer');
          await systemOptimizer.runOptimization();
        },
        cooldown: 300000, // 5 minutes
        lastExecuted: 0,
        enabled: true
      },
      {
        id: 'high_memory',
        name: 'High Memory Usage',
        condition: () => {
          const metrics = performanceMonitor.getMetricsSummary();
          return (metrics.MEMORY_USAGE_PERCENT?.latest || 0) > 85;
        },
        action: async () => {
          logger.info('Triggered memory cleanup due to high usage', {}, 'AutoOptimizer');
          await this.performMemoryCleanup();
        },
        cooldown: 180000, // 3 minutes
        lastExecuted: 0,
        enabled: true
      },
      {
        id: 'slow_api',
        name: 'Slow API Response',
        condition: () => {
          const metrics = performanceMonitor.getMetricsSummary();
          return (metrics.API_CALL_DURATION?.average || 0) > 3000;
        },
        action: async () => {
          logger.info('Triggered API optimization due to slow responses', {}, 'AutoOptimizer');
          await this.optimizeAPIRequests();
        },
        cooldown: 600000, // 10 minutes
        lastExecuted: 0,
        enabled: true
      },
      {
        id: 'critical_health',
        name: 'Critical System Health',
        condition: () => {
          const health = systemHealthService.getCurrentHealth();
          return health?.overall === 'critical';
        },
        action: async () => {
          logger.warn('Triggered emergency optimization due to critical health', {}, 'AutoOptimizer');
          await this.performEmergencyOptimization();
        },
        cooldown: 120000, // 2 minutes
        lastExecuted: 0,
        enabled: true
      }
    ];

    triggers.forEach(trigger => {
      this.triggers.set(trigger.id, trigger);
    });
  }

  private startAutomatedOptimization(): void {
    if (!this.config.enabled) return;

    this.intervalId = setInterval(() => {
      this.checkTriggers();
    }, this.config.checkInterval);

    logger.info('Automated optimization started', { 
      checkInterval: this.config.checkInterval 
    }, 'AutoOptimizer');
  }

  private async checkTriggers(): Promise<void> {
    if (!this.config.enabled) return;

    // Reset optimization count every hour
    if (Date.now() - this.lastHourReset > 3600000) {
      this.optimizationCount = 0;
      this.lastHourReset = Date.now();
    }

    // Check rate limit
    if (this.optimizationCount >= this.config.maxOptimizationsPerHour && !this.config.emergencyMode) {
      return;
    }

    for (const trigger of this.triggers.values()) {
      if (!trigger.enabled) continue;

      // Check cooldown
      if (Date.now() - trigger.lastExecuted < trigger.cooldown) continue;

      // Check condition
      try {
        if (trigger.condition()) {
          logger.info('Trigger condition met', { triggerId: trigger.id }, 'AutoOptimizer');
          
          await trigger.action();
          trigger.lastExecuted = Date.now();
          this.optimizationCount++;

          // Break after first trigger to avoid overwhelming the system
          break;
        }
      } catch (error) {
        logger.error('Trigger execution failed', { 
          triggerId: trigger.id, 
          error 
        }, 'AutoOptimizer');
      }
    }
  }

  private async performMemoryCleanup(): Promise<void> {
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }

    // Clear large cached data
    const cacheKeys = Object.keys(localStorage);
    const largeKeys = cacheKeys.filter(key => {
      const value = localStorage.getItem(key);
      return value && value.length > 100000; // > 100KB
    });

    largeKeys.forEach(key => {
      if (!key.includes('essential')) { // Preserve essential data
        localStorage.removeItem(key);
      }
    });

    logger.info('Memory cleanup completed', { 
      removedKeys: largeKeys.length 
    }, 'AutoOptimizer');
  }

  private async optimizeAPIRequests(): Promise<void> {
    // Implement request batching and caching
    const originalFetch = window.fetch;
    const requestQueue: Array<{ url: string; options: any; resolve: any; reject: any }> = [];
    let batchTimeout: NodeJS.Timeout;

    window.fetch = async (url: string | URL, options?: RequestInit) => {
      return new Promise((resolve, reject) => {
        requestQueue.push({ url: url.toString(), options, resolve, reject });

        clearTimeout(batchTimeout);
        batchTimeout = setTimeout(async () => {
          await this.processBatchedRequests(requestQueue, originalFetch);
        }, 100); // Batch requests for 100ms
      });
    };

    logger.info('API request optimization applied', {}, 'AutoOptimizer');
  }

  private async processBatchedRequests(
    requests: Array<{ url: string; options: any; resolve: any; reject: any }>,
    originalFetch: typeof fetch
  ): Promise<void> {
    // Group similar requests
    const groups = new Map<string, typeof requests>();
    
    requests.forEach(request => {
      const key = `${request.url}_${JSON.stringify(request.options)}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(request);
    });

    // Execute grouped requests
    for (const [key, group] of groups) {
      try {
        const response = await originalFetch(group[0].url, group[0].options);
        const clonedResponse = response.clone();
        
        // Resolve all similar requests with the same response
        group.forEach(request => {
          request.resolve(clonedResponse.clone());
        });
      } catch (error) {
        group.forEach(request => {
          request.reject(error);
        });
      }
    }

    requests.length = 0; // Clear the queue
  }

  private async performEmergencyOptimization(): Promise<void> {
    this.config.emergencyMode = true;
    
    try {
      // Aggressive optimization measures
      await Promise.all([
        this.performMemoryCleanup(),
        systemOptimizer.runOptimization(),
        this.clearNonEssentialCaches()
      ]);

      logger.info('Emergency optimization completed', {}, 'AutoOptimizer');
    } finally {
      // Reset emergency mode after 10 minutes
      setTimeout(() => {
        this.config.emergencyMode = false;
      }, 600000);
    }
  }

  private async clearNonEssentialCaches(): Promise<void> {
    // Clear browser caches that are not essential
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const nonEssentialCaches = cacheNames.filter(name => 
        !name.includes('essential') && !name.includes('critical')
      );

      await Promise.all(
        nonEssentialCaches.map(name => caches.delete(name))
      );

      logger.info('Non-essential caches cleared', { 
        clearedCaches: nonEssentialCaches.length 
      }, 'AutoOptimizer');
    }
  }

  // Public API
  getConfig(): AutomatedOptimizationConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AutomatedOptimizationConfig>): void {
    this.config = { ...this.config, ...updates };
    
    if (updates.enabled !== undefined) {
      if (updates.enabled && !this.intervalId) {
        this.startAutomatedOptimization();
      } else if (!updates.enabled && this.intervalId) {
        this.stop();
      }
    }

    if (updates.checkInterval && this.intervalId) {
      this.stop();
      this.startAutomatedOptimization();
    }
  }

  getTriggers(): OptimizationTrigger[] {
    return Array.from(this.triggers.values());
  }

  updateTrigger(id: string, updates: Partial<OptimizationTrigger>): boolean {
    const trigger = this.triggers.get(id);
    if (!trigger) return false;

    Object.assign(trigger, updates);
    return true;
  }

  getOptimizationStats() {
    return {
      optimizationCount: this.optimizationCount,
      lastHourReset: this.lastHourReset,
      emergencyMode: this.config.emergencyMode,
      enabled: this.config.enabled
    };
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    logger.info('Automated optimization stopped', {}, 'AutoOptimizer');
  }
}

export const automatedOptimizer = new AutomatedOptimizer();
export default automatedOptimizer;
