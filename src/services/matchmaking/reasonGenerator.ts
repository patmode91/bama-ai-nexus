
import { MatchmakingRequest } from './types';

export class ReasonGenerator {
  generateMatchReasons(searchResult: any, request: MatchmakingRequest): string[] {
    const reasons = [...searchResult.matchingReasons];
    const { business } = searchResult;
    
    // Add matchmaking-specific reasons
    if (business.verified) {
      reasons.push('Verified company profile');
    }
    
    if (business.rating && business.rating >= 4.0) {
      reasons.push(`High customer rating (${business.rating}/5)`);
    }
    
    if (request.requirements?.location && 
        business.location?.toLowerCase().includes(request.requirements.location.toLowerCase())) {
      reasons.push('Located in your preferred area');
    }
    
    if (business.employees_count) {
      if (business.employees_count >= 10 && business.employees_count <= 200) {
        reasons.push('Right-sized team for personalized service');
      } else if (business.employees_count > 200) {
        reasons.push('Large, established company with extensive resources');
      }
    }
    
    return reasons.slice(0, 4); // Limit to top 4 reasons
  }

  assessConfidence(score: number, searchResult: any): 'high' | 'medium' | 'low' {
    const { business } = searchResult;
    
    // High confidence criteria
    if (score >= 70 && business.verified && business.rating >= 4.0) {
      return 'high';
    }
    
    // Medium confidence criteria
    if (score >= 50 || (score >= 40 && business.verified)) {
      return 'medium';
    }
    
    return 'low';
  }

  generateRecommendations(searchResult: any, request: MatchmakingRequest): string[] {
    const recommendations: string[] = [];
    const { business } = searchResult;
    
    switch (request.type) {
      case 'b2b':
        recommendations.push("Schedule a consultation to discuss your specific requirements");
        if (business.website) {
          recommendations.push("Review their portfolio and case studies");
        }
        recommendations.push("Request a detailed project proposal and timeline");
        break;
        
      case 'candidate-to-job':
        recommendations.push("Check their current job openings");
        recommendations.push("Connect with their HR team or hiring manager");
        recommendations.push("Research the company culture and benefits");
        break;
        
      case 'startup-to-investor':
        recommendations.push("Prepare a compelling pitch deck");
        recommendations.push("Research their investment criteria and portfolio");
        recommendations.push("Network through mutual connections if possible");
        break;
    }
    
    return recommendations.slice(0, 3);
  }
}

export const reasonGenerator = new ReasonGenerator();
