
import { performanceMonitor } from '../performanceMonitor';
import { createCacheOptimizationRules } from './cacheOptimization';
import { createMemoryOptimizationRules } from './memoryOptimization';
import { createPerformanceOptimizationRules } from './performanceOptimization';
import { generateOptimizationSuggestions } from './suggestionGenerator';
import { OptimizationRule, OptimizationResult, OptimizationHistory } from './types';

class SystemOptimizer {
  private optimizationRules: OptimizationRule[] = [];
  private isOptimizing = false;
  private optimizationHistory: OptimizationHistory[] = [];

  constructor() {
    this.initializeOptimizationRules();
  }

  private initializeOptimizationRules() {
    this.optimizationRules = [
      ...createCacheOptimizationRules(),
      ...createMemoryOptimizationRules(),
      ...createPerformanceOptimizationRules()
    ];
  }

  addRule(rule: OptimizationRule) {
    this.optimizationRules.push(rule);
  }

  async runOptimization(): Promise<OptimizationResult> {
    if (this.isOptimizing) {
      console.log('⏳ Optimization already in progress');
      throw new Error('Optimization already in progress');
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
    return generateOptimizationSuggestions();
  }
}

export const systemOptimizer = new SystemOptimizer();

// Auto-start optimization monitoring
if (typeof window !== 'undefined') {
  systemOptimizer.scheduleOptimization(30); // Every 30 minutes
  systemOptimizer.enablePerformanceBasedOptimization();
}
