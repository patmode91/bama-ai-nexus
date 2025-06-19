import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'; // For direct DB queries

// Assuming the tooling copies and adapts these services into a local _shared directory
// and that their internal Supabase client initializations and env var usage are Deno-compatible.
import { SemanticSearchEngine, SearchResult } from './_shared/services/ai/semanticSearchEngine.ts';
import { PredictionEngine } from './_shared/services/ml/predictionEngine.ts';

// Define a simplified Business type for this handler's context.
// In a real app, this would come from a shared types definition.
interface Business {
  id: string | number;
  name: string;
  description?: string;
  category?: string;
  location?: string; // e.g., city
  tags?: string[];
  rating?: number;
  review_count?: number;
  years_in_business?: number;
  employees_count?: number;
  verified?: boolean;
  website?: string;
  // Any other fields used for feature vector creation or basic scoring
  [key: string]: any; // Allow other properties
}

interface MatchResult {
  business: Business;
  score: number;
  reasoning?: string; // Simplified reasoning
  semanticSimilarity?: number; // If applicable
  mlSuccessProbability?: number; // If applicable
}

console.log("Connector Agent Handler function initializing...");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ConnectorAgentRequest {
  task: string;
  payload: Record<string, any>;
}

// Initialize Supabase client for direct DB operations within this function
// This uses SERVICE_ROLE_KEY for potentially broader access than individual services might have,
// or if services are designed to use the client passed to them.
// However, SemanticSearchEngine and PredictionEngine internally initialize their own clients
// which should also use Deno.env.get for their respective keys.
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Initialize services (assuming their getInstance methods are Deno-compatible)
// These initializations might trigger further async operations within the services (e.g., model loading)
// It's important these are handled gracefully or pre-warmed if necessary.
const semanticSearchEngine = SemanticSearchEngine.getInstance();
const predictionEngine = PredictionEngine.getInstance();
// Eagerly initialize prediction engine (model loading/training)
// In a real serverless env, long init might timeout. Consider pre-warmed instances or on-demand init.
predictionEngine.initialize().catch(err => console.error("Error initializing PredictionEngine on startup:", err));


serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw { message: 'Method Not Allowed', statusCode: 405 };
    }

    const requestData: ConnectorAgentRequest = await req.json();
    const { task, payload } = requestData;

    if (!task || !payload) {
      throw { message: 'Missing "task" or "payload" in request body.', statusCode: 400 };
    }

    console.log(`Connector Agent Handler received task: ${task}`, payload);

    let responseData: any;

    switch (task) {
      case 'connector_find_and_score_businesses': {
        const { searchCriteria = {}, limit = 10 } = payload;
        let businesses: Business[] = [];
        let semanticResultsMap: Map<string | number, SearchResult> = new Map();

        // Step 1: Fetch Businesses
        if (searchCriteria.queryText) {
          const semanticSearchResults = await semanticSearchEngine.search(
            searchCriteria.queryText,
            searchCriteria.similarityThreshold || 0.5, // Default threshold
            searchCriteria.semanticLimit || 20 // Fetch more for diverse results before filtering/scoring
          );
          // Assuming SearchResult contains the full Business object or enough to reconstruct it.
          // For this example, let's assume SearchResult has an 'id' and other business fields.
          semanticSearchResults.forEach(sr => {
            businesses.push(sr as unknown as Business); // Casting, ensure SearchResult is compatible
            semanticResultsMap.set(sr.id, sr);
          });
        } else {
          // Fallback to structured search if no queryText or to augment results
          let queryBuilder = supabaseClient.from('businesses').select('*');
          if (searchCriteria.industry) {
            queryBuilder = queryBuilder.ilike('category', `%${searchCriteria.industry}%`);
          }
          if (searchCriteria.location) {
            queryBuilder = queryBuilder.ilike('location', `%${searchCriteria.location}%`);
          }
          if (searchCriteria.tags && Array.isArray(searchCriteria.tags) && searchCriteria.tags.length > 0) {
            queryBuilder = queryBuilder.overlaps('tags', searchCriteria.tags);
          }
          const { data: structuredSearchData, error: structuredSearchError } = await queryBuilder.limit(20);
          if (structuredSearchError) throw structuredSearchError;
          if (structuredSearchData) {
            // Combine and deduplicate if both searches run
            const existingIds = new Set(businesses.map(b => b.id));
            structuredSearchData.forEach(b => {
              if (!existingIds.has(b.id)) {
                businesses.push(b as Business);
              }
            });
          }
        }

        // Deduplicate businesses by ID if fetched from multiple sources
        const uniqueBusinesses = Array.from(new Map(businesses.map(b => [b.id, b])).values());


        // Step 2: Score Businesses
        const scoredMatches: MatchResult[] = [];
        for (const business of uniqueBusinesses) {
          let score = 0;
          let reasoning = "";
          let mlSuccessProbability: number | undefined = undefined;
          const semanticMatch = semanticResultsMap.get(business.id);

          // Basic criteria matching (simplified from MCPAgentConnector)
          if (searchCriteria.industry && business.category?.toLowerCase().includes(searchCriteria.industry.toLowerCase())) {
            score += 30; reasoning += "Industry match. ";
          }
          if (searchCriteria.location && business.location?.toLowerCase().includes(searchCriteria.location.toLowerCase())) {
            score += 20; reasoning += "Location match. ";
          }
          if (semanticMatch) {
            score += Math.round(semanticMatch.similarity * 20); // Max 20 points from similarity
            reasoning += `Semantic similarity: ${semanticMatch.similarity.toFixed(2)}. `;
          }
          if (business.rating && business.rating > 4.0) {
            score += 10; reasoning += `High rating (${business.rating}). `;
          }
          if (business.verified) {
            score += 5; reasoning += `Verified. `;
          }

          // ML-based score component
          try {
            const features = [
              business.rating || 0,
              business.review_count || 0,
              business.years_in_business || 0,
              (business.employees_count || 0) / 100, // Normalized
              business.verified ? 1 : 0,
              // Pad to 10 features as per predictionEngine's example
            ];
            while (features.length < 10) features.push(0);

            mlSuccessProbability = await predictionEngine.predictSuccessProbability(features.slice(0, 10));
            score += Math.round(mlSuccessProbability * 15); // Max 15 points from ML score
            reasoning += `ML Success Prob: ${mlSuccessProbability.toFixed(2)}. `;
          } catch (mlError) {
            console.warn(`ML prediction failed for business ${business.id}:`, mlError.message);
          }

          scoredMatches.push({
            business,
            score: Math.min(100, Math.max(0, score)), // Cap score between 0-100
            reasoning: reasoning.trim(),
            semanticSimilarity: semanticMatch?.similarity,
            mlSuccessProbability,
          });
        }

        // Step 3: Rank and Return
        scoredMatches.sort((a, b) => b.score - a.score);
        responseData = scoredMatches.slice(0, limit);
        break;
      }

      case 'connector_semantic_search_only':
        if (!payload.queryText) {
          throw { message: 'Missing "queryText" in payload.', statusCode: 400 };
        }
        responseData = await semanticSearchEngine.search(
          payload.queryText,
          payload.threshold,
          payload.limit
        );
        break;

      case 'connector_get_ml_score_for_business':
        if (!payload.businessFeatures || !Array.isArray(payload.businessFeatures)) {
          throw { message: 'Missing or invalid "businessFeatures" array in payload.', statusCode: 400 };
        }
        // Ensure features are numbers and pad if necessary, matching predictionEngine's expectation
        let features: number[] = payload.businessFeatures.map(Number).filter(n => !isNaN(n));
        while (features.length < 10) features.push(0); // Pad to 10
        features = features.slice(0, 10); // Ensure exactly 10

        responseData = await predictionEngine.predictSuccessProbability(features);
        break;

      default:
        throw { message: `Unknown task: ${task}`, statusCode: 400 };
    }

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`Error in Connector Agent Handler (task: ${error.task || 'unknown'}):`, error);
    const statusCode = error.statusCode || 500;
    const errorMessage = typeof error.message === 'string' ? error.message :
                         (typeof error === 'string' ? error : 'An unexpected error occurred in Connector Agent.');

    return new Response(
      JSON.stringify({ success: false, error: errorMessage, details: error.stack }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

console.log('Connector Agent Handler function script processed.');
