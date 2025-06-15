
import { supabase } from '@/integrations/supabase/client';

export interface MCPContext {
  id: string;
  sessionId: string;
  userId?: string;
  intent: string;
  entities: Record<string, any>;
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

export interface MCPSession {
  id: string;
  userId?: string;
  contexts: MCPContext[];
  createdAt: Date;
  lastActivity: Date;
  status: 'active' | 'completed' | 'expired';
}

class MCPContextManager {
  private sessions: Map<string, MCPSession> = new Map();
  private static instance: MCPContextManager;

  static getInstance(): MCPContextManager {
    if (!MCPContextManager.instance) {
      MCPContextManager.instance = new MCPContextManager();
    }
    return MCPContextManager.instance;
  }

  // Create a new session
  createSession(userId?: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: MCPSession = {
      id: sessionId,
      userId,
      contexts: [],
      createdAt: new Date(),
      lastActivity: new Date(),
      status: 'active'
    };
    
    this.sessions.set(sessionId, session);
    return sessionId;
  }

  // Add context to a session
  addContext(sessionId: string, context: Omit<MCPContext, 'id' | 'sessionId' | 'timestamp'>): MCPContext {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const fullContext: MCPContext = {
      ...context,
      id: `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      timestamp: new Date()
    };

    session.contexts.push(fullContext);
    session.lastActivity = new Date();
    
    // Broadcast context update
    this.broadcastContextUpdate(sessionId, fullContext);
    
    return fullContext;
  }

  // Get session context
  getSessionContext(sessionId: string): MCPSession | null {
    return this.sessions.get(sessionId) || null;
  }

  // Get latest context by type
  getLatestContext(sessionId: string, source?: string): MCPContext | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const contexts = source 
      ? session.contexts.filter(ctx => ctx.source === source)
      : session.contexts;

    return contexts.length > 0 ? contexts[contexts.length - 1] : null;
  }

  // Extract relevant context for agent
  getContextForAgent(sessionId: string, agentType: 'connector' | 'curator' | 'analyst'): MCPContext[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    // Return contexts that would be relevant for the specific agent
    return session.contexts.filter(ctx => {
      switch (agentType) {
        case 'connector':
          return ctx.intent || ctx.industry || ctx.businessType || ctx.requirements;
        case 'curator':
          return ctx.entities || ctx.industry || ctx.businessType;
        case 'analyst':
          return ctx.industry || ctx.location || ctx.budget;
        default:
          return true;
      }
    });
  }

  // Merge contexts from different sources
  mergeContexts(sessionId: string): MCPContext {
    const session = this.sessions.get(sessionId);
    if (!session || session.contexts.length === 0) {
      throw new Error('No contexts to merge');
    }

    const merged: MCPContext = {
      id: `merged_${Date.now()}`,
      sessionId,
      userId: session.userId,
      intent: '',
      entities: {},
      metadata: {},
      timestamp: new Date(),
      source: 'user'
    };

    // Merge all contexts
    session.contexts.forEach(ctx => {
      merged.intent = merged.intent || ctx.intent;
      merged.industry = merged.industry || ctx.industry;
      merged.businessType = merged.businessType || ctx.businessType;
      merged.location = merged.location || ctx.location;
      merged.budget = merged.budget || ctx.budget;
      merged.timeline = merged.timeline || ctx.timeline;
      merged.requirements = [...(merged.requirements || []), ...(ctx.requirements || [])];
      
      // Merge entities and metadata
      merged.entities = { ...merged.entities, ...ctx.entities };
      merged.metadata = { ...merged.metadata, ...ctx.metadata };
    });

    return merged;
  }

  // Broadcast context updates via Supabase realtime
  private async broadcastContextUpdate(sessionId: string, context: MCPContext) {
    const channel = supabase.channel(`mcp_session_${sessionId}`);
    await channel.send({
      type: 'broadcast',
      event: 'context_update',
      payload: { context, sessionId }
    });
  }

  // Subscribe to context updates
  subscribeToSession(sessionId: string, callback: (context: MCPContext) => void) {
    const channel = supabase
      .channel(`mcp_session_${sessionId}`)
      .on('broadcast', { event: 'context_update' }, (payload) => {
        callback(payload.payload.context);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Clean up expired sessions
  cleanupSessions() {
    const now = new Date();
    const expirationTime = 24 * 60 * 60 * 1000; // 24 hours

    this.sessions.forEach((session, sessionId) => {
      if (now.getTime() - session.lastActivity.getTime() > expirationTime) {
        this.sessions.delete(sessionId);
      }
    });
  }
}

export const mcpContextManager = MCPContextManager.getInstance();
