
import { useState, useCallback, useMemo } from 'react';
import { logger } from '@/services/loggerService';

interface CompositionConfig<T> {
  components: Array<{
    id: string;
    component: React.ComponentType<any>;
    props?: any;
    condition?: (data: T) => boolean;
    priority?: number;
  }>;
  layout?: 'stack' | 'grid' | 'flex';
  maxComponents?: number;
}

export const useComposition = <T>(data: T, config: CompositionConfig<T>) => {
  const [activeComponents, setActiveComponents] = useState<string[]>([]);

  const visibleComponents = useMemo(() => {
    const filtered = config.components
      .filter(comp => !comp.condition || comp.condition(data))
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, config.maxComponents || 10);

    return filtered;
  }, [data, config]);

  const toggleComponent = useCallback((componentId: string) => {
    setActiveComponents(prev => {
      const newActive = prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId];
      
      logger.debug('Component toggled', { 
        componentId, 
        active: !prev.includes(componentId) 
      }, 'useComposition');
      
      return newActive;
    });
  }, []);

  const renderComponents = useCallback(() => {
    return visibleComponents.map(({ id, component: Component, props = {} }) => {
      const isActive = activeComponents.length === 0 || activeComponents.includes(id);
      
      if (!isActive) return null;

      return (
        <Component
          key={id}
          {...props}
          data={data}
          compositionId={id}
        />
      );
    }).filter(Boolean);
  }, [visibleComponents, activeComponents, data]);

  const getLayoutClasses = useCallback(() => {
    switch (config.layout) {
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
      case 'flex':
        return 'flex flex-wrap gap-4';
      case 'stack':
      default:
        return 'space-y-4';
    }
  }, [config.layout]);

  return {
    visibleComponents,
    activeComponents,
    toggleComponent,
    renderComponents,
    getLayoutClasses,
    totalComponents: config.components.length,
    visibleCount: visibleComponents.length
  };
};

// Composition presets for common patterns
export const createBusinessCardComposition = (businessData: any) => ({
  components: [
    {
      id: 'basic-info',
      component: ({ data }: any) => <div>Basic Info Component</div>,
      priority: 10
    },
    {
      id: 'contact-info',
      component: ({ data }: any) => <div>Contact Component</div>,
      priority: 8,
      condition: (data: any) => data.contactemail || data.website
    },
    {
      id: 'ratings',
      component: ({ data }: any) => <div>Ratings Component</div>,
      priority: 7,
      condition: (data: any) => data.rating > 0
    },
    {
      id: 'certifications',
      component: ({ data }: any) => <div>Certifications Component</div>,
      priority: 5,
      condition: (data: any) => data.certifications?.length > 0
    }
  ],
  layout: 'stack' as const,
  maxComponents: 6
});

export const createDashboardComposition = (userData: any) => ({
  components: [
    {
      id: 'overview',
      component: ({ data }: any) => <div>Overview Widget</div>,
      priority: 10
    },
    {
      id: 'analytics',
      component: ({ data }: any) => <div>Analytics Widget</div>,
      priority: 8,
      condition: (data: any) => data.hasAnalyticsAccess
    },
    {
      id: 'recent-activity',
      component: ({ data }: any) => <div>Recent Activity Widget</div>,
      priority: 7
    },
    {
      id: 'recommendations',
      component: ({ data }: any) => <div>Recommendations Widget</div>,
      priority: 6
    }
  ],
  layout: 'grid' as const,
  maxComponents: 8
});
