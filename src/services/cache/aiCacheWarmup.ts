
import { aiCache } from './advancedCacheService';
import { supabase } from '@/integrations/supabase/client';
import { warmupConfig } from './warmupConfig';

export class AICacheWarmup {
  async warmup(): Promise<void> {
    try {
      await Promise.all([
        this.warmupCommonQueries(),
        this.warmupRecommendations()
      ]);
      
      console.log('AI cache warmup completed');
    } catch (error) {
      console.warn('AI cache warmup failed:', error);
    }
  }

  private async warmupCommonQueries(): Promise<void> {
    await aiCache.warmup(
      warmupConfig.ai.commonQueries.map(query => `ai-response-${query}`),
      async (key) => {
        const query = key.replace('ai-response-', '');
        return {
          query,
          response: `Cached AI response for: ${query}`,
          confidence: 0.85,
          timestamp: Date.now()
        };
      }
    );
  }

  private async warmupRecommendations(): Promise<void> {
    await aiCache.warmup(
      ['ai-recommendations-business', 'ai-recommendations-trending'],
      async (key) => {
        if (key === 'ai-recommendations-business') {
          const { data } = await supabase
            .from('businesses')
            .select('*')
            .eq('verified', true)
            .order('rating', { ascending: false })
            .limit(10);
          return data || [];
        } else {
          return [
            { type: 'trending', category: 'AI/ML', growth: '+25%' },
            { type: 'trending', category: 'Fintech', growth: '+18%' },
            { type: 'trending', category: 'Healthcare Tech', growth: '+22%' }
          ];
        }
      }
    );
  }
}

export const aiCacheWarmup = new AICacheWarmup();
