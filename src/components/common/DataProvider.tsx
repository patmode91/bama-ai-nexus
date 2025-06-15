
import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { useAppState } from '@/hooks/useAppState';
import { logger } from '@/services/loggerService';

interface DataProviderProps {
  children: React.ReactNode;
}

interface DataContextValue {
  refetchAll: () => void;
  invalidateAll: () => void;
  isOnline: boolean;
}

const DataContext = createContext<DataContextValue | null>(null);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const { setError, setLoading } = useAppState();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      logger.info('Application came online', {}, 'DataProvider');
      // Refetch queries when coming back online
      queryClient.refetchQueries({ stale: true });
    };

    const handleOffline = () => {
      setIsOnline(false);
      logger.warn('Application went offline', {}, 'DataProvider');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);

  // Global error handler for queries
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.query.state.error) {
        const error = event.query.state.error as Error;
        logger.error('Query error detected', { 
          queryKey: event.query.queryKey,
          error: error.message 
        }, 'DataProvider');
        
        setError(`Data loading error: ${error.message}`);
        
        // Clear error after 5 seconds
        setTimeout(() => setError(null), 5000);
      }
    });

    return unsubscribe;
  }, [queryClient, setError]);

  // Preload critical data
  useQuery({
    queryKey: ['app-init'],
    queryFn: async () => {
      setLoading(true);
      try {
        // Simulate app initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
        logger.info('App initialized successfully', {}, 'DataProvider');
        return { initialized: true };
      } finally {
        setLoading(false);
      }
    },
    staleTime: Infinity, // Never refetch automatically
    refetchOnWindowFocus: false
  });

  const refetchAll = () => {
    logger.info('Refetching all queries', {}, 'DataProvider');
    queryClient.refetchQueries();
  };

  const invalidateAll = () => {
    logger.info('Invalidating all queries', {}, 'DataProvider');
    queryClient.invalidateQueries();
    apiClient.invalidateCache(['api']);
  };

  const value: DataContextValue = {
    refetchAll,
    invalidateAll,
    isOnline
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
