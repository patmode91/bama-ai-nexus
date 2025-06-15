
import { useState } from 'react';
import { mcpAgentAnalyst, AnalystResponse } from '@/services/mcp/MCPAgentAnalyst';
import { MCPContext } from '@/services/mcp/MCPContextManager';

export const useAnalyst = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalystResponse | null>(null);

  const generateMarketInsights = async (sessionId: string, context: MCPContext): Promise<AnalystResponse> => {
    setIsAnalyzing(true);
    try {
      const result = await mcpAgentAnalyst.generateMarketInsights(sessionId, context);
      setAnalysisResult(result);
      return result;
    } catch (error) {
      console.error('Error generating market insights:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    analysisResult,
    generateMarketInsights
  };
};
