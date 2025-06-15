
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
