
import { HealthCalculator } from './healthCalculator';

export class RecommendationsGenerator {
  constructor(private healthCalculator: HealthCalculator) {}

  getHealthRecommendations(): string[] {
    const recommendations: string[] = [];
    const health = this.healthCalculator.calculatePerformanceHealth();
    
    if (health < 70) {
      recommendations.push('Consider optimizing component rendering');
      recommendations.push('Review and optimize database queries');
      recommendations.push('Implement code splitting for better performance');
    }
    
    const memoryHealth = this.healthCalculator.calculateMemoryHealth();
    if (memoryHealth < 70) {
      recommendations.push('Monitor memory leaks in components');
      recommendations.push('Optimize large data structures');
      recommendations.push('Consider implementing virtual scrolling');
    }
    
    const cacheHealth = this.healthCalculator.calculateCacheHealth();
    if (cacheHealth < 70) {
      recommendations.push('Review cache strategies');
      recommendations.push('Optimize cache TTL settings');
      recommendations.push('Consider implementing cache warming');
    }
    
    return recommendations;
  }
}
