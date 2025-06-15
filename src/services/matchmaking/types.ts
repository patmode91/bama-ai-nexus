
export interface MatchmakingRequest {
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

export interface MatchResult {
  business: any;
  matchScore: number;
  matchReasons: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  recommendations: string[];
}
