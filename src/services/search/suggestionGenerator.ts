
import { supabase } from '@/integrations/supabase/client';

export class SuggestionGenerator {
  async getSearchSuggestions(partialQuery: string): Promise<string[]> {
    const suggestions = [
      "AI companies in Birmingham using computer vision",
      "Healthcare technology startups in Huntsville",
      "Manufacturing companies with automation solutions",
      "Fintech companies in Alabama",
      "Aerospace companies using machine learning",
      "Software development companies in Mobile",
      "Data analytics firms in Montgomery",
      "Cybersecurity companies in Alabama",
      "IoT solutions for agriculture",
      "Verified tech companies offering consulting services"
    ];

    if (!partialQuery || partialQuery.length < 2) {
      return suggestions.slice(0, 5);
    }

    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(partialQuery.toLowerCase())
      )
      .slice(0, 5);
  }

  async getRelatedQueries(originalQuery: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-bamabot', {
        body: {
          message: `Generate 3 related search queries for: "${originalQuery}". Focus on Alabama businesses and AI/tech ecosystem. Return as JSON array of strings.`,
          type: 'chat'
        }
      });

      if (error) throw error;

      try {
        const response = data.response || '[]';
        const parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
        return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
      } catch {
        return this.getDefaultRelatedQueries(originalQuery);
      }
    } catch (error) {
      console.error('Related queries error:', error);
      return this.getDefaultRelatedQueries(originalQuery);
    }
  }

  private getDefaultRelatedQueries(query: string): string[] {
    const defaults = [
      "Similar companies in Alabama",
      "AI solutions in the same industry",
      "Verified companies with similar services"
    ];
    return defaults;
  }
}

export const suggestionGenerator = new SuggestionGenerator();
