
import { supabase } from '@/integrations/supabase/client';
import { marketDataService } from '@/services/marketDataService';

export interface AnalyticsMetrics {
  totalBusinesses: number;
  verifiedBusinesses: number;
  categoriesCount: number;
  averageRating: number;
  growthRate: number;
  activeUsers: number;
}

export interface CategoryInsight {
  category: string;
  businessCount: number;
  averageRating: number;
  growthPercentage: number;
  topBusiness: string;
}

export interface LocationInsight {
  location: string;
  businessCount: number;
  categories: string[];
  averageEmployees: number;
}

export interface TrendData {
  period: string;
  value: number;
  change: number;
}

export class AnalyticsService {
  async getOverviewMetrics(): Promise<AnalyticsMetrics> {
    try {
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('*');

      if (error) throw error;

      const totalBusinesses = businesses?.length || 0;
      const verifiedBusinesses = businesses?.filter(b => b.verified).length || 0;
      const categories = [...new Set(businesses?.map(b => b.category).filter(Boolean))];
      const averageRating = businesses?.reduce((acc, b) => acc + (b.rating || 0), 0) / totalBusinesses || 0;

      // Simulate growth rate calculation
      const growthRate = Math.round((Math.random() * 20 + 5) * 100) / 100;

      // Get active users from analytics events
      const { data: analyticsData } = await supabase
        .from('analytics_events')
        .select('user_id')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const activeUsers = [...new Set(analyticsData?.map(a => a.user_id))].length;

      return {
        totalBusinesses,
        verifiedBusinesses,
        categoriesCount: categories.length,
        averageRating: Math.round(averageRating * 10) / 10,
        growthRate,
        activeUsers
      };
    } catch (error) {
      console.error('Analytics metrics error:', error);
      throw error;
    }
  }

  async getCategoryInsights(): Promise<CategoryInsight[]> {
    try {
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('*');

      if (error) throw error;

      const categoryMap = new Map<string, any[]>();
      
      businesses?.forEach(business => {
        if (business.category) {
          if (!categoryMap.has(business.category)) {
            categoryMap.set(business.category, []);
          }
          categoryMap.get(business.category)!.push(business);
        }
      });

      const insights: CategoryInsight[] = [];

      categoryMap.forEach((businessList, category) => {
        const businessCount = businessList.length;
        const averageRating = businessList.reduce((acc, b) => acc + (b.rating || 0), 0) / businessCount;
        const topBusiness = businessList.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.businessname || 'N/A';
        const growthPercentage = Math.round((Math.random() * 30 + 5) * 100) / 100;

        insights.push({
          category,
          businessCount,
          averageRating: Math.round(averageRating * 10) / 10,
          growthPercentage,
          topBusiness
        });
      });

      return insights.sort((a, b) => b.businessCount - a.businessCount);
    } catch (error) {
      console.error('Category insights error:', error);
      throw error;
    }
  }

  async getLocationInsights(): Promise<LocationInsight[]> {
    try {
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('*');

      if (error) throw error;

      const locationMap = new Map<string, any[]>();
      
      businesses?.forEach(business => {
        if (business.location) {
          const location = business.location.split(',')[0].trim(); // Get city part
          if (!locationMap.has(location)) {
            locationMap.set(location, []);
          }
          locationMap.get(location)!.push(business);
        }
      });

      const insights: LocationInsight[] = [];

      locationMap.forEach((businessList, location) => {
        const businessCount = businessList.length;
        const categories = [...new Set(businessList.map(b => b.category).filter(Boolean))];
        const averageEmployees = businessList.reduce((acc, b) => acc + (b.employees_count || 0), 0) / businessCount;

        insights.push({
          location,
          businessCount,
          categories,
          averageEmployees: Math.round(averageEmployees)
        });
      });

      return insights.sort((a, b) => b.businessCount - a.businessCount).slice(0, 10);
    } catch (error) {
      console.error('Location insights error:', error);
      throw error;
    }
  }

  async getTrendData(metric: string, period: 'week' | 'month' | 'quarter' = 'month'): Promise<TrendData[]> {
    try {
      // Simulate trend data generation
      const periods = period === 'week' ? 7 : period === 'month' ? 30 : 90;
      const data: TrendData[] = [];

      for (let i = periods; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const baseValue = 100 + Math.random() * 50;
        const trend = i === 0 ? 0 : Math.random() * 10 - 5;
        
        data.push({
          period: date.toISOString().split('T')[0],
          value: Math.round(baseValue + trend),
          change: Math.round(trend * 100) / 100
        });
      }

      return data;
    } catch (error) {
      console.error('Trend data error:', error);
      throw error;
    }
  }

  async trackEvent(eventType: string, metadata?: any, businessId?: number) {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_type: eventType,
          metadata,
          business_id: businessId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Event tracking error:', error);
    }
  }

  async getMarketIntelligence(): Promise<any> {
    try {
      // Integrate with market data service for external insights
      const marketData = await marketDataService.getMarketTrends();
      const categoryInsights = await this.getCategoryInsights();
      
      return {
        marketTrends: marketData,
        categoryGrowth: categoryInsights,
        recommendations: this.generateRecommendations(categoryInsights)
      };
    } catch (error) {
      console.error('Market intelligence error:', error);
      return { marketTrends: [], categoryGrowth: [], recommendations: [] };
    }
  }

  private generateRecommendations(categoryInsights: CategoryInsight[]): string[] {
    const recommendations = [];
    
    const fastestGrowing = categoryInsights.sort((a, b) => b.growthPercentage - a.growthPercentage)[0];
    if (fastestGrowing) {
      recommendations.push(`${fastestGrowing.category} is showing strong growth (${fastestGrowing.growthPercentage}%). Consider focusing on this sector.`);
    }

    const highRated = categoryInsights.filter(c => c.averageRating >= 4.5);
    if (highRated.length > 0) {
      recommendations.push(`High-quality sectors: ${highRated.map(c => c.category).join(', ')} maintain excellent ratings.`);
    }

    const underserved = categoryInsights.filter(c => c.businessCount < 5);
    if (underserved.length > 0) {
      recommendations.push(`Potential opportunities in underserved categories: ${underserved.map(c => c.category).join(', ')}.`);
    }

    return recommendations;
  }
}

export const analyticsService = new AnalyticsService();
