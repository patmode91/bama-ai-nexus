
import { lazy, ComponentType } from 'react';
import { logger } from '@/services/loggerService';

interface LazyLoadOptions {
  fallback?: ComponentType;
  retryCount?: number;
  chunkName?: string;
}

export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): ComponentType<any> => {
  const { retryCount = 3, chunkName } = options;

  const retryImport = async (attempt = 1): Promise<{ default: T }> => {
    try {
      logger.debug(`Loading lazy component${chunkName ? ` (${chunkName})` : ''} - attempt ${attempt}`, {}, 'LazyLoading');
      const module = await importFn();
      logger.info(`Successfully loaded lazy component${chunkName ? ` (${chunkName})` : ''}`, {}, 'LazyLoading');
      return module;
    } catch (error) {
      logger.warn(`Failed to load lazy component${chunkName ? ` (${chunkName})` : ''} - attempt ${attempt}`, { error }, 'LazyLoading');
      
      if (attempt < retryCount) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryImport(attempt + 1);
      }
      
      logger.error(`Failed to load lazy component after ${retryCount} attempts`, { error, chunkName }, 'LazyLoading');
      throw error;
    }
  };

  return lazy(() => retryImport());
};

// Pre-defined lazy components for heavy features
export const LazyAnalyticsDashboard = createLazyComponent(
  () => import('@/components/analytics/AnalyticsDashboard'),
  { chunkName: 'analytics' }
);

export const LazyAIFeaturesHub = createLazyComponent(
  () => import('@/components/ai/AIFeaturesHub'),
  { chunkName: 'ai-features' }
);

export const LazyChartsBundle = createLazyComponent(
  () => import('@/components/analytics/MetricsOverview'),
  { chunkName: 'charts' }
);

export const LazyBusinessDashboard = createLazyComponent(
  () => import('@/components/dashboard/DataDashboard'),
  { chunkName: 'business-dashboard' }
);

export const LazyForumComponents = createLazyComponent(
  () => import('@/components/forums/ForumCard'),
  { chunkName: 'forums' }
);

export const LazyEventComponents = createLazyComponent(
  () => import('@/components/events/EventsCalendar'),
  { chunkName: 'events' }
);

// Preload strategy for route-based components
export const preloadRouteComponent = (componentName: string) => {
  const preloadMap: Record<string, () => Promise<any>> = {
    analytics: () => import('@/components/analytics/AnalyticsDashboard'),
    ai: () => import('@/components/ai/AIFeaturesHub'),
    dashboard: () => import('@/components/dashboard/DataDashboard'),
    forums: () => import('@/components/forums/ForumCard'),
    events: () => import('@/components/events/EventsCalendar'),
    admin: () => import('@/components/admin/AdminDashboard'),
  };

  const preloadFn = preloadMap[componentName];
  if (preloadFn) {
    logger.info(`Preloading component: ${componentName}`, {}, 'LazyLoading');
    preloadFn().catch(error => {
      logger.warn(`Failed to preload component: ${componentName}`, { error }, 'LazyLoading');
    });
  }
};

// Intersection observer for lazy loading on scroll
export const useLazyLoadOnScroll = (callback: () => void, options?: IntersectionObserverInit) => {
  const createObserver = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
          observer.disconnect();
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '100px',
      ...options
    });

    return observer;
  };

  return { createObserver };
};
