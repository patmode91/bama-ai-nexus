
import { Database } from '@/integrations/supabase/types';
import { ScoringResult } from '@/types/semanticSearch';

type Business = Database['public']['Tables']['businesses']['Row'];

export class BusinessScorer {
  async scoreBusinessRelevance(
    business: Business, 
    searchCriteria: any, 
    originalQuery: string
  ): Promise<ScoringResult> {
    let score = 0;
    const reasons: string[] = [];

    // Base score
    score += 20;

    // Text relevance scoring
    const textRelevance = this.calculateTextRelevance(business, originalQuery);
    score += textRelevance.score;
    reasons.push(...textRelevance.reasons);

    // Technology matching
    if (searchCriteria.technologies?.length > 0) {
      const techMatch = this.scoreTechnologyMatch(business, searchCriteria.technologies);
      score += techMatch.score;
      reasons.push(...techMatch.reasons);
    }

    // Industry matching
    if (searchCriteria.industries?.length > 0) {
      const industryMatch = this.scoreIndustryMatch(business, searchCriteria.industries);
      score += industryMatch.score;
      reasons.push(...industryMatch.reasons);
    }

    // Location relevance
    if (searchCriteria.locations?.length > 0) {
      const locationMatch = this.scoreLocationMatch(business, searchCriteria.locations);
      score += locationMatch.score;
      reasons.push(...locationMatch.reasons);
    }

    // Quality indicators
    const qualityBonus = this.calculateQualityBonus(business);
    score += qualityBonus.score;
    reasons.push(...qualityBonus.reasons);

    return {
      score: Math.min(100, Math.max(0, score)),
      reasons: reasons.filter(Boolean)
    };
  }

  private calculateTextRelevance(business: Business, query: string): ScoringResult {
    let score = 0;
    const reasons: string[] = [];
    const queryTerms = query.toLowerCase().split(/\s+/);

    queryTerms.forEach(term => {
      if (business.businessname?.toLowerCase().includes(term)) {
        score += 25;
        reasons.push(`Business name contains "${term}"`);
      }
      if (business.description?.toLowerCase().includes(term)) {
        score += 15;
        reasons.push(`Description mentions "${term}"`);
      }
      if (business.category?.toLowerCase().includes(term)) {
        score += 20;
        reasons.push(`Category matches "${term}"`);
      }
    });

    return { score, reasons };
  }

  private scoreTechnologyMatch(business: Business, technologies: string[]): ScoringResult {
    let score = 0;
    const reasons: string[] = [];

    technologies.forEach(tech => {
      const businessText = [
        business.businessname,
        business.description,
        ...(business.tags || [])
      ].join(' ').toLowerCase();

      if (businessText.includes(tech.toLowerCase())) {
        score += 20;
        reasons.push(`Specializes in ${tech}`);
      }
    });

    return { score, reasons };
  }

  private scoreIndustryMatch(business: Business, industries: string[]): ScoringResult {
    let score = 0;
    const reasons: string[] = [];

    industries.forEach(industry => {
      if (business.category?.toLowerCase().includes(industry.toLowerCase())) {
        score += 30;
        reasons.push(`Industry match: ${industry}`);
      }
    });

    return { score, reasons };
  }

  private scoreLocationMatch(business: Business, locations: string[]): ScoringResult {
    let score = 0;
    const reasons: string[] = [];

    locations.forEach(location => {
      if (business.location?.toLowerCase().includes(location.toLowerCase())) {
        score += 15;
        reasons.push(`Located in ${location}`);
      }
    });

    return { score, reasons };
  }

  private calculateQualityBonus(business: Business): ScoringResult {
    let score = 0;
    const reasons: string[] = [];

    if (business.verified) {
      score += 10;
      reasons.push('Verified business');
    }

    if (business.rating && business.rating > 4) {
      score += 8;
      reasons.push('Highly rated');
    }

    if (business.website) {
      score += 5;
      reasons.push('Has website');
    }

    return { score, reasons };
  }
}

export const businessScorer = new BusinessScorer();
