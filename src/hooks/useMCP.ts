
import { useState, useEffect, useCallback } from 'react';
import { mcpContextManager, MCPContext, MCPSession } from '@/services/mcp/MCPContextManager';
import { mcpEventBus, MCPEvent } from '@/services/mcp/MCPEventBus';
import { mcpAgentConnector, ConnectorResponse } from '@/services/mcp/MCPAgentConnector';

export const useMCP = (userId?: string) => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<MCPSession | null>(null);
  const [contexts, setContexts] = useState<MCPContext[]>([]);
  const [events, setEvents] = useState<MCPEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create or get session
  const initializeSession = useCallback(() => {
    if (!currentSessionId) {
      const sessionId = mcpContextManager.createSession(userId);
      setCurrentSessionId(sessionId);
      return sessionId;
    }
    return currentSessionId;
  }, [currentSessionId, userId]);

  // Add context to current session
  const addContext = useCallback(async (
    intent: string,
    entities: Record<string, any> = {},
    metadata: Record<string, any> = {},
    source: MCPContext['source'] = 'user'
  ) => {
    const sessionId = initializeSession();
    
    try {
      const context = mcpContextManager.addContext(sessionId, {
        intent,
        entities,
        metadata,
        source,
        userId
      });

      // Emit context created event
      await mcpEventBus.emit({
        type: 'context_created',
        source,
        payload: { context, sessionId }
      });

      return context;
    } catch (error) {
      console.error('Error adding context:', error);
      throw error;
    }
  }, [initializeSession, userId]);

  // Get business matches using The Connector
  const findBusinessMatches = useCallback(async (): Promise<ConnectorResponse> => {
    if (!currentSessionId) {
      throw new Error('No active session');
    }

    setIsLoading(true);
    try {
      const response = await mcpAgentConnector.findMatches(currentSessionId);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId]);

  // Extract intent from natural language (simplified version)
  const extractIntent = useCallback((message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Industry detection
    let industry = '';
    if (lowerMessage.includes('legal') || lowerMessage.includes('law') || lowerMessage.includes('contract')) {
      industry = 'Legal';
    } else if (lowerMessage.includes('healthcare') || lowerMessage.includes('medical')) {
      industry = 'Healthcare';
    } else if (lowerMessage.includes('retail') || lowerMessage.includes('ecommerce') || lowerMessage.includes('shopping')) {
      industry = 'Retail';
    } else if (lowerMessage.includes('manufacturing') || lowerMessage.includes('production')) {
      industry = 'Manufacturing';
    } else if (lowerMessage.includes('finance') || lowerMessage.includes('banking') || lowerMessage.includes('fintech')) {
      industry = 'Financial Services';
    }

    // Service detection
    const services: string[] = [];
    if (lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence')) {
      services.push('AI Solutions');
    }
    if (lowerMessage.includes('machine learning') || lowerMessage.includes('ml')) {
      services.push('Machine Learning');
    }
    if (lowerMessage.includes('nlp') || lowerMessage.includes('natural language')) {
      services.push('NLP');
    }
    if (lowerMessage.includes('automation')) {
      services.push('Automation');
    }
    if (lowerMessage.includes('analytics') || lowerMessage.includes('data analysis')) {
      services.push('Data Analytics');
    }

    // Location detection
    let location = '';
    if (lowerMessage.includes('birmingham')) location = 'Birmingham';
    else if (lowerMessage.includes('huntsville')) location = 'Huntsville';
    else if (lowerMessage.includes('mobile')) location = 'Mobile';
    else if (lowerMessage.includes('montgomery')) location = 'Montgomery';
    else if (lowerMessage.includes('alabama')) location = 'Alabama';

    // Budget detection
    let budget = null;
    const budgetMatch = lowerMessage.match(/\$?(\d{1,3}(?:,\d{3})*(?:k|thousand)?)\s*(?:to|-)\s*\$?(\d{1,3}(?:,\d{3})*(?:k|thousand)?)/);
    if (budgetMatch) {
      const min = parseInt(budgetMatch[1].replace(/[k,]/g, '')) * (budgetMatch[1].includes('k') ? 1000 : 1);
      const max = parseInt(budgetMatch[2].replace(/[k,]/g, '')) * (budgetMatch[2].includes('k') ? 1000 : 1);
      budget = { min, max };
    }

    return {
      industry,
      services,
      location,
      budget,
      businessType: industry ? `${industry} Business` : ''
    };
  }, []);

  // Process user message and extract context
  const processMessage = useCallback(async (message: string) => {
    const extracted = extractIntent(message);
    
    return await addContext(
      'find_business_solution',
      {
        originalMessage: message,
        services: extracted.services,
        companySize: null // Could be extracted from message
      },
      {
        extractedData: extracted,
        timestamp: new Date().toISOString()
      },
      'bamabot'
    );
  }, [addContext, extractIntent]);

  // Subscribe to session updates
  useEffect(() => {
    if (currentSessionId) {
      const unsubscribe = mcpContextManager.subscribeToSession(
        currentSessionId,
        (context) => {
          setContexts(prev => [...prev, context]);
        }
      );

      // Subscribe to events for this session
      const eventUnsubscribe = mcpEventBus.subscribe('agent_response', (event) => {
        if (event.payload.sessionId === currentSessionId) {
          setEvents(prev => [...prev, event]);
        }
      });

      return () => {
        unsubscribe();
        eventUnsubscribe();
      };
    }
  }, [currentSessionId]);

  // Load current session data
  useEffect(() => {
    if (currentSessionId) {
      const session = mcpContextManager.getSessionContext(currentSessionId);
      if (session) {
        setCurrentSession(session);
        setContexts(session.contexts);
      }
    }
  }, [currentSessionId]);

  return {
    currentSessionId,
    currentSession,
    contexts,
    events,
    isLoading,
    initializeSession,
    addContext,
    processMessage,
    findBusinessMatches,
    extractIntent
  };
};
