import { ScoringResult } from '@/types/semanticSearch';

export class BusinessScorer {
  async scoreBusinessRelevance(business: any, criteria: any, query: string): Promise<ScoringResult> {
    let score = 0;
    const reasons: string[] = [];

    // Name match
    if (business.businessname?.toLowerCase().includes(query.toLowerCase().split(' ')[0])) {
      score += 30;
      reasons.push('Business name matches search term');
    }

    // Category/Industry match
    if (criteria.industries?.some((industry: string) => 
      business.category?.toLowerCase().includes(industry.toLowerCase())
    )) {
      score += 25;
      reasons.push('Industry match');
    }

    // Technology match in description
    if (criteria.technologies?.some((tech: string) => 
      business.description?.toLowerCase().includes(tech.toLowerCase())
    )) {
      score += 25;
      reasons.push('Technology alignment');
    }

    // Location match
    if (criteria.locations?.some((location: string) => 
      business.location?.toLowerCase().includes(location.toLowerCase())
    )) {
      score += 15;
      reasons.push('Location match');
    }

    // Verified bonus
    if (business.verified) {
      score += 10;
      reasons.push('Verified company');
    }

    // Description relevance
    if (business.description && criteria.keywords?.some((keyword: string) => 
      business.description.toLowerCase().includes(keyword.toLowerCase())
    )) {
      score += 20;
      reasons.push('Description relevance');
    }

    return { score: Math.min(score, 100), reasons };
  }
}

export const businessScorer = new BusinessScorer();
