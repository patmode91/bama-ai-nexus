import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'; // For orchestrator's own logging
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';
import { mcpContextManager } from './_shared/services/mcp/MCPContextManager.ts'; // Import MCPContextManager

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

    // Initialize Supabase client for the orchestrator's own logging needs (using service role key)
    const orchestratorSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      // No user auth context needed for service role operations like logging to orchestrator_tasks
    );

    // Log the structured request
    await orchestratorSupabaseClient
      .from('orchestrator_tasks')
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

    let resultData;
    
    try {
      // Ensure session exists in MCPContextManager for tasks that might need it
      // This is a server-side in-memory manager, so it's fresh for each orchestrator invocation
      // unless it's adapted to persist/load state from DB (outside current scope).
      // For BamaBot chat, we explicitly manage session creation/retrieval in its handler.

      // Route based on task prefix or main task category
      if (task.startsWith('connector_')) {
        resultData = await handleConnectorAgent(task, payload, clientContext, orchestratorSupabaseClient);
      } else if (task.startsWith('analyst_')) {
        resultData = await handleAnalystAgent(task, payload, clientContext, orchestratorSupabaseClient);
      } else if (task.startsWith('curator_')) {
        resultData = await handleCuratorAgent(task, payload, clientContext, orchestratorSupabaseClient);
      } else if (task === 'bamabot_chat_interaction' && payload.queryText) {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        // Pass sessionId and userId to handleBamaBotChat for context management
        resultData = await handleBamaBotChat(sessionId, userId, payload, clientContext, model);
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
      await orchestratorSupabaseClient // Use the initialized client
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
      await orchestratorSupabaseClient // Use the initialized client
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
  sessionId: string, // Added sessionId
  userId: string | undefined, // Added userId
  payload: Record<string, any>,
  clientContext: Record<string, any>,
  model: any // Gemini model instance
) {
  const { queryText } = payload; // chatHistory is no longer sent from client
  const orchestratorSupabaseClient = createClient( // Client for invoking other functions
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Ensure session exists or create it in MCPContextManager
  let session = mcpContextManager.getSessionContext(sessionId);
  if (!session) {
    console.log(`handleBamaBotChat: Session ${sessionId} not found. Creating.`);
    mcpContextManager.createSession(userId, sessionId);
  } else {
    console.log(`handleBamaBotChat: Session ${sessionId} found.`);
  }

  // Retrieve chat history from MCPContextManager
  const chatHistoryString = mcpContextManager.getChatHistoryForLLM(sessionId, 5);

  // Save user's current message to context
  mcpContextManager.addContext(sessionId, {
    source: 'user',
    intent: 'user_query',
    chat_message_text: queryText,
    entities: { queryTextFromUser: queryText },
    metadata: { timestamp: new Date().toISOString(), clientType: clientContext?.clientType },
    ...(userId && { userId }),
  });

  // Refined prompt for better entity extraction for agent tasks
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
    "industry": "string | null (e.g., 'Healthcare AI', 'Fintech')",
    "location": "string | null (e.g., 'Birmingham, AL', 'Huntsville')",
    "company_name": "string | null (e.g., 'BioTech Solutions Inc.')",
    "search_terms": "string[] | null (general keywords from query)",
    "query_text_for_semantic_search": "string | null (optimized phrase for semantic search if applicable)",
    "target_business_id": "string | null (ID of a business if mentioned or implied for specific action)",
    "target_business_domain": "string | null (domain of a business, e.g. for enrichment)",
    "bls_series_id": "string | null (e.g., 'LNS14000000' for BLS data)",
    "census_dataset": "string | null (e.g., '2020/dec/pl' for Census)",
    "census_params": "Record<string, string> | null (parameters for Census API)",
    "trend_analysis_type": "'movingAverage' | 'linearRegression' | null",
    "risk_assessment_target": "business_object | null (if enough info to construct one for risk assessment)",
    "validation_data": "business_object | null (full or partial business data for validation)"
    // Add other specific entities your agent tasks might need
  },
  "suggested_next_task": "string (e.g., 'connector_find_and_score_businesses', 'analyst_get_bls_data', 'curator_enrich_business_profile', 'none')",
  "confidence_score": "number (0.0 to 1.0)"
}

Possible intents: "request_business_match", "ask_market_trend", "request_company_info", "request_enrichment", "request_validation", "general_question", "greeting", "farewell", "clarification_needed", "help_suggestion", "other".
Supported suggested_next_task values:
- "connector_find_and_score_businesses": requires entities.industry, entities.location, or entities.query_text_for_semantic_search.
- "analyst_get_market_trend_analysis": requires entities.trend_analysis_type and for its payload: seriesData, analysisType. (seriesData usually comes from prior context or DB query not from user text directly)
- "analyst_get_business_risk_profile": requires entities.target_business_id (or a fully described business object in validation_data perhaps).
- "analyst_get_competitor_analysis": requires entities.target_business_id.
- "analyst_get_bls_data": requires entities.bls_series_id.
- "analyst_get_census_data": requires entities.census_dataset and entities.census_params.
- "curator_enrich_business_profile": requires entities.target_business_id or entities.target_business_domain.
- "curator_validate_business_data": requires entities.validation_data (a business object).
- "none": If no specific agent task is identified or if it's a general conversational turn.

Example:
User: "Find tech companies in Huntsville that use AI."
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
  const classificationIndex = responseText.lastIndexOf(classificationMarker);

  if (classificationIndex !== -1) {
    const textualPart = responseText.substring(0, classificationIndex).replace(/^Textual Response:\s*/im, "").trim();
    if (textualPart) textualReply = textualPart;

    const jsonString = responseText.substring(classificationIndex + classificationMarker.length).trim();
    try {
      classification = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse classification JSON from LLM:", e, "Raw JSON String:", jsonString);
      // Fallback, classification will keep its default. textualReply might still be valid.
    }
  } else {
    // If marker not found, assume the whole response is textual and intent is unclear or general.
    const trimmedResponse = responseText.replace(/^Textual Response:\s*/im, "").trim();
    if (trimmedResponse) textualReply = trimmedResponse;
    // Classification remains as default (clarification_needed or other)
  }

  // --- Intent-based Agent Task Invocation ---
  let agentTaskResponseData: any = null;
  if (classification.suggested_next_task && classification.suggested_next_task !== "none" && classification.confidence_score > 0.6) {
    const taskToPerform = classification.suggested_next_task;
    const entities = classification.entities || {};
    let agentPayload: Record<string, any> = {};
    let agentHandlerToInvoke: string | null = null;

    try {
      switch (taskToPerform) {
        case 'connector_find_and_score_businesses':
          if (entities.query_text_for_semantic_search || entities.industry || entities.location) {
            agentPayload = {
              searchCriteria: {
                queryText: entities.query_text_for_semantic_search,
                industry: entities.industry,
                location: entities.location,
                tags: entities.search_terms
              },
              limit: 5 // Default limit for BamaBot initiated searches
            };
            agentHandlerToInvoke = 'connector-agent-handler';
          } else {
            textualReply = "I can search for businesses, but I need a bit more information. What type of business or service are you looking for, and is there a specific location?";
          }
          break;

        case 'analyst_get_business_risk_profile':
          if (entities.target_business_id) { // Assuming we need an ID for this
            // We'd need to fetch the business object first, or assume target_business_id is enough.
            // For now, let's assume the analyst handler can fetch by ID if needed.
            // Or, if the LLM could provide a full business object in entities.validation_data.
            agentPayload = { targetBusinessId: entities.target_business_id /*, allBusinessesInContext: ... */ };
            // Note: allBusinessesInContext is hard to get here without another DB call.
            // This specific task might be better initiated differently or simplified.
            // For now, we'll just send what we have.
            agentHandlerToInvoke = 'analyst-agent-handler';
            textualReply = `Let me assess the risk profile for business ID ${entities.target_business_id}...`;
          } else {
            textualReply = "I can assess business risk, but I need to know which business you're interested in. Do you have a business name or ID?";
          }
          break;

        case 'curator_enrich_business_profile':
          if (entities.target_business_id || entities.target_business_domain) {
            agentPayload = {
              businessId: entities.target_business_id,
              domain: entities.target_business_domain
              // The curator_enrich_business_profile task in handler expects businessId
            };
            if (!agentPayload.businessId && agentPayload.domain) {
              // If only domain, we can't call enrich directly, this highlights a need for a findByDomain then enrich flow.
              // For now, this task is better if businessId is known.
              textualReply = `I can enrich profiles if I have a business ID. For domain ${agentPayload.domain}, I'd first need to find its ID.`;
            } else if (agentPayload.businessId) {
               agentHandlerToInvoke = 'curator-agent-handler';
               textualReply = `Let me try to enrich the profile for business ID ${agentPayload.businessId}...`;
            }
          } else {
            textualReply = "Which business profile would you like me to enrich? Please provide its ID or domain.";
          }
          break;
        // Add more cases for other suggested_next_task values based on refined LLM prompt
        // e.g., 'analyst_get_bls_data', 'curator_validate_business_data', etc.

        default:
          console.log(`BamaBot: Intent "${classification.intent}" with suggested task "${taskToPerform}" not directly actionable or entities missing. Using initial textual reply.`);
          // Use the original textualReply if no specific agent action is taken
          break;
      }

      if (agentHandlerToInvoke) {
        console.log(`Invoking ${agentHandlerToInvoke} for task ${taskToPerform} with payload:`, agentPayload);
        const { data: agentData, error: agentError } = await orchestratorSupabaseClient.functions.invoke(
          agentHandlerToInvoke,
          { body: JSON.stringify({ task: taskToPerform, payload: agentPayload, clientContext, sessionId }) }
        );

        if (agentError) {
          console.error(`Error from invoked agent ${agentHandlerToInvoke} for task ${taskToPerform}:`, agentError);
          textualReply = `I tried to process your request with one of our specialized agents, but encountered an issue: ${agentError.message}. The original BamaBot reply was: ${textualReply}`;
        } else if (agentData) {
          // Simple formatting of agent response. This needs to be more sophisticated.
          // For now, just a part of the response for demonstration.
          if (taskToPerform === 'connector_find_and_score_businesses' && agentData.data?.length > 0) {
            const businesses = agentData.data.map((b: any) => b.business.name).join(', ');
            textualReply = `Okay, I found these businesses matching your criteria: ${businesses}. Let me know if you want more details on any of them!`;
          } else if (agentData.data) { // Generic way to handle other agent responses
             textualReply = `I've processed your request. Here's a summary: ${JSON.stringify(agentData.data, null, 2).substring(0, 200)}...`;
          } else {
            textualReply = `The agent processed your request for ${taskToPerform}, but there was no specific data to return. My original thought was: ${textualReply}`;
          }
          agentTaskResponseData = agentData; // Store for context
        }
      }
    } catch (e) {
        console.error(`Error during agent task invocation logic: ${e.message}`);
        textualReply = `I encountered an issue while trying to delegate your task. My initial thought was: ${textualReply}`;
    }
  }


  // Save BamaBot's final response and original classification to context
  mcpContextManager.addContext(sessionId, {
    source: 'bamabot', // Literal as per MCPContext source types
    intent: classification.intent || 'bot_response',
    chat_message_text: textualReply,
    entities: classification.entities || {}, // Store extracted entities
    metadata: {
      llm_classification: classification, // Store the full classification object
      timestamp: new Date().toISOString(),
      clientType: clientContext?.clientType
    },
    // userId for bot response context is implicitly the session's userId if needed for filtering later
  });

  return {
    agent: 'bamabot_nlp_engine',
    textResponse: textualReply,
    classification: classification,
    // clientContext is not typically returned in the 'data' part of the response to BamaBot UI
    // debug_llm_raw_output: responseText // Keep for debugging if necessary during development
  };
}
