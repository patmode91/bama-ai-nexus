
import { mcpContextManager, MCPContext } from './MCPContextManager';
import { mcpEventBus } from './MCPEventBus';
import { BusinessEnricher } from './curator/businessEnricher';
import { DataQualityAnalyzer } from './curator/dataQualityAnalyzer';
import type { EnrichedBusinessData, CuratorResponse } from './curator/types';

export type { EnrichedBusinessData, CuratorResponse };

class MCPAgentCurator {
  private static instance: MCPAgentCurator;
  private businessEnricher: BusinessEnricher;
  private dataQualityAnalyzer: DataQualityAnalyzer;

  static getInstance(): MCPAgentCurator {
    if (!MCPAgentCurator.instance) {
      MCPAgentCurator.instance = new MCPAgentCurator();
    }
    return MCPAgentCurator.instance;
  }

  constructor() {
    this.businessEnricher = new BusinessEnricher();
    this.dataQualityAnalyzer = new DataQualityAnalyzer();
    
    // Subscribe to agent requests for data enrichment
    mcpEventBus.subscribe('agent_request', this.handleAgentRequest.bind(this));
  }

  private async handleAgentRequest(event: any) {
    if (event.payload.action === 'enrich_data' || event.source === 'connector') {
      const businesses = event.payload.businesses;
      const context = event.payload.context;
      
      if (businesses && context) {
        await this.enrichBusinessData(event.payload.sessionId, businesses, context);
      }
    }
  }

  async enrichBusinessData(sessionId: string, businesses: any[], context: MCPContext): Promise<CuratorResponse> {
    try {
      // Emit agent request event
      await mcpEventBus.emit({
        type: 'agent_request',
        source: 'curator',
        payload: { action: 'enrich_data', businesses, context }
      });

      const enrichedBusinesses = await Promise.all(
        businesses.map(business => this.businessEnricher.enrichSingleBusiness(business, context))
      );

      const dataQualityReport = this.dataQualityAnalyzer.generateDataQualityReport(enrichedBusinesses);
      const suggestions = this.dataQualityAnalyzer.generateDataSuggestions(enrichedBusinesses, context);

      const response: CuratorResponse = {
        enrichedBusinesses,
        dataQualityReport,
        suggestions
      };

      // Add curator context back to session
      mcpContextManager.addContext(sessionId, {
        intent: 'data_enrichment_complete',
        entities: {
          enrichedCount: enrichedBusinesses.length,
          qualityScore: dataQualityReport.highQuality / dataQualityReport.totalProcessed
        },
        metadata: {
          enrichmentTimestamp: new Date().toISOString(),
          dataQuality: dataQualityReport
        },
        source: 'curator'
      });

      // Emit response event
      await mcpEventBus.emit({
        type: 'agent_response',
        source: 'curator',
        payload: { response, sessionId }
      });

      return response;

    } catch (error) {
      console.error('Error in curator enrichBusinessData:', error);
      throw error;
    }
  }
}

export const mcpAgentCurator = MCPAgentCurator.getInstance();
