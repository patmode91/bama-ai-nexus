
import { supabase } from '@/integrations/supabase/client';
import type { SearchQuery, SearchResult, SearchIntent } from '@/types/semanticSearch';

class SemanticSearchService {
  async searchBusinesses(query: SearchQuery): Promise<SearchResult[]> {
    try {
      let dbQuery = supabase
        .from('businesses')
        .select('*')
        .eq('verified', true);

      // Apply filters
      if (query.filters?.category) {
        dbQuery = dbQuery.ilike('category', `%${query.filters.category}%`);
      }

      if (query.filters?.location) {
        dbQuery = dbQuery.ilike('location', `%${query.filters.location}%`);
      }

      if (query.filters?.verified !== undefined) {
        dbQuery = dbQuery.eq('verified', query.filters.verified);
      }

      if (query.filters?.tags && query.filters.tags.length > 0) {
        dbQuery = dbQuery.overlaps('tags', query.filters.tags);
      }

      // Apply text search if query provided
      if (query.query) {
        dbQuery = dbQuery.or(`businessname.ilike.%${query.query}%,description.ilike.%${query.query}%`);
      }

      const { data: businesses, error } = await dbQuery
        .limit(query.limit || 20)
        .offset(query.offset || 0);

      if (error) throw error;

      // Transform to SearchResult format with basic scoring
      const results: SearchResult[] = (businesses || []).map(business => {
        let score = 50; // Base score
        const reasons: string[] = [];

        // Basic relevance scoring
        if (query.query) {
          const queryLower = query.query.toLowerCase();
          if (business.businessname?.toLowerCase().includes(queryLower)) {
            score += 30;
            reasons.push('Name match');
          }
          if (business.description?.toLowerCase().includes(queryLower)) {
            score += 20;
            reasons.push('Description match');
          }
        }

        if (business.verified) {
          score += 10;
          reasons.push('Verified business');
        }

        if (business.rating && business.rating > 4.0) {
          score += 5;
          reasons.push('High rating');
        }

        return {
          business,
          relevanceScore: Math.min(100, score),
          matchingReasons: reasons.length > 0 ? reasons : ['General match']
        };
      });

      return results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    } catch (error) {
      console.error('Semantic search error:', error);
      throw error;
    }
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      if (!query || query.length < 2) {
        // Return popular categories
        return [
          'AI and Machine Learning',
          'Healthcare Technology',
          'Financial Services',
          'Manufacturing',
          'Consulting',
          'Software Development'
        ];
      }

      const { data: suggestions, error } = await supabase
        .from('search_suggestions')
        .select('suggestion')
        .ilike('suggestion', `%${query}%`)
        .order('popularity_score', { ascending: false })
        .limit(5);

      if (error) throw error;

      return suggestions?.map(s => s.suggestion) || [];

    } catch (error) {
      console.error('Search suggestions error:', error);
      return [];
    }
  }

  async getRelatedQueries(query: string): Promise<string[]> {
    // For now, return static related queries based on common patterns
    const relatedQueries = [
      `${query} in Birmingham`,
      `${query} in Huntsville`,
      `${query} partnerships`,
      `${query} consulting services`,
      `Best ${query} companies in Alabama`
    ];

    return relatedQueries.slice(0, 3);
  }

  async analyzeSearchIntent(query: string): Promise<SearchIntent> {
    const queryLower = query.toLowerCase();
    
    // Simple intent classification
    let intent: SearchIntent['intent'] = 'find_businesses';
    
    if (queryLower.includes('market') || queryLower.includes('trend') || queryLower.includes('analysis')) {
      intent = 'market_research';
    } else if (queryLower.includes('partner') || queryLower.includes('collaborate')) {
      intent = 'partnership';
    } else if (queryLower.includes('invest') || queryLower.includes('funding')) {
      intent = 'investment';
    }

    // Extract criteria
    const extractedCriteria = {
      technologies: this.extractTechnologies(query),
      industries: this.extractIndustries(query),
      locations: this.extractLocations(query),
      companySize: this.extractCompanySize(query),
      services: this.extractServices(query),
      keywords: query.split(' ').filter(word => word.length > 2)
    };

    return {
      intent,
      extractedCriteria,
      searchTerms: [query]
    };
  }

  private extractTechnologies(query: string): string[] {
    const techKeywords = ['AI', 'Machine Learning', 'Blockchain', 'IoT', 'Cloud', 'Data Analytics'];
    return techKeywords.filter(tech => 
      query.toLowerCase().includes(tech.toLowerCase())
    );
  }

  private extractIndustries(query: string): string[] {
    const industries = ['Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Government'];
    return industries.filter(industry => 
      query.toLowerCase().includes(industry.toLowerCase())
    );
  }

  private extractLocations(query: string): string[] {
    const locations = ['Birmingham', 'Huntsville', 'Mobile', 'Montgomery', 'Tuscaloosa'];
    return locations.filter(location => 
      query.toLowerCase().includes(location.toLowerCase())
    );
  }

  private extractCompanySize(query: string): string {
    const queryLower = query.toLowerCase();
    if (queryLower.includes('startup') || queryLower.includes('small')) return 'small';
    if (queryLower.includes('enterprise') || queryLower.includes('large')) return 'large';
    if (queryLower.includes('medium')) return 'medium';
    return '';
  }

  private extractServices(query: string): string[] {
    const services = ['Consulting', 'Development', 'Integration', 'Support', 'Training', 'Analytics'];
    return services.filter(service => 
      query.toLowerCase().includes(service.toLowerCase())
    );
  }
}

export const semanticSearchService = new SemanticSearchService();
