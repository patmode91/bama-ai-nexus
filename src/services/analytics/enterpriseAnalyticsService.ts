import { businessStateManager } from '../stateManager';
import { logger } from '../loggerService';

interface MetricData {
  timestamp: number;
  value: number;
  metadata?: Record<string, any>;
}

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

interface BusinessIntelligenceReport {
  id: string;
  title: string;
  type: 'revenue' | 'engagement' | 'growth' | 'market' | 'performance';
  data: any[];
  insights: string[];
  recommendations: string[];
  generatedAt: number;
  timeRange: {
    start: number;
    end: number;
  };
}

class EnterpriseAnalyticsService {
  private metrics: Map<string, MetricData[]> = new Map();
  private events: AnalyticsEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking(): void {
    // Track page views
    window.addEventListener('popstate', () => {
      this.trackEvent('page_view', { url: window.location.href });
    });

    // Track user interactions
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.dataset.analytics) {
        this.trackEvent('element_click', {
          element: target.dataset.analytics,
          url: window.location.href
        });
      }
    });

    logger.info('Enterprise analytics tracking initialized', { sessionId: this.sessionId }, 'EnterpriseAnalytics');
  }

  trackEvent(event: string, properties: Record<string, any> = {}): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.events.push(analyticsEvent);

    // Keep only last 1000 events to prevent memory issues
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    logger.debug('Analytics event tracked', { event, properties }, 'EnterpriseAnalytics');
  }

  recordMetric(metricName: string, value: number, metadata?: Record<string, any>): void {
    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, []);
    }

    const metricData: MetricData = {
      timestamp: Date.now(),
      value,
      metadata
    };

    const metrics = this.metrics.get(metricName)!;
    metrics.push(metricData);

    // Keep only last 100 data points per metric
    if (metrics.length > 100) {
      this.metrics.set(metricName, metrics.slice(-100));
    }
  }

  generateBusinessIntelligenceReport(type: BusinessIntelligenceReport['type'], timeRange?: { start: number; end: number }): BusinessIntelligenceReport {
    const now = Date.now();
    const defaultTimeRange = {
      start: now - (30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: now
    };

    const actualTimeRange = timeRange || defaultTimeRange;

    const report: BusinessIntelligenceReport = {
      id: `report_${Date.now()}`,
      title: this.getReportTitle(type),
      type,
      data: this.generateReportData(type, actualTimeRange),
      insights: this.generateInsights(type),
      recommendations: this.generateRecommendations(type),
      generatedAt: now,
      timeRange: actualTimeRange
    };

    return report;
  }

  private getReportTitle(type: BusinessIntelligenceReport['type']): string {
    const titles = {
      revenue: 'Revenue Analysis Report',
      engagement: 'User Engagement Report',
      growth: 'Business Growth Report',
      market: 'Market Intelligence Report',
      performance: 'Platform Performance Report'
    };
    return titles[type];
  }

  private generateReportData(type: BusinessIntelligenceReport['type'], timeRange: { start: number; end: number }): any[] {
    // Mock data generation - in a real app, this would query actual data
    switch (type) {
      case 'revenue':
        return this.generateRevenueData(timeRange);
      case 'engagement':
        return this.generateEngagementData(timeRange);
      case 'growth':
        return this.generateGrowthData(timeRange);
      case 'market':
        return this.generateMarketData(timeRange);
      case 'performance':
        return this.generatePerformanceData(timeRange);
      default:
        return [];
    }
  }

  private generateRevenueData(timeRange: { start: number; end: number }): any[] {
    const days = Math.ceil((timeRange.end - timeRange.start) / (24 * 60 * 60 * 1000));
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(timeRange.start + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.random() * 10000 + 5000,
      transactions: Math.floor(Math.random() * 100) + 50,
      averageOrderValue: Math.random() * 200 + 100
    }));
  }

  private generateEngagementData(timeRange: { start: number; end: number }): any[] {
    return [
      { metric: 'Page Views', value: Math.floor(Math.random() * 10000) + 5000 },
      { metric: 'Unique Visitors', value: Math.floor(Math.random() * 2000) + 1000 },
      { metric: 'Session Duration', value: Math.floor(Math.random() * 300) + 120 },
      { metric: 'Bounce Rate', value: Math.random() * 0.4 + 0.3 },
      { metric: 'Return Visitors', value: Math.random() * 0.6 + 0.2 }
    ];
  }

  private generateGrowthData(timeRange: { start: number; end: number }): any[] {
    return [
      { period: 'Last 30 Days', newUsers: 145, growth: 12.5 },
      { period: 'Last 7 Days', newUsers: 38, growth: 8.2 },
      { period: 'Yesterday', newUsers: 7, growth: 15.3 }
    ];
  }

  private generateMarketData(timeRange: { start: number; end: number }): any[] {
    return [
      { category: 'Technology', marketShare: 0.25, growth: 0.15 },
      { category: 'Healthcare', marketShare: 0.18, growth: 0.22 },
      { category: 'Finance', marketShare: 0.15, growth: 0.08 },
      { category: 'Retail', marketShare: 0.12, growth: 0.18 },
      { category: 'Manufacturing', marketShare: 0.10, growth: 0.12 }
    ];
  }

  private generatePerformanceData(timeRange: { start: number; end: number }): any[] {
    return [
      { metric: 'API Response Time', value: 145, unit: 'ms', status: 'good' },
      { metric: 'Database Query Time', value: 32, unit: 'ms', status: 'excellent' },
      { metric: 'Page Load Time', value: 2.1, unit: 's', status: 'good' },
      { metric: 'Cache Hit Rate', value: 85, unit: '%', status: 'good' },
      { metric: 'Error Rate', value: 0.02, unit: '%', status: 'excellent' }
    ];
  }

  private generateInsights(type: BusinessIntelligenceReport['type']): string[] {
    const insights = {
      revenue: [
        'Revenue shows strong upward trend with 15% growth month-over-month',
        'Average order value has increased by 8% compared to previous period',
        'Weekend transactions account for 35% of total revenue'
      ],
      engagement: [
        'User engagement has improved by 12% with new features',
        'Mobile users show 20% higher session duration',
        'Search functionality drives 40% of user interactions'
      ],
      growth: [
        'User acquisition rate has accelerated by 18%',
        'Organic growth represents 65% of new user acquisitions',
        'User retention rate has improved to 78%'
      ],
      market: [
        'Technology sector shows highest growth potential',
        'Emerging markets represent 25% opportunity',
        'Competitive advantage in AI/ML capabilities'
      ],
      performance: [
        'System performance is within optimal ranges',
        'Database optimization reduced query time by 20%',
        'CDN implementation improved global load times'
      ]
    };

    return insights[type] || [];
  }

  private generateRecommendations(type: BusinessIntelligenceReport['type']): string[] {
    const recommendations = {
      revenue: [
        'Focus on premium features to increase average order value',
        'Implement dynamic pricing for peak demand periods',
        'Expand payment options to reduce cart abandonment'
      ],
      engagement: [
        'Optimize mobile experience to capitalize on higher engagement',
        'Implement personalized content recommendations',
        'Add gamification elements to increase session duration'
      ],
      growth: [
        'Invest in content marketing for organic growth',
        'Implement referral program to leverage existing users',
        'Expand to emerging markets with localized features'
      ],
      market: [
        'Prioritize technology sector partnerships',
        'Develop AI-powered features for competitive advantage',
        'Create market-specific solutions for better penetration'
      ],
      performance: [
        'Continue database optimization initiatives',
        'Implement additional caching layers',
        'Monitor and optimize critical user journeys'
      ]
    };

    return recommendations[type] || [];
  }

  getAnalyticsOverview() {
    return {
      totalEvents: this.events.length,
      uniqueEventTypes: new Set(this.events.map(e => e.event)).size,
      sessionId: this.sessionId,
      trackedMetrics: Array.from(this.metrics.keys()),
      lastActivity: this.events.length > 0 ? this.events[this.events.length - 1].timestamp : null
    };
  }

  exportAnalyticsData() {
    return {
      events: this.events,
      metrics: Object.fromEntries(this.metrics),
      sessionInfo: {
        sessionId: this.sessionId,
        startTime: this.events.length > 0 ? this.events[0].timestamp : Date.now(),
        endTime: Date.now()
      }
    };
  }
}

export const enterpriseAnalyticsService = new EnterpriseAnalyticsService();
export default enterpriseAnalyticsService;
