import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';

interface AgentRequest {
  sessionId: string;
  userId: string;
  query: string;
  context?: Record<string, any>;
}

interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  sessionId: string;
  timestamp: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_AI_API_KEY') || '');

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestData: AgentRequest = await req.json();
    const { sessionId, userId, query, context = {} } = requestData;

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Log the request
    await supabaseClient
      .from('agent_requests')
      .insert([
        {
          session_id: sessionId,
          user_id: userId,
          query,
          context,
          status: 'processing'
        },
      ]);

    // Route the request to the appropriate agent based on the query
    let result;
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    try {
      // First, classify the intent of the query
      const intentPrompt = `Classify the following user query into one of these categories: 
      - business_search: For finding or discovering businesses
      - market_analysis: For market trends, analysis, or insights
      - data_enrichment: For enriching or validating business data
      - general: For general questions or support
      
      Query: "${query}"
      
      Respond with only the category name.`;
      
      const intentResult = await model.generateContent(intentPrompt);
      const intent = (await intentResult.response.text()).trim().toLowerCase();
      
      // Route based on intent
      switch (intent) {
        case 'business_search':
          result = await handleConnectorAgent(query, context, model, supabaseClient);
          break;
          
        case 'market_analysis':
          result = await handleAnalystAgent(query, context, model, supabaseClient);
          break;
          
        case 'data_enrichment':
          result = await handleCuratorAgent(query, context, model, supabaseClient);
          break;
          
        default:
          result = await handleGeneralQuery(query, model);
      }
      
      // Log successful response
      await supabaseClient
        .from('agent_requests')
        .update({ status: 'completed', response: result })
        .eq('session_id', sessionId);

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
          sessionId,
          timestamp: new Date().toISOString(),
        } as AgentResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
      
    } catch (error) {
      console.error('Agent processing error:', error);
      
      // Log the error
      await supabaseClient
        .from('agent_requests')
        .update({ 
          status: 'error', 
          error: error.message || 'Unknown error occurred' 
        })
        .eq('session_id', sessionId);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to process request',
          sessionId,
          timestamp: new Date().toISOString(),
        } as AgentResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      } as AgentResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Agent Handlers
async function handleConnectorAgent(
  query: string, 
  context: Record<string, any>,
  model: any,
  supabase: any
) {
  // Implement business search and matching logic
  const prompt = `You are The Connector, an AI that helps find and match businesses.
  
  User query: "${query}"
  Context: ${JSON.stringify(context, null, 2)}
  
  Generate a structured response with business matches and recommendations.`;
  
  const result = await model.generateContent(prompt);
  return {
    agent: 'connector',
    response: await result.response.text(),
    timestamp: new Date().toISOString()
  };
}

async function handleAnalystAgent(
  query: string, 
  context: Record<string, any>,
  model: any,
  supabase: any
) {
  // Implement market analysis logic
  const prompt = `You are The Analyst, an AI that provides market intelligence and insights.
  
  User query: "${query}"
  Context: ${JSON.stringify(context, null, 2)}
  
  Generate a detailed market analysis based on the query.`;
  
  const result = await model.generateContent(prompt);
  return {
    agent: 'analyst',
    response: await result.response.text(),
    timestamp: new Date().toISOString()
  };
}

async function handleCuratorAgent(
  query: string, 
  context: Record<string, any>,
  model: any,
  supabase: any
) {
  // Implement data enrichment logic
  const prompt = `You are The Curator, an AI that enriches and validates business data.
  
  User query: "${query}"
  Context: ${JSON.stringify(context, null, 2)}
  
  Provide enriched business information and data validation.`;
  
  const result = await model.generateContent(prompt);
  return {
    agent: 'curator',
    response: await result.response.text(),
    timestamp: new Date().toISOString()
  };
}

async function handleGeneralQuery(
  query: string,
  model: any
) {
  // Handle general queries
  const prompt = `You are BamaBot, a helpful AI assistant for the BAMA AI Nexus platform.
  
  User query: "${query}"
  
  Provide a helpful and informative response.`;
  
  const result = await model.generateContent(prompt);
  return {
    agent: 'general',
    response: await result.response.text(),
    timestamp: new Date().toISOString()
  };
}
