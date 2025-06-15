
import { semanticSearchService } from './semanticSearchService';
import { scoringEngine } from './matchmaking/scoringEngine';
import { reasonGenerator } from './matchmaking/reasonGenerator';
import { MatchmakingRequest, MatchResult } from './matchmaking/types';

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
        const enhancedScore = scoringEngine.calculateMatchScore(result, request);
        const matchReasons = reasonGenerator.generateMatchReasons(result, request);
        const confidence = reasonGenerator.assessConfidence(enhancedScore, result);
        const recommendations = reasonGenerator.generateRecommendations(result, request);
        
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
}

export const matchmakingService = new MatchmakingService();
