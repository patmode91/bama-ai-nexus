
export interface DataProvenance {
  sourceId: string;
  sourceName: string;
  sourceType: 'database' | 'api' | 'web_scraping' | 'user_generated' | 'ai_generated';
  confidenceScore: number; // 0-100
  lastUpdated: Date;
  verificationStatus: 'verified' | 'unverified' | 'flagged';
  dataPoints: string[];
}

export interface AgentDecisionLog {
  agentId: string;
  agentName: string;
  timestamp: Date;
  reasoning: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  dataSourcesUsed: DataProvenance[];
  alternativesConsidered?: string[];
  biasAuditFlags?: string[];
}

export interface EnhancedAgentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  sessionId: string;
  timestamp: string;
  provenance: DataProvenance[];
  decisionLog: AgentDecisionLog;
  transparencyScore: number; // 0-100, how transparent this response is
}
