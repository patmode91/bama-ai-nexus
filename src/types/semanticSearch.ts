
export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
  includeAnalysis?: boolean;
}

export interface SearchFilters {
  category?: string;
  location?: string;
  verified?: boolean;
  employeeRange?: string;
  foundedYearRange?: string;
  tags?: string[];
  projectBudgetRange?: string;
}

export interface SearchResult {
  business: any;
  relevanceScore: number;
  matchingReasons: string[];
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
