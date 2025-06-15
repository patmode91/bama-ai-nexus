
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Business = Database['public']['Tables']['businesses']['Row'];

export interface MatchingCriteria {
  industry?: string;
  location?: string;
  companySize?: string;
  budget?: { min: number; max: number };
  technologies?: string[];
  services?: string[];
  partnerships?: string[];
  targetMarkets?: string[];
}

export interface EnhancedMatchResult {
  business: Business;
  matchScore: number;
  matchReasons: string[];
  compatibilityFactors: {
    industry: number;
    location: number;
    size: number;
    technology: number;
    services: number;
  };
  recommendedActions: string[];
  potentialSynergies: string[];
}

export interface MatchingRecommendation {
  type: 'partnership' | 'supplier' | 'customer' | 'competitor' | 'collaboration';
  confidence: number;
  reasoning: string;
}

class EnhancedMatchingService {
  async findMatches(
    criteria: MatchingCriteria,
    excludeBusinessIds: number[] = [],
    limit: number = 20
  ): Promise<EnhancedMatchResult[]> {
    try {
      // Get businesses based on basic criteria
      let query = supabase
        .from('businesses')
        .select('*')
        .not('id', 'in', `(${excludeBusinessIds.join(',')})`)
        .limit(limit * 3); // Get more to filter and rank

      // Apply basic filters
      if (criteria.industry) {
        query = query.ilike('category', `%${criteria.industry}%`);
      }

      if (criteria.location) {
        query = query.ilike('location', `%${criteria.location}%`);
      }

      const { data: businesses, error } = await query;

      if (error) throw error;

      if (!businesses) return [];

      // Calculate enhanced match scores
      const matches = await Promise.all(
        businesses.map(business => this.calculateEnhancedMatch(business, criteria))
      );

      // Sort by match score and return top results
      return matches
        .filter(match => match.matchScore > 30)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

    } catch (error) {
      console.error('Error finding matches:', error);
      return [];
    }
  }

  private async calculateEnhancedMatch(
    business: Business,
    criteria: MatchingCriteria
  ): Promise<EnhancedMatchResult> {
    const compatibilityFactors = {
      industry: this.calculateIndustryCompatibility(business, criteria),
      location: this.calculateLocationCompatibility(business, criteria),
      size: this.calculateSizeCompatibility(business, criteria),
      technology: this.calculateTechnologyCompatibility(business, criteria),
      services: this.calculateServicesCompatibility(business, criteria)
    };

    const matchScore = this.calculateOverallScore(compatibilityFactors);
    const matchReasons = this.generateMatchReasons(business, criteria, compatibilityFactors);
    const potentialSynergies = this.identifyPotentialSynergies(business, criteria);
    const recommendedActions = this.generateRecommendedActions(business, criteria, matchScore);

    return {
      business,
      matchScore,
      matchReasons,
      compatibilityFactors,
      recommendedActions,
      potentialSynergies
    };
  }

  private calculateIndustryCompatibility(business: Business, criteria: MatchingCriteria): number {
    if (!criteria.industry || !business.category) return 50;

    const businessCategory = business.category.toLowerCase();
    const targetIndustry = criteria.industry.toLowerCase();

    // Exact match
    if (businessCategory.includes(targetIndustry)) return 100;

    // Related industry matching
    const industryMappings = {
      'technology': ['software', 'it', 'tech', 'digital', 'ai', 'data'],
      'healthcare': ['medical', 'health', 'pharmaceutical', 'biotech'],
      'manufacturing': ['production', 'industrial', 'factory', 'automotive'],
      'retail': ['commerce', 'sales', 'shopping', 'consumer'],
      'finance': ['banking', 'investment', 'insurance', 'fintech']
    };

    for (const [category, keywords] of Object.entries(industryMappings)) {
      if (targetIndustry.includes(category) || keywords.some(k => targetIndustry.includes(k))) {
        if (keywords.some(k => businessCategory.includes(k))) return 80;
      }
    }

    return 30;
  }

  private calculateLocationCompatibility(business: Business, criteria: MatchingCriteria): number {
    if (!criteria.location || !business.location) return 50;

    const businessLocation = business.location.toLowerCase();
    const targetLocation = criteria.location.toLowerCase();

    // Same city
    if (businessLocation.includes(targetLocation) || targetLocation.includes(businessLocation)) {
      return 100;
    }

    // Same state (Alabama)
    const alabamaCities = ['birmingham', 'huntsville', 'mobile', 'montgomery', 'tuscaloosa'];
    const businessInAlabama = alabamaCities.some(city => businessLocation.includes(city));
    const targetInAlabama = alabamaCities.some(city => targetLocation.includes(city)) || targetLocation.includes('alabama');

    if (businessInAlabama && targetInAlabama) return 70;

    return 20;
  }

  private calculateSizeCompatibility(business: Business, criteria: MatchingCriteria): number {
    if (!criteria.companySize || !business.employees_count) return 50;

    const employeeCount = business.employees_count;
    const targetSize = criteria.companySize.toLowerCase();

    const sizeRanges = {
      'startup': [1, 10],
      'small': [11, 50],
      'medium': [51, 200],
      'large': [201, 1000],
      'enterprise': [1001, Infinity]
    };

    const [min, max] = sizeRanges[targetSize as keyof typeof sizeRanges] || [0, Infinity];

    if (employeeCount >= min && employeeCount <= max) return 100;

    // Adjacent size categories get partial match
    const adjacentCategories = {
      'startup': ['small'],
      'small': ['startup', 'medium'],
      'medium': ['small', 'large'],
      'large': ['medium', 'enterprise'],
      'enterprise': ['large']
    };

    const adjacent = adjacentCategories[targetSize as keyof typeof adjacentCategories] || [];
    for (const adjSize of adjacent) {
      const [adjMin, adjMax] = sizeRanges[adjSize as keyof typeof sizeRanges];
      if (employeeCount >= adjMin && employeeCount <= adjMax) return 60;
    }

    return 30;
  }

  private calculateTechnologyCompatibility(business: Business, criteria: MatchingCriteria): number {
    if (!criteria.technologies || !business.tags) return 50;

    const businessTags = business.tags.map(tag => tag.toLowerCase());
    const targetTechnologies = criteria.technologies.map(tech => tech.toLowerCase());

    const matches = targetTechnologies.filter(tech =>
      businessTags.some(tag => tag.includes(tech) || tech.includes(tag))
    );

    return (matches.length / targetTechnologies.length) * 100;
  }

  private calculateServicesCompatibility(business: Business, criteria: MatchingCriteria): number {
    if (!criteria.services || !business.description) return 50;

    const businessDescription = business.description.toLowerCase();
    const targetServices = criteria.services.map(service => service.toLowerCase());

    const matches = targetServices.filter(service =>
      businessDescription.includes(service)
    );

    return (matches.length / targetServices.length) * 100;
  }

  private calculateOverallScore(factors: any): number {
    const weights = {
      industry: 0.3,
      location: 0.2,
      size: 0.15,
      technology: 0.2,
      services: 0.15
    };

    return Object.entries(weights).reduce((score, [factor, weight]) => {
      return score + (factors[factor] * weight);
    }, 0);
  }

  private generateMatchReasons(
    business: Business,
    criteria: MatchingCriteria,
    factors: any
  ): string[] {
    const reasons: string[] = [];

    if (factors.industry > 80) {
      reasons.push(`Strong industry alignment with ${business.category}`);
    }

    if (factors.location > 80) {
      reasons.push(`Located in same area (${business.location})`);
    }

    if (factors.technology > 70) {
      reasons.push('Complementary technology stack');
    }

    if (business.verified) {
      reasons.push('Verified business with established credibility');
    }

    if (business.rating && business.rating > 4) {
      reasons.push(`Highly rated business (${business.rating}/5 stars)`);
    }

    return reasons;
  }

  private identifyPotentialSynergies(business: Business, criteria: MatchingCriteria): string[] {
    const synergies: string[] = [];

    // Industry-specific synergies
    if (business.category?.toLowerCase().includes('technology')) {
      synergies.push('Technology integration opportunities');
      synergies.push('Digital transformation collaboration');
    }

    if (business.category?.toLowerCase().includes('manufacturing')) {
      synergies.push('Supply chain optimization');
      synergies.push('Production efficiency improvements');
    }

    // General business synergies
    synergies.push('Knowledge sharing and best practices');
    synergies.push('Joint marketing opportunities');
    synergies.push('Resource sharing potential');

    return synergies;
  }

  private generateRecommendedActions(
    business: Business,
    criteria: MatchingCriteria,
    score: number
  ): string[] {
    const actions: string[] = [];

    if (score > 80) {
      actions.push('Schedule an immediate meeting');
      actions.push('Prepare a detailed partnership proposal');
    } else if (score > 60) {
      actions.push('Research their recent projects and initiatives');
      actions.push('Connect through mutual contacts');
    } else {
      actions.push('Monitor for future opportunities');
      actions.push('Keep in touch through industry events');
    }

    actions.push('Review their business profile in detail');
    actions.push('Identify specific collaboration areas');

    return actions;
  }

  async getBusinessRecommendations(businessId: number): Promise<MatchingRecommendation[]> {
    try {
      // Get the business details
      const { data: business, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error || !business) return [];

      // Generate criteria based on business profile
      const criteria: MatchingCriteria = {
        industry: business.category || undefined,
        location: business.location || undefined,
        technologies: business.tags || undefined
      };

      // Find matches
      const matches = await this.findMatches(criteria, [businessId], 10);

      // Generate recommendations
      return matches.map(match => this.generateRecommendationType(business, match));

    } catch (error) {
      console.error('Error getting business recommendations:', error);
      return [];
    }
  }

  private generateRecommendationType(
    sourceBusiness: Business,
    match: EnhancedMatchResult
  ): MatchingRecommendation {
    const { business: targetBusiness, matchScore } = match;

    // Determine recommendation type based on business characteristics
    if (sourceBusiness.category === targetBusiness.category) {
      return {
        type: 'competitor',
        confidence: matchScore,
        reasoning: 'Similar business in the same industry - potential for market insights'
      };
    }

    if (matchScore > 80) {
      return {
        type: 'partnership',
        confidence: matchScore,
        reasoning: 'High compatibility for strategic partnership'
      };
    }

    if (matchScore > 60) {
      return {
        type: 'collaboration',
        confidence: matchScore,
        reasoning: 'Good potential for project collaboration'
      };
    }

    return {
      type: 'supplier',
      confidence: matchScore,
      reasoning: 'Potential service provider or supplier relationship'
    };
  }
}

export const enhancedMatchingService = new EnhancedMatchingService();
