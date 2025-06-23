
import { logger } from '../loggerService';

export interface SDKAgent {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  endpoints: SDKEndpoint[];
  authentication: AuthConfig;
  status: 'active' | 'inactive' | 'deprecated';
  metadata: Record<string, any>;
}

export interface SDKEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  parameters: Parameter[];
  responseSchema: any;
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
}

export interface Parameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  default?: any;
}

export interface AuthConfig {
  type: 'api_key' | 'oauth' | 'jwt' | 'basic';
  parameters: Record<string, any>;
}

export interface IntegrationConfig {
  agentId: string;
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  customHeaders?: Record<string, string>;
}

export interface AgentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    requestId: string;
    timestamp: string;
    executionTime: number;
  };
}

class AgentSDK {
  private static instance: AgentSDK;
  private registeredAgents: Map<string, SDKAgent> = new Map();
  private integrations: Map<string, IntegrationConfig> = new Map();
  private requestCache: Map<string, any> = new Map();

  static getInstance(): AgentSDK {
    if (!AgentSDK.instance) {
      AgentSDK.instance = new AgentSDK();
    }
    return AgentSDK.instance;
  }

  constructor() {
    this.initializeDefaultAgents();
  }

  private initializeDefaultAgents(): void {
    // Register default BAMA AI agents
    this.registerAgent({
      id: 'bama-connector',
      name: 'BAMA Business Connector',
      version: '2.0.0',
      description: 'Connects businesses and facilitates partnerships within Alabama ecosystem',
      capabilities: ['business_matching', 'partnership_recommendation', 'network_analysis'],
      endpoints: [
        {
          path: '/find-matches',
          method: 'POST',
          description: 'Find business matches based on criteria',
          parameters: [
            { name: 'query', type: 'string', required: true, description: 'Search query' },
            { name: 'filters', type: 'object', required: false, description: 'Filter criteria' },
            { name: 'limit', type: 'number', required: false, description: 'Max results', default: 10 }
          ],
          responseSchema: {
            matches: 'array',
            total: 'number',
            recommendations: 'array'
          }
        }
      ],
      authentication: {
        type: 'api_key',
        parameters: { header: 'X-API-Key' }
      },
      status: 'active',
      metadata: {
        category: 'business_intelligence',
        region: 'alabama'
      }
    });

    this.registerAgent({
      id: 'bama-analyst',
      name: 'BAMA Market Analyst',
      version: '2.0.0',
      description: 'Provides market insights and business intelligence for Alabama market',
      capabilities: ['market_analysis', 'trend_prediction', 'competitive_intelligence'],
      endpoints: [
        {
          path: '/analyze-market',
          method: 'POST',
          description: 'Analyze market conditions and trends',
          parameters: [
            { name: 'sector', type: 'string', required: true, description: 'Market sector' },
            { name: 'timeframe', type: 'string', required: false, description: 'Analysis timeframe', default: '12m' }
          ],
          responseSchema: {
            insights: 'object',
            trends: 'array',
            recommendations: 'array'
          }
        }
      ],
      authentication: {
        type: 'jwt',
        parameters: { issuer: 'bama-ai' }
      },
      status: 'active',
      metadata: {
        category: 'analytics',
        specialization: 'market_intelligence'
      }
    });

    logger.info('Default SDK agents initialized', { agentCount: this.registeredAgents.size }, 'AgentSDK');
  }

  // Agent Registration
  registerAgent(agent: SDKAgent): void {
    this.registeredAgents.set(agent.id, agent);
    logger.info('Agent registered', { agentId: agent.id, version: agent.version }, 'AgentSDK');
  }

  unregisterAgent(agentId: string): boolean {
    const removed = this.registeredAgents.delete(agentId);
    if (removed) {
      logger.info('Agent unregistered', { agentId }, 'AgentSDK');
    }
    return removed;
  }

  getAgent(agentId: string): SDKAgent | undefined {
    return this.registeredAgents.get(agentId);
  }

  listAgents(): SDKAgent[] {
    return Array.from(this.registeredAgents.values());
  }

  // Integration Management
  configureIntegration(config: IntegrationConfig): void {
    this.integrations.set(config.agentId, config);
    logger.info('Integration configured', { agentId: config.agentId }, 'AgentSDK');
  }

  removeIntegration(agentId: string): boolean {
    const removed = this.integrations.delete(agentId);
    if (removed) {
      logger.info('Integration removed', { agentId }, 'AgentSDK');
    }
    return removed;
  }

  // Agent Execution
  async executeAgent<T = any>(
    agentId: string,
    endpoint: string,
    parameters: Record<string, any> = {},
    options: { timeout?: number; useCache?: boolean } = {}
  ): Promise<AgentResponse<T>> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const agent = this.registeredAgents.get(agentId);
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      const integration = this.integrations.get(agentId);
      const agentEndpoint = agent.endpoints.find(ep => ep.path === endpoint);
      
      if (!agentEndpoint) {
        throw new Error(`Endpoint ${endpoint} not found for agent ${agentId}`);
      }

      // Validate parameters
      this.validateParameters(parameters, agentEndpoint.parameters);

      // Check cache if enabled
      const cacheKey = `${agentId}:${endpoint}:${JSON.stringify(parameters)}`;
      if (options.useCache && this.requestCache.has(cacheKey)) {
        const cachedResult = this.requestCache.get(cacheKey);
        logger.debug('Cache hit', { agentId, endpoint, requestId }, 'AgentSDK');
        return cachedResult;
      }

      // Execute agent logic based on agent type
      let result: any;
      if (agentId.startsWith('bama-')) {
        result = await this.executeBamaAgent(agentId, endpoint, parameters);
      } else {
        result = await this.executeThirdPartyAgent(agent, integration, endpoint, parameters, options);
      }

      const response: AgentResponse<T> = {
        success: true,
        data: result,
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          executionTime: Date.now() - startTime
        }
      };

      // Cache result if enabled
      if (options.useCache) {
        this.requestCache.set(cacheKey, response);
        // Auto-expire cache after 5 minutes
        setTimeout(() => this.requestCache.delete(cacheKey), 5 * 60 * 1000);
      }

      logger.info('Agent executed successfully', { 
        agentId, 
        endpoint, 
        requestId, 
        executionTime: Date.now() - startTime 
      }, 'AgentSDK');

      return response;

    } catch (error) {
      logger.error('Agent execution failed', { 
        agentId, 
        endpoint, 
        requestId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'AgentSDK');

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          executionTime: Date.now() - startTime
        }
      };
    }
  }

  private validateParameters(parameters: Record<string, any>, schema: Parameter[]): void {
    for (const param of schema) {
      if (param.required && !(param.name in parameters)) {
        throw new Error(`Required parameter '${param.name}' is missing`);
      }

      if (param.name in parameters) {
        const value = parameters[param.name];
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        
        if (actualType !== param.type) {
          throw new Error(`Parameter '${param.name}' should be of type '${param.type}', got '${actualType}'`);
        }
      }
    }
  }

  private async executeBamaAgent(agentId: string, endpoint: string, parameters: Record<string, any>): Promise<any> {
    // Route to internal BAMA agents
    switch (agentId) {
      case 'bama-connector':
        return this.executeBamaConnector(endpoint, parameters);
      case 'bama-analyst':
        return this.executeBamaAnalyst(endpoint, parameters);
      default:
        throw new Error(`Unknown BAMA agent: ${agentId}`);
    }
  }

  private async executeBamaConnector(endpoint: string, parameters: Record<string, any>): Promise<any> {
    switch (endpoint) {
      case '/find-matches':
        // Simulate business matching
        return {
          matches: [
            {
              id: 1,
              name: 'TechCorp Alabama',
              score: 95,
              reasons: ['Technology match', 'Location proximity', 'Size compatibility']
            },
            {
              id: 2,
              name: 'Innovation Hub Birmingham',
              score: 87,
              reasons: ['Industry synergy', 'Partnership history']
            }
          ],
          total: 2,
          recommendations: [
            'Consider scheduling introductory meetings',
            'Review complementary capabilities'
          ]
        };
      default:
        throw new Error(`Endpoint ${endpoint} not implemented for bama-connector`);
    }
  }

  private async executeBamaAnalyst(endpoint: string, parameters: Record<string, any>): Promise<any> {
    switch (endpoint) {
      case '/analyze-market':
        // Simulate market analysis
        return {
          insights: {
            marketSize: '$2.4B',
            growthRate: '15.3%',
            competitiveIndex: 'Medium',
            opportunityScore: 78
          },
          trends: [
            'Increasing AI adoption in healthcare',
            'Growing demand for automation solutions',
            'Rising investment in Alabama tech sector'
          ],
          recommendations: [
            'Focus on healthcare AI applications',
            'Consider partnerships with UAB',
            'Leverage state incentives for expansion'
          ]
        };
      default:
        throw new Error(`Endpoint ${endpoint} not implemented for bama-analyst`);
    }
  }

  private async executeThirdPartyAgent(
    agent: SDKAgent, 
    integration: IntegrationConfig | undefined, 
    endpoint: string, 
    parameters: Record<string, any>,
    options: { timeout?: number }
  ): Promise<any> {
    if (!integration) {
      throw new Error(`No integration configured for agent ${agent.id}`);
    }

    const baseUrl = integration.baseUrl || 'https://api.example.com';
    const timeout = options.timeout || integration.timeout || 30000;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...integration.customHeaders
    };

    // Add authentication
    if (agent.authentication.type === 'api_key' && integration.apiKey) {
      headers[agent.authentication.parameters.header || 'Authorization'] = 
        `Bearer ${integration.apiKey}`;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(parameters),
      signal: AbortSignal.timeout(timeout)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // Utility Methods
  generateDocumentation(agentId: string): string {
    const agent = this.registeredAgents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    let docs = `# ${agent.name} v${agent.version}\n\n`;
    docs += `${agent.description}\n\n`;
    docs += `## Capabilities\n`;
    agent.capabilities.forEach(cap => {
      docs += `- ${cap}\n`;
    });
    docs += `\n## Endpoints\n`;
    
    agent.endpoints.forEach(endpoint => {
      docs += `### ${endpoint.method} ${endpoint.path}\n`;
      docs += `${endpoint.description}\n\n`;
      docs += `**Parameters:**\n`;
      endpoint.parameters.forEach(param => {
        docs += `- \`${param.name}\` (${param.type}${param.required ? ', required' : ''}): ${param.description}\n`;
      });
      docs += '\n';
    });

    return docs;
  }

  getSDKStats() {
    const activeAgents = Array.from(this.registeredAgents.values()).filter(a => a.status === 'active').length;
    const totalIntegrations = this.integrations.size;
    const cacheSize = this.requestCache.size;

    return {
      totalAgents: this.registeredAgents.size,
      activeAgents,
      totalIntegrations,
      cacheSize,
      supportedAuthTypes: ['api_key', 'oauth', 'jwt', 'basic']
    };
  }

  clearCache(): void {
    this.requestCache.clear();
    logger.info('SDK cache cleared', {}, 'AgentSDK');
  }
}

export const agentSDK = AgentSDK.getInstance();
export default agentSDK;
