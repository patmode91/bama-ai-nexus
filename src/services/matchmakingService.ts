
import { semanticSearchService } from './semanticSearchService';

interface MatchmakingRequest {
  type: 'b2b' | 'candidate-to-job' | 'startup-to-investor';
  description: string;
  requirements?: {
    location?: string;
    budget?: string;
    timeline?: string;
    industry?: string;
    size?: string;
  };
  userProfile?: any;
}

interface MatchResult {
  business: any;
  matchScore: number;
  matchReasons: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  recommendations: string[];
}

export class MatchmakingService {
  
  async findMatches(request: MatchmakingRequest): Promise<MatchResult[]> {
    try {
      console.log('Processing matchmaking request:', request);
      
      // Use semantic search as the foundation
      const searchResults = await semanticSearchService.searchBusinesses({
        query: request.description,
        filters: {
          location: request.requirements?.location,
          verified: true // Prefer verified companies for matchmaking
        },
        limit: 50
      });
      
      // Enhanced scoring for matchmaking context
      const matchResults = searchResults.map(result => {
        const enhancedScore = this.calculateMatchScore(result, request);
        const matchReasons = this.generateMatchReasons(result, request);
        const confidence = this.assessConfidence(enhancedScore, result);
        const recommendations = this.generateRecommendations(result, request);
        
        return {
          business: result.business,
          matchScore: enhancedScore,
          matchReasons,
          confidenceLevel: confidence,
          recommendations
        };
      });
      
      // Filter and sort by match quality
      return matchResults
        .filter(match => match.matchScore >= 40) // Minimum threshold
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5); // Return top 5 matches
        
    } catch (error) {
      console.error('Matchmaking error:', error);
      throw error;
    }
  }
  
  private calculateMatchScore(searchResult: any, request: MatchmakingRequest): number {
    let score = searchResult.relevanceScore;
    const { business } = searchResult;
    
    // Type-specific scoring adjustments
    switch (request.type) {
      case 'b2b':
        score += this.calculateB2BScore(business, request);
        break;
      case 'candidate-to-job':
        score += this.calculateJobMatchScore(business, request);
        break;
      case 'startup-to-investor':
        score += this.calculateInvestorMatchScore(business, request);
        break;
    }
    
    // Size/budget compatibility
    if (request.requirements?.budget && business.project_budget_min) {
      const budgetMatch = this.assessBudgetCompatibility(
        request.requirements.budget, 
        business.project_budget_min, 
        business.project_budget_max
      );
      score += budgetMatch;
    }
    
    // Company maturity/size
    if (request.requirements?.size) {
      score += this.assessSizeCompatibility(business, request.requirements.size);
    }
    
    // Industry alignment
    if (request.requirements?.industry) {
      score += this.assessIndustryAlignment(business, request.requirements.industry);
    }
    
    return Math.min(score, 100); // Cap at 100%
  }
  
  private calculateB2BScore(business: any, request: MatchmakingRequest): number {
    let score = 0;
    
    // Service capability matching
    const serviceKeywords = this.extractServiceKeywords(request.description);
    const businessCapabilities = this.getBusinessCapabilities(business);
    
    const capabilityOverlap = serviceKeywords.filter(keyword => 
      businessCapabilities.some(cap => cap.toLowerCase().includes(keyword.toLowerCase()))
    ).length;
    
    score += (capabilityOverlap / serviceKeywords.length) * 30;
    
    // Experience indicators
    if (business.founded_year) {
      const experience = new Date().getFullYear() - business.founded_year;
      score += Math.min(experience * 2, 20); // Max 20 points for experience
    }
    
    // Portfolio/certification bonus
    if (business.certifications && business.certifications.length > 0) {
      score += 10;
    }
    
    return score;
  }
  
  private calculateJobMatchScore(business: any, request: MatchmakingRequest): number {
    let score = 0;
    
    // Currently simplified - would integrate with job postings in real implementation
    // For now, score based on company size and growth indicators
    if (business.employees_count) {
      if (business.employees_count >= 10 && business.employees_count <= 500) {
        score += 20; // Sweet spot for job opportunities
      }
    }
    
    return score;
  }
  
  private calculateInvestorMatchScore(business: any, request: MatchmakingRequest): number {
    let score = 0;
    
    // This would integrate with investor profiles in a real implementation
    // For now, basic heuristics
    if (business.verified) score += 15;
    if (business.rating && business.rating >= 4.0) score += 10;
    
    return score;
  }
  
  private extractServiceKeywords(description: string): string[] {
    const serviceTerms = [
      'automation', 'analytics', 'prediction', 'optimization', 'classification',
      'detection', 'recognition', 'processing', 'generation', 'recommendation',
      'chatbot', 'virtual assistant', 'machine learning', 'deep learning',
      'computer vision', 'natural language', 'speech recognition', 'robotics'
    ];
    
    const descLower = description.toLowerCase();
    return serviceTerms.filter(term => descLower.includes(term));
  }
  
  private getBusinessCapabilities(business: any): string[] {
    const capabilities = [];
    
    if (business.description) capabilities.push(business.description);
    if (business.category) capabilities.push(business.category);
    if (business.tags) capabilities.push(...business.tags);
    if (business.certifications) capabilities.push(...business.certifications);
    
    return capabilities;
  }
  
  private assessBudgetCompatibility(requestBudget: string, minBudget?: number, maxBudget?: number): number {
    // Simplified budget matching logic
    const budgetRanges = {
      'under-10k': [0, 10000],
      '10k-50k': [10000, 50000],
      '50k-100k': [50000, 100000],
      '100k-500k': [100000, 500000],
      'over-500k': [500000, Infinity]
    };
    
    const requestRange = budgetRanges[requestBudget as keyof typeof budgetRanges];
    if (!requestRange || !minBudget) return 0;
    
    // Check for overlap
    const businessMax = maxBudget || minBudget * 3; // Estimate if no max
    if (requestRange[1] >= minBudget && requestRange[0] <= businessMax) {
      return 15; // Budget compatible
    }
    
    return -10; // Budget incompatible
  }
  
  private assessSizeCompatibility(business: any, requestedSize: string): number {
    const employeeCount = business.employees_count || 0;
    
    const sizeMap = {
      'startup': [1, 20],
      'small': [21, 100],
      'medium': [101, 500],
      'large': [501, Infinity]
    };
    
    const sizeRange = sizeMap[requestedSize as keyof typeof sizeMap];
    if (sizeRange && employeeCount >= sizeRange[0] && employeeCount <= sizeRange[1]) {
      return 10;
    }
    
    return 0;
  }
  
  private assessIndustryAlignment(business: any, requestedIndustry: string): number {
    const businessCategory = business.category?.toLowerCase() || '';
    const industryLower = requestedIndustry.toLowerCase();
    
    if (businessCategory.includes(industryLower) || 
        industryLower.includes(businessCategory)) {
      return 15;
    }
    
    return 0;
  }
  
  private generateMatchReasons(searchResult: any, request: MatchmakingRequest): string[] {
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
  
  private assessConfidence(score: number, searchResult: any): 'high' | 'medium' | 'low' {
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
  
  private generateRecommendations(searchResult: any, request: MatchmakingRequest): string[] {
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

export const matchmakingService = new MatchmakingService();
