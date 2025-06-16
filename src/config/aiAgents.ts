// AI Agents Configuration

export const AI_AGENT_CONFIG = {
  // Agent Types
  AGENT_TYPES: {
    CONNECTOR: 'connector',
    ANALYST: 'analyst',
    CURATOR: 'curator',
  },

  // API Endpoints
  ENDPOINTS: {
    AI_ORCHESTRATOR: '/functions/v1/ai-agent-orchestrator',
    SEMANTIC_SEARCH: '/functions/v1/semantic-search',
    MARKET_ANALYSIS: '/functions/v1/market-analysis',
    DATA_ENRICHMENT: '/functions/v1/data-enrichment',
  },

  // Model Configuration
  MODELS: {
    EMBEDDING: 'embedding-001',
    TEXT_GENERATION: 'gemini-pro',
    CODE_GENERATION: 'code-bison-001',
  },

  // Search Configuration
  SEARCH: {
    DEFAULT_LIMIT: 10,
    SIMILARITY_THRESHOLD: 0.7,
    CACHE_TTL: 3600, // 1 hour in seconds
  },

  // Market Data Configuration
  MARKET_DATA: {
    CACHE_TTL: 86400, // 24 hours in seconds
    PROVIDERS: {
      BLS: {
        BASE_URL: 'https://api.bls.gov/publicAPI/v2',
        CACHE_KEY: 'bls',
      },
      CENSUS: {
        BASE_URL: 'https://api.census.gov/data',
        CACHE_KEY: 'census',
      },
    },
  },

  // Business Data Configuration
  BUSINESS_DATA: {
    CACHE_TTL: 86400, // 24 hours in seconds
    PROVIDERS: {
      CLEARBIT: {
        BASE_URL: 'https://company.clearbit.com/v2',
        CACHE_KEY: 'clearbit',
      },
      ZOOMINFO: {
        BASE_URL: 'https://api.zoominfo.com',
        CACHE_KEY: 'zoominfo',
      },
    },
  },

  // ML Model Configuration
  ML: {
    PREDICTION_THRESHOLD: 0.7,
    TRAINING_BATCH_SIZE: 32,
    TRAINING_EPOCHS: 50,
    VALIDATION_SPLIT: 0.2,
  },

  // Rate Limiting
  RATE_LIMITING: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_DAY: 1000,
  },

  // Error Handling
  ERROR_MESSAGES: {
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
    INVALID_REQUEST: 'Invalid request. Please check your input and try again.',
    SERVICE_UNAVAILABLE: 'Service is currently unavailable. Please try again later.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
  },

  // Feature Flags
  FEATURE_FLAGS: {
    ENABLE_SEMANTIC_SEARCH: true,
    ENABLE_MARKET_ANALYSIS: true,
    ENABLE_DATA_ENRICHMENT: true,
    ENABLE_ML_PREDICTIONS: true,
  },
};

// Environment Variables
export const ENV = {
  // Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  
  // AI/ML Services
  GOOGLE_AI_API_KEY: import.meta.env.VITE_GOOGLE_AI_API_KEY || '',
  
  // External APIs
  BLS_API_KEY: import.meta.env.VITE_BLS_API_KEY || '',
  CENSUS_API_KEY: import.meta.env.VITE_CENSUS_API_KEY || '',
  CLEARBIT_API_KEY: import.meta.env.VITE_CLEARBIT_API_KEY || '',
  ZOOMINFO_API_KEY: import.meta.env.VITE_ZOOMINFO_API_KEY || '',
  NEWS_API_KEY: import.meta.env.VITE_NEWS_API_KEY || '',
  
  // Feature Flags
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
};

// Validate required environment variables in production
if (ENV.IS_PRODUCTION) {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_GOOGLE_AI_API_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Export a function to get configuration based on environment
export function getConfig() {
  return {
    ...AI_AGENT_CONFIG,
    env: ENV,
    isConfigured: () => {
      return (
        !!ENV.SUPABASE_URL &&
        !!ENV.SUPABASE_ANON_KEY &&
        !!ENV.GOOGLE_AI_API_KEY
      );
    },
  };
}
