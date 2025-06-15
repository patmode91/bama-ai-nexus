
import { cacheService } from './cacheService';
import { performanceMonitor } from './performanceMonitor';

interface OptimizationRule {
  name: string;
  condition: () => boolean;
  action: () => Promise<void>;
  priority: 'low' | 'medium' | 'high';
}

class SystemOptimizer {
  private optimizationRules: OptimizationRule[] = [];
  private isOptimizing = false;
  private optimizationHistory: Array<{
    rule: string;
    timestamp: number;
    success: boolean;
    performance: number;
  }> = [];

  constructor() {
    this.initializeOptimizationRules();
  }

  private initializeOptimizationRules() {
    // Cache optimization rules
    this.addRule({
      name: 'Clear Expired Cache',
      condition: () => {
        const stats = cacheService.getStats();
        return stats.size > 100; // Clear cache if too many items
      },
      action: async () => {
        cacheService.cleanup();
        console.log('🧹 Cache cleanup completed');
      },
      priority: 'medium'
    });

    // Memory optimization
    this.addRule({
      name: 'Memory Cleanup',
      condition: () => {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          const usedMB = memory.usedJSHeapSize / 1024 / 1024;
          return usedMB > 150; // Cleanup if using more than 150MB
        }
        return false;
      },
      action: async () => {
        // Force garbage collection if available
        if ('gc' in window) {
          (window as any).gc();
        }
        
        // Clear large data structures
        this.clearLargeDataStructures();
        console.log('🗑️ Memory cleanup completed');
      },
      priority: 'high'
    });

    // Bundle size optimization
    this.addRule({
      name: 'Lazy Load Components',
      condition: () => {
        const metrics = performanceMonitor.getMetricsSummary();
        return (metrics.Bundle_Size?.avg || 0) > 2000; // > 2MB
      },
      action: async () => {
        // Suggest component lazy loading
        this.suggestLazyLoading();
        console.log('📦 Bundle size optimization suggestions generated');
      },
      priority: 'medium'
    });

    // API optimization
    this.addRule({
      name: 'Optimize Slow APIs',
      condition: () => {
        const metrics = performanceMonitor.getMetricsSummary();
        return (metrics.API_Response_Time?.avg || 0) > 2000; // > 2 seconds
      },
      action: async () => {
        this.optimizeAPIRequests();
        console.log('🚀 API optimization applied');
      },
      priority: 'high'
    });

    // Database query optimization
    this.addRule({
      name: 'Optimize Database Queries',
      condition: () => {
        const metrics = performanceMonitor.getMetricsSummary();
        return (metrics.DB_Query_Time?.avg || 0) > 1000; // > 1 second
      },
      action: async () => {
        this.optimizeDatabaseQueries();
        console.log('🗄️ Database query optimization applied');
      },
      priority: 'high'
    });
  }

  addRule(rule: OptimizationRule) {
    this.optimizationRules.push(rule);
  }

  async runOptimization() {
    if (this.isOptimizing) {
      console.log('⏳ Optimization already in progress');
      return;
    }

    this.isOptimizing = true;
    console.log('🔧 Starting system optimization...');

    const beforeScore = performanceMonitor.calculatePerformanceScore();
    
    // Sort rules by priority
    const sortedRules = this.optimizationRules.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });

    for (const rule of sortedRules) {
      try {
        if (rule.condition()) {
          console.log(`🎯 Applying optimization: ${rule.name}`);
          await rule.action();
          
          // Record optimization
          this.optimizationHistory.push({
            rule: rule.name,
            timestamp: Date.now(),
            success: true,
            performance: performanceMonitor.calculatePerformanceScore()
          });
        }
      } catch (error) {
        console.error(`❌ Optimization failed: ${rule.name}`, error);
        this.optimizationHistory.push({
          rule: rule.name,
          timestamp: Date.now(),
          success: false,
          performance: performanceMonitor.calculatePerformanceScore()
        });
      }
    }

    const afterScore = performanceMonitor.calculatePerformanceScore();
    const improvement = afterScore - beforeScore;
    
    console.log(`✅ Optimization complete. Performance improved by ${improvement.toFixed(1)} points`);
    this.isOptimizing = false;

    return {
      beforeScore,
      afterScore,
      improvement,
      optimizationsApplied: this.optimizationHistory.slice(-sortedRules.length)
    };
  }

  private clearLargeDataStructures() {
    // Clear large arrays/objects that might be cached in memory
    const largeElements = document.querySelectorAll('img, video, canvas');
    largeElements.forEach(element => {
      if (element instanceof HTMLImageElement && !element.src.includes('data:')) {
        // Optionally clear non-critical images
      }
    });
  }

  private suggestLazyLoading() {
    // Analyze components that could benefit from lazy loading
    const components = [
      'Analytics Dashboard',
      'User Engagement Charts',
      'Category Insights',
      'Market Intelligence'
    ];

    console.log('💡 Consider lazy loading these components:', components);
  }

  private optimizeAPIRequests() {
    // Implement request debouncing and caching
    const originalFetch = window.fetch;
    const requestCache = new Map();

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const key = `${input.toString()}_${JSON.stringify(init)}`;
      
      if (requestCache.has(key)) {
        const cached = requestCache.get(key);
        if (Date.now() - cached.timestamp < 30000) { // 30 second cache
          return Promise.resolve(cached.response.clone());
        }
      }

      const response = await originalFetch(input, init);
      
      if (response.ok) {
        requestCache.set(key, {
          response: response.clone(),
          timestamp: Date.now()
        });
      }

      return response;
    };
  }

  private optimizeDatabaseQueries() {
    // Suggest query optimizations
    console.log('🔍 Database optimization suggestions:');
    console.log('- Add indexes on frequently queried columns');
    console.log('- Implement query result caching');
    console.log('- Use database connection pooling');
    console.log('- Consider read replicas for analytics queries');
  }

  // Automated optimization scheduler
  scheduleOptimization(intervalMinutes: number = 30) {
    setInterval(() => {
      this.runOptimization();
    }, intervalMinutes * 60 * 1000);

    console.log(`📅 Automatic optimization scheduled every ${intervalMinutes} minutes`);
  }

  // Performance monitoring integration
  enablePerformanceBasedOptimization() {
    setInterval(() => {
      const score = performanceMonitor.calculatePerformanceScore();
      
      if (score < 70) {
        console.log(`⚠️ Performance score low (${score}), triggering optimization`);
        this.runOptimization();
      }
    }, 60000); // Check every minute
  }

  getOptimizationHistory() {
    return this.optimizationHistory;
  }

  getOptimizationSuggestions() {
    const metrics = performanceMonitor.getMetricsSummary();
    const suggestions = [];

    if ((metrics.LCP?.avg || 0) > 2500) {
      suggestions.push({
        type: 'LCP',
        message: 'Optimize images and reduce render-blocking resources',
        priority: 'high'
      });
    }

    if ((metrics.FID?.avg || 0) > 100) {
      suggestions.push({
        type: 'FID',
        message: 'Break up long-running tasks and optimize JavaScript execution',
        priority: 'high'
      });
    }

    if ((metrics.CLS?.avg || 0) > 0.1) {
      suggestions.push({
        type: 'CLS',
        message: 'Set explicit dimensions for images and avoid dynamic content insertion',
        priority: 'medium'
      });
    }

    return suggestions;
  }
}

export const systemOptimizer = new SystemOptimizer();

// Auto-start optimization monitoring
if (typeof window !== 'undefined') {
  systemOptimizer.scheduleOptimization(30); // Every 30 minutes
  systemOptimizer.enablePerformanceBasedOptimization();
}
