
export interface EnrichedBusinessData {
  business: any;
  enrichedTags: string[];
  industryInsights: string[];
  compatibilityScore: number;
  dataQuality: 'high' | 'medium' | 'low';
  lastEnriched: Date;
}

export interface CuratorResponse {
  enrichedBusinesses: EnrichedBusinessData[];
  dataQualityReport: {
    totalProcessed: number;
    highQuality: number;
    needsImprovement: number;
  };
  suggestions: string[];
}

export interface DataQualityReport {
  totalProcessed: number;
  highQuality: number;
  needsImprovement: number;
}
