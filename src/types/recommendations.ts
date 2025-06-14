
export interface PersonalizedRecommendation {
  business: any; // Using any for now to match the existing Business type
  relevanceScore: number;
  personalizedReasons: string[];
  recommendationType: 'perfect_match' | 'growth_opportunity' | 'trending' | 'similar_interests';
  confidenceLevel: number;
}
