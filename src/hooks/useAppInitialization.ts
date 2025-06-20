
import { useState, useEffect } from 'react';
import { cacheInitializer } from '@/services/cache/cacheInitializer';
import { predictionEngine } from '@/services/ml/predictionEngine';
import { logger } from '@/services/loggerService';

export const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [initializationProgress, setInitializationProgress] = useState(0);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        logger.info('Starting application initialization...', {}, 'AppInitialization');
        
        setInitializationProgress(25);
        
        // Initialize cache system
        await cacheInitializer.initialize();
        setInitializationProgress(50);
        
        // Initialize ML prediction engine
        await predictionEngine.initialize();
        setInitializationProgress(75);
        
        // Mark as fully initialized
        setInitializationProgress(100);
        setIsInitialized(true);
        
        logger.info('Application initialization completed', {}, 'AppInitialization');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
        setInitializationError(errorMessage);
        logger.error('Application initialization failed', { error }, 'AppInitialization');
      }
    };

    initializeApp();
  }, []);

  return {
    isInitialized,
    initializationError,
    initializationProgress
  };
};
