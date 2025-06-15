
import { mcpContextManager, MCPContext } from './MCPContextManager';
import { mcpEventBus } from './MCPEventBus';
import { MarketAnalyzer } from './analyst/marketAnalyzer';
import { RecommendationGenerator } from './analyst/recommendationGenerator';
import type { MarketInsight, AnalystResponse } from './analyst/types';

export type { MarketInsight, AnalystResponse };

class MCPAgentAnalyst {
  private static instance: MCPAgentAnalyst;
  private marketAnalyzer: MarketAnalyzer;
  private recommendationGenerator: RecommendationGenerator;

  static getInstance(): MCPAgentAnalyst {
    if (!MCPAgentAnalyst.instance) {
      MCPAgentAnalyst.instance = new MCPAgentAnalyst();
    }
    return MCPAgentAnalyst.instance;
  }

  constructor() {
    this.marketAnalyzer = new MarketAnalyzer();
    this.recommendationGenerator = new RecommendationGenerator();
    
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
      const insights = await this.marketAnalyzer.analyzeMarket(context);
      
      // Generate recommendations
      const recommendations = this.recommendationGenerator.generateRecommendations(insights, context);
      const riskFactors = this.recommendationGenerator.identifyRiskFactors(insights, context);
      const opportunities = this.recommendationGenerator.identifyOpportunities(insights, context);

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
}

export const mcpAgentAnalyst = MCPAgentAnalyst.getInstance();
