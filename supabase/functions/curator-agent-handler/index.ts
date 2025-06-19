import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// Assuming the tooling copies and adapts these services into a local _shared directory
// and that their internal Supabase client initializations are Deno-compatible (using Deno.env.get).
import { BusinessDataAPI } from './_shared/services/external/businessDataAPI.ts';
import { DataQualityAnalyzer } from './_shared/services/mcp/curator/dataQualityAnalyzer.ts';
import type { BusinessForValidation } from './_shared/services/mcp/curator/curationRules.ts';
// Supabase client might be needed here if we make direct DB calls, but typically services handle their own.
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

console.log("Curator Agent Handler function initializing...");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Adjust for specific origins in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Specify allowed methods
};

interface CuratorAgentRequest {
  task: string;
  payload: Record<string, any>;
  // sessionId?: string; // Optional, depending on how sessions are managed
  // userId?: string;    // Optional, for user-specific actions
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
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

    const requestData: CuratorAgentRequest = await req.json();
    const { task, payload } = requestData;

    if (!task || !payload) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing "task" or "payload" in request body.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Curator Agent Handler received task: ${task}`, payload);

    let responseData: any;
    const businessDataAPI = BusinessDataAPI.getInstance();
    const dataQualityAnalyzer = DataQualityAnalyzer.getInstance(); // Assuming it's a singleton too

    switch (task) {
      case 'curator_enrich_business_profile':
        if (!payload.businessId) {
          throw { message: 'Missing "businessId" in payload for enrich_business_profile task.', statusCode: 400 };
        }
        responseData = await businessDataAPI.enrichBusinessProfile(payload.businessId);
        if (responseData === null && !payload.businessId) { // enrichBusinessProfile might return null for various reasons
            // Distinguish "not found" from other errors if possible, or just treat null as error/partial success
            console.warn(`Enrichment for business ID ${payload.businessId} returned null.`);
        }
        break;

      case 'curator_validate_business_data':
        if (!payload.businessData) {
          throw { message: 'Missing "businessData" in payload for validate_business_data task.', statusCode: 400 };
        }
        // Ensure businessData structure matches BusinessForValidation if possible, or cast
        responseData = dataQualityAnalyzer.validateBusinessProfile(payload.businessData as BusinessForValidation);
        break;

      // Example of how to add more tasks for BusinessDataAPI directly if needed
      case 'curator_get_company_info': // Using Clearbit via BusinessDataAPI
        if (!payload.domain) {
            throw { message: 'Missing "domain" in payload for get_company_info task.', statusCode: 400 };
        }
        responseData = await businessDataAPI.getCompanyInfo(payload.domain);
        break;

      case 'curator_fetch_company_news': // Using NewsAPI via BusinessDataAPI
        if (!payload.companyName) {
            throw { message: 'Missing "companyName" in payload for fetch_company_news task.', statusCode: 400 };
        }
        responseData = await businessDataAPI.fetchCompanyNews(payload.companyName, payload.domain);
        break;

      default:
        throw { message: `Unknown task: ${task}`, statusCode: 400 };
    }

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`Error in Curator Agent Handler (task: ${error.task || 'unknown'}):`, error);
    const statusCode = error.statusCode || 500;
    // Ensure message is a string
    const errorMessage = typeof error.message === 'string' ? error.message :
                         (typeof error === 'string' ? error : 'An unexpected error occurred.');

    return new Response(
      JSON.stringify({ success: false, error: errorMessage, details: error.stack }), // Added details for debugging
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

console.log('Curator Agent Handler function script processed.');
