
import { useState } from 'react';
import { mcpAgentCurator, CuratorResponse } from '@/services/mcp/MCPAgentCurator';
import { MCPContext } from '@/services/mcp/MCPContextManager';

export const useCurator = () => {
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentResult, setEnrichmentResult] = useState<CuratorResponse | null>(null);

  const enrichBusinessData = async (sessionId: string, businesses: any[], context: MCPContext): Promise<CuratorResponse> => {
    setIsEnriching(true);
    try {
      const result = await mcpAgentCurator.enrichBusinessData(sessionId, businesses, context);
      setEnrichmentResult(result);
      return result;
    } catch (error) {
      console.error('Error enriching business data:', error);
      throw error;
    } finally {
      setIsEnriching(false);
    }
  };

  return {
    isEnriching,
    enrichmentResult,
    enrichBusinessData
  };
};
