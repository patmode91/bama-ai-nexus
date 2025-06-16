import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AgentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  sessionId: string;
  timestamp: string;
}

class AgentService {
  private sessionId: string;
  
  constructor() {
    // Generate a session ID if it doesn't exist in sessionStorage
    this.sessionId = sessionStorage.getItem('agentSessionId') || uuidv4();
    sessionStorage.setItem('agentSessionId', this.sessionId);
  }

  private async callAgent<T = any>(
    endpoint: string,
    payload: Record<string, any>
  ): Promise<AgentResponse<T>> {
    try {
      // Get the current user ID if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          ...payload,
          sessionId: this.sessionId,
          userId: user?.id || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to call agent');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error calling ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Connector Agent Methods
  async findBusinesses(query: string, filters: Record<string, any> = {}) {
    return this.callAgent('ai-agent-orchestrator', {
      query,
      context: { 
        intent: 'business_search', 
        filters: {
          ...filters,
          // Add any default filters here
        },
      },
    });
  }

  // Analyst Agent Methods
  async analyzeMarket(query: string, context: Record<string, any> = {}) {
    return this.callAgent('ai-agent-orchestrator', {
      query,
      context: { 
        intent: 'market_analysis', 
        ...context 
      },
    });
  }

  // Curator Agent Methods
  async enrichBusiness(businessId: number, data: Record<string, any> = {}) {
    return this.callAgent('ai-agent-orchestrator', {
      query: `Enrich business with ID: ${businessId}`,
      context: { 
        intent: 'data_enrichment', 
        businessId,
        ...data,
      },
    });
  }

  // Add a new business with embedding
  async addBusiness(business: {
    id: number;
    name: string;
    description: string;
    metadata?: Record<string, any>;
  }) {
    return this.callAgent('ai-agent-orchestrator', {
      query: `Add new business: ${business.name}`,
      context: {
        intent: 'add_business',
        business,
      },
    });
  }

  // General Query
  async queryAgent(query: string, context: Record<string, any> = {}) {
    return this.callAgent('ai-agent-orchestrator', {
      query,
      context: { ...context },
    });
  }

  // Get session ID
  getSessionId(): string {
    return this.sessionId;
  }
}

export const agentService = new AgentService();
