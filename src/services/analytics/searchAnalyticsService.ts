
import { supabase } from '@/integrations/supabase/client';
import { logger } from '../loggerService';

export interface SearchAnalyticsData {
  totalSearches: number;
  averageResults: number;
  topQueries: { query: string; count: number }[];
  searchTrends: { date: string; searches: number }[];
  clickThroughRate: number;
  averageSessionDuration: number;
}

export interface QueryPerformance {
  query: string;
  searchCount: number;
  averageResults: number;
  clickThroughRate: number;
  conversionRate: number;
  suggestions: string[];
}

class SearchAnalyticsService {
  async getSearchAnalytics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<SearchAnalyticsData> {
    try {
      const dateFilter = this.getDateFilter(timeframe);
      
      const { data: searchData, error } = await supabase
        .from('search_analytics')
        .select('*')
        .gte('created_at', dateFilter);

      if (error) throw error;

      const analytics = this.processSearchData(searchData || []);
      
      logger.info('Search analytics generated', { timeframe, totalSearches: analytics.totalSearches }, 'SearchAnalyticsService');
      return analytics;
    } catch (error) {
      logger.error('Failed to get search analytics', { error, timeframe }, 'SearchAnalyticsService');
      throw error;
    }
  }

  async getQueryPerformance(query: string): Promise<QueryPerformance> {
    try {
      const { data: queryData, error } = await supabase
        .from('search_analytics')
        .select('*')
        .ilike('search_query', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const performance = this.analyzeQueryPerformance(query, queryData || []);
      
      logger.info('Query performance analyzed', { query, searchCount: performance.searchCount }, 'SearchAnalyticsService');
      return performance;
    } catch (error) {
      logger.error('Failed to analyze query performance', { error, query }, 'SearchAnalyticsService');
      throw error;
    }
  }

  async trackSearchBehavior(searchQuery: string, filters: any, resultsCount: number): Promise<void> {
    try {
      const behaviorData = {
        search_query: searchQuery,
        search_filters: filters,
        results_count: resultsCount,
        search_duration_ms: Math.random() * 1000 + 200, // Mock duration
        session_id: this.getSessionId(),
        user_agent: navigator.userAgent
      };

      await supabase.from('search_analytics').insert(behaviorData);
      
      logger.info('Search behavior tracked', { searchQuery, resultsCount }, 'SearchAnalyticsService');
    } catch (error) {
      logger.error('Failed to track search behavior', { error, searchQuery }, 'SearchAnalyticsService');
    }
  }

  async getSearchSuggestions(partialQuery: string): Promise<string[]> {
    try {
      if (!partialQuery || partialQuery.length < 2) {
        return this.getPopularQueries();
      }

      const { data: suggestions, error } = await supabase
        .from('search_analytics')
        .select('search_query')
        .ilike('search_query', `%${partialQuery}%`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const uniqueSuggestions = [...new Set(suggestions?.map(s => s.search_query) || [])];
      return uniqueSuggestions.slice(0, 5);
    } catch (error) {
      logger.error('Failed to get search suggestions', { error, partialQuery }, 'SearchAnalyticsService');
      return [];
    }
  }

  private processSearchData(searches: any[]): SearchAnalyticsData {
    const totalSearches = searches.length;
    const averageResults = searches.reduce((sum, search) => sum + (search.results_count || 0), 0) / totalSearches || 0;
    
    // Count query frequency
    const queryCount = searches.reduce((acc, search) => {
      const query = search.search_query;
      acc[query] = (acc[query] || 0) + 1;
      return acc;
    }, {});

    const topQueries = Object.entries(queryCount)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([query, count]) => ({ query, count: count as number }));

    // Generate trend data (mock for now)
    const searchTrends = this.generateTrendData(searches);

    // Calculate CTR
    const clickThroughRate = searches.filter(s => s.clicked_business_id).length / totalSearches || 0;

    return {
      totalSearches,
      averageResults,
      topQueries,
      searchTrends,
      clickThroughRate,
      averageSessionDuration: 145 // Mock average session duration in seconds
    };
  }

  private analyzeQueryPerformance(query: string, queryData: any[]): QueryPerformance {
    const searchCount = queryData.length;
    const averageResults = queryData.reduce((sum, search) => sum + (search.results_count || 0), 0) / searchCount || 0;
    const clickThroughRate = queryData.filter(s => s.clicked_business_id).length / searchCount || 0;
    
    return {
      query,
      searchCount,
      averageResults,
      clickThroughRate,
      conversionRate: clickThroughRate * 0.7, // Mock conversion rate
      suggestions: this.generateQuerySuggestions(query)
    };
  }

  private generateTrendData(searches: any[]): { date: string; searches: number }[] {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      searches: searches.filter(s => s.created_at.startsWith(date)).length
    }));
  }

  private generateQuerySuggestions(query: string): string[] {
    const baseSuggestions = [
      `${query} in Alabama`,
      `${query} near me`,
      `verified ${query}`,
      `top ${query} companies`,
      `${query} services`
    ];
    return baseSuggestions.slice(0, 3);
  }

  private getPopularQueries(): string[] {
    return [
      'AI companies in Birmingham',
      'Healthcare technology startups',
      'Manufacturing companies Alabama',
      'Fintech companies Huntsville',
      'Software development Mobile'
    ];
  }

  private getDateFilter(timeframe: 'day' | 'week' | 'month'): string {
    const date = new Date();
    switch (timeframe) {
      case 'day':
        date.setDate(date.getDate() - 1);
        break;
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
    }
    return date.toISOString();
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

export const searchAnalyticsService = new SearchAnalyticsService();
