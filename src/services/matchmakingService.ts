
import { supabase } from '@/integrations/supabase/client';
import { semanticSearchService } from './semanticSearchService';

export interface MatchRequest {
  type: 'b2b' | 'investment' | 'partnership' | 'talent';
  description: string;
  requirements: {
    location?: string;
    industry?: string;
    companySize?: string;
    budget?: { min: number; max: number };
    timeline?: string;
    technologies?: string[];
  };
  preferences?: {
    verified?: boolean;
    rating?: number;
    founded?: { min: number; max: number };
  };
}

export interface MatchResult {
  business: any;
  matchScore: number;
  matchReasons: string[];
  compatibility: {
    location: number;
    industry: number;
    size: number;
    technology: number;
    overall: number;
  };
  recommendations: string[];
}

class MatchmakingService {
  async findMatches(request: MatchRequest): Promise<MatchResult[]> {
    try {
      // First, get potential matches using semantic search
      const searchResults = await semanticSearchService.searchBusinesses({
        query: request.description,
        filters: {
          location: request.requirements.location,
          category: request.requirements.industry,
          verified: request.preferences?.verified
        },
        limit: 50
      });

      // Score and rank matches
      const matches = searchResults.map(result => {
        const matchScore = this.calculateMatchScore(result.business, request);
        const compatibility = this.calculateCompatibility(result.business, request);
        const matchReasons = this.generateMatchReasons(result.business, request, compatibility);
        const recommendations = this.generateRecommendations(result.business, request);

        return {
          business: result.business,
          matchScore,
          matchReasons,
          compatibility,
          recommendations
        };
      });

      // Sort by match score and return top matches
      return matches
        .filter(match => match.matchScore > 30) // Minimum threshold
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 20);
    } catch (error) {
      console.error('Matchmaking error:', error);
      throw error;
    }
  }

  private calculateMatchScore(business: any, request: MatchRequest): number {
    let score = 0;
    const weights = {
      location: 25,
      industry: 30,
      size: 20,
      technology: 15,
      quality: 10
    };

    // Location match
    if (request.requirements.location && business.location) {
      const locationMatch = business.location.toLowerCase()
        .includes(request.requirements.location.toLowerCase());
      if (locationMatch) score += weights.location;
    }

    // Industry/Category match
    if (request.requirements.industry && business.category) {
      const industryMatch = business.category.toLowerCase()
        .includes(request.requirements.industry.toLowerCase());
      if (industryMatch) score += weights.industry;
    }

    // Company size match
    if (request.requirements.companySize && business.employees_count) {
      const sizeMatch = this.matchCompanySize(business.employees_count, request.requirements.companySize);
      score += sizeMatch * weights.size;
    }

    // Technology match
    if (request.requirements.technologies && business.tags) {
      const techMatch = this.calculateTechnologyMatch(business.tags, request.requirements.technologies);
      score += techMatch * weights.technology;
    }

    // Quality indicators
    if (business.verified) score += weights.quality * 0.5;
    if (business.rating && business.rating > 4.0) score += weights.quality * 0.5;

    return Math.min(100, score);
  }

  private calculateCompatibility(business: any, request: MatchRequest) {
    const location = this.calculateLocationCompatibility(business.location, request.requirements.location);
    const industry = this.calculateIndustryCompatibility(business.category, request.requirements.industry);
    const size = this.calculateSizeCompatibility(business.employees_count, request.requirements.companySize);
    const technology = this.calculateTechnologyMatch(business.tags, request.requirements.technologies || []);

    const overall = (location + industry + size + technology) / 4;

    return { location, industry, size, technology, overall };
  }

  private calculateLocationCompatibility(businessLocation: string, requiredLocation?: string): number {
    if (!requiredLocation || !businessLocation) return 50; // Neutral if no data

    const businessLoc = businessLocation.toLowerCase();
    const requiredLoc = requiredLocation.toLowerCase();

    if (businessLoc.includes(requiredLoc) || requiredLoc.includes(businessLoc)) {
      return 100;
    }

    // Check for same state (Alabama)
    if (businessLoc.includes('alabama') || businessLoc.includes('al')) {
      return 75;
    }

    return 25;
  }

  private calculateIndustryCompatibility(businessCategory: string, requiredIndustry?: string): number {
    if (!requiredIndustry || !businessCategory) return 50;

    const businessCat = businessCategory.toLowerCase();
    const requiredInd = requiredIndustry.toLowerCase();

    if (businessCat.includes(requiredInd) || requiredInd.includes(businessCat)) {
      return 100;
    }

    // Check for related industries
    const techTerms = ['ai', 'software', 'technology', 'digital', 'it'];
    const businessHasTech = techTerms.some(term => businessCat.includes(term));
    const requiredHasTech = techTerms.some(term => requiredInd.includes(term));

    if (businessHasTech && requiredHasTech) {
      return 75;
    }

    return 25;
  }

  private calculateSizeCompatibility(businessSize: number, requiredSize?: string): number {
    if (!requiredSize || !businessSize) return 50;

    const sizeRanges = {
      'startup': { min: 1, max: 10 },
      'small': { min: 11, max: 50 },
      'medium': { min: 51, max: 250 },
      'large': { min: 251, max: Infinity }
    };

    const range = sizeRanges[requiredSize.toLowerCase() as keyof typeof sizeRanges];
    if (!range) return 50;

    if (businessSize >= range.min && businessSize <= range.max) {
      return 100;
    }

    // Partial match for adjacent ranges
    const adjacentRanges = {
      'startup': ['small'],
      'small': ['startup', 'medium'],
      'medium': ['small', 'large'],
      'large': ['medium']
    };

    const adjacent = adjacentRanges[requiredSize.toLowerCase() as keyof typeof adjacentRanges] || [];
    for (const adjSize of adjacent) {
      const adjRange = sizeRanges[adjSize as keyof typeof sizeRanges];
      if (businessSize >= adjRange.min && businessSize <= adjRange.max) {
        return 60;
      }
    }

    return 25;
  }

  private calculateTechnologyMatch(businessTags: string[], requiredTechnologies: string[]): number {
    if (!businessTags || !requiredTechnologies || requiredTechnologies.length === 0) {
      return 50;
    }

    const businessTagsLower = businessTags.map(tag => tag.toLowerCase());
    const requiredTechLower = requiredTechnologies.map(tech => tech.toLowerCase());

    let matchCount = 0;
    for (const tech of requiredTechLower) {
      if (businessTagsLower.some(tag => tag.includes(tech) || tech.includes(tag))) {
        matchCount++;
      }
    }

    return (matchCount / requiredTechnologies.length) * 100;
  }

  private matchCompanySize(employeeCount: number, requiredSize: string): number {
    const sizeMap = {
      'startup': employeeCount <= 10 ? 1 : 0.5,
      'small': employeeCount <= 50 ? 1 : employeeCount <= 100 ? 0.7 : 0.3,
      'medium': employeeCount <= 250 && employeeCount > 50 ? 1 : 0.5,
      'large': employeeCount > 250 ? 1 : 0.3
    };

    return sizeMap[requiredSize.toLowerCase() as keyof typeof sizeMap] || 0.5;
  }

  private generateMatchReasons(business: any, request: MatchRequest, compatibility: any): string[] {
    const reasons: string[] = [];

    if (compatibility.location > 75) {
      reasons.push('Strong location match');
    }
    if (compatibility.industry > 75) {
      reasons.push('Industry expertise alignment');
    }
    if (compatibility.technology > 75) {
      reasons.push('Technology stack compatibility');
    }
    if (business.verified) {
      reasons.push('Verified business');
    }
    if (business.rating && business.rating > 4.0) {
      reasons.push('High customer rating');
    }
    if (compatibility.size > 75) {
      reasons.push('Appropriate company size');
    }

    return reasons.length > 0 ? reasons : ['General business match'];
  }

  private generateRecommendations(business: any, request: MatchRequest): string[] {
    const recommendations: string[] = [];

    if (request.type === 'partnership') {
      recommendations.push('Consider scheduling an initial partnership discussion');
      if (business.website) {
        recommendations.push('Review their website for service compatibility');
      }
    }

    if (request.type === 'b2b') {
      recommendations.push('Request a capabilities presentation');
      recommendations.push('Discuss project scope and timeline');
    }

    if (business.contactemail) {
      recommendations.push('Direct contact available via email');
    }

    return recommendations;
  }
}

export const matchmakingService = new MatchmakingService();
