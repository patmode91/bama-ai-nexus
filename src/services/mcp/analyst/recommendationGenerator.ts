
import { MCPContext } from '../MCPContextManager';
import { MarketInsight } from './types';

export class RecommendationGenerator {
  generateRecommendations(insights: MarketInsight, context: MCPContext): string[] {
    const recommendations: string[] = [];
    
    if (insights.demandLevel === 'high') {
      recommendations.push('Market conditions are favorable for this type of project');
    }
    
    if (insights.competitorCount < 5) {
      recommendations.push('Limited competition provides opportunity for premium pricing');
    } else if (insights.competitorCount > 20) {
      recommendations.push('Highly competitive market - focus on differentiation');
    }
    
    if (insights.marketTrend === 'growing') {
      recommendations.push('Consider early engagement to secure preferred vendors');
    }
    
    recommendations.push(`Budget ${insights.averageProjectCost.min.toLocaleString()} - ${insights.averageProjectCost.max.toLocaleString()} for optimal results`);
    
    return recommendations;
  }

  identifyRiskFactors(insights: MarketInsight, context: MCPContext): string[] {
    const risks: string[] = [];
    
    if (insights.competitorCount > 25) {
      risks.push('High market saturation may drive up costs');
    }
    
    if (insights.demandLevel === 'high' && insights.competitorCount < 10) {
      risks.push('Limited vendor availability may extend timelines');
    }
    
    if (!context.budget || 
        !('min' in context.budget) || 
        context.budget.min < insights.averageProjectCost.min) {
      risks.push('Budget may be insufficient for market rates');
    }
    
    return risks;
  }

  identifyOpportunities(insights: MarketInsight, context: MCPContext): string[] {
    const opportunities: string[] = [];
    
    if (insights.marketTrend === 'growing') {
      opportunities.push('Strong growth trajectory in this sector');
    }
    
    if (context.location?.toLowerCase().includes('alabama')) {
      opportunities.push('Access to state incentives and support programs');
    }
    
    if (insights.keyFactors.includes('Research university partnerships')) {
      opportunities.push('Potential collaboration with local universities');
    }
    
    return opportunities;
  }
}
