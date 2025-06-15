
export interface SearchFilters {
  location?: string;
  category?: string;
  verified?: boolean;
  tags?: string[];
  employeeRange?: string;
  fundingStage?: string;
}

export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  includeAnalysis?: boolean;
}

export interface SearchResult {
  business: any;
  relevanceScore: number;
  matchingReasons: string[];
  contextualInsights?: string;
}

export interface SearchIntent {
  intent: 'find_businesses' | 'market_research' | 'partnership' | 'investment';
  extractedCriteria: {
    technologies: string[];
    industries: string[];
    locations: string[];
    companySize: string;
    services: string[];
    keywords: string[];
  };
  searchTerms: string[];
}

export interface ScoringResult {
  score: number;
  reasons: string[];
}
