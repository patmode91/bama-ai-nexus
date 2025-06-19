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
      } else if (task === 'bamabot_chat_interaction' && payload.queryText) {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' }); // Ensure genAI is available
        resultData = await handleBamaBotChat(payload, clientContext, model);
      } else if (task === 'general_query' && payload.queryText) {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        resultData = await handleGeneralQuery(payload.queryText, model);
      } else {
        // Ensure statusCode is set for client errors for proper response
        const err = new Error(`Unknown or malformed task: ${task}`);
        (err as any).statusCode = 400;
        throw err;
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
  console.log(`Invoking connector-agent-handler for task: ${task}`, { payload, clientContext });

  const { data, error } = await supabase.functions.invoke('connector-agent-handler', {
    body: JSON.stringify({ task, payload, clientContext }),
    // Supabase client automatically sets Authorization header if invoking with user's context.
    // If needing service_role for the invoked function, ensure it's configured or use a dedicated client.
  });

  if (error) {
    console.error(`Error from connector-agent-handler (task: ${task}):`, error.message || error);
    const err = new Error(`Connector agent task ${task} failed: ${error.message || 'Function invocation error'}`);
    // Attempt to get status from underlying error if possible, default to 500
    (err as any).statusCode = typeof error === 'object' && error !== null && 'status' in error ? (error as any).status : 500;
    (err as any).details = typeof error === 'object' && error !== null && 'details' in error ? (error as any).details : error;
    throw err;
  }

  // The invoked function's response is expected to be in the 'data' field.
  // If the invoked function returns { success: true, data: actualResponseData }, then data.data is needed.
  // Assuming the invoked function returns the actual business data directly.
  return data;
}

async function handleAnalystAgent(
  task: string,
  payload: Record<string, any>,
  clientContext: Record<string, any>, // Added clientContext
  supabase: any
) {
  console.log(`Invoking analyst-agent-handler for task: ${task}`, { payload, clientContext });

  const { data, error } = await supabase.functions.invoke('analyst-agent-handler', {
    body: JSON.stringify({ task, payload, clientContext }),
  });

  if (error) {
    console.error(`Error from analyst-agent-handler (task: ${task}):`, error.message || error);
    const err = new Error(`Analyst agent task ${task} failed: ${error.message || 'Function invocation error'}`);
    (err as any).statusCode = typeof error === 'object' && error !== null && 'status' in error ? (error as any).status : 500;
    (err as any).details = typeof error === 'object' && error !== null && 'details' in error ? (error as any).details : error;
    throw err;
  }
  return data;
}

async function handleCuratorAgent(
  task: string,
  payload: Record<string, any>,
  clientContext: Record<string, any>, // Added clientContext
  supabase: any
) {
  console.log(`Invoking curator-agent-handler for task: ${task}`, { payload, clientContext });

  const { data, error } = await supabase.functions.invoke('curator-agent-handler', {
    body: JSON.stringify({ task, payload, clientContext }),
  });

  if (error) {
    console.error(`Error from curator-agent-handler (task: ${task}):`, error.message || error);
    const err = new Error(`Curator agent task ${task} failed: ${error.message || 'Function invocation error'}`);
    (err as any).statusCode = typeof error === 'object' && error !== null && 'status' in error ? (error as any).status : 500;
    (err as any).details = typeof error === 'object' && error !== null && 'details' in error ? (error as any).details : error;
    throw err;
  }
  return data;
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
  // Ensure the response structure is consistent if orchestrator expects a 'data' wrapper from all handlers
  // For now, handleGeneralQuery's direct response might be fine if client handles it.
  // However, for consistency with other agent handlers which return structured data:
  return {
    agent: 'general_bot',
    textResponse: await result.response.text(), // Changed 'response' to 'textResponse' for consistency
    timestamp: new Date().toISOString()
  };
}

async function handleBamaBotChat(
  payload: Record<string, any>,
  clientContext: Record<string, any>, // Contains clientType e.g. BamaBotUI
  model: any // Gemini model instance
) {
  const { queryText, chatHistory } = payload;

  // Construct a detailed prompt for intent classification and response generation
  const historyString = (chatHistory || [])
    .map((msg: { text: string; sender: string }) => `${msg.sender === 'bot' ? 'BamaBot' : 'User'}: ${msg.text}`) // Assuming sender 'bot' or 'user'
    .join('\n');

  const prompt = `
You are BamaBot, a helpful AI assistant for the BAMA AI Nexus platform.
Your goal is to understand the user's query, provide a direct and helpful textual response, AND classify the user's intent and extract key entities.

User's Current Query: "${queryText}"

Chat History (last few messages):
${historyString}

Alabama Business Ecosystem Context:
- Major hubs: Birmingham (healthcare, finance), Huntsville (aerospace, tech), Mobile (manufacturing, logistics)
- Key industries: Aerospace, Automotive, Healthcare, Technology, Manufacturing, Legal Services, Financial Services
- Growing sectors: AI/ML, Fintech, Healthtech, Defense Technology, Cybersecurity, Supply Chain Tech

Based on the user's current query and chat history:
1.  Provide a natural, conversational, and helpful textual response to the user's query. The response should be directly usable for display.
2.  After the textual response, on a new line, provide a JSON object with your classification. The JSON object must start with "Classification: {" and end with "}".

Textual Response:
[Your engaging and helpful textual response here. Answer the query or ask for clarification if needed.]

Classification:
{
  "intent": "CLASSIFIED_INTENT",
  "entities": {
    "industry": "extracted_industry_if_any (e.g., Healthcare, Aerospace, Technology)",
    "location": "extracted_location_if_any (e.g., Birmingham, Huntsville, Alabama)",
    "company_name": "extracted_company_name_if_any",
    "search_terms": ["relevant", "search", "terms", "from", "query"],
    "specific_details_requested": "e.g., contact info, recent news, risk assessment, market trends, validation status",
    "task_target": "e.g., a specific business ID if mentioned for enrichment/validation"
  },
  "suggested_next_task": "SUGGESTED_ORCHESTRATOR_TASK_IF_APPLICABLE",
  "confidence_score": 0.0
}

Possible intents: "request_business_match", "ask_market_trend", "request_company_info", "request_enrichment", "request_validation", "general_question", "greeting", "farewell", "clarification_needed", "help_suggestion", "other".
Possible suggested_next_task (align with orchestrator tasks): "connector_find_business_matches", "analyst_get_market_trend_analysis", "analyst_get_business_risk_profile", "analyst_get_competitor_analysis", "curator_enrich_business_profile", "curator_validate_business_data", "none".

Example:
User: "Hi BamaBot, can you find me tech companies in Huntsville that work with AI?"
Textual Response:
Hello! I can certainly help you with that. Huntsville is a major tech hub, especially for AI. I'll look for technology companies in Huntsville that specialize in Artificial Intelligence. One moment...
Classification:
{
  "intent": "request_business_match",
  "entities": {
    "industry": "Technology",
    "location": "Huntsville",
    "search_terms": ["tech companies", "Huntsville", "AI"],
    "specific_details_requested": null,
    "task_target": null
  },
  "suggested_next_task": "connector_find_business_matches",
  "confidence_score": 0.9
}

Ensure the JSON is well-formed and directly parsable.
`;

  const rawLLMResponse = await model.generateContent(prompt);
  const responseText = await rawLLMResponse.response.text();

  let textualReply = "I'm having a little trouble understanding that. Could you try rephrasing your request?";
  let classification = { intent: "clarification_needed", entities: {}, confidence_score: 0.2, suggested_next_task: "none" };

  const classificationMarker = "Classification:";
  // Use lastIndexOf in case the textual response itself contains the word "Classification:"
  const classificationIndex = responseText.lastIndexOf(classificationMarker);

  if (classificationIndex !== -1) {
    const textualPart = responseText.substring(0, classificationIndex).replace(/^Textual Response:\s*/im, "").trim();
    if (textualPart) textualReply = textualPart; // Use LLM response only if non-empty

    const jsonString = responseText.substring(classificationIndex + classificationMarker.length).trim();
    try {
      classification = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse classification JSON from LLM:", e, "JSON String was:", jsonString);
      // Keep default classification, textualReply might still be useful
    }
  } else {
    // If marker not found, assume the whole response is textual and intent is unclear
    const trimmedResponse = responseText.replace(/^Textual Response:\s*/im, "").trim();
    if (trimmedResponse) textualReply = trimmedResponse;
  }

  return {
    agent: 'bamabot_nlp_engine',
    textResponse: textualReply,
    classification: classification,
    clientContext: clientContext, // Echo back client context if needed
    debug_llm_raw_output: responseText // For debugging purposes
  };
}
