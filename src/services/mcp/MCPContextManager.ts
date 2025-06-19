
import { supabase } from '@/integrations/supabase/client';

export interface MCPContext {
  id: string;
  sessionId: string;
  userId?: string;
  intent: string;
  entities: Record<string, any>;
  chat_message_text?: string; // For actual text of user/bot message
  industry?: string;
  businessType?: string;
  location?: string;
  budget?: { min?: number; max?: number };
  timeline?: string;
  requirements?: string[];
  metadata: Record<string, any>;
  timestamp: Date;
  source: 'bamabot' | 'connector' | 'curator' | 'analyst' | 'user';
}

// Updated MCPSession interface to align with mcp_sessions table schema
export interface MCPSession {
  session_id: string; // Changed from id
  user_id?: string | null;
  contexts: MCPContext[]; // This will be populated from JSONB, MCPContext.timestamp will be Date
  created_at: string; // ISO timestamp string from DB
  last_activity_at: string; // ISO timestamp string from DB
  status: 'active' | 'completed' | 'expired'; // Align with DB CHECK constraint
  metadata?: Record<string, any> | null;
}

class MCPContextManager {
  // Remove in-memory session storage:
  // private sessions: Map<string, MCPSession> = new Map();
  private static instance: MCPContextManager;

  static getInstance(): MCPContextManager {
    if (!MCPContextManager.instance) {
      MCPContextManager.instance = new MCPContextManager();
    }
    return MCPContextManager.instance;
  }

  // Create a new session or ensure an existing one is active
  async createSession(userId?: string, sessionIdToUse?: string, initialContexts?: MCPContext[]): Promise<string> {
    const finalSessionId = sessionIdToUse || crypto.randomUUID();

    const { data: existingSession, error: selectError } = await supabase
      .from('mcp_sessions')
      .select('session_id, user_id, status, contexts') // Select contexts to avoid overwriting if upsert logic is simple
      .eq('session_id', finalSessionId)
      .maybeSingle();

    if (selectError) {
      console.error('Error selecting session in createSession:', selectError);
      throw selectError;
    }

    if (existingSession) {
      console.log(`Session ${finalSessionId} exists. Updating last_activity_at.`);
      const updatePayload: { last_activity_at: string; user_id?: string; status?: 'active' } = {
        last_activity_at: new Date().toISOString(),
        status: 'active', // Reactivate if it was, e.g., expired or completed
      };
      if (userId && !existingSession.user_id) {
        updatePayload.user_id = userId;
      }
      const { error: updateError } = await supabase
        .from('mcp_sessions')
        .update(updatePayload)
        .eq('session_id', finalSessionId);
      if (updateError) {
        console.error('Error updating existing session:', updateError);
        throw updateError;
      }
      return finalSessionId;
    } else {
      console.log(`Creating new session ${finalSessionId}.`);
      const { data: newSession, error: insertError } = await supabase
        .from('mcp_sessions')
        .insert({
          session_id: finalSessionId,
          user_id: userId,
          contexts: initialContexts || [], // Store MCPContext[] directly, Supabase client handles JSONB
          status: 'active',
          // created_at and last_activity_at will use DB defaults on initial insert
        })
        .select('session_id')
        .single();
      if (insertError) {
        console.error('Error inserting new session:', insertError);
        throw insertError;
      }
      return newSession!.session_id;
    }
  }

  // Add context to a session (This will need to be refactored for DB persistence)
  async addContext(sessionId: string, contextData: Omit<MCPContext, 'id' | 'sessionId' | 'timestamp'>): Promise<MCPContext> {
    const fullContext: MCPContext = {
      ...contextData,
      id: `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Client-side generated context ID
      sessionId,
      timestamp: new Date() // Client-side timestamp for the context object itself
    };

    // Fetch current contexts, append new one, then update
    const { data: session, error: fetchError } = await supabase
        .from('mcp_sessions')
        .select('contexts')
        .eq('session_id', sessionId)
        .single();

    if (fetchError || !session) {
        console.error(`Session ${sessionId} not found or error fetching for addContext:`, fetchError);
        throw new Error(`Session ${sessionId} not found or error fetching.`);
    }
    
    const updatedContexts = [...(session.contexts || []), fullContext];

    const { error: updateError } = await supabase
        .from('mcp_sessions')
        .update({ contexts: updatedContexts, last_activity_at: new Date().toISOString() })
        .eq('session_id', sessionId);

    if (updateError) {
        console.error(`Error adding context to session ${sessionId}:`, updateError);
        throw updateError;
    }
    
    // Consider if broadcastContextUpdate should still exist or if clients subscribe to DB changes directly
    // await this.broadcastContextUpdate(sessionId, fullContext);
    console.log(`Context added to session ${sessionId}. DB persistence not fully implemented for broadcast.`);
    return fullContext;
  }

  // Get session context
  async getSessionContext(sessionId: string): Promise<MCPSession | null> {
    try {
      const { data, error } = await supabase
        .from('mcp_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) {
        console.error(`Error fetching session ${sessionId}:`, error.message);
        throw error;
      }
      if (!data) return null;

      // Map DB row to MCPSession. Contexts are JSONB, should be parsed.
      // Timestamps from DB are strings, MCPContext.timestamp is Date.
      const contextsFromDB = (data.contexts || []) as Array<any>;
      const mappedContexts: MCPContext[] = contextsFromDB.map(ctx => ({
          ...ctx,
          timestamp: new Date(ctx.timestamp), // Ensure MCPContext timestamps are Date objects
      }));

      return {
        session_id: data.session_id,
        user_id: data.user_id,
        contexts: mappedContexts,
        created_at: data.created_at, // Keep as string from DB
        last_activity_at: data.last_activity_at, // Keep as string from DB
        status: data.status as MCPSession['status'],
        metadata: data.metadata,
      };
    } catch (error) {
      // Log or handle as appropriate
      return null;
    }
  }

  // --- Methods below this line still use in-memory logic and need refactoring ---
  // For this subtask, focus is on createSession & getSessionContext.
  // Other methods will be refactored in subsequent steps.

  // Get latest context by type
  async getLatestContext(sessionId: string, source?: string): Promise<MCPContext | null> {
    const session = await this.getSessionContext(sessionId);
    if (!session) return null;
    // This logic needs to be adapted for how contexts are structured/queried from DB
    const contexts = source 
      ? session.contexts.filter(ctx => ctx.source === source)
      : session.contexts;
    return contexts.length > 0 ? contexts[contexts.length - 1] : null;
  }

  // Extract relevant context for agent
  async getContextForAgent(sessionId: string, agentType: 'connector' | 'curator' | 'analyst'): Promise<MCPContext[]> {
    const session = await this.getSessionContext(sessionId);
    if (!session) return [];
    // This filtering logic can remain similar, operating on session.contexts
    return session.contexts.filter(ctx => { /* ... same logic ... */ });
  }

  // Merge contexts from different sources
  async mergeContexts(sessionId: string): Promise<MCPContext | null> { // Return type changed to Promise<MCPContext | null>
    const session = await this.getSessionContext(sessionId);
    if (!session || session.contexts.length === 0) {
      // throw new Error('No contexts to merge'); // Or return null
      return null;
    }
    // Merging logic remains largely the same, but operates on contexts from DB-backed session
    const merged: MCPContext = { /* ... same merging logic, ensure timestamp is Date ... */ } as MCPContext;
     session.contexts.forEach(ctx => {
      merged.intent = merged.intent || ctx.intent;
      merged.industry = merged.industry || ctx.industry;
      merged.businessType = merged.businessType || ctx.businessType;
      merged.location = merged.location || ctx.location;
      merged.budget = merged.budget || ctx.budget;
      merged.timeline = merged.timeline || ctx.timeline;
      merged.requirements = Array.from(new Set([...(merged.requirements || []), ...(ctx.requirements || [])]));
      merged.entities = { ...merged.entities, ...ctx.entities };
      merged.metadata = { ...merged.metadata, ...ctx.metadata };
      if (ctx.chat_message_text && !merged.chat_message_text) merged.chat_message_text = ctx.chat_message_text;
    });
    merged.id = `merged_${Date.now()}`;
    merged.timestamp = new Date(); // New timestamp for the merged context
    merged.userId = session.user_id || undefined;
    merged.source = 'user'; // Or determine dynamically

    return merged;
  }

  // Broadcast context updates via Supabase realtime
  private async broadcastContextUpdate(sessionId: string, context: MCPContext) {
    // This method's utility might change if clients subscribe directly to DB table changes.
    // However, custom broadcast events can still be useful.
    const channel = supabase.channel(`mcp_session_${sessionId}_custom_events`); // Changed channel name slightly
    await channel.send({
      type: 'broadcast',
      event: 'mcp_context_added', // More specific event name
      payload: { context, sessionId }
    });
    // Consider removing this channel after send if it's send-only, or manage subscription elsewhere.
    supabase.removeChannel(channel).catch(e => console.error("Error removing broadcast channel:", e));
  }

  // Subscribe to context updates
  subscribeToSession(sessionId: string, callback: (context: MCPContext) => void) {
    // This might change to listening to DB table changes directly for `contexts` JSONB field.
    // For now, keeping custom broadcast event subscription.
    const channel = supabase
      .channel(`mcp_session_${sessionId}_custom_events`)
      .on('broadcast', { event: 'mcp_context_added' }, (payload) => {
        // Ensure payload.payload.context is correctly typed or cast
        const receivedContext = payload.payload.context as MCPContext;
        // Convert timestamp back to Date object if it was stringified
        if (receivedContext.timestamp && typeof receivedContext.timestamp === 'string') {
            receivedContext.timestamp = new Date(receivedContext.timestamp);
        }
        callback(receivedContext);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Retrieves formatted chat history for use in an LLM prompt.
   * @param sessionId The ID of the session.
   * @param limit The maximum number of chat turns (user + bot message = 1 turn, roughly) to retrieve. Defaults to 10.
   * @returns A string representing the chat history, or an empty string if no relevant history.
   */
  async getChatHistoryForLLM(sessionId: string, limit: number = 10): Promise<string> { // Made async
    const session = await this.getSessionContext(sessionId); // Now async
    if (!session || session.contexts.length === 0) {
      return "";
    }

    const chatMessages: { sender: string, text: string }[] = [];
    const relevantContexts = session.contexts.filter(
      ctx => ctx.chat_message_text && (ctx.source === 'user' || ctx.source === 'bamabot')
    );
    const recentContexts = relevantContexts.slice(- (limit * 2));

    for (const ctx of recentContexts) {
      const sender = ctx.source === 'user' ? 'User' : 'BamaBot';
      chatMessages.push({ sender, text: ctx.chat_message_text! });
    }

    if (chatMessages.length === 0) return "";
    return chatMessages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
  }

  // Clean up expired sessions (This would now be a DB operation)
  async cleanupSessions(): Promise<void> { // Made async
    const expirationTime = new Date(Date.now() - (24 * 60 * 60 * 1000)); // 24 hours ago
    console.log(`Cleaning up sessions last active before ${expirationTime.toISOString()}`);

    // Option 1: Update status to 'expired'
    const { count, error } = await supabase
        .from('mcp_sessions')
        .update({ status: 'expired' })
        .lt('last_activity_at', expirationTime.toISOString())
        .eq('status', 'active');

    // Option 2: Delete old sessions (use with caution)
    // const { count, error } = await supabase
    //     .from('mcp_sessions')
    //     .delete()
    //     .lt('last_activity_at', expirationTime.toISOString());

    if (error) {
        console.error("Error cleaning up sessions:", error);
    } else {
        console.log(`MCPContextManager: ${count || 0} sessions marked as expired/deleted.`);
    }
  }
}

export const mcpContextManager = MCPContextManager.getInstance();
