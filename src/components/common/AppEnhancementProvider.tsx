
import React, { ReactNode, useEffect } from 'react';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
import { LoadingProvider } from './SmartLoadingManager';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { userExperienceService } from '@/services/userExperienceService';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useLoading } from './SmartLoadingManager';

interface AppEnhancementProviderProps {
  children: ReactNode;
}

const AppInitializationManager: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isInitialized, initializationError, initializationProgress } = useAppInitialization();
  const { addLoading, updateProgress, setSuccess, setError } = useLoading();
  const { suggestions, optimizePerformance } = usePerformanceOptimization();

  useEffect(() => {
    if (!isInitialized) {
      addLoading('app-init', 'Initializing application...');
      updateProgress('app-init', initializationProgress);
    } else {
      setSuccess('app-init');
    }

    if (initializationError) {
      setError('app-init', initializationError);
    }
  }, [isInitialized, initializationError, initializationProgress, addLoading, updateProgress, setSuccess, setError]);

  // Auto-optimize performance when suggestions are available
  useEffect(() => {
    if (suggestions.length > 0 && suggestions.some(s => s.severity === 'warning')) {
      const timer = setTimeout(() => {
        optimizePerformance();
      }, 5000); // Wait 5 seconds before auto-optimizing

      return () => clearTimeout(timer);
    }
  }, [suggestions, optimizePerformance]);

  // Track custom events for important user actions
  useEffect(() => {
    if (isInitialized) {
      userExperienceService.trackCustomEvent('app_initialized', {
        initializationTime: initializationProgress,
        performanceSuggestions: suggestions.length
      });
    }
  }, [isInitialized, initializationProgress, suggestions.length]);

  if (!isInitialized && !initializationError) {
    return null; // Let the loading overlay handle this
  }

  return <>{children}</>;
};

export const AppEnhancementProvider: React.FC<AppEnhancementProviderProps> = ({ children }) => {
  return (
    <EnhancedErrorBoundary>
      <LoadingProvider>
        <AppInitializationManager>
          {children}
        </AppInitializationManager>
      </LoadingProvider>
    </EnhancedErrorBoundary>
  );
};
