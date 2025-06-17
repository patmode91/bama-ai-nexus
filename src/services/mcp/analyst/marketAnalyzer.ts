import { supabase } from '@/integrations/supabase/client';
import { MCPContext } from '../MCPContextManager';
import { MarketInsight } from './types';
import {
  calculateMovingAverage,
  calculateLinearRegression,
  DataPoint,
  LinearRegressionResult
} from '../../analytics/trendAnalysis';

// Define a basic Business type for competitive analysis context.
// In a real application, this would likely be imported from a shared types definition.
interface Business {
  id: string | number;
  name: string;
  category: string;
  location?: string; // e.g., city or a more structured address object
  rating?: number;
  reviewCount?: number;
  servicesOffered?: string[];
  // Add other relevant fields as available, e.g., priceRange, yearsInBusiness
}

export interface CompetitorComparisonReport {
  targetBusinessId: string | number;
  competitorBusinessId: string | number;
  sharedCategory: string;
  sharedLocation?: string;
  strengthsTarget: string[];
  weaknessesTarget: string[]; // Relative to this competitor
  keyDifferentiators: {
    targetOnly: string[];
    competitorOnly: string[];
  };
  opportunities?: string[]; // Placeholder for more advanced analysis
  threats?: string[];       // Placeholder for more advanced analysis
}

// --- Risk Assessment Types ---
export interface RiskFactor {
  type: 'Competition' | 'Reputation' | 'Market Saturation' | 'Data Quality'; // Added Data Quality
  level: 'Low' | 'Medium' | 'High' | 'Unknown';
  assessment: string; // Brief explanation of the risk
}

export interface BusinessRiskProfile {
  businessId: string | number;
  overallRiskLevel: 'Low' | 'Medium' | 'High' | 'Unknown';
  riskFactors: RiskFactor[];
  summary?: string;
}
// --- End Risk Assessment Types ---

export interface TrendAnalysisInputPoint {
  date?: any; // Can be Date object, string, or number (timestamp/index)
  value: number;
}

export interface TrendAnalysisOptions {
  windowSize?: number; // For Moving Average
  treatDateAs?: 'timestamp' | 'index'; // For Linear Regression: how to interpret date for x-axis
}

export interface TrendAnalysisResult {
  analysisType: 'movingAverage' | 'linearRegression';
  trendDirection?: 'upward' | 'downward' | 'stable' | 'indeterminate'; // Indeterminate for MA
  trendStrength?: number; // e.g. slope magnitude * rSquared for LR
  processedData?: number[] | DataPoint[]; // Smoothed data for MA, or input points for LR
  regressionCoefficients?: { slope: number; intercept: number; rSquared: number };
  details?: string;
  error?: string;
}

export class MarketAnalyzer {
  async analyzeMarket(context: MCPContext): Promise<MarketInsight> {
    const sector = context.industry || context.businessType || 'Technology';
    
    // Get market data from database
    const { data: businesses } = await supabase
      .from('businesses')
      .select('*')
      .ilike('category', `%${sector}%`);

    const competitorCount = businesses?.length || 0;

    const insights: MarketInsight = {
      sector,
      averageProjectCost: this.calculateProjectCosts(context, businesses),
      typicalTimeline: this.estimateTimeline(context),
      marketTrend: await this.assessMarketTrend(sector, businesses, context),
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

  // Modified to return only the valid market trend types
  private async assessMarketTrend(sector: string, businesses: any[], context: MCPContext): Promise<'growing' | 'stable' | 'declining'> {
    const aiRelatedSectors = ['technology', 'healthcare', 'finance', 'legal'];
    if (aiRelatedSectors.some(s => sector.toLowerCase().includes(s))) {
      return 'growing';
    }
    return businesses && businesses.length > 10 ? 'stable' : 'growing';
  }

  /**
   * Analyzes a given time series data for trends.
   * @param seriesData An array of data points, each with a 'value' and an optional 'date'.
   * @param analysisType The type of analysis to perform: 'movingAverage' or 'linearRegression'.
   * @param options Optional parameters for the analysis (e.g., windowSize for MA, treatDateAs for LR).
   * @returns A Promise resolving to a TrendAnalysisResult object.
   */
  async analyzeTimeSeriesData(
    seriesData: TrendAnalysisInputPoint[],
    analysisType: 'movingAverage' | 'linearRegression',
    options: TrendAnalysisOptions = {}
  ): Promise<TrendAnalysisResult> {
    if (!seriesData || seriesData.length === 0) {
      return { analysisType, error: 'Input data is empty or null.' , trendDirection: 'indeterminate'};
    }

    if (analysisType === 'movingAverage') {
      const values = seriesData.map(d => d.value);
      const windowSize = options.windowSize || Math.max(1, Math.min(7, Math.floor(values.length / 3))); // Default window: min(7, N/3)

      if (values.length < windowSize && values.length > 0) {
         // Not enough data for chosen window, return simple average or indicate insufficient data
        const simpleAverage = values.reduce((acc, v) => acc + v, 0) / values.length;
        return {
          analysisType,
          trendDirection: 'indeterminate',
          processedData: [simpleAverage],
          details: `Data too short for window size ${windowSize}. Simple average calculated.`,
        };
      }
      if (values.length === 0){
         return { analysisType, error: 'No numerical values to process for moving average.', trendDirection: 'indeterminate' };
      }

      const movingAverages = calculateMovingAverage(values, windowSize);
      return {
        analysisType,
        trendDirection: 'indeterminate', // MA itself doesn't give direction, but change in MA can
        processedData: movingAverages,
        details: `Moving average calculated with window size ${windowSize}.`,
      };
    } else if (analysisType === 'linearRegression') {
      const treatDateAs = options.treatDateAs || 'index';
      let dataPoints: DataPoint[];

      if (seriesData.length < 2) {
        return { analysisType, error: 'Insufficient data for linear regression (need at least 2 points).', trendDirection: 'indeterminate' };
      }

      try {
        dataPoints = seriesData.map((d, index) => {
          let xValue: number;
          if (treatDateAs === 'timestamp' && d.date) {
            xValue = new Date(d.date).getTime();
          } else {
            xValue = index;
          }
          if (isNaN(xValue)) throw new Error(`Invalid date encountered: ${d.date} at index ${index} resulting in NaN timestamp.`);
          return { x: xValue, y: d.value };
        });
      } catch(e: any) {
        return { analysisType, error: `Data processing error for linear regression: ${e.message}`, trendDirection: 'indeterminate' };
      }

      // Normalize timestamps to start near 0 for better numerical stability if dates were used
      if (treatDateAs === 'timestamp' && dataPoints.length > 0) {
        const firstTimestamp = dataPoints[0].x;
        dataPoints = dataPoints.map(dp => ({ ...dp, x: dp.x - firstTimestamp }));
      }

      const regressionResult = calculateLinearRegression(dataPoints);
      if (!regressionResult) {
        return { analysisType, error: 'Linear regression calculation failed.', trendDirection: 'indeterminate' };
      }

      return {
        analysisType,
        trendDirection: regressionResult.trendDirection,
        trendStrength: regressionResult.trendStrength,
        regressionCoefficients: {
          slope: regressionResult.slope,
          intercept: regressionResult.intercept,
          rSquared: regressionResult.rSquared,
        },
        processedData: dataPoints, // The points used for regression
        details: `Linear regression calculated. Trend is ${regressionResult.trendDirection}. R-squared: ${regressionResult.rSquared.toFixed(3)}.`,
      };
    } else {
      return { analysisType: analysisType, error: 'Invalid analysis type specified.', trendDirection: 'indeterminate' };
    }
  }

  private assessDemand(sector: string, context: MCPContext): 'high' | 'medium' | 'low' {
    const services = context.entities?.services || []; // Added optional chaining for context.entities
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

  /**
   * Identifies key competitors for a target business from a list of all businesses.
   * Competitors are primarily identified based on shared category and location.
   * They are then ranked by rating and review count.
   * @param targetBusiness The business for which to find competitors.
   * @param allBusinesses An array of all businesses to consider.
   * @param maxCompetitors The maximum number of competitors to return. Defaults to 5.
   * @returns An array of Business objects representing key competitors.
   */
  identifyKeyCompetitors(
    targetBusiness: Business,
    allBusinesses: Business[],
    maxCompetitors: number = 5
  ): Business[] {
    if (!targetBusiness || !allBusinesses) {
      return [];
    }

    const potentialCompetitors = allBusinesses.filter(business => {
      if (business.id === targetBusiness.id) {
        return false; // Exclude the target business itself
      }

      // Must be in the same category
      const sameCategory = business.category?.toLowerCase() === targetBusiness.category?.toLowerCase();
      if (!sameCategory) {
        return false;
      }

      // Optionally, filter by location if both have it defined
      if (targetBusiness.location && business.location) {
        const sameLocation = business.location?.toLowerCase() === targetBusiness.location?.toLowerCase();
        if (!sameLocation) {
          return false;
        }
      }
      return true;
    });

    // Rank competitors: higher rating is better, then more reviews is better
    potentialCompetitors.sort((a, b) => {
      if ((b.rating ?? 0) !== (a.rating ?? 0)) {
        return (b.rating ?? 0) - (a.rating ?? 0);
      }
      return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
    });

    return potentialCompetitors.slice(0, maxCompetitors);
  }

  /**
   * Generates a basic comparison report between a target business and a competitor.
   * @param targetBusiness The primary business.
   * @param competitorBusiness The competitor business.
   * @returns A CompetitorComparisonReport object.
   */
  generateCompetitorComparison(
    targetBusiness: Business,
    competitorBusiness: Business
  ): CompetitorComparisonReport {
    const report: CompetitorComparisonReport = {
      targetBusinessId: targetBusiness.id,
      competitorBusinessId: competitorBusiness.id,
      sharedCategory: targetBusiness.category,
      sharedLocation: targetBusiness.location === competitorBusiness.location ? targetBusiness.location : undefined,
      strengthsTarget: [],
      weaknessesTarget: [],
      keyDifferentiators: { targetOnly: [], competitorOnly: [] },
      opportunities: ["Placeholder: Explore untapped customer segments."], // Generic placeholder
      threats: ["Placeholder: Monitor competitor's marketing initiatives."] // Generic placeholder
    };

    // Compare ratings
    if (targetBusiness.rating !== undefined && competitorBusiness.rating !== undefined) {
      if (targetBusiness.rating > competitorBusiness.rating) {
        report.strengthsTarget.push(`Higher rating (${targetBusiness.rating} vs ${competitorBusiness.rating})`);
      } else if (targetBusiness.rating < competitorBusiness.rating) {
        report.weaknessesTarget.push(`Lower rating (${targetBusiness.rating} vs ${competitorBusiness.rating})`);
      }
    }

    // Compare review counts
    if (targetBusiness.reviewCount !== undefined && competitorBusiness.reviewCount !== undefined) {
      if (targetBusiness.reviewCount > competitorBusiness.reviewCount) {
        report.strengthsTarget.push(`More reviews (${targetBusiness.reviewCount} vs ${competitorBusiness.reviewCount})`);
      } else if (targetBusiness.reviewCount < competitorBusiness.reviewCount) {
        report.weaknessesTarget.push(`Fewer reviews (${targetBusiness.reviewCount} vs ${competitorBusiness.reviewCount})`);
      }
    }

    // Compare services offered
    const targetServices = new Set(targetBusiness.servicesOffered?.map(s => s.toLowerCase()) || []);
    const competitorServices = new Set(competitorBusiness.servicesOffered?.map(s => s.toLowerCase()) || []);

    report.keyDifferentiators.targetOnly = targetBusiness.servicesOffered?.filter(s => !competitorServices.has(s.toLowerCase())) || [];
    report.keyDifferentiators.competitorOnly = competitorBusiness.servicesOffered?.filter(s => !targetServices.has(s.toLowerCase())) || [];

    if (report.strengthsTarget.length === 0 && report.weaknessesTarget.length === 0 &&
        report.keyDifferentiators.targetOnly.length === 0 && report.keyDifferentiators.competitorOnly.length === 0) {
        report.strengthsTarget.push("Similar profile based on available data.");
    }

    return report;
  }

  /**
   * Assesses various risk factors for a target business based on its profile and the competitive landscape.
   * @param targetBusiness The business to assess.
   * @param allBusinessesInContext A list of all businesses relevant to the current analysis context
   *                               (e.g., same sector, potentially filtered by geography already).
   * @returns A BusinessRiskProfile object detailing identified risks.
   */
  assessBusinessRisk(
    targetBusiness: Business,
    allBusinessesInContext: Business[]
  ): BusinessRiskProfile {
    const riskFactors: RiskFactor[] = [];

    // 1. Competition Risk
    const competitors = this.identifyKeyCompetitors(targetBusiness, allBusinessesInContext, 10); // Check up to 10
    let competitionRiskLevel: 'Low' | 'Medium' | 'High';
    let competitionAssessment: string;

    if (competitors.length >= 5) {
      competitionRiskLevel = 'High';
      competitionAssessment = `High competition: ${competitors.length} key competitors identified in the same category and location.`;
    } else if (competitors.length >= 2) {
      competitionRiskLevel = 'Medium';
      competitionAssessment = `Moderate competition: ${competitors.length} key competitors identified.`;
    } else {
      competitionRiskLevel = 'Low';
      competitionAssessment = `Low competition: ${competitors.length} key competitor(s) identified.`;
    }
    riskFactors.push({ type: 'Competition', level: competitionRiskLevel, assessment: competitionAssessment });

    // 2. Reputation Risk
    let reputationRiskLevel: 'Low' | 'Medium' | 'High' | 'Unknown' = 'Unknown';
    let reputationAssessment: string = "Reputation data not available or insufficient.";

    if (targetBusiness.rating !== undefined && targetBusiness.reviewCount !== undefined) {
      const { rating, reviewCount } = targetBusiness;
      if (rating < 3.0) {
        reputationRiskLevel = 'High';
        reputationAssessment = `High risk: Rating is very low (${rating}/5).`;
      } else if (rating < 3.5 && reviewCount < 10) {
        reputationRiskLevel = 'High';
        reputationAssessment = `High risk: Rating is low (${rating}/5) with few reviews (${reviewCount}).`;
      } else if (rating < 3.8 && reviewCount < 20) {
        reputationRiskLevel = 'Medium';
        reputationAssessment = `Medium risk: Rating is average (${rating}/5) with moderate reviews (${reviewCount}). Consider improving online presence.`;
      } else if (rating >= 3.8 && reviewCount >= 20) {
        reputationRiskLevel = 'Low';
        reputationAssessment = `Low risk: Good rating (${rating}/5) with sufficient reviews (${reviewCount}).`;
      } else if (reviewCount < 5) {
        reputationRiskLevel = 'Medium';
        reputationAssessment = `Medium risk: Rating is ${rating}/5 but very few reviews (${reviewCount}). Reputation may not be well established.`;
      } else {
        reputationRiskLevel = 'Low'; // Default to Low if rating is good but review count is between 5 and 19
        reputationAssessment = `Low risk: Rating is ${rating}/5. Review count (${reviewCount}) is acceptable.`;
      }
    } else if (targetBusiness.rating !== undefined) {
        reputationRiskLevel = 'Medium';
        reputationAssessment = `Medium risk: Rating is ${targetBusiness.rating}/5 but review count is unknown/zero.`;
    } else if (targetBusiness.reviewCount !== undefined && targetBusiness.reviewCount < 5) {
        reputationRiskLevel = 'Medium';
        reputationAssessment = `Medium risk: Very few reviews (${targetBusiness.reviewCount}), rating unknown.`;
    }
    riskFactors.push({ type: 'Reputation', level: reputationRiskLevel, assessment: reputationAssessment });

    // 3. Market Saturation Risk (based on density of similar businesses in the provided context)
    const similarBusinessesInContext = allBusinessesInContext.filter(b =>
        b.id !== targetBusiness.id &&
        b.category?.toLowerCase() === targetBusiness.category?.toLowerCase() &&
        (b.location?.toLowerCase() === targetBusiness.location?.toLowerCase() || !targetBusiness.location) // if target has no location, compare only by category
    );
    let saturationRiskLevel: 'Low' | 'Medium' | 'High';
    let saturationAssessment: string;

    // Example thresholds for saturation based on count in the given context
    if (similarBusinessesInContext.length > 15) {
        saturationRiskLevel = 'High';
        saturationAssessment = `High market saturation: ${similarBusinessesInContext.length} similar businesses found in this context.`;
    } else if (similarBusinessesInContext.length > 5) {
        saturationRiskLevel = 'Medium';
        saturationAssessment = `Moderate market saturation: ${similarBusinessesInContext.length} similar businesses found in this context.`;
    } else {
        saturationRiskLevel = 'Low';
        saturationAssessment = `Low market saturation: ${similarBusinessesInContext.length} similar businesses found in this context.`;
    }
    riskFactors.push({ type: 'Market Saturation', level: saturationRiskLevel, assessment: saturationAssessment });

    // 4. Data Quality Risk (Poor quality of its own data)
    let dataQualityRiskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    let dataQualityAssessment: string = 'Business profile data seems adequate.';
    const missingFields = [];
    if (targetBusiness.rating === undefined) missingFields.push('rating');
    if (targetBusiness.reviewCount === undefined) missingFields.push('review count');
    if (!targetBusiness.location) missingFields.push('location');
    if (!targetBusiness.servicesOffered || targetBusiness.servicesOffered.length === 0) missingFields.push('services offered');

    if (missingFields.length >= 3) {
        dataQualityRiskLevel = 'High';
        dataQualityAssessment = `High risk: Multiple key data fields missing (${missingFields.join(', ')}). Difficult to assess accurately.`;
    } else if (missingFields.length >= 1) {
        dataQualityRiskLevel = 'Medium';
        dataQualityAssessment = `Medium risk: Some data fields missing (${missingFields.join(', ')}). May impact assessment quality.`;
    }
    riskFactors.push({ type: 'Data Quality', level: dataQualityRiskLevel, assessment: dataQualityAssessment });

    // Determine Overall Risk Level
    let overallRiskLevel: 'Low' | 'Medium' | 'High' | 'Unknown' = 'Low';
    if (riskFactors.some(f => f.level === 'High')) {
      overallRiskLevel = 'High';
    } else if (riskFactors.some(f => f.level === 'Medium')) {
      overallRiskLevel = 'Medium';
    } else if (riskFactors.every(f => f.level === 'Unknown') && riskFactors.length > 0) {
      overallRiskLevel = 'Unknown';
    }


    const summary = `Overall business risk assessed as ${overallRiskLevel}. Key factors include ${competitionRiskLevel} competition, ${reputationRiskLevel} reputation, ${saturationRiskLevel} market saturation, and ${dataQualityRiskLevel} data quality.`;

    return {
      businessId: targetBusiness.id,
      overallRiskLevel,
      riskFactors,
      summary,
    };
  }
}
