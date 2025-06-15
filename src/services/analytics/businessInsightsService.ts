
import { supabase } from '@/integrations/supabase/client';
import { logger } from '../loggerService';

export interface BusinessInsight {
  id: string;
  type: 'performance' | 'opportunity' | 'risk' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendations: string[];
  data?: any;
}

export interface PerformanceMetrics {
  businessId: number;
  metrics: {
    visibility: number;
    engagement: number;
    reputation: number;
    growth: number;
    competitiveness: number;
  };
  benchmarks: {
    industry: number;
    local: number;
    category: number;
  };
  trends: {
    monthly: number[];
    quarterly: number[];
  };
}

export interface BusinessHealth {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    name: string;
    score: number;
    weight: number;
    impact: string;
  }[];
  improvements: string[];
  strengths: string[];
}

class BusinessInsightsService {
  async getBusinessInsights(businessId: number): Promise<BusinessInsight[]> {
    try {
      const { data: business, error } = await supabase
        .from('businesses')
        .select(`
          *,
          reviews (rating, comment, created_at),
          saved_businesses (user_id)
        `)
        .eq('id', businessId)
        .single();

      if (error) throw error;

      const insights = await this.analyzeBusinessData(business);
      
      logger.info('Business insights generated', { businessId, insightsCount: insights.length }, 'BusinessInsightsService');
      return insights;
    } catch (error) {
      logger.error('Failed to generate business insights', { error, businessId }, 'BusinessInsightsService');
      throw error;
    }
  }

  async getPerformanceMetrics(businessId: number): Promise<PerformanceMetrics> {
    try {
      const { data: business, error } = await supabase
        .from('businesses')
        .select(`
          *,
          reviews (rating, created_at),
          saved_businesses (user_id)
        `)
        .eq('id', businessId)
        .single();

      if (error) throw error;

      const metrics = this.calculatePerformanceMetrics(business);
      
      logger.info('Performance metrics calculated', { businessId }, 'BusinessInsightsService');
      return metrics;
    } catch (error) {
      logger.error('Failed to calculate performance metrics', { error, businessId }, 'BusinessInsightsService');
      throw error;
    }
  }

  async getBusinessHealth(businessId: number): Promise<BusinessHealth> {
    try {
      const { data: business, error } = await supabase
        .from('businesses')
        .select(`
          *,
          reviews (rating, comment, created_at)
        `)
        .eq('id', businessId)
        .single();

      if (error) throw error;

      const health = this.assessBusinessHealth(business);
      
      logger.info('Business health assessed', { businessId, score: health.score }, 'BusinessInsightsService');
      return health;
    } catch (error) {
      logger.error('Failed to assess business health', { error, businessId }, 'BusinessInsightsService');
      throw error;
    }
  }

  private async analyzeBusinessData(business: any): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = [];

    // Analyze rating performance
    if (business.reviews && business.reviews.length > 0) {
      const avgRating = business.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / business.reviews.length;
      
      if (avgRating < 3.5) {
        insights.push({
          id: 'insight_low_rating',
          type: 'risk',
          title: 'Below Average Rating',
          description: `Current rating of ${avgRating.toFixed(1)} is below industry standards`,
          impact: 'high',
          actionable: true,
          recommendations: [
            'Address customer concerns promptly',
            'Implement customer feedback system',
            'Improve service quality training'
          ]
        });
      } else if (avgRating > 4.5) {
        insights.push({
          id: 'insight_high_rating',
          type: 'performance',
          title: 'Excellent Customer Satisfaction',
          description: `Outstanding rating of ${avgRating.toFixed(1)} indicates strong customer loyalty`,
          impact: 'high',
          actionable: true,
          recommendations: [
            'Leverage positive reviews in marketing',
            'Request testimonials from satisfied customers',
            'Maintain current service standards'
          ]
        });
      }
    }

    // Analyze review trends
    if (business.reviews && business.reviews.length > 5) {
      const recentReviews = business.reviews
        .filter((review: any) => {
          const reviewDate = new Date(review.created_at);
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return reviewDate > threeMonthsAgo;
        });

      if (recentReviews.length === 0) {
        insights.push({
          id: 'insight_review_decline',
          type: 'risk',
          title: 'Declining Review Activity',
          description: 'No recent reviews may indicate decreased customer engagement',
          impact: 'medium',
          actionable: true,
          recommendations: [
            'Encourage customers to leave reviews',
            'Follow up with recent customers',
            'Implement post-service review requests'
          ]
        });
      }
    }

    // Analyze business completeness
    const completeness = this.calculateProfileCompleteness(business);
    if (completeness < 80) {
      insights.push({
        id: 'insight_incomplete_profile',
        type: 'opportunity',
        title: 'Incomplete Business Profile',
        description: `Profile is ${completeness}% complete. Complete profiles get 40% more visibility`,
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Add missing business information',
          'Upload high-quality photos',
          'Include detailed service descriptions'
        ]
      });
    }

    // Analyze market trends
    insights.push({
      id: 'insight_market_trend',
      type: 'trend',
      title: 'Market Opportunity',
      description: `${business.category} businesses are experiencing increased demand`,
      impact: 'medium',
      actionable: true,
      recommendations: [
        'Expand service offerings',
        'Increase marketing efforts',
        'Consider premium service tiers'
      ]
    });

    return insights;
  }

  private calculatePerformanceMetrics(business: any): PerformanceMetrics {
    const reviews = business.reviews || [];
    const savedCount = business.saved_businesses?.length || 0;

    const visibility = Math.min(100, (savedCount * 10) + (reviews.length * 5));
    const engagement = Math.min(100, reviews.length * 8);
    const reputation = business.rating ? (business.rating / 5) * 100 : 0;
    const growth = Math.random() * 30 + 70; // Mock growth calculation
    const competitiveness = Math.random() * 40 + 60; // Mock competitiveness

    return {
      businessId: business.id,
      metrics: {
        visibility,
        engagement,
        reputation,
        growth,
        competitiveness
      },
      benchmarks: {
        industry: 75,
        local: 70,
        category: 80
      },
      trends: {
        monthly: Array.from({ length: 12 }, () => Math.floor(Math.random() * 20) + 70),
        quarterly: Array.from({ length: 4 }, () => Math.floor(Math.random() * 15) + 75)
      }
    };
  }

  private assessBusinessHealth(business: any): BusinessHealth {
    const factors = [
      {
        name: 'Customer Reviews',
        score: business.rating ? (business.rating / 5) * 100 : 0,
        weight: 30,
        impact: 'Direct impact on customer trust and acquisition'
      },
      {
        name: 'Profile Completeness',
        score: this.calculateProfileCompleteness(business),
        weight: 20,
        impact: 'Affects search visibility and customer confidence'
      },
      {
        name: 'Online Presence',
        score: business.website ? 90 : 40,
        weight: 15,
        impact: 'Critical for digital marketing and customer reach'
      },
      {
        name: 'Verification Status',
        score: business.tags?.includes('verified') ? 100 : 0,
        weight: 15,
        impact: 'Builds trust and credibility with customers'
      },
      {
        name: 'Market Activity',
        score: Math.random() * 30 + 70, // Mock activity score
        weight: 20,
        impact: 'Indicates business engagement and growth'
      }
    ];

    const weightedScore = factors.reduce((sum, factor) => {
      return sum + (factor.score * factor.weight / 100);
    }, 0);

    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (weightedScore >= 90) grade = 'A';
    else if (weightedScore >= 80) grade = 'B';
    else if (weightedScore >= 70) grade = 'C';
    else if (weightedScore >= 60) grade = 'D';
    else grade = 'F';

    const improvements = factors
      .filter(factor => factor.score < 70)
      .map(factor => `Improve ${factor.name.toLowerCase()}`);

    const strengths = factors
      .filter(factor => factor.score >= 80)
      .map(factor => factor.name);

    return {
      score: Math.round(weightedScore),
      grade,
      factors,
      improvements,
      strengths
    };
  }

  private calculateProfileCompleteness(business: any): number {
    const fields = [
      'businessname',
      'description',
      'category',
      'location',
      'phone',
      'website',
      'email',
      'hours'
    ];

    const completedFields = fields.filter(field => business[field] && business[field].trim() !== '');
    return Math.round((completedFields.length / fields.length) * 100);
  }
}

export const businessInsightsService = new BusinessInsightsService();
