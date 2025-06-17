import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';

// Redefined for more specific task-based orchestration
export interface OrchestratorRequest { // Added export for potential use in client
  sessionId: string;
  userId?: string; // Optional if system-generated session or task
  task: string; // e.g., 'analyst_get_trend_analysis', 'curator_enrich_business_profile'
  payload: Record<string, any>; // Task-specific parameters
  clientContext?: Record<string, any>; // Broader client context if needed (e.g. user prefs)
}

export interface OrchestratorResponse { // Added export
  success: boolean;
  data?: any;
  error?: string;
  sessionId?: string; // SessionId might not always be relevant for error responses before session is known
  taskId?: string; // Optional: could be same as task, or a unique ID for this execution
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
    const requestData = await req.json() as OrchestratorRequest; // Type assertion
    const { sessionId, userId, task, payload, clientContext = {} } = requestData;

    // Validate essential parameters early
    if (!sessionId || !task || typeof payload !== 'object' || payload === null) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing or invalid required fields: sessionId, task, or payload must be an object.',
          timestamp: new Date().toISOString(),
        } as OrchestratorResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

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
    // Log the structured request
    // Consider a different table or modifying 'agent_requests' structure for these task-based invocations
    await supabaseClient
      .from('orchestrator_tasks') // New table for structured tasks
      .insert([
        {
          session_id: sessionId,
          user_id: userId,
          task_name: task,
          payload: payload,
          client_context: clientContext,
          status: 'processing'
        },
      ]);

    let resultData; // To store the data returned by the agent handlers
    
    try {
      // Route based on task prefix or main task category
      // The Gemini model is now passed to handlers that might need it (e.g. general query)
      if (task.startsWith('connector_')) {
        resultData = await handleConnectorAgent(task, payload, clientContext, supabaseClient);
      } else if (task.startsWith('analyst_')) {
        resultData = await handleAnalystAgent(task, payload, clientContext, supabaseClient);
      } else if (task.startsWith('curator_')) {
        resultData = await handleCuratorAgent(task, payload, clientContext, supabaseClient);
      } else if (task === 'general_query' && payload.queryText) {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        resultData = await handleGeneralQuery(payload.queryText, model);
      } else {
        throw new Error(`Unknown or malformed task: ${task}`);
      }
      
      // Log successful response
      await supabaseClient
        .from('orchestrator_tasks')
        .update({ status: 'completed', response_data: resultData }) // Storing structured result
        .eq('session_id', sessionId).eq('task_name', task); // More specific update

      return new Response(
        JSON.stringify({
          success: true,
          data: resultData,
          sessionId,
          taskId: task,
          timestamp: new Date().toISOString(),
        } as OrchestratorResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
      
    } catch (agentError) { // Catch errors from agent handlers or task routing
      console.error('Agent/Task processing error:', agentError);
      await supabaseClient
        .from('orchestrator_tasks')
        .update({ 
          status: 'error', 
          error_details: agentError.message || 'Unknown error during agent processing'
        })
        .eq('session_id', sessionId).eq('task_name', task);

      return new Response(
        JSON.stringify({
          success: false,
          error: agentError.message || 'Failed to process task via agent',
          sessionId,
          taskId: task,
          timestamp: new Date().toISOString(),
        } as OrchestratorResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          // Use a property like 'statusCode' from the error if available, otherwise default to 500 or 400
          status: (agentError as any).statusCode || 500,
        }
      );
    }
    
  } catch (requestError) { // Catch errors like invalid JSON payload before Supabase client is initialized
    console.error('Initial request processing error:', requestError);
    return new Response(
      JSON.stringify({
        success: false,
        error: requestError.message || 'Internal server error processing request',
        // sessionId might not be available here if requestData parsing failed
        timestamp: new Date().toISOString(),
      } as OrchestratorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: (requestError as any).statusCode || 500,
      }
    );
  }
});

// Agent Handlers - These will now primarily use supabase.functions.invoke
// The 'model' parameter (Gemini) is removed unless a specific handler still needs direct LLM access for a sub-task.

async function handleConnectorAgent(
  task: string,
  payload: Record<string, any>,
  clientContext: Record<string, any>, // Added clientContext
  supabase: any // Supabase client for invoking functions
) {
  console.log(`Connector Agent handling task: ${task}`, {payload, clientContext} );
  // Example: If task is 'connector_find_business_matches'
  if (task === 'connector_find_business_matches') {
    // This is where you would invoke another Supabase Function for the Connector Agent's specific task
    // const { data, error } = await supabase.functions.invoke('connector-agent-main', {
    //   body: { taskAction: task, payload, clientContext }, // Pass task, payload, context
    // });
    // if (error) throw new Error(`Error invoking connector agent: ${error.message}`, { cause: error });
    // return data;

    // Mock response for now, as the actual agent functions are not created in this step
    return {
      agent: 'connector',
      taskPerformed: task, // Echo back the task
      status: 'mock_success_connector',
      message: 'Connector agent task for finding matches would be invoked here.',
      data: { matches: [{ id: '123', name: 'Mock Business Match', score: 0.9, ...payload }] },
      timestamp: new Date().toISOString()
    };
  }
  // Add more specific connector tasks here
  // else if (task === 'connector_get_business_details') { ... }
  
  const err = new Error(`Unknown connector task: ${task}`);
  (err as any).statusCode = 400; // Bad request if task is unknown
  throw err;
}

async function handleAnalystAgent(
  task: string,
  payload: Record<string, any>,
  clientContext: Record<string, any>, // Added clientContext
  supabase: any
) {
  console.log(`Analyst Agent handling task: ${task}`, {payload, clientContext});
  let functionToInvoke = '';
  switch (task) {
    case 'analyst_get_trend_analysis':
      functionToInvoke = 'analyst-perform-trend-analysis'; // Hypothetical function name
      break;
    case 'analyst_get_business_risk_profile':
      functionToInvoke = 'analyst-assess-business-risk';
      break;
    case 'analyst_get_competitor_analysis':
      functionToInvoke = 'analyst-identify-competitors';
      break;
    // Add more cases for other analyst tasks
    default:
      const err = new Error(`Unknown analyst task: ${task}`);
      (err as any).statusCode = 400;
      throw err;
  }

  // const { data, error } = await supabase.functions.invoke(functionToInvoke, {
  //    body: { taskAction: task, payload, clientContext },
  // });
  // if (error) throw new Error(`Error invoking analyst agent task ${task}: ${error.message}`, { cause: error });
  // return data;

  // Mock response for now
  let mockData: any = { taskSpecificPayload: payload };
  if (task === 'analyst_get_trend_analysis') {
    mockData = { ...mockData, trendType: payload.analysisType, dataPointsCount: payload.seriesData?.length, trend: "stable (mock)" };
  } else if (task === 'analyst_get_business_risk_profile') {
    mockData = { ...mockData, businessId: payload.targetBusinessId, riskLevel: "low (mock)" };
  } else if (task === 'analyst_get_competitor_analysis') {
    mockData = { ...mockData, businessId: payload.targetBusinessId, competitors: ["MockCompA", "MockCompB"] };
  }

  return {
    agent: 'analyst',
    taskPerformed: task,
    status: 'mock_success_analyst',
    message: `Analyst agent task for ${task} would be invoked here (function: ${functionToInvoke}).`,
    data: mockData,
    timestamp: new Date().toISOString()
  };
}

async function handleCuratorAgent(
  task: string,
  payload: Record<string, any>,
  clientContext: Record<string, any>, // Added clientContext
  supabase: any
) {
  console.log(`Curator Agent handling task: ${task}`, {payload, clientContext});
  let functionToInvoke = '';
  switch (task) {
    case 'curator_enrich_business_profile':
      functionToInvoke = 'curator-enrich-profile'; // Hypothetical function name
      break;
    case 'curator_validate_business_data':
      functionToInvoke = 'curator-validate-data';
      break;
    // Add more cases for other curator tasks
    default:
      const err = new Error(`Unknown curator task: ${task}`);
      (err as any).statusCode = 400;
      throw err;
  }
  
  // const { data, error } = await supabase.functions.invoke(functionToInvoke, {
  //    body: { taskAction: task, payload, clientContext },
  // });
  // if (error) throw new Error(`Error invoking curator agent task ${task}: ${error.message}`, { cause: error });
  // return data;
  
  // Mock response for now
  let mockData: any = { taskSpecificPayload: payload };
   if (task === 'curator_enrich_business_profile') {
    mockData = { ...mockData, businessId: payload.businessId, enrichedFieldsCount: 3 };
  } else if (task === 'curator_validate_business_data') {
    mockData = { ...mockData, businessId: payload.businessData?.id, validationStatus: "passed (mock)", issuesCount: 0 };
  }
  
  return {
    agent: 'curator',
    taskPerformed: task,
    status: 'mock_success_curator',
    message: `Curator agent task for ${task} would be invoked here (function: ${functionToInvoke}).`,
    data: mockData,
    timestamp: new Date().toISOString()
  };
}

async function handleGeneralQuery(
  queryText: string, // Now expects just the query text directly
  model: any // Gemini model
) {
  console.log(`Handling general query: ${queryText}`);
  // This function remains as a direct LLM call for general queries
  const prompt = `You are BamaBot, a helpful AI assistant for the BAMA AI Nexus platform.
  User query: "${queryText}"
  Provide a helpful and informative response.`;
  
  const result = await model.generateContent(prompt);
  return {
    agent: 'general_bot', // Renamed for clarity
    response: await result.response.text(), // Keep original response structure for this one
    timestamp: new Date().toISOString()
  };
}
