
import { aiCache } from './advancedCacheService';

class AICacheWarmup {
  async warmup(): Promise<void> {
    console.log('Starting AI cache warmup...');
    
    try {
      // Warmup AI model responses
      await this.warmupModelResponses();
      
      // Warmup AI suggestions
      await this.warmupAISuggestions();
      
      console.log('AI cache warmup completed');
    } catch (error) {
      console.warn('AI cache warmup failed:', error);
    }
  }

  private async warmupModelResponses(): Promise<void> {
    const commonQueries = [
      'best tech companies',
      'healthcare recommendations',
      'business partnerships',
      'investment opportunities'
    ];

    for (const query of commonQueries) {
      await aiCache.set(`ai:response:${query}`, {
        response: `Cached response for: ${query}`,
        timestamp: Date.now()
      }, {
        ttl: 15 * 60 * 1000, // 15 minutes
        priority: 'normal'
      });
    }
  }

  private async warmupAISuggestions(): Promise<void> {
    const suggestions = [
      'Consider partnerships with tech companies',
      'Explore healthcare innovation opportunities',
      'Look into sustainable business practices',
      'Investigate market expansion possibilities'
    ];

    await aiCache.set('ai-suggestions', suggestions, {
      ttl: 60 * 60 * 1000, // 1 hour
      priority: 'high'
    });
  }
}

export const aiCacheWarmup = new AICacheWarmup();
