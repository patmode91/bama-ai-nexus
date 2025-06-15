
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Business = Database['public']['Tables']['businesses']['Row'];
type SearchAnalytics = Database['public']['Tables']['search_analytics']['Insert'];

export interface SearchFilters {
  location?: string;
  category?: string;
  verified?: boolean;
  rating?: number;
  tags?: string[];
  employeeRange?: string;
  foundedAfter?: number;
  [key: string]: any; // Add index signature for JSON compatibility
}

export interface SearchResult {
  business: Business;
  relevanceScore: number;
  matchHighlights: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  suggestions: string[];
  facets: SearchFacets;
  searchTime: number;
}

export interface SearchFacets {
  categories: { name: string; count: number }[];
  locations: { name: string; count: number }[];
  ratings: { range: string; count: number }[];
  verified: { verified: boolean; count: number }[];
}

class EnhancedSearchService {
  async search(
    query: string,
    filters: SearchFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResponse> {
    const startTime = performance.now();
    const offset = (page - 1) * limit;

    try {
      // Build the search query
      let searchQuery = supabase
        .from('businesses')
        .select('*', { count: 'exact' });

      // Apply full-text search if query is provided
      if (query.trim()) {
        const tsQuery = this.buildTsQuery(query);
        searchQuery = searchQuery.textSearch('search_vector', tsQuery);
      }

      // Apply filters
      searchQuery = this.applyFilters(searchQuery, filters);

      // Execute the search
      const { data: businesses, error, count } = await searchQuery
        .order('rating', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Calculate relevance scores and highlights
      const results: SearchResult[] = (businesses || []).map(business => ({
        business,
        relevanceScore: this.calculateRelevanceScore(business, query),
        matchHighlights: this.extractHighlights(business, query)
      }));

      // Get search suggestions
      const suggestions = await this.getSearchSuggestions(query);

      // Get facets for filtering
      const facets = await this.generateFacets(query, filters);

      const searchTime = performance.now() - startTime;

      // Track search analytics
      await this.trackSearch(query, filters, count || 0, searchTime);

      return {
        results,
        totalCount: count || 0,
        suggestions,
        facets,
        searchTime
      };

    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  private buildTsQuery(query: string): string {
    // Clean and prepare the query for PostgreSQL full-text search
    const cleanQuery = query
      .trim()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0)
      .join(' & ');
    
    return cleanQuery || query;
  }

  private applyFilters(query: any, filters: SearchFilters) {
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.category) {
      query = query.ilike('category', `%${filters.category}%`);
    }

    if (filters.verified !== undefined) {
      query = query.eq('verified', filters.verified);
    }

    if (filters.rating) {
      query = query.gte('rating', filters.rating);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters.foundedAfter) {
      query = query.gte('founded_year', filters.foundedAfter);
    }

    return query;
  }

  private calculateRelevanceScore(business: Business, query: string): number {
    let score = 50; // Base score

    const searchTerms = query.toLowerCase().split(/\s+/);
    const businessText = [
      business.businessname,
      business.description,
      business.category,
      business.location,
      ...(business.tags || [])
    ].join(' ').toLowerCase();

    // Boost score for exact matches
    searchTerms.forEach(term => {
      if (business.businessname?.toLowerCase().includes(term)) score += 30;
      if (business.category?.toLowerCase().includes(term)) score += 20;
      if (business.description?.toLowerCase().includes(term)) score += 10;
      if (businessText.includes(term)) score += 5;
    });

    // Boost for verified businesses
    if (business.verified) score += 15;

    // Boost for highly rated businesses
    if (business.rating && business.rating > 4) score += 10;

    return Math.min(100, score);
  }

  private extractHighlights(business: Business, query: string): string[] {
    const highlights: string[] = [];
    const searchTerms = query.toLowerCase().split(/\s+/);

    searchTerms.forEach(term => {
      if (business.businessname?.toLowerCase().includes(term)) {
        highlights.push(`Business name matches "${term}"`);
      }
      if (business.category?.toLowerCase().includes(term)) {
        highlights.push(`Category: ${business.category}`);
      }
    });

    return highlights;
  }

  async getSearchSuggestions(partialQuery: string): Promise<string[]> {
    if (!partialQuery || partialQuery.length < 2) return [];

    try {
      const { data, error } = await supabase
        .from('search_suggestions')
        .select('suggestion')
        .textSearch('suggestion', partialQuery)
        .order('popularity_score', { ascending: false })
        .limit(5);

      if (error) throw error;

      return data?.map(item => item.suggestion) || [];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }

  async generateFacets(query: string, currentFilters: SearchFilters): Promise<SearchFacets> {
    try {
      // Get category facets
      const { data: categories } = await supabase
        .from('businesses')
        .select('category')
        .not('category', 'is', null);

      // Get location facets
      const { data: locations } = await supabase
        .from('businesses')
        .select('location')
        .not('location', 'is', null);

      // Process the data to create facet counts
      const categoryFacets = this.processFacetData(categories || [], 'category');
      const locationFacets = this.processFacetData(locations || [], 'location');

      return {
        categories: categoryFacets.slice(0, 10),
        locations: locationFacets.slice(0, 10),
        ratings: [
          { range: '4+ stars', count: 0 },
          { range: '3+ stars', count: 0 },
          { range: '2+ stars', count: 0 }
        ],
        verified: [
          { verified: true, count: 0 },
          { verified: false, count: 0 }
        ]
      };
    } catch (error) {
      console.error('Error generating facets:', error);
      return {
        categories: [],
        locations: [],
        ratings: [],
        verified: []
      };
    }
  }

  private processFacetData(data: any[], field: string): { name: string; count: number }[] {
    const counts = data.reduce((acc, item) => {
      const value = item[field];
      if (value) {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count);
  }

  async trackSearch(
    query: string,
    filters: SearchFilters,
    resultsCount: number,
    searchTime: number
  ): Promise<void> {
    try {
      const analytics: SearchAnalytics = {
        search_query: query,
        search_filters: filters as any, // Cast to satisfy JSON type
        results_count: resultsCount,
        search_duration_ms: Math.round(searchTime),
        session_id: this.getSessionId(),
        user_agent: navigator.userAgent
      };

      await supabase.from('search_analytics').insert(analytics);
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  async trackClick(businessId: number, searchQuery: string): Promise<void> {
    try {
      await supabase
        .from('search_analytics')
        .update({ clicked_business_id: businessId })
        .eq('search_query', searchQuery)
        .order('created_at', { ascending: false })
        .limit(1);
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('search_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('search_session_id', sessionId);
    }
    return sessionId;
  }
}

export const enhancedSearchService = new EnhancedSearchService();
