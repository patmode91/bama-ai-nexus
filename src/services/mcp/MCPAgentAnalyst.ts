import { mcpContextManager, MCPContext } from './MCPContextManager';
import { mcpEventBus } from './MCPEventBus';
import { supabase } from '@/integrations/supabase/client';

export interface MarketInsight {
  sector: string;
  averageProjectCost: { min: number; max: number };
  typicalTimeline: string;
  marketTrend: 'growing' | 'stable' | 'declining';
  competitorCount: number;
  demandLevel: 'high' | 'medium' | 'low';
  keyFactors: string[];
}

export interface AnalystResponse {
  insights: MarketInsight;
  recommendations: string[];
  riskFactors: string[];
  opportunities: string[];
}

class MCPAgentAnalyst {
  private static instance: MCPAgentAnalyst;

  static getInstance(): MCPAgentAnalyst {
    if (!MCPAgentAnalyst.instance) {
      MCPAgentAnalyst.instance = new MCPAgentAnalyst();
    }
    return MCPAgentAnalyst.instance;
  }

  constructor() {
    // Subscribe to context updates to provide market insights
    mcpEventBus.subscribe('context_created', this.handleContextUpdate.bind(this));
    mcpEventBus.subscribe('agent_request', this.handleAgentRequest.bind(this));
  }

  private async handleContextUpdate(event: any) {
    const context = event.payload.context;
    if (context.industry || context.businessType) {
      // Automatically provide market insights when industry context is available
      await this.generateMarketInsights(event.payload.sessionId, context);
    }
  }

  private async handleAgentRequest(event: any) {
    if (event.payload.action === 'market_analysis' || event.source === 'connector') {
      const sessionId = event.payload.sessionId || event.payload.context?.sessionId;
      if (sessionId) {
        await this.generateMarketInsights(sessionId, event.payload.context);
      }
    }
  }

  async generateMarketInsights(sessionId: string, context: MCPContext): Promise<AnalystResponse> {
    try {
      // Emit agent request event
      await mcpEventBus.emit({
        type: 'agent_request',
        source: 'analyst',
        payload: { action: 'market_analysis', context }
      });

      // Analyze market based on context
      const insights = await this.analyzeMarket(context);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(insights, context);
      const riskFactors = this.identifyRiskFactors(insights, context);
      const opportunities = this.identifyOpportunities(insights, context);

      const response: AnalystResponse = {
        insights,
        recommendations,
        riskFactors,
        opportunities
      };

      // Add analyst context back to session
      mcpContextManager.addContext(sessionId, {
        intent: 'market_analysis_complete',
        entities: { 
          marketInsights: insights,
          analysisType: 'market_intelligence'
        },
        metadata: {
          analysisTimestamp: new Date().toISOString(),
          recommendations: recommendations.length,
          riskFactors: riskFactors.length
        },
        source: 'analyst'
      });

      // Emit response event
      await mcpEventBus.emit({
        type: 'agent_response',
        source: 'analyst',
        payload: { response, sessionId }
      });

      return response;

    } catch (error) {
      console.error('Error in analyst generateMarketInsights:', error);
      throw error;
    }
  }

  private async analyzeMarket(context: MCPContext): Promise<MarketInsight> {
    const sector = context.industry || context.businessType || 'Technology';
    
    // Get market data from database
    const { data: businesses } = await supabase
      .from('businesses')
      .select('*')
      .ilike('category', `%${sector}%`);

    const competitorCount = businesses?.length || 0;

    // Calculate insights based on context and data
    const insights: MarketInsight = {
      sector,
      averageProjectCost: this.calculateProjectCosts(context, businesses),
      typicalTimeline: this.estimateTimeline(context),
      marketTrend: this.assessMarketTrend(sector, businesses),
      competitorCount,
      demandLevel: this.assessDemand(sector, context),
      keyFactors: this.identifyKeyFactors(context, sector)
    };

    return insights;
  }

  private calculateProjectCosts(context: MCPContext, businesses: any[]): { min: number; max: number } {
    // Check if context has a properly defined budget with both min and max
    if (context.budget && 
        typeof context.budget === 'object' && 
        'min' in context.budget && 
        'max' in context.budget &&
        typeof context.budget.min === 'number' && 
        typeof context.budget.max === 'number') {
      return { min: context.budget.min, max: context.budget.max };
    }

    // Default ranges based on industry
    const industry = context.industry?.toLowerCase() || '';
    
    if (industry.includes('legal')) {
      return { min: 25000, max: 150000 };
    } else if (industry.includes('healthcare')) {
      return { min: 50000, max: 300000 };
    } else if (industry.includes('finance')) {
      return { min: 75000, max: 500000 };
    } else if (industry.includes('retail')) {
      return { min: 15000, max: 100000 };
    } else {
      return { min: 20000, max: 200000 };
    }
  }

  private estimateTimeline(context: MCPContext): string {
    if (context.timeline) {
      return context.timeline;
    }

    const services = context.entities.services || [];
    
    if (services.some(s => s.includes('AI') || s.includes('Machine Learning'))) {
      return '4-8 months';
    } else if (services.some(s => s.includes('Automation'))) {
      return '2-6 months';
    } else {
      return '3-6 months';
    }
  }

  private assessMarketTrend(sector: string, businesses: any[]): 'growing' | 'stable' | 'declining' {
    // Simulate market trend analysis
    const aiRelatedSectors = ['technology', 'healthcare', 'finance', 'legal'];
    
    if (aiRelatedSectors.some(s => sector.toLowerCase().includes(s))) {
      return 'growing';
    }
    
    return businesses && businesses.length > 10 ? 'stable' : 'growing';
  }

  private assessDemand(sector: string, context: MCPContext): 'high' | 'medium' | 'low' {
    const services = context.entities.services || [];
    const highDemandServices = ['AI', 'Machine Learning', 'Automation', 'Data Analytics'];
    
    if (services.some(s => highDemandServices.some(hd => s.includes(hd)))) {
      return 'high';
    }
    
    return 'medium';
  }

  private identifyKeyFactors(context: MCPContext, sector: string): string[] {
    const factors = ['Alabama business-friendly environment', 'Skilled workforce availability'];
    
    if (context.location?.toLowerCase().includes('huntsville')) {
      factors.push('Aerospace & defense hub proximity', 'Research university partnerships');
    } else if (context.location?.toLowerCase().includes('birmingham')) {
      factors.push('Financial services ecosystem', 'Healthcare innovation center');
    }
    
    if (sector.toLowerCase().includes('tech')) {
      factors.push('Growing tech ecosystem', 'State AI incentives');
    }
    
    return factors;
  }

  private generateRecommendations(insights: MarketInsight, context: MCPContext): string[] {
    const recommendations: string[] = [];
    
    if (insights.demandLevel === 'high') {
      recommendations.push('Market conditions are favorable for this type of project');
    }
    
    if (insights.competitorCount < 5) {
      recommendations.push('Limited competition provides opportunity for premium pricing');
    } else if (insights.competitorCount > 20) {
      recommendations.push('Highly competitive market - focus on differentiation');
    }
    
    if (insights.marketTrend === 'growing') {
      recommendations.push('Consider early engagement to secure preferred vendors');
    }
    
    recommendations.push(`Budget ${insights.averageProjectCost.min.toLocaleString()} - ${insights.averageProjectCost.max.toLocaleString()} for optimal results`);
    
    return recommendations;
  }

  private identifyRiskFactors(insights: MarketInsight, context: MCPContext): string[] {
    const risks: string[] = [];
    
    if (insights.competitorCount > 25) {
      risks.push('High market saturation may drive up costs');
    }
    
    if (insights.demandLevel === 'high' && insights.competitorCount < 10) {
      risks.push('Limited vendor availability may extend timelines');
    }
    
    if (!context.budget || 
        !('min' in context.budget) || 
        context.budget.min < insights.averageProjectCost.min) {
      risks.push('Budget may be insufficient for market rates');
    }
    
    return risks;
  }

  private identifyOpportunities(insights: MarketInsight, context: MCPContext): string[] {
    const opportunities: string[] = [];
    
    if (insights.marketTrend === 'growing') {
      opportunities.push('Strong growth trajectory in this sector');
    }
    
    if (context.location?.toLowerCase().includes('alabama')) {
      opportunities.push('Access to state incentives and support programs');
    }
    
    if (insights.keyFactors.includes('Research university partnerships')) {
      opportunities.push('Potential collaboration with local universities');
    }
    
    return opportunities;
  }
}

export const mcpAgentAnalyst = MCPAgentAnalyst.getInstance();
