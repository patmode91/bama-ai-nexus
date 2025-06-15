
import { mcpContextManager, MCPContext } from './MCPContextManager';
import { mcpEventBus } from './MCPEventBus';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessMatch {
  business: any;
  score: number;
  reasoning: string;
  contextMatch: string[];
}

export interface ConnectorResponse {
  matches: BusinessMatch[];
  marketInsights?: any;
  recommendations: string[];
  totalMatches: number;
}

class MCPAgentConnector {
  private static instance: MCPAgentConnector;

  static getInstance(): MCPAgentConnector {
    if (!MCPAgentConnector.instance) {
      MCPAgentConnector.instance = new MCPAgentConnector();
    }
    return MCPAgentConnector.instance;
  }

  constructor() {
    // Subscribe to context updates to trigger matching
    mcpEventBus.subscribe('context_created', this.handleContextUpdate.bind(this));
    mcpEventBus.subscribe('context_updated', this.handleContextUpdate.bind(this));
  }

  private async handleContextUpdate(event: any) {
    if (event.payload.context.source === 'bamabot') {
      // Auto-trigger matching when BamaBot provides context
      const sessionId = event.payload.sessionId;
      await this.findMatches(sessionId);
    }
  }

  async findMatches(sessionId: string): Promise<ConnectorResponse> {
    try {
      // Get merged context from session
      const mergedContext = mcpContextManager.mergeContexts(sessionId);
      
      // Emit agent request event
      await mcpEventBus.emit({
        type: 'agent_request',
        source: 'connector',
        payload: { action: 'find_matches', context: mergedContext }
      });

      // Build search criteria from context
      const searchCriteria = this.buildSearchCriteria(mergedContext);
      
      // Query businesses from database
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('verified', true);

      // Apply filters based on context
      if (searchCriteria.industry) {
        query = query.ilike('category', `%${searchCriteria.industry}%`);
      }

      if (searchCriteria.location) {
        query = query.ilike('location', `%${searchCriteria.location}%`);
      }

      if (searchCriteria.tags && searchCriteria.tags.length > 0) {
        query = query.overlaps('tags', searchCriteria.tags);
      }

      const { data: businesses, error } = await query.limit(20);

      if (error) throw error;

      // Score and rank businesses
      const matches = this.scoreBusinesses(businesses || [], mergedContext);

      // Get market insights from The Analyst
      const marketInsights = await this.requestMarketInsights(mergedContext);

      const response: ConnectorResponse = {
        matches: matches.slice(0, 10), // Top 10 matches
        marketInsights,
        recommendations: this.generateRecommendations(mergedContext, matches),
        totalMatches: matches.length
      };

      // Add connector context back to session
      mcpContextManager.addContext(sessionId, {
        intent: 'business_matches_found',
        entities: { matches: response.matches, searchCriteria },
        metadata: { 
          matchCount: response.totalMatches,
          searchPerformed: new Date().toISOString()
        },
        source: 'connector'
      });

      // Emit response event
      await mcpEventBus.emit({
        type: 'agent_response',
        source: 'connector',
        payload: { response, sessionId }
      });

      return response;

    } catch (error) {
      console.error('Error in connector findMatches:', error);
      throw error;
    }
  }

  private buildSearchCriteria(context: MCPContext) {
    const criteria: any = {};

    // Extract search terms from intent and entities
    if (context.industry) {
      criteria.industry = context.industry;
    }

    if (context.businessType) {
      criteria.businessType = context.businessType;
    }

    if (context.location) {
      criteria.location = context.location;
    }

    // Extract tags from requirements
    if (context.requirements) {
      criteria.tags = context.requirements;
    }

    // Extract additional criteria from entities
    if (context.entities.services) {
      criteria.tags = [...(criteria.tags || []), ...context.entities.services];
    }

    return criteria;
  }

  private scoreBusinesses(businesses: any[], context: MCPContext): BusinessMatch[] {
    return businesses.map(business => {
      let score = 0;
      const contextMatch: string[] = [];
      let reasoning = '';

      // Industry/category match (high weight)
      if (context.industry && business.category) {
        const industryMatch = business.category.toLowerCase().includes(context.industry.toLowerCase());
        if (industryMatch) {
          score += 40;
          contextMatch.push('industry');
          reasoning += `Strong industry match (${business.category}). `;
        }
      }

      // Location match (medium weight)
      if (context.location && business.location) {
        const locationMatch = business.location.toLowerCase().includes(context.location.toLowerCase());
        if (locationMatch) {
          score += 25;
          contextMatch.push('location');
          reasoning += `Location match (${business.location}). `;
        }
      }

      // Tags/services match (medium weight)
      if (context.requirements && business.tags) {
        const tagMatches = context.requirements.filter(req => 
          business.tags.some((tag: string) => 
            tag.toLowerCase().includes(req.toLowerCase())
          )
        );
        if (tagMatches.length > 0) {
          score += tagMatches.length * 15;
          contextMatch.push('services');
          reasoning += `Service match: ${tagMatches.join(', ')}. `;
        }
      }

      // Company size match (if specified)
      if (context.entities.companySize && business.employees_count) {
        const sizeMatch = this.matchCompanySize(context.entities.companySize, business.employees_count);
        if (sizeMatch) {
          score += 10;
          contextMatch.push('size');
          reasoning += `Company size match. `;
        }
      }

      // Verification bonus
      if (business.verified) {
        score += 5;
        reasoning += `Verified business. `;
      }

      // Rating bonus
      if (business.rating > 4.0) {
        score += 5;
        reasoning += `High rating (${business.rating}). `;
      }

      return {
        business,
        score,
        reasoning: reasoning.trim() || 'General business match',
        contextMatch
      };
    }).sort((a, b) => b.score - a.score);
  }

  private matchCompanySize(preferredSize: string, employeeCount: number): boolean {
    switch (preferredSize.toLowerCase()) {
      case 'startup':
      case 'small':
        return employeeCount <= 50;
      case 'medium':
        return employeeCount > 50 && employeeCount <= 500;
      case 'large':
      case 'enterprise':
        return employeeCount > 500;
      default:
        return true;
    }
  }

  private async requestMarketInsights(context: MCPContext) {
    try {
      // This would integrate with The Analyst agent
      // For now, return mock data
      return {
        averageProjectCost: '$50,000 - $150,000',
        typicalTimeline: '3-6 months',
        marketTrend: 'Growing demand in Alabama',
        competitorCount: 15
      };
    } catch (error) {
      console.error('Error getting market insights:', error);
      return null;
    }
  }

  private generateRecommendations(context: MCPContext, matches: BusinessMatch[]): string[] {
    const recommendations: string[] = [];

    if (matches.length > 0) {
      recommendations.push(`Found ${matches.length} potential matches based on your requirements.`);
      
      if (context.budget) {
        recommendations.push('Consider discussing budget expectations early in conversations.');
      }

      if (context.timeline) {
        recommendations.push('Mention your timeline to ensure availability alignment.');
      }

      const topMatch = matches[0];
      if (topMatch.score > 50) {
        recommendations.push(`${topMatch.business.businessname} appears to be an excellent match with a ${topMatch.score}% compatibility score.`);
      }
    } else {
      recommendations.push('No exact matches found. Consider broadening your search criteria.');
      recommendations.push('Try searching in nearby cities or related industries.');
    }

    return recommendations;
  }
}

export const mcpAgentConnector = MCPAgentConnector.getInstance();
