
import { aiCache } from './advancedCacheService';

class AICacheWarmup {
  async warmup(): Promise<void> {
    console.log('Starting AI cache warmup...');
    
    try {
      // Warmup common AI responses
      await this.warmupCommonResponses();
      
      console.log('AI cache warmup completed');
    } catch (error) {
      console.warn('AI cache warmup failed:', error);
    }
  }

  private async warmupCommonResponses(): Promise<void> {
    const commonQueries = [
      'business recommendations',
      'local services',
      'restaurants near me',
      'technology companies',
      'healthcare providers'
    ];

    const mockResponses = commonQueries.map(query => ({
      query,
      response: `AI response for ${query}`,
      confidence: 0.8,
      suggestions: [`${query} suggestion 1`, `${query} suggestion 2`]
    }));

    for (const response of mockResponses) {
      await aiCache.set(
        `ai_response_${response.query}`,
        response,
        {
          ttl: 1800000, // 30 minutes
          priority: 'medium', // Changed from 'normal' to 'medium'
          tags: ['ai', 'responses']
        }
      );
    }
  }

  async warmupUserSpecific(userId: string): Promise<void> {
    // Warmup user-specific AI responses
    await aiCache.set(
      `user_ai_context_${userId}`,
      { userId, preferences: [], history: [] },
      {
        ttl: 3600000, // 1 hour
        priority: 'high',
        tags: ['ai', 'user', userId]
      }
    );
  }
}

export const aiCacheWarmup = new AICacheWarmup();
