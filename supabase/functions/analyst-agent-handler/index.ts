import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// Assuming the tooling copies and adapts these services into a local _shared directory
// and that their internal Supabase client initializations are Deno-compatible (using Deno.env.get).
import { MarketDataAPI } from './_shared/services/external/marketDataAPI.ts';
import { MarketAnalyzer } from './_shared/services/mcp/analyst/marketAnalyzer.ts';
// Import types needed for payload validation/casting, assuming they are also in _shared
import type { TrendAnalysisInputPoint, TrendAnalysisOptions } from './_shared/services/mcp/analyst/marketAnalyzer.ts';
// Business interface would be needed for targetBusiness, allBusinessesInContext.
// Assuming a generic 'any' for now, or a shared Business type if available.
// For simplicity, this example assumes payload structures match method signatures.

console.log("Analyst Agent Handler function initializing...");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Adjust for specific origins in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Specify allowed methods
};

interface AnalystAgentRequest {
  task: string;
  payload: Record<string, any>;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestData: AnalystAgentRequest = await req.json();
    const { task, payload } = requestData;

    if (!task || !payload) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing "task" or "payload" in request body.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyst Agent Handler received task: ${task}`, payload);

    let responseData: any;
    const marketDataAPI = MarketDataAPI.getInstance();
    const marketAnalyzer = MarketAnalyzer.getInstance();

    switch (task) {
      case 'analyst_get_market_trend_analysis':
        if (!payload.seriesData || !payload.analysisType) {
          throw { message: 'Missing "seriesData" or "analysisType" in payload.', statusCode: 400 };
        }
        responseData = await marketAnalyzer.analyzeTimeSeriesData(
          payload.seriesData as TrendAnalysisInputPoint[], // Cast if necessary
          payload.analysisType as 'movingAverage' | 'linearRegression',
          payload.options as TrendAnalysisOptions
        );
        break;

      case 'analyst_get_business_risk_profile':
        if (!payload.targetBusiness || !payload.allBusinessesInContext) {
          throw { message: 'Missing "targetBusiness" or "allBusinessesInContext" in payload.', statusCode: 400 };
        }
        responseData = marketAnalyzer.assessBusinessRisk( // This method is synchronous in current implementation
          payload.targetBusiness, // Cast to Business type if defined in _shared
          payload.allBusinessesInContext // Cast to Business[] type
        );
        break;

      case 'analyst_get_competitor_analysis':
        if (!payload.targetBusiness || !payload.allBusinessesInContext) {
          throw { message: 'Missing "targetBusiness" or "allBusinessesInContext" in payload.', statusCode: 400 };
        }
        const competitors = marketAnalyzer.identifyKeyCompetitors(
          payload.targetBusiness, // Cast to Business type
          payload.allBusinessesInContext, // Cast to Business[] type
          payload.maxCompetitors || 5
        );
        const comparisonReports = competitors.map(competitor =>
          marketAnalyzer.generateCompetitorComparison(payload.targetBusiness, competitor)
        );
        responseData = { identifiedCompetitors: competitors, comparisonReports };
        break;

      case 'analyst_get_bls_data':
        if (!payload.seriesId || !payload.startYear || !payload.endYear) {
          throw { message: 'Missing "seriesId", "startYear", or "endYear" in payload.', statusCode: 400 };
        }
        responseData = await marketDataAPI.getLaborStatistics(
          payload.seriesId,
          payload.startYear,
          payload.endYear
        );
        break;

      case 'analyst_get_census_data':
        if (!payload.dataset || !payload.params) {
          throw { message: 'Missing "dataset" or "params" in payload.', statusCode: 400 };
        }
        responseData = await marketDataAPI.getCensusData(
          payload.dataset,
          payload.params
        );
        break;

      case 'analyst_get_industry_growth': // New task for existing MarketDataAPI method
        if (!payload.naicsCode || !payload.location){
             throw { message: 'Missing "naicsCode" or "location" in payload for industry growth.', statusCode: 400 };
        }
        responseData = await marketDataAPI.getIndustryGrowth(payload.naicsCode, payload.location);
        break;

      default:
        throw { message: `Unknown task: ${task}`, statusCode: 400 };
    }

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`Error in Analyst Agent Handler (task: ${error.task || 'unknown'}):`, error);
    const statusCode = error.statusCode || 500;
    const errorMessage = typeof error.message === 'string' ? error.message :
                         (typeof error === 'string' ? error : 'An unexpected error occurred in Analyst Agent.');

    return new Response(
      JSON.stringify({ success: false, error: errorMessage, details: error.stack }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

console.log('Analyst Agent Handler function script processed.');
