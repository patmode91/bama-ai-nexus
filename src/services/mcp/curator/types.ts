
// Define this here to be centrally available
export interface BusinessSocialMediaLinks {
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinCompanyUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
}

export interface EnrichedBusinessData {
  business: any; // This should ideally be a more specific Business type
  enrichedTags: string[];
  industryInsights: string[];
  compatibilityScore: number;
  dataQuality: 'high' | 'medium' | 'low';
  socialMediaUrls?: BusinessSocialMediaLinks; // Added field
  lastEnriched: Date;
}

export interface CuratorResponse {
  enrichedBusinesses: EnrichedBusinessData[];
  dataQualityReport: {
    totalProcessed: number;
    highQuality: number;
    needsImprovement: number;
  };
  suggestions: string[];
}

export interface DataQualityReport {
  totalProcessed: number;
  highQuality: number;
  needsImprovement: number;
}
