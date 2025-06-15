
import { useState, useEffect, useCallback } from 'react';
import { mcpContextManager, MCPContext, MCPSession } from '@/services/mcp/MCPContextManager';
import { mcpEventBus, MCPEvent } from '@/services/mcp/MCPEventBus';
import { mcpAgentConnector, ConnectorResponse } from '@/services/mcp/MCPAgentConnector';
import { mcpAgentAnalyst, AnalystResponse } from '@/services/mcp/MCPAgentAnalyst';
import { mcpAgentCurator, CuratorResponse } from '@/services/mcp/MCPAgentCurator';

export const useMCP = (userId?: string) => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<MCPSession | null>(null);
  const [contexts, setContexts] = useState<MCPContext[]>([]);
  const [events, setEvents] = useState<MCPEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agentResponses, setAgentResponses] = useState<{
    connector?: ConnectorResponse;
    analyst?: AnalystResponse;
    curator?: CuratorResponse;
  }>({});

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
      setAgentResponses(prev => ({ ...prev, connector: response }));
      return response;
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId]);

  // Get market insights using The Analyst
  const getMarketInsights = useCallback(async (context: MCPContext): Promise<AnalystResponse> => {
    if (!currentSessionId) {
      throw new Error('No active session');
    }

    setIsLoading(true);
    try {
      const response = await mcpAgentAnalyst.generateMarketInsights(currentSessionId, context);
      setAgentResponses(prev => ({ ...prev, analyst: response }));
      return response;
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId]);

  // Enrich business data using The Curator
  const enrichBusinessData = useCallback(async (businesses: any[], context: MCPContext): Promise<CuratorResponse> => {
    if (!currentSessionId) {
      throw new Error('No active session');
    }

    setIsLoading(true);
    try {
      const response = await mcpAgentCurator.enrichBusinessData(currentSessionId, businesses, context);
      setAgentResponses(prev => ({ ...prev, curator: response }));
      return response;
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId]);

  // Orchestrate all agents for comprehensive analysis
  const runFullAnalysis = useCallback(async (userIntent: string, entities: Record<string, any> = {}) => {
    if (!currentSessionId) {
      throw new Error('No active session');
    }

    setIsLoading(true);
    try {
      // Step 1: Add user context
      const context = await addContext(userIntent, entities, {}, 'user');

      // Step 2: Get business matches from Connector
      const connectorResponse = await mcpAgentConnector.findMatches(currentSessionId);
      
      // Step 3: Enrich business data with Curator
      const curatorResponse = await mcpAgentCurator.enrichBusinessData(
        currentSessionId, 
        connectorResponse.matches.map(m => m.business), 
        context
      );

      // Step 4: Get market insights from Analyst
      const analystResponse = await mcpAgentAnalyst.generateMarketInsights(currentSessionId, context);

      // Update agent responses
      setAgentResponses({
        connector: connectorResponse,
        curator: curatorResponse,
        analyst: analystResponse
      });

      return {
        context,
        connector: connectorResponse,
        curator: curatorResponse,
        analyst: analystResponse
      };

    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, addContext]);

  // Extract intent from natural language (enhanced version)
  const extractIntent = useCallback((message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Industry detection
    let industry = '';
    if (lowerMessage.includes('legal') || lowerMessage.includes('law') || lowerMessage.includes('contract')) {
      industry = 'Legal';
    } else if (lowerMessage.includes('healthcare') || lowerMessage.includes('medical') || lowerMessage.includes('health')) {
      industry = 'Healthcare';
    } else if (lowerMessage.includes('retail') || lowerMessage.includes('ecommerce') || lowerMessage.includes('shopping')) {
      industry = 'Retail';
    } else if (lowerMessage.includes('manufacturing') || lowerMessage.includes('production')) {
      industry = 'Manufacturing';
    } else if (lowerMessage.includes('finance') || lowerMessage.includes('banking') || lowerMessage.includes('fintech')) {
      industry = 'Financial Services';
    } else if (lowerMessage.includes('education') || lowerMessage.includes('school') || lowerMessage.includes('university')) {
      industry = 'Education';
    }

    // Service detection (enhanced)
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
    if (lowerMessage.includes('automation') || lowerMessage.includes('automate')) {
      services.push('Automation');
    }
    if (lowerMessage.includes('analytics') || lowerMessage.includes('data analysis')) {
      services.push('Data Analytics');
    }
    if (lowerMessage.includes('cloud') || lowerMessage.includes('aws') || lowerMessage.includes('azure')) {
      services.push('Cloud Services');
    }
    if (lowerMessage.includes('security') || lowerMessage.includes('cybersecurity')) {
      services.push('Security Services');
    }

    // Location detection (enhanced)
    let location = '';
    if (lowerMessage.includes('birmingham')) location = 'Birmingham';
    else if (lowerMessage.includes('huntsville')) location = 'Huntsville';
    else if (lowerMessage.includes('mobile')) location = 'Mobile';
    else if (lowerMessage.includes('montgomery')) location = 'Montgomery';
    else if (lowerMessage.includes('tuscaloosa')) location = 'Tuscaloosa';
    else if (lowerMessage.includes('auburn')) location = 'Auburn';
    else if (lowerMessage.includes('alabama')) location = 'Alabama';

    // Budget detection (enhanced)
    let budget = null;
    const budgetMatch = lowerMessage.match(/\$?(\d{1,3}(?:,\d{3})*(?:k|thousand|million)?)\s*(?:to|-)\s*\$?(\d{1,3}(?:,\d{3})*(?:k|thousand|million)?)/);
    if (budgetMatch) {
      const parseAmount = (amount: string) => {
        let num = parseInt(amount.replace(/[k,]/g, ''));
        if (amount.includes('k') || amount.includes('thousand')) num *= 1000;
        if (amount.includes('million')) num *= 1000000;
        return num;
      };
      
      budget = { 
        min: parseAmount(budgetMatch[1]), 
        max: parseAmount(budgetMatch[2]) 
      };
    }

    // Company size detection
    let companySize = '';
    if (lowerMessage.includes('startup') || lowerMessage.includes('small business')) {
      companySize = 'small';
    } else if (lowerMessage.includes('enterprise') || lowerMessage.includes('large company')) {
      companySize = 'large';
    } else if (lowerMessage.includes('medium') || lowerMessage.includes('mid-size')) {
      companySize = 'medium';
    }

    return {
      industry,
      services,
      location,
      budget,
      companySize,
      businessType: industry ? `${industry} Business` : ''
    };
  }, []);

  // Process user message and extract context (enhanced)
  const processMessage = useCallback(async (message: string) => {
    const extracted = extractIntent(message);
    
    return await addContext(
      'find_business_solution',
      {
        originalMessage: message,
        services: extracted.services,
        companySize: extracted.companySize
      },
      {
        extractedData: extracted,
        timestamp: new Date().toISOString(),
        messageLength: message.length
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

      // Subscribe to all agent events for this session
      const eventUnsubscribe = mcpEventBus.subscribe('agent_response', (event) => {
        if (event.payload.sessionId === currentSessionId) {
          setEvents(prev => [...prev, event]);
          
          // Update agent responses based on source
          if (event.source === 'connector') {
            setAgentResponses(prev => ({ ...prev, connector: event.payload.response }));
          } else if (event.source === 'analyst') {
            setAgentResponses(prev => ({ ...prev, analyst: event.payload.response }));
          } else if (event.source === 'curator') {
            setAgentResponses(prev => ({ ...prev, curator: event.payload.response }));
          }
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
    agentResponses,
    initializeSession,
    addContext,
    processMessage,
    findBusinessMatches,
    getMarketInsights,
    enrichBusinessData,
    runFullAnalysis,
    extractIntent
  };
};
