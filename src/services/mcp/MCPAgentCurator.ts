
import { mcpContextManager, MCPContext } from './MCPContextManager';
import { mcpEventBus } from './MCPEventBus';
import { BusinessEnricher } from './curator/businessEnricher';
import { DataQualityAnalyzer } from './curator/dataQualityAnalyzer';
import type { EnrichedBusinessData, CuratorResponse } from './curator/types';
import type { BusinessForValidation, ValidationIssue } from './curator/curationRules'; // Import validation types

export type { EnrichedBusinessData, CuratorResponse, BusinessForValidation, ValidationIssue };

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

  /**
   * Performs validation on a given business profile.
   * @param business The business data object to validate.
   * @returns A promise that resolves to an object containing the validation status (isValid)
   *          and a list of identified issues.
   */
  async performBusinessDataValidation(
    business: BusinessForValidation
  ): Promise<{ isValid: boolean; issues: ValidationIssue[] }> {
    // In a more complex scenario, this might involve fetching the business by ID first,
    // or handling a list of businesses. For now, it directly validates the provided object.

    // The actual validation logic is in DataQualityAnalyzer
    const validationResult = this.dataQualityAnalyzer.validateBusinessProfile(business);

    // Optionally, emit an event or log validation results here if needed at the agent level
    // For example:
    // await mcpEventBus.emit({
    //   type: 'data_validation_ran',
    //   source: 'curator',
    //   payload: { businessId: business.id, issues: validationResult.issues }
    // });

    return validationResult;
  }
}

export const mcpAgentCurator = MCPAgentCurator.getInstance();
