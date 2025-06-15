
import { logger } from './loggerService';
import { advancedCacheService } from './cache/advancedCacheService';

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  cache?: {
    enabled: boolean;
    ttl?: number;
    tags?: string[];
  };
  retry?: {
    attempts: number;
    delay: number;
  };
  timeout?: number;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private interceptors: {
    request: Array<(config: RequestConfig) => RequestConfig>;
    response: Array<(response: any) => any>;
    error: Array<(error: any) => any>;
  } = {
    request: [],
    response: [],
    error: []
  };

  constructor(baseURL: string = '', defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };

    logger.info('ApiClient initialized', { baseURL }, 'ApiClient');
  }

  async request<T>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      cache = { enabled: false },
      retry = { attempts: 3, delay: 1000 },
      timeout = 10000
    } = config;

    // Generate cache key if caching is enabled
    const cacheKey = cache.enabled 
      ? `api-${method}-${endpoint}-${JSON.stringify(body || {})}`
      : null;

    // Try to get from cache first
    if (cache.enabled && cacheKey) {
      const cached = await advancedCacheService.get<T>(cacheKey);
      if (cached) {
        logger.debug('Cache hit for API request', { endpoint, method }, 'ApiClient');
        return {
          data: cached,
          status: 200,
          headers: new Headers()
        };
      }
    }

    // Apply request interceptors
    let finalConfig = { ...config };
    for (const interceptor of this.interceptors.request) {
      finalConfig = interceptor(finalConfig);
    }

    const url = `${this.baseURL}${endpoint}`;
    const requestOptions: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeout)
    };

    let lastError: Error;
    
    for (let attempt = 1; attempt <= retry.attempts; attempt++) {
      try {
        logger.debug(`API request attempt ${attempt}`, { 
          url, 
          method, 
          attempt 
        }, 'ApiClient');

        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Apply response interceptors
        let finalData = data;
        for (const interceptor of this.interceptors.response) {
          finalData = interceptor(finalData);
        }

        const apiResponse: ApiResponse<T> = {
          data: finalData,
          status: response.status,
          headers: response.headers
        };

        // Cache successful response
        if (cache.enabled && cacheKey) {
          await advancedCacheService.set(cacheKey, finalData, {
            ttl: cache.ttl || 5 * 60 * 1000,
            tags: cache.tags || ['api']
          });
        }

        logger.info('API request successful', { 
          url, 
          method, 
          status: response.status,
          attempt 
        }, 'ApiClient');

        return apiResponse;

      } catch (error) {
        lastError = error as Error;
        
        logger.warn(`API request failed (attempt ${attempt})`, { 
          url, 
          method, 
          error: error.message,
          attempt 
        }, 'ApiClient');

        // Apply error interceptors
        for (const interceptor of this.interceptors.error) {
          interceptor(error);
        }

        if (attempt < retry.attempts) {
          await new Promise(resolve => setTimeout(resolve, retry.delay * attempt));
        }
      }
    }

    logger.error('API request failed after all retries', { 
      url, 
      method, 
      error: lastError.message 
    }, 'ApiClient');

    throw lastError;
  }

  // Convenience methods
  get<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>) {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  put<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Interceptor management
  addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig) {
    this.interceptors.request.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: any) => any) {
    this.interceptors.response.push(interceptor);
  }

  addErrorInterceptor(interceptor: (error: any) => any) {
    this.interceptors.error.push(interceptor);
  }

  // Clear cache for specific tags
  invalidateCache(tags: string[]) {
    tags.forEach(tag => advancedCacheService.invalidateByTag(tag));
  }
}

// Create global API client instance
export const apiClient = new ApiClient();

// Add default interceptors
apiClient.addRequestInterceptor((config) => {
  // Add authentication token if available
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return config;
});

apiClient.addErrorInterceptor((error) => {
  // Handle authentication errors globally
  if (error.message.includes('401') || error.message.includes('403')) {
    localStorage.removeItem('auth-token');
    window.location.href = '/auth';
  }
});

export default apiClient;
