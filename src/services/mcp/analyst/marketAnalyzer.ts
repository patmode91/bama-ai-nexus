
import { supabase } from '@/integrations/supabase/client';
import { MCPContext } from '../MCPContextManager';
import { MarketInsight } from './types';

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
      marketTrend: this.assessMarketTrend(sector, businesses),
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

  private assessMarketTrend(sector: string, businesses: any[]): 'growing' | 'stable' | 'declining' {
    const aiRelatedSectors = ['technology', 'healthcare', 'finance', 'legal'];
    
    if (aiRelatedSectors.some(s => sector.toLowerCase().includes(s))) {
      return 'growing';
    }
    
    return businesses && businesses.length > 10 ? 'stable' : 'growing';
  }

  private assessDemand(sector: string, context: MCPContext): 'high' | 'medium' | 'low' {
    const services = context.entities.services || [];
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
}
