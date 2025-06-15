import { intentAnalyzer } from './search/intentAnalyzer';
import { queryBuilder } from './search/queryBuilder';
import { businessScorer } from './search/businessScorer';
import { suggestionGenerator } from './search/suggestionGenerator';
import { SearchQuery, SearchResult, SearchFilters } from '@/types/semanticSearch';

class SemanticSearchService {
  async searchBusinesses(searchQuery: SearchQuery): Promise<SearchResult[]> {
    try {
      // Analyze search intent
      const analysis = await intentAnalyzer.analyzeSearchIntent(searchQuery.query);
      
      // Build and execute database query
      const dbQuery = queryBuilder.buildSearchQuery(analysis.extractedCriteria, searchQuery.filters);
      const { data: businesses, error } = await dbQuery.limit(searchQuery.limit || 50);

      if (error) throw error;

      if (!businesses || businesses.length === 0) {
        return [];
      }

      // Score and rank results
      const scoredResults = await Promise.all(
        businesses.map(async (business) => {
          const { score, reasons } = await businessScorer.scoreBusinessRelevance(
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
    return suggestionGenerator.getSearchSuggestions(partialQuery);
  }

  async getRelatedQueries(originalQuery: string): Promise<string[]> {
    return suggestionGenerator.getRelatedQueries(originalQuery);
  }
}

export const semanticSearchService = new SemanticSearchService();
