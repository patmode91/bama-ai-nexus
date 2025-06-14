
import { supabase } from '@/integrations/supabase/client';

interface SearchQuery {
  query: string;
  filters?: {
    location?: string;
    category?: string;
    verified?: boolean;
  };
  limit?: number;
}

interface SearchResult {
  business: any;
  relevanceScore: number;
  matchingReasons: string[];
}

export class SemanticSearchService {
  
  async searchBusinesses(searchQuery: SearchQuery): Promise<SearchResult[]> {
    const { query, filters, limit = 10 } = searchQuery;
    
    try {
      // For now, we'll implement a sophisticated keyword-based search
      // Later this can be enhanced with vector embeddings
      const searchTerms = this.extractSearchTerms(query);
      
      let supabaseQuery = supabase
        .from('businesses')
        .select('*')
        .limit(limit);
      
      // Apply filters
      if (filters?.location) {
        supabaseQuery = supabaseQuery.ilike('location', `%${filters.location}%`);
      }
      
      if (filters?.category) {
        supabaseQuery = supabaseQuery.eq('category', filters.category);
      }
      
      if (filters?.verified !== undefined) {
        supabaseQuery = supabaseQuery.eq('verified', filters.verified);
      }
      
      const { data: businesses, error } = await supabaseQuery;
      
      if (error) throw error;
      
      // Score and rank results based on semantic relevance
      const scoredResults = businesses?.map(business => {
        const score = this.calculateRelevanceScore(business, searchTerms, query);
        const reasons = this.generateMatchingReasons(business, searchTerms, query);
        
        return {
          business,
          relevanceScore: score,
          matchingReasons: reasons
        };
      }) || [];
      
      // Sort by relevance score (highest first)
      return scoredResults
        .filter(result => result.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
      
    } catch (error) {
      console.error('Semantic search error:', error);
      throw error;
    }
  }
  
  private extractSearchTerms(query: string): string[] {
    // Extract meaningful terms from the query
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'that', 'this', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2 && !stopWords.has(term));
  }
  
  private calculateRelevanceScore(business: any, searchTerms: string[], originalQuery: string): number {
    let score = 0;
    const searchableText = this.getSearchableText(business);
    const lowerQuery = originalQuery.toLowerCase();
    
    // Exact phrase matching (highest weight)
    if (searchableText.includes(lowerQuery)) {
      score += 100;
    }
    
    // Individual term matching
    searchTerms.forEach(term => {
      const termRegex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = searchableText.match(termRegex);
      if (matches) {
        // Weight by field importance and frequency
        if (business.businessname?.toLowerCase().includes(term)) score += 50;
        if (business.description?.toLowerCase().includes(term)) score += 30;
        if (business.category?.toLowerCase().includes(term)) score += 40;
        if (business.tags?.some((tag: string) => tag.toLowerCase().includes(term))) score += 35;
        
        score += matches.length * 10; // Frequency bonus
      }
    });
    
    // Industry/category relevance
    if (this.hasIndustryRelevance(business, originalQuery)) {
      score += 25;
    }
    
    // Location relevance
    if (this.hasLocationRelevance(business, originalQuery)) {
      score += 20;
    }
    
    // Verified business bonus
    if (business.verified) {
      score += 15;
    }
    
    return score;
  }
  
  private getSearchableText(business: any): string {
    const fields = [
      business.businessname || '',
      business.description || '',
      business.category || '',
      business.location || '',
      ...(business.tags || []),
      ...(business.certifications || [])
    ];
    
    return fields.join(' ').toLowerCase();
  }
  
  private hasIndustryRelevance(business: any, query: string): boolean {
    const industryKeywords = {
      'healthcare': ['medical', 'health', 'patient', 'clinical', 'diagnosis', 'treatment'],
      'finance': ['financial', 'banking', 'investment', 'trading', 'fintech', 'payment'],
      'manufacturing': ['factory', 'production', 'automation', 'quality control', 'supply chain'],
      'aerospace': ['aircraft', 'satellite', 'space', 'defense', 'aviation', 'rocket'],
      'education': ['learning', 'training', 'academic', 'student', 'curriculum', 'university'],
      'retail': ['commerce', 'shopping', 'customer', 'sales', 'inventory', 'ecommerce']
    };
    
    const queryLower = query.toLowerCase();
    const businessCategory = business.category?.toLowerCase() || '';
    
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (businessCategory.includes(industry) && 
          keywords.some(keyword => queryLower.includes(keyword))) {
        return true;
      }
    }
    
    return false;
  }
  
  private hasLocationRelevance(business: any, query: string): boolean {
    const locations = ['birmingham', 'huntsville', 'mobile', 'montgomery', 'tuscaloosa', 'auburn', 'alabama'];
    const queryLower = query.toLowerCase();
    const businessLocation = business.location?.toLowerCase() || '';
    
    return locations.some(location => 
      queryLower.includes(location) && businessLocation.includes(location)
    );
  }
  
  private generateMatchingReasons(business: any, searchTerms: string[], originalQuery: string): string[] {
    const reasons: string[] = [];
    const searchableText = this.getSearchableText(business);
    
    // Check for direct matches
    if (business.businessname?.toLowerCase().includes(originalQuery.toLowerCase())) {
      reasons.push('Company name matches your search');
    }
    
    if (business.description?.toLowerCase().includes(originalQuery.toLowerCase())) {
      reasons.push('Service description matches your query');
    }
    
    // Check category alignment
    if (business.category && this.hasIndustryRelevance(business, originalQuery)) {
      reasons.push(`Specializes in ${business.category}`);
    }
    
    // Check location relevance
    if (this.hasLocationRelevance(business, originalQuery)) {
      reasons.push('Located in your specified area');
    }
    
    // Check for specific capabilities
    const capabilityTerms = searchTerms.filter(term => 
      ['ai', 'machine learning', 'nlp', 'computer vision', 'automation', 'analytics', 'prediction'].includes(term)
    );
    
    if (capabilityTerms.length > 0) {
      reasons.push(`Offers ${capabilityTerms.join(', ')} capabilities`);
    }
    
    // Verification status
    if (business.verified) {
      reasons.push('Verified company profile');
    }
    
    return reasons.slice(0, 3); // Limit to top 3 reasons
  }
}

export const semanticSearchService = new SemanticSearchService();
