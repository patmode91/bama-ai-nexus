import { intelligenceHubService } from './intelligenceHubService';
import { businessStateManager } from '../stateManager';
import { logger } from '../loggerService';
import { supabase } from '@/integrations/supabase/client';

interface PredictiveModel {
  id: string;
  name: string;
  type: 'market_forecast' | 'business_growth' | 'risk_assessment' | 'opportunity_detection';
  accuracy: number;
  lastTrained: number;
  parameters: Record<string, any>;
}

interface MarketForecast {
  sector: string;
  timeframe: '3m' | '6m' | '12m' | '24m';
  growthPrediction: number;
  confidence: number;
  keyFactors: string[];
  riskFactors: string[];
  opportunities: string[];
}

interface BusinessGrowthPrediction {
  businessId: number;
  predictedGrowth: number;
  timeline: string;
  confidence: number;
  factors: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  recommendations: string[];
}

interface OracleInsight {
  id: string;
  type: 'prediction' | 'forecast' | 'recommendation' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  data: any;
  confidence: number;
  timestamp: number;
  source: string;
}

class OracleAgent {
  private static instance: OracleAgent;
  private models: Map<string, PredictiveModel> = new Map();
  private insights: OracleInsight[] = [];
  private isAnalyzing = false;

  static getInstance(): OracleAgent {
    if (!OracleAgent.instance) {
      OracleAgent.instance = new OracleAgent();
    }
    return OracleAgent.instance;
  }

  constructor() {
    this.initializeModels();
    this.startPredictiveAnalysis();
  }

  private initializeModels(): void {
    const models: PredictiveModel[] = [
      {
        id: 'market_forecaster',
        name: 'Alabama Market Forecaster',
        type: 'market_forecast',
        accuracy: 0.87,
        lastTrained: Date.now() - 86400000,
        parameters: {
          sectors: ['AI/ML', 'Healthcare', 'Aerospace', 'Manufacturing'],
          indicators: ['employment', 'investment', 'startups', 'revenue']
        }
      },
      {
        id: 'growth_predictor',
        name: 'Business Growth Predictor',
        type: 'business_growth',
        accuracy: 0.82,
        lastTrained: Date.now() - 43200000,
        parameters: {
          factors: ['rating', 'reviews', 'partnerships', 'funding', 'team_size'],
          weights: [0.25, 0.20, 0.20, 0.20, 0.15]
        }
      },
      {
        id: 'risk_analyzer',
        name: 'Strategic Risk Analyzer',
        type: 'risk_assessment',
        accuracy: 0.91,
        lastTrained: Date.now() - 21600000,
        parameters: {
          categories: ['market', 'operational', 'financial', 'regulatory'],
          threshold: 0.7
        }
      },
      {
        id: 'opportunity_detector',
        name: 'Market Opportunity Detector',
        type: 'opportunity_detection',
        accuracy: 0.76,
        lastTrained: Date.now() - 10800000,
        parameters: {
          markets: ['emerging', 'underserved', 'growing'],
          signals: ['demand', 'competition', 'investment']
        }
      }
    ];

    models.forEach(model => this.models.set(model.id, model));
    logger.info('Oracle models initialized', { modelCount: models.length }, 'Oracle');
  }

  private startPredictiveAnalysis(): void {
    // Run predictive analysis every 10 minutes
    setInterval(() => {
      this.runPredictiveAnalysis();
    }, 10 * 60 * 1000);

    // Initial analysis after 2 seconds
    setTimeout(() => this.runPredictiveAnalysis(), 2000);
  }

  private async runPredictiveAnalysis(): Promise<void> {
    if (this.isAnalyzing) return;

    this.isAnalyzing = true;
    logger.debug('Starting Oracle predictive analysis', {}, 'Oracle');

    try {
      await Promise.all([
        this.generateMarketForecasts(),
        this.predictBusinessGrowth(),
        this.assessStrategicRisks(),
        this.detectMarketOpportunities()
      ]);

      this.generateAutomatedInsights();
    } catch (error) {
      logger.error('Oracle analysis error', { error }, 'Oracle');
    } finally {
      this.isAnalyzing = false;
    }
  }

  private async generateMarketForecasts(): Promise<void> {
    const sectors = ['AI/ML', 'Healthcare Tech', 'Aerospace', 'Manufacturing', 'Fintech'];
    
    for (const sector of sectors) {
      const forecast = await this.createMarketForecast(sector);
      
      if (forecast.confidence > 0.75) {
        this.addInsight({
          id: `forecast_${sector}_${Date.now()}`,
          type: 'forecast',
          priority: forecast.growthPrediction > 0.2 ? 'high' : 'medium',
          title: `${sector} Market Forecast`,
          description: `Predicted ${(forecast.growthPrediction * 100).toFixed(1)}% growth over ${forecast.timeframe}`,
          data: forecast,
          confidence: forecast.confidence,
          timestamp: Date.now(),
          source: 'market_forecaster'
        });
      }
    }
  }

  private async createMarketForecast(sector: string): Promise<MarketForecast> {
    // Simulate advanced market analysis
    const baseGrowth = Math.random() * 0.4 + 0.05; // 5-45% growth
    const seasonality = Math.sin(Date.now() / (30 * 24 * 60 * 60 * 1000)) * 0.1;
    const trendFactor = sector.includes('AI') ? 0.15 : 0.05;
    
    const growthPrediction = Math.max(0, baseGrowth + seasonality + trendFactor);
    const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence

    return {
      sector,
      timeframe: '12m',
      growthPrediction,
      confidence,
      keyFactors: [
        'Alabama business incentives',
        'Skilled workforce availability',
        'Infrastructure investment',
        'University partnerships'
      ],
      riskFactors: [
        'Economic uncertainty',
        'Competition from other states',
        'Regulatory changes'
      ],
      opportunities: [
        'Government contracts',
        'Cross-sector partnerships',
        'Export opportunities'
      ]
    };
  }

  private async predictBusinessGrowth(): Promise<void> {
    try {
      // Fetch businesses directly from Supabase
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('*')
        .limit(10);

      if (error) {
        logger.error('Failed to fetch businesses for growth prediction', { error }, 'Oracle');
        return;
      }

      const topBusinesses = businesses || [];

      for (const business of topBusinesses) {
        const prediction = this.generateGrowthPrediction(business);
        
        if (prediction.confidence > 0.8) {
          this.addInsight({
            id: `growth_${business.id}_${Date.now()}`,
            type: 'prediction',
            priority: prediction.predictedGrowth > 0.3 ? 'high' : 'medium',
            title: `Growth Prediction: ${business.businessname}`,
            description: `Predicted ${(prediction.predictedGrowth * 100).toFixed(1)}% growth`,
            data: prediction,
            confidence: prediction.confidence,
            timestamp: Date.now(),
            source: 'growth_predictor'
          });
        }
      }
    } catch (error) {
      logger.error('Error in predictBusinessGrowth', { error }, 'Oracle');
    }
  }

  private generateGrowthPrediction(business: any): BusinessGrowthPrediction {
    let growthScore = 0;
    const factors = { positive: [], negative: [], neutral: [] };

    // Rating factor
    if (business.rating > 4.0) {
      growthScore += 0.2;
      factors.positive.push('High customer satisfaction');
    } else if (business.rating < 3.0) {
      growthScore -= 0.1;
      factors.negative.push('Low customer ratings');
    }

    // Verification factor
    if (business.verified) {
      growthScore += 0.1;
      factors.positive.push('Verified business status');
    }

    // Location factor
    if (business.location?.includes('Birmingham') || business.location?.includes('Huntsville')) {
      growthScore += 0.15;
      factors.positive.push('Located in major business hub');
    }

    // Category factor
    if (business.category?.toLowerCase().includes('ai') || business.category?.toLowerCase().includes('tech')) {
      growthScore += 0.2;
      factors.positive.push('High-growth technology sector');
    }

    const predictedGrowth = Math.max(0, Math.min(1, growthScore + (Math.random() * 0.2 - 0.1)));
    const confidence = Math.random() * 0.3 + 0.7;

    return {
      businessId: business.id,
      predictedGrowth,
      timeline: '12 months',
      confidence,
      factors,
      recommendations: [
        'Focus on customer experience improvement',
        'Expand digital presence',
        'Consider strategic partnerships'
      ]
    };
  }

  private async assessStrategicRisks(): Promise<void> {
    const risks = [
      {
        type: 'Market Risk',
        description: 'Increased competition in AI sector',
        probability: Math.random() * 0.4 + 0.3,
        impact: Math.random() * 0.3 + 0.5
      },
      {
        type: 'Regulatory Risk',
        description: 'Changes in data privacy regulations',
        probability: Math.random() * 0.3 + 0.4,
        impact: Math.random() * 0.4 + 0.4
      },
      {
        type: 'Economic Risk',
        description: 'Economic downturn affecting funding',
        probability: Math.random() * 0.5 + 0.2,
        impact: Math.random() * 0.5 + 0.3
      }
    ];

    risks.forEach(risk => {
      const riskScore = risk.probability * risk.impact;
      if (riskScore > 0.5) {
        this.addInsight({
          id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'alert',
          priority: riskScore > 0.7 ? 'critical' : 'high',
          title: `Risk Alert: ${risk.type}`,
          description: risk.description,
          data: { ...risk, riskScore },
          confidence: 0.85,
          timestamp: Date.now(),
          source: 'risk_analyzer'
        });
      }
    });
  }

  private async detectMarketOpportunities(): Promise<void> {
    const opportunities = [
      {
        market: 'Healthcare AI',
        description: 'Growing demand for AI in Alabama healthcare systems',
        potential: Math.random() * 0.4 + 0.6,
        timeline: '6-12 months'
      },
      {
        market: 'Defense Tech',
        description: 'Government contracts in aerospace sector',
        potential: Math.random() * 0.3 + 0.7,
        timeline: '12-18 months'
      },
      {
        market: 'Agriculture Tech',
        description: 'Precision agriculture opportunities',
        potential: Math.random() * 0.5 + 0.4,
        timeline: '9-15 months'
      }
    ];

    opportunities.forEach(opportunity => {
      if (opportunity.potential > 0.7) {
        this.addInsight({
          id: `opportunity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'recommendation',
          priority: opportunity.potential > 0.8 ? 'high' : 'medium',
          title: `Market Opportunity: ${opportunity.market}`,
          description: opportunity.description,
          data: opportunity,
          confidence: opportunity.potential,
          timestamp: Date.now(),
          source: 'opportunity_detector'
        });
      }
    });
  }

  private generateAutomatedInsights(): void {
    // Generate meta-insights based on patterns
    const recentInsights = this.insights.slice(0, 10);
    const highConfidenceInsights = recentInsights.filter(i => i.confidence > 0.8);
    
    if (highConfidenceInsights.length > 5) {
      this.addInsight({
        id: `meta_insight_${Date.now()}`,
        type: 'recommendation',
        priority: 'high',
        title: 'Strong Market Signals Detected',
        description: `${highConfidenceInsights.length} high-confidence predictions indicate favorable market conditions`,
        data: { insightCount: highConfidenceInsights.length },
        confidence: 0.9,
        timestamp: Date.now(),
        source: 'oracle_meta_analysis'
      });
    }
  }

  private addInsight(insight: OracleInsight): void {
    this.insights.unshift(insight);
    
    // Keep only last 100 insights
    if (this.insights.length > 100) {
      this.insights = this.insights.slice(0, 100);
    }

    logger.info('Oracle insight generated', { 
      type: insight.type, 
      priority: insight.priority,
      confidence: insight.confidence 
    }, 'Oracle');
  }

  // Public API
  getInsights(type?: OracleInsight['type']): OracleInsight[] {
    if (type) {
      return this.insights.filter(insight => insight.type === type);
    }
    return [...this.insights];
  }

  getMarketForecast(sector: string): Promise<MarketForecast> {
    return this.createMarketForecast(sector);
  }

  async predictGrowth(businessId: number): Promise<BusinessGrowthPrediction | null> {
    try {
      // Fetch specific business from Supabase
      const { data: business, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error || !business) {
        logger.error('Failed to fetch business for growth prediction', { error, businessId }, 'Oracle');
        return null;
      }

      return this.generateGrowthPrediction(business);
    } catch (error) {
      logger.error('Error in predictGrowth', { error, businessId }, 'Oracle');
      return null;
    }
  }

  getModels(): PredictiveModel[] {
    return Array.from(this.models.values());
  }

  getAnalysisStatus() {
    return {
      isAnalyzing: this.isAnalyzing,
      totalInsights: this.insights.length,
      activeModels: this.models.size,
      lastAnalysis: this.insights.length > 0 ? this.insights[0].timestamp : null,
      highPriorityInsights: this.insights.filter(i => i.priority === 'high' || i.priority === 'critical').length
    };
  }
}

export const oracleAgent = OracleAgent.getInstance();
export default oracleAgent;
