import { businessStateManager } from '../stateManager';
import { logger } from '../loggerService';
import { enterpriseAnalyticsService } from '../analytics/enterpriseAnalyticsService';

interface PredictiveModel {
  id: string;
  name: string;
  type: 'growth' | 'trend' | 'risk' | 'opportunity';
  accuracy: number;
  lastTrained: number;
  predictions: any[];
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  conditions: Record<string, any>;
  actions: string[];
  enabled: boolean;
  lastExecuted?: number;
}

interface IntelligenceInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  data: any;
  recommendations: string[];
  timestamp: number;
}

class IntelligenceHubService {
  private models: Map<string, PredictiveModel> = new Map();
  private automationRules: AutomationRule[] = [];
  private insights: IntelligenceInsight[] = [];
  private isAnalyzing = false;

  constructor() {
    this.initializeModels();
    this.startAutomatedAnalysis();
  }

  private initializeModels(): void {
    const defaultModels: PredictiveModel[] = [
      {
        id: 'business_growth',
        name: 'Business Growth Predictor',
        type: 'growth',
        accuracy: 0.85,
        lastTrained: Date.now() - 86400000, // 24 hours ago
        predictions: []
      },
      {
        id: 'market_trends',
        name: 'Market Trend Analyzer',
        type: 'trend',
        accuracy: 0.78,
        lastTrained: Date.now() - 43200000, // 12 hours ago
        predictions: []
      },
      {
        id: 'risk_assessment',
        name: 'Risk Assessment Engine',
        type: 'risk',
        accuracy: 0.92,
        lastTrained: Date.now() - 21600000, // 6 hours ago
        predictions: []
      },
      {
        id: 'opportunity_finder',
        name: 'Opportunity Detector',
        type: 'opportunity',
        accuracy: 0.73,
        lastTrained: Date.now() - 10800000, // 3 hours ago
        predictions: []
      }
    ];

    defaultModels.forEach(model => {
      this.models.set(model.id, model);
    });

    logger.info('Intelligence models initialized', { modelCount: defaultModels.length }, 'IntelligenceHub');
  }

  private startAutomatedAnalysis(): void {
    // Run analysis every 5 minutes
    setInterval(() => {
      this.runAutomatedAnalysis();
    }, 5 * 60 * 1000);

    // Initial analysis
    setTimeout(() => this.runAutomatedAnalysis(), 1000);
  }

  private async runAutomatedAnalysis(): Promise<void> {
    if (this.isAnalyzing) return;

    this.isAnalyzing = true;
    logger.debug('Starting automated intelligence analysis', {}, 'IntelligenceHub');

    try {
      await Promise.all([
        this.analyzeMarketTrends(),
        this.detectAnomalies(),
        this.identifyOpportunities(),
        this.assessRisks()
      ]);

      this.executeAutomationRules();
    } catch (error) {
      logger.error('Error in automated analysis', { error }, 'IntelligenceHub');
    } finally {
      this.isAnalyzing = false;
    }
  }

  private async analyzeMarketTrends(): Promise<void> {
    const businessState = businessStateManager.getState();
    const analyticsOverview = enterpriseAnalyticsService.getAnalyticsOverview();

    // Simulate trend analysis
    const trends = [
      {
        category: 'AI/ML Services',
        growth: Math.random() * 0.3 + 0.1, // 10-40% growth
        confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
      },
      {
        category: 'Healthcare Tech',
        growth: Math.random() * 0.25 + 0.05, // 5-30% growth
        confidence: Math.random() * 0.25 + 0.75
      },
      {
        category: 'Fintech',
        growth: Math.random() * 0.35 + 0.0, // 0-35% growth
        confidence: Math.random() * 0.2 + 0.8
      }
    ];

    trends.forEach(trend => {
      if (trend.growth > 0.2 && trend.confidence > 0.8) {
        this.addInsight({
          id: `trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'trend',
          severity: trend.growth > 0.3 ? 'high' : 'medium',
          title: `Strong Growth in ${trend.category}`,
          description: `${trend.category} sector showing ${(trend.growth * 100).toFixed(1)}% growth with high confidence`,
          confidence: trend.confidence,
          data: trend,
          recommendations: [
            `Consider expanding into ${trend.category} market`,
            'Identify key players and partnership opportunities',
            'Monitor competitive landscape closely'
          ],
          timestamp: Date.now()
        });
      }
    });
  }

  private async detectAnomalies(): Promise<void> {
    const analyticsOverview = enterpriseAnalyticsService.getAnalyticsOverview();
    
    // Simulate anomaly detection
    const anomalies = [
      {
        metric: 'User Engagement',
        expected: 100,
        actual: 75,
        deviation: -0.25
      },
      {
        metric: 'API Response Time',
        expected: 150,
        actual: 300,
        deviation: 1.0
      }
    ];

    anomalies.forEach(anomaly => {
      if (Math.abs(anomaly.deviation) > 0.2) {
        this.addInsight({
          id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'anomaly',
          severity: Math.abs(anomaly.deviation) > 0.5 ? 'high' : 'medium',
          title: `Anomaly Detected: ${anomaly.metric}`,
          description: `${anomaly.metric} is ${anomaly.deviation > 0 ? 'above' : 'below'} expected values by ${Math.abs(anomaly.deviation * 100).toFixed(1)}%`,
          confidence: 0.85,
          data: anomaly,
          recommendations: [
            'Investigate root cause of deviation',
            'Review recent changes or updates',
            'Monitor closely for continued anomalies'
          ],
          timestamp: Date.now()
        });
      }
    });
  }

  private async identifyOpportunities(): Promise<void> {
    const businessState = businessStateManager.getState();
    
    // Simulate opportunity identification
    const opportunities = [
      {
        type: 'Market Gap',
        description: 'Underserved AI consulting market in Birmingham',
        potential: 0.8,
        difficulty: 0.4
      },
      {
        type: 'Partnership',
        description: 'Cross-sector collaboration opportunity',
        potential: 0.7,
        difficulty: 0.3
      }
    ];

    opportunities.forEach(opportunity => {
      if (opportunity.potential > 0.6) {
        this.addInsight({
          id: `opportunity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'opportunity',
          severity: opportunity.potential > 0.8 ? 'high' : 'medium',
          title: `Business Opportunity: ${opportunity.type}`,
          description: opportunity.description,
          confidence: opportunity.potential,
          data: opportunity,
          recommendations: [
            'Conduct detailed market research',
            'Identify potential partners or competitors',
            'Develop go-to-market strategy'
          ],
          timestamp: Date.now()
        });
      }
    });
  }

  private async assessRisks(): Promise<void> {
    // Simulate risk assessment
    const risks = [
      {
        type: 'Market Risk',
        description: 'Increased competition in core markets',
        probability: 0.6,
        impact: 0.7
      },
      {
        type: 'Technology Risk',
        description: 'Rapid technological changes',
        probability: 0.8,
        impact: 0.5
      }
    ];

    risks.forEach(risk => {
      const riskScore = risk.probability * risk.impact;
      if (riskScore > 0.4) {
        this.addInsight({
          id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'risk',
          severity: riskScore > 0.6 ? 'high' : 'medium',
          title: `Risk Alert: ${risk.type}`,
          description: risk.description,
          confidence: risk.probability,
          data: { ...risk, riskScore },
          recommendations: [
            'Develop mitigation strategies',
            'Monitor risk indicators closely',
            'Create contingency plans'
          ],
          timestamp: Date.now()
        });
      }
    });
  }

  private executeAutomationRules(): void {
    this.automationRules.filter(rule => rule.enabled).forEach(rule => {
      // Simulate rule execution
      if (this.shouldExecuteRule(rule)) {
        logger.info('Executing automation rule', { ruleId: rule.id, ruleName: rule.name }, 'IntelligenceHub');
        rule.lastExecuted = Date.now();
      }
    });
  }

  private shouldExecuteRule(rule: AutomationRule): boolean {
    // Simple time-based execution for demo
    const timeSinceLastExecution = rule.lastExecuted ? Date.now() - rule.lastExecuted : Infinity;
    return timeSinceLastExecution > 3600000; // Execute max once per hour
  }

  private addInsight(insight: IntelligenceInsight): void {
    this.insights.unshift(insight);
    
    // Keep only last 50 insights
    if (this.insights.length > 50) {
      this.insights = this.insights.slice(0, 50);
    }

    logger.debug('New insight generated', { type: insight.type, severity: insight.severity }, 'IntelligenceHub');
  }

  // Public API
  getModels(): PredictiveModel[] {
    return Array.from(this.models.values());
  }

  getModel(id: string): PredictiveModel | undefined {
    return this.models.get(id);
  }

  getInsights(type?: IntelligenceInsight['type']): IntelligenceInsight[] {
    if (type) {
      return this.insights.filter(insight => insight.type === type);
    }
    return [...this.insights];
  }

  getAutomationRules(): AutomationRule[] {
    return [...this.automationRules];
  }

  addAutomationRule(rule: Omit<AutomationRule, 'id'>): AutomationRule {
    const newRule: AutomationRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.automationRules.push(newRule);
    return newRule;
  }

  updateAutomationRule(id: string, updates: Partial<AutomationRule>): boolean {
    const index = this.automationRules.findIndex(rule => rule.id === id);
    if (index !== -1) {
      this.automationRules[index] = { ...this.automationRules[index], ...updates };
      return true;
    }
    return false;
  }

  deleteAutomationRule(id: string): boolean {
    const index = this.automationRules.findIndex(rule => rule.id === id);
    if (index !== -1) {
      this.automationRules.splice(index, 1);
      return true;
    }
    return false;
  }

  generatePrediction(modelId: string, data: any): any {
    const model = this.models.get(modelId);
    if (!model) return null;

    // Simulate prediction generation
    const prediction = {
      id: `prediction_${Date.now()}`,
      modelId,
      confidence: model.accuracy * (0.8 + Math.random() * 0.2),
      result: this.generateMockPrediction(model.type),
      timestamp: Date.now(),
      inputData: data
    };

    model.predictions.unshift(prediction);
    if (model.predictions.length > 10) {
      model.predictions = model.predictions.slice(0, 10);
    }

    return prediction;
  }

  private generateMockPrediction(type: PredictiveModel['type']): any {
    switch (type) {
      case 'growth':
        return {
          growthRate: Math.random() * 0.5 + 0.1,
          timeframe: '6 months',
          factors: ['market expansion', 'technology adoption', 'competitive advantage']
        };
      case 'trend':
        return {
          direction: Math.random() > 0.5 ? 'upward' : 'stable',
          strength: Math.random() * 0.8 + 0.2,
          duration: Math.floor(Math.random() * 12) + 3 + ' months'
        };
      case 'risk':
        return {
          riskLevel: Math.random() * 0.7 + 0.1,
          category: ['market', 'operational', 'financial', 'regulatory'][Math.floor(Math.random() * 4)],
          mitigation: 'diversification strategy recommended'
        };
      case 'opportunity':
        return {
          potential: Math.random() * 0.8 + 0.2,
          timeline: Math.floor(Math.random() * 6) + 1 + ' months',
          investment: '$' + (Math.floor(Math.random() * 100) + 10) + 'K'
        };
      default:
        return { value: Math.random() };
    }
  }

  getAnalysisSummary() {
    const insightsByType = this.insights.reduce((acc, insight) => {
      acc[insight.type] = (acc[insight.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const highSeverityInsights = this.insights.filter(i => i.severity === 'high' || i.severity === 'critical').length;
    const activeModels = Array.from(this.models.values()).length;
    const activeRules = this.automationRules.filter(r => r.enabled).length;

    return {
      totalInsights: this.insights.length,
      insightsByType,
      highSeverityInsights,
      activeModels,
      activeAutomationRules: activeRules,
      isAnalyzing: this.isAnalyzing,
      lastAnalysis: this.insights.length > 0 ? this.insights[0].timestamp : null
    };
  }
}

export const intelligenceHubService = new IntelligenceHubService();
export default intelligenceHubService;
