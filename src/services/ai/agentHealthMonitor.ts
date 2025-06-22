
import { logger } from '@/services/loggerService';

interface AgentHealthMetrics {
  agentId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  successRate: number;
  errorCount: number;
  lastCheckTime: Date;
}

interface HealthCheckResult {
  success: boolean;
  responseTime: number;
  error?: string;
}

class AgentHealthMonitor {
  private metrics: Map<string, AgentHealthMetrics> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 30000; // 30 seconds
  private readonly agents = ['general', 'connector', 'analyst', 'curator'];

  constructor() {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    this.agents.forEach(agentId => {
      this.metrics.set(agentId, {
        agentId,
        status: 'healthy',
        responseTime: 0,
        successRate: 100,
        errorCount: 0,
        lastCheckTime: new Date()
      });
    });
  }

  startMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.CHECK_INTERVAL_MS);

    logger.info('Agent health monitoring started', {}, 'AgentHealthMonitor');
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    logger.info('Agent health monitoring stopped', {}, 'AgentHealthMonitor');
  }

  private async performHealthChecks() {
    const checks = this.agents.map(agentId => 
      this.checkAgentHealth(agentId)
    );

    const results = await Promise.allSettled(checks);
    
    results.forEach((result, index) => {
      const agentId = this.agents[index];
      if (result.status === 'fulfilled') {
        this.updateMetrics(agentId, result.value);
      } else {
        this.updateMetrics(agentId, {
          success: false,
          responseTime: 0,
          error: result.reason?.message || 'Health check failed'
        });
      }
    });
  }

  private async checkAgentHealth(agentId: string): Promise<HealthCheckResult> {
    const startTime = performance.now();
    
    try {
      // Simple health check - we could make this more sophisticated
      // For now, we'll simulate a basic connectivity check
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      const responseTime = performance.now() - startTime;
      
      if (response.ok) {
        return {
          success: true,
          responseTime
        };
      } else {
        return {
          success: false,
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      const responseTime = performance.now() - startTime;
      return {
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private updateMetrics(agentId: string, result: HealthCheckResult) {
    const currentMetrics = this.metrics.get(agentId);
    if (!currentMetrics) return;

    const updatedMetrics: AgentHealthMetrics = {
      ...currentMetrics,
      responseTime: result.responseTime,
      lastCheckTime: new Date()
    };

    if (result.success) {
      updatedMetrics.successRate = Math.min(100, updatedMetrics.successRate + 1);
      updatedMetrics.errorCount = Math.max(0, updatedMetrics.errorCount - 1);
    } else {
      updatedMetrics.successRate = Math.max(0, updatedMetrics.successRate - 5);
      updatedMetrics.errorCount = updatedMetrics.errorCount + 1;
      
      logger.warn(`Agent ${agentId} health check failed`, {
        error: result.error,
        responseTime: result.responseTime
      }, 'AgentHealthMonitor');
    }

    // Determine status based on metrics
    if (updatedMetrics.successRate >= 90 && updatedMetrics.responseTime < 3000) {
      updatedMetrics.status = 'healthy';
    } else if (updatedMetrics.successRate >= 70 && updatedMetrics.responseTime < 5000) {
      updatedMetrics.status = 'degraded';
    } else {
      updatedMetrics.status = 'unhealthy';
    }

    this.metrics.set(agentId, updatedMetrics);

    logger.debug(`Agent ${agentId} metrics updated`, {
      status: updatedMetrics.status,
      successRate: updatedMetrics.successRate,
      responseTime: updatedMetrics.responseTime
    }, 'AgentHealthMonitor');
  }

  getAgentMetrics(agentId: string): AgentHealthMetrics | undefined {
    return this.metrics.get(agentId);
  }

  getAllMetrics(): AgentHealthMetrics[] {
    return Array.from(this.metrics.values());
  }

  getSystemHealth(): {
    overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    healthyAgents: number;
    totalAgents: number;
    averageResponseTime: number;
  } {
    const allMetrics = this.getAllMetrics();
    const healthyAgents = allMetrics.filter(m => m.status === 'healthy').length;
    const averageResponseTime = allMetrics.reduce((sum, m) => sum + m.responseTime, 0) / allMetrics.length;
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyAgents === allMetrics.length) {
      overallStatus = 'healthy';
    } else if (healthyAgents >= allMetrics.length * 0.7) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }

    return {
      overallStatus,
      healthyAgents,
      totalAgents: allMetrics.length,
      averageResponseTime
    };
  }
}

export const agentHealthMonitor = new AgentHealthMonitor();

// Auto-start monitoring in browser environment
if (typeof window !== 'undefined') {
  agentHealthMonitor.startMonitoring();
}
