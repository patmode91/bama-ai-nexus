
import { supabase } from '@/integrations/supabase/client';

interface SearchFilters {
  location?: string;
  category?: string;
  verified?: boolean;
  tags?: string[];
  employeeRange?: string;
  fundingStage?: string;
}

interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  includeAnalysis?: boolean;
}

interface SearchResult {
  business: any;
  relevanceScore: number;
  matchingReasons: string[];
  contextualInsights?: string;
}

interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  searchInsights: string;
  suggestedFilters: string[];
  relatedQueries: string[];
}

class SemanticSearchService {
  private async analyzeSearchIntent(query: string): Promise<{
    intent: 'find_businesses' | 'market_research' | 'partnership' | 'investment';
    extractedCriteria: any;
    searchTerms: string[];
  }> {
    // Enhanced intent analysis using Gemini
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-bamabot', {
        body: {
          message: `Analyze this search query and extract search intent: "${query}"
          
          Return JSON format:
          {
            "intent": "find_businesses|market_research|partnership|investment",
            "extractedCriteria": {
              "technologies": [],
              "industries": [],
              "locations": [],
              "companySize": "",
              "services": [],
              "keywords": []
            },
            "searchTerms": ["relevant", "search", "terms"]
          }`,
          type: 'chat'
        }
      });

      if (error) throw error;

      // Parse the AI response
      const response = data.response || '{}';
      try {
        const parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
        return parsed;
      } catch {
        // Fallback analysis
        return this.basicIntentAnalysis(query);
      }
    } catch (error) {
      console.error('Intent analysis error:', error);
      return this.basicIntentAnalysis(query);
    }
  }

  private basicIntentAnalysis(query: string): any {
    const lowercaseQuery = query.toLowerCase();
    
    let intent = 'find_businesses';
    if (lowercaseQuery.includes('market') || lowercaseQuery.includes('trend')) {
      intent = 'market_research';
    } else if (lowercaseQuery.includes('partner') || lowercaseQuery.includes('collaborate')) {
      intent = 'partnership';
    } else if (lowercaseQuery.includes('invest') || lowercaseQuery.includes('funding')) {
      intent = 'investment';
    }

    const technologies = this.extractTechnologies(query);
    const industries = this.extractIndustries(query);
    const locations = this.extractLocations(query);

    return {
      intent,
      extractedCriteria: {
        technologies,
        industries,
        locations,
        services: [],
        keywords: query.split(' ').filter(word => word.length > 3)
      },
      searchTerms: [query]
    };
  }

  private extractTechnologies(query: string): string[] {
    const techKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning',
      'computer vision', 'nlp', 'natural language processing', 'robotics',
      'automation', 'blockchain', 'iot', 'internet of things', 'cloud',
      'saas', 'software', 'mobile app', 'web development', 'data science',
      'analytics', 'big data', 'cybersecurity', 'fintech', 'healthtech'
    ];
    
    return techKeywords.filter(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  private extractIndustries(query: string): string[] {
    const industryKeywords = [
      'healthcare', 'aerospace', 'manufacturing', 'automotive', 'finance',
      'education', 'retail', 'logistics', 'agriculture', 'energy',
      'real estate', 'hospitality', 'media', 'telecommunications',
      'defense', 'government', 'nonprofit'
    ];
    
    return industryKeywords.filter(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  private extractLocations(query: string): string[] {
    const locationKeywords = [
      'birmingham', 'huntsville', 'mobile', 'montgomery', 'tuscaloosa',
      'auburn', 'dothan', 'florence', 'gadsden', 'hoover', 'alabama'
    ];
    
    return locationKeywords.filter(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  private buildSearchQuery(criteria: any, filters: SearchFilters = {}): any {
    let query = supabase.from('businesses').select('*');

    // Apply text search
    if (criteria.keywords?.length > 0) {
      const searchTerms = criteria.keywords.join(' | ');
      query = query.or(`businessname.ilike.%${searchTerms}%,description.ilike.%${searchTerms}%,category.ilike.%${searchTerms}%`);
    }

    // Apply location filter
    if (filters.location || criteria.locations?.length > 0) {
      const location = filters.location || criteria.locations[0];
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }
    }

    // Apply category filter
    if (filters.category || criteria.industries?.length > 0) {
      const category = filters.category || criteria.industries[0];
      if (category) {
        query = query.ilike('category', `%${category}%`);
      }
    }

    // Apply verified filter
    if (filters.verified !== undefined) {
      query = query.eq('verified', filters.verified);
    }

    return query;
  }

  private async scoreBusinessRelevance(business: any, criteria: any, query: string): Promise<{
    score: number;
    reasons: string[];
  }> {
    let score = 0;
    const reasons: string[] = [];

    // Name match
    if (business.businessname?.toLowerCase().includes(query.toLowerCase().split(' ')[0])) {
      score += 30;
      reasons.push('Business name matches search term');
    }

    // Category/Industry match
    if (criteria.industries?.some((industry: string) => 
      business.category?.toLowerCase().includes(industry.toLowerCase())
    )) {
      score += 25;
      reasons.push('Industry match');
    }

    // Technology match in description
    if (criteria.technologies?.some((tech: string) => 
      business.description?.toLowerCase().includes(tech.toLowerCase())
    )) {
      score += 25;
      reasons.push('Technology alignment');
    }

    // Location match
    if (criteria.locations?.some((location: string) => 
      business.location?.toLowerCase().includes(location.toLowerCase())
    )) {
      score += 15;
      reasons.push('Location match');
    }

    // Verified bonus
    if (business.verified) {
      score += 10;
      reasons.push('Verified company');
    }

    // Description relevance
    if (business.description && criteria.keywords?.some((keyword: string) => 
      business.description.toLowerCase().includes(keyword.toLowerCase())
    )) {
      score += 20;
      reasons.push('Description relevance');
    }

    return { score: Math.min(score, 100), reasons };
  }

  async searchBusinesses(searchQuery: SearchQuery): Promise<SearchResult[]> {
    try {
      // Analyze search intent
      const analysis = await this.analyzeSearchIntent(searchQuery.query);
      
      // Build and execute database query
      const dbQuery = this.buildSearchQuery(analysis.extractedCriteria, searchQuery.filters);
      const { data: businesses, error } = await dbQuery.limit(searchQuery.limit || 50);

      if (error) throw error;

      if (!businesses || businesses.length === 0) {
        return [];
      }

      // Score and rank results
      const scoredResults = await Promise.all(
        businesses.map(async (business) => {
          const { score, reasons } = await this.scoreBusinessRelevance(
            business, 
            analysis.extractedCriteria, 
            searchQuery.query
          );

          return {
            business,
            relevanceScore: score,
            matchingReasons: reasons
          };
        })
      );

      // Sort by relevance score
      return scoredResults
        .filter(result => result.relevanceScore > 10)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

    } catch (error) {
      console.error('Semantic search error:', error);
      throw error;
    }
  }

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

export const semanticSearchService = new SemanticSearchService();
