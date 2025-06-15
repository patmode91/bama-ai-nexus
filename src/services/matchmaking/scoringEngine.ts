
import { MatchmakingRequest } from './types';

export class ScoringEngine {
  calculateMatchScore(searchResult: any, request: MatchmakingRequest): number {
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
}

export const scoringEngine = new ScoringEngine();
