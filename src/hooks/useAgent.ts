import { useState, useCallback, useEffect } from 'react';
import { agentService } from '@/services/ai/agentService';

type AgentType = 'connector' | 'analyst' | 'curator' | 'general';

type UseAgentOptions<T = any> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  autoFetch?: boolean;
  initialQuery?: string;
  initialContext?: Record<string, any>;
};

type AgentResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  sessionId: string;
  timestamp: string;
};

export function useAgent<T = any>(
  agentType: AgentType = 'general',
  options: UseAgentOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    autoFetch = false,
    initialQuery = '',
    initialContext = {},
  } = options;

  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<AgentResponse<T> | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [context, setContext] = useState(initialContext);

  const callAgent = useCallback(
    async (queryOrContext?: string | Record<string, any>, contextOverride?: Record<string, any>) => {
      setIsLoading(true);
      setError(null);

      // Handle different parameter patterns
      let effectiveQuery = query;
      let effectiveContext = context;

      if (typeof queryOrContext === 'string') {
        effectiveQuery = queryOrContext;
        if (contextOverride) {
          effectiveContext = { ...context, ...contextOverride };
        }
      } else if (queryOrContext && typeof queryOrContext === 'object') {
        effectiveContext = { ...context, ...queryOrContext };
      }

      try {
        let result: AgentResponse<T>;

        switch (agentType) {
          case 'connector':
            result = await agentService.findBusinesses(effectiveQuery, effectiveContext);
            break;
            
          case 'analyst':
            result = await agentService.analyzeMarket(effectiveQuery, effectiveContext);
            break;
            
          case 'curator':
            const businessId = effectiveContext.businessId;
            if (!businessId) {
              throw new Error('businessId is required for curator agent');
            }
            result = await agentService.enrichBusiness(businessId, effectiveContext);
            break;
            
          default:
            result = await agentService.queryAgent(effectiveQuery, effectiveContext);
        }

        setResponse(result);
        setQuery(effectiveQuery);
        setContext(effectiveContext);

        if (result.success && onSuccess && result.data) {
          onSuccess(result.data);
        } else if (!result.success && result.error) {
          throw new Error(result.error);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [agentType, query, context, onSuccess, onError]
  );

  // Auto-fetch when autoFetch is true
  useEffect(() => {
    if (autoFetch && initialQuery) {
      callAgent(initialQuery, initialContext);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    callAgent,
    isLoading,
    error,
    response,
    query,
    context,
    setQuery,
    setContext,
    reset: () => {
      setResponse(null);
      setError(null);
      setQuery(initialQuery);
      setContext(initialContext);
    },
    sessionId: agentService.getSessionId(),
  };
}

// Convenience hooks for each agent type with proper typing
export function useConnectorAgent<T = any>(options?: Omit<UseAgentOptions<T>, 'agentType'>) {
  return useAgent<T>('connector', options);
}

export function useAnalystAgent<T = any>(options?: Omit<UseAgentOptions<T>, 'agentType'>) {
  return useAgent<T>('analyst', options);
}

export function useCuratorAgent<T = any>(options?: Omit<UseAgentOptions<T>, 'agentType'>) {
  return useAgent<T>('curator', options);
}

export function useGeneralAgent<T = any>(options?: Omit<UseAgentOptions<T>, 'agentType'>) {
  return useAgent<T>('general', options);
}

// Hook for adding a new business
export function useAddBusiness() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<AgentResponse | null>(null);

  const addBusiness = useCallback(async (business: {
    id: number;
    name: string;
    description: string;
    metadata?: Record<string, any>;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await agentService.addBusiness(business);
      setResponse(result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add business');
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    addBusiness,
    isLoading,
    error,
    response,
    reset: () => {
      setResponse(null);
      setError(null);
    },
  };
}
