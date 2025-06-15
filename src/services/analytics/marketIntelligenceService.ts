
import { supabase } from '@/integrations/supabase/client';
import { logger } from '../loggerService';

export interface MarketTrend {
  id: string;
  category: string;
  trend: 'rising' | 'stable' | 'declining';
  change: number;
  period: string;
  data: number[];
  insights: string[];
}

export interface CompetitorAnalysis {
  businessId: number;
  competitors: {
    id: number;
    name: string;
    rating: number;
    marketShare: number;
    strengths: string[];
    weaknesses: string[];
  }[];
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  opportunities: string[];
  threats: string[];
}

export interface MarketOpportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  potential: 'high' | 'medium' | 'low';
  investmentRequired: string;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
}

class MarketIntelligenceService {
  async getMarketTrends(category?: string): Promise<MarketTrend[]> {
    try {
      // In a real implementation, this would fetch from external APIs
      // For now, we'll generate mock data based on business data
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('category, rating, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const trends = this.analyzeMarketTrends(businesses || [], category);
      
      logger.info('Market trends analyzed', { category, trendsCount: trends.length }, 'MarketIntelligenceService');
      return trends;
    } catch (error) {
      logger.error('Failed to get market trends', { error, category }, 'MarketIntelligenceService');
      throw error;
    }
  }

  async getCompetitorAnalysis(businessId: number): Promise<CompetitorAnalysis> {
    try {
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (businessError) throw businessError;

      const { data: competitors, error: competitorsError } = await supabase
        .from('businesses')
        .select('*')
        .eq('category', business.category)
        .neq('id', businessId)
        .order('rating', { ascending: false })
        .limit(10);

      if (competitorsError) throw competitorsError;

      const analysis = this.analyzeCompetitors(business, competitors || []);
      
      logger.info('Competitor analysis completed', { businessId, competitorsCount: competitors?.length }, 'MarketIntelligenceService');
      return analysis;
    } catch (error) {
      logger.error('Failed to analyze competitors', { error, businessId }, 'MarketIntelligenceService');
      throw error;
    }
  }

  async getMarketOpportunities(category?: string): Promise<MarketOpportunity[]> {
    try {
      const opportunities = this.generateMarketOpportunities(category);
      
      logger.info('Market opportunities generated', { category, count: opportunities.length }, 'MarketIntelligenceService');
      return opportunities;
    } catch (error) {
      logger.error('Failed to get market opportunities', { error, category }, 'MarketIntelligenceService');
      throw error;
    }
  }

  private analyzeMarketTrends(businesses: any[], category?: string): MarketTrend[] {
    const categoryData = businesses.filter(b => !category || b.category === category);
    const categories = [...new Set(businesses.map(b => b.category))];

    return categories.map(cat => {
      const catBusinesses = businesses.filter(b => b.category === cat);
      const recentGrowth = this.calculateGrowthRate(catBusinesses);
      
      return {
        id: `trend_${cat.toLowerCase().replace(/\s+/g, '_')}`,
        category: cat,
        trend: recentGrowth > 10 ? 'rising' : recentGrowth < -5 ? 'declining' : 'stable',
        change: recentGrowth,
        period: 'Last 6 months',
        data: this.generateTrendData(),
        insights: this.generateTrendInsights(cat, recentGrowth)
      };
    });
  }

  private analyzeCompetitors(business: any, competitors: any[]): CompetitorAnalysis {
    const competitorAnalysis = competitors.map(comp => ({
      id: comp.id,
      name: comp.businessname,
      rating: comp.rating || 0,
      marketShare: Math.random() * 30 + 5, // Mock market share
      strengths: this.generateStrengths(comp),
      weaknesses: this.generateWeaknesses(comp)
    }));

    const avgRating = competitors.reduce((sum, comp) => sum + (comp.rating || 0), 0) / competitors.length;
    const businessRating = business.rating || 0;

    let marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
    if (businessRating > avgRating + 0.5) marketPosition = 'leader';
    else if (businessRating > avgRating) marketPosition = 'challenger';
    else if (businessRating > avgRating - 0.5) marketPosition = 'follower';
    else marketPosition = 'niche';

    return {
      businessId: business.id,
      competitors: competitorAnalysis,
      marketPosition,
      opportunities: this.generateOpportunities(business, competitors),
      threats: this.generateThreats(business, competitors)
    };
  }

  private calculateGrowthRate(businesses: any[]): number {
    // Simulate growth rate calculation based on business creation dates
    const recent = businesses.filter(b => {
      const createdAt = new Date(b.created_at);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return createdAt > sixMonthsAgo;
    });

    return (recent.length / businesses.length) * 100 - 50; // Normalize to percentage
  }

  private generateTrendData(): number[] {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 100) + 50);
  }

  private generateTrendInsights(category: string, growth: number): string[] {
    const insights = [
      `${category} businesses showing ${growth > 0 ? 'positive' : 'negative'} growth trends`,
      `Market demand for ${category} services ${growth > 10 ? 'increasing rapidly' : growth > 0 ? 'growing steadily' : 'stabilizing'}`,
      `Competition level: ${growth > 15 ? 'High' : growth > 5 ? 'Medium' : 'Low'}`
    ];

    if (growth > 20) {
      insights.push('Consider entering this high-growth market segment');
    } else if (growth < -10) {
      insights.push('Market consolidation may be occurring');
    }

    return insights;
  }

  private generateStrengths(competitor: any): string[] {
    const strengths = ['Strong brand presence', 'High customer satisfaction', 'Competitive pricing'];
    if (competitor.rating > 4.0) strengths.push('Excellent reviews');
    if (competitor.tags?.includes('verified')) strengths.push('Verified business');
    return strengths.slice(0, 3);
  }

  private generateWeaknesses(competitor: any): string[] {
    const weaknesses = ['Limited online presence', 'Higher pricing', 'Limited service area'];
    if (competitor.rating < 3.5) weaknesses.push('Poor customer reviews');
    return weaknesses.slice(0, 2);
  }

  private generateOpportunities(business: any, competitors: any[]): string[] {
    return [
      'Expand digital marketing efforts',
      'Introduce premium service offerings',
      'Target underserved market segments',
      'Develop strategic partnerships'
    ];
  }

  private generateThreats(business: any, competitors: any[]): string[] {
    return [
      'Increasing competition in the market',
      'Economic downturn affecting demand',
      'New market entrants with lower pricing',
      'Changing consumer preferences'
    ];
  }

  private generateMarketOpportunities(category?: string): MarketOpportunity[] {
    const opportunities = [
      {
        id: 'opp_digital_transformation',
        title: 'Digital Transformation Services',
        description: 'Growing demand for businesses to digitize their operations',
        category: 'Technology',
        potential: 'high' as const,
        investmentRequired: '$50K - $200K',
        timeframe: '6-12 months',
        riskLevel: 'medium' as const
      },
      {
        id: 'opp_sustainable_solutions',
        title: 'Sustainable Business Solutions',
        description: 'Eco-friendly alternatives gaining market traction',
        category: 'Environmental',
        potential: 'high' as const,
        investmentRequired: '$25K - $100K',
        timeframe: '3-9 months',
        riskLevel: 'low' as const
      },
      {
        id: 'opp_remote_services',
        title: 'Remote Service Delivery',
        description: 'Virtual and remote service offerings expanding rapidly',
        category: 'Service',
        potential: 'medium' as const,
        investmentRequired: '$10K - $50K',
        timeframe: '2-6 months',
        riskLevel: 'low' as const
      }
    ];

    return category ? opportunities.filter(opp => opp.category === category) : opportunities;
  }
}

export const marketIntelligenceService = new MarketIntelligenceService();
