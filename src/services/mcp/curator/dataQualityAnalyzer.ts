
import { MCPContext } from '../MCPContextManager';
import type { EnrichedBusinessData, DataQualityReport } from './types';

export class DataQualityAnalyzer {
  generateDataQualityReport(enrichedBusinesses: EnrichedBusinessData[]): DataQualityReport {
    const totalProcessed = enrichedBusinesses.length;
    const highQuality = enrichedBusinesses.filter(b => b.dataQuality === 'high').length;
    const needsImprovement = enrichedBusinesses.filter(b => b.dataQuality === 'low').length;

    return {
      totalProcessed,
      highQuality,
      needsImprovement
    };
  }

  generateDataSuggestions(enrichedBusinesses: EnrichedBusinessData[], context: MCPContext): string[] {
    const suggestions: string[] = [];

    const lowQualityCount = enrichedBusinesses.filter(b => b.dataQuality === 'low').length;
    if (lowQualityCount > 0) {
      suggestions.push(`${lowQualityCount} businesses could benefit from enhanced profile data`);
    }

    const unverifiedCount = enrichedBusinesses.filter(b => !b.business.verified).length;
    if (unverifiedCount > 0) {
      suggestions.push(`${unverifiedCount} businesses are pending verification`);
    }

    const highCompatibility = enrichedBusinesses.filter(b => b.compatibilityScore > 80).length;
    if (highCompatibility > 0) {
      suggestions.push(`${highCompatibility} businesses show high compatibility with your requirements`);
    }

    return suggestions;
  }
}
