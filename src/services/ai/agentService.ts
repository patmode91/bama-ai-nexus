
import { supabase } from '@/integrations/supabase/client';

export interface AgentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  sessionId: string;
  timestamp: string;
}

class AgentService {
  private sessionId: string;

  constructor() {
    this.sessionId = crypto.randomUUID();
  }

  getSessionId(): string {
    return this.sessionId;
  }

  async queryAgent(query: string, context: Record<string, any> = {}): Promise<AgentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-orchestrator', {
        body: {
          agent: 'general',
          action: 'query',
          query,
          context
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Agent service error:', error);
      throw error;
    }
  }

  async findBusinesses(query: string, context: Record<string, any> = {}): Promise<AgentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-orchestrator', {
        body: {
          agent: 'connector',
          action: 'find_matches',
          query,
          context
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Connector agent error:', error);
      throw error;
    }
  }

  async analyzeMarket(query: string, context: Record<string, any> = {}): Promise<AgentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-orchestrator', {
        body: {
          agent: 'analyst',
          action: 'market_analysis',
          query,
          context
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Analyst agent error:', error);
      throw error;
    }
  }

  async enrichBusiness(businessId: number, context: Record<string, any> = {}): Promise<AgentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-orchestrator', {
        body: {
          agent: 'curator',
          action: 'enrich_data',
          businessId,
          context
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Curator agent error:', error);
      throw error;
    }
  }

  async addBusiness(business: {
    id: number;
    name: string;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<AgentResponse> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          businessname: business.name,
          description: business.description,
          // Add other required fields with defaults
          category: 'Technology',
          location: 'Alabama',
          verified: false,
          rating: 0.0
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Add business error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add business',
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const agentService = new AgentService();
