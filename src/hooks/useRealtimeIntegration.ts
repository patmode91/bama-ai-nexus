
import { useState, useEffect, useCallback } from 'react';
import { useRealtime } from './useRealtime';
import { usePerformanceOptimization } from './usePerformanceOptimization';
import { useLoading } from '@/components/common/SmartLoadingManager';
import { userExperienceService } from '@/services/userExperienceService';
import { logger } from '@/services/loggerService';

interface RealtimeMetrics {
  connectionLatency: number;
  messageRate: number;
  activeConnections: number;
  dataTransferRate: number;
}

interface RealtimeIntegrationOptions {
  enablePerformanceTracking?: boolean;
  enableUserTracking?: boolean;
  enableAutoOptimization?: boolean;
  metricsUpdateInterval?: number;
}

export const useRealtimeIntegration = (
  channel: string,
  options: RealtimeIntegrationOptions = {}
) => {
  const {
    enablePerformanceTracking = true,
    enableUserTracking = true,
    enableAutoOptimization = true,
    metricsUpdateInterval = 5000
  } = options;

  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    connectionLatency: 0,
    messageRate: 0,
    activeConnections: 0,
    dataTransferRate: 0
  });

  const [isOptimized, setIsOptimized] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<Date | null>(null);

  const { addLoading, updateProgress, setSuccess, setError } = useLoading();
  const { suggestions, optimizePerformance } = usePerformanceOptimization();
  
  const { events, connectionStatus, broadcast, isConnected } = useRealtime({
    channel,
    onEvent: (event) => {
      if (enableUserTracking) {
        userExperienceService.trackCustomEvent('realtime_event_received', {
          channel,
          eventType: event.type,
          timestamp: Date.now()
        });
      }
    }
  });

  // Monitor realtime performance metrics
  const updateMetrics = useCallback(() => {
    const startTime = performance.now();
    
    // Measure connection latency with a system event instead of ping
    broadcast({
      type: 'system_alert',
      data: { 
        message: 'performance_check',
        timestamp: Date.now() 
      }
    });

    const endTime = performance.now();
    const latency = endTime - startTime;

    setMetrics(prev => ({
      ...prev,
      connectionLatency: latency,
      messageRate: events.length / (metricsUpdateInterval / 1000),
      activeConnections: isConnected ? 1 : 0,
      dataTransferRate: events.reduce((sum, event) => 
        sum + JSON.stringify(event).length, 0
      ) / (metricsUpdateInterval / 1000)
    }));

    if (enablePerformanceTracking) {
      logger.info('Realtime metrics updated', {
        channel,
        latency,
        messageRate: events.length,
        connectionStatus
      }, 'RealtimeIntegration');
    }
  }, [broadcast, events, isConnected, connectionStatus, channel, metricsUpdateInterval, enablePerformanceTracking]);

  // Auto-optimization based on performance
  const handleAutoOptimization = useCallback(async () => {
    if (!enableAutoOptimization || isOptimized) return;

    const shouldOptimize = 
      metrics.connectionLatency > 1000 || // High latency
      metrics.messageRate > 100 || // High message rate
      suggestions.some(s => s.severity === 'warning');

    if (shouldOptimize) {
      addLoading('realtime-optimization', 'Optimizing real-time performance...');
      
      try {
        await optimizePerformance();
        setIsOptimized(true);
        setLastOptimization(new Date());
        setSuccess('realtime-optimization');
        
        logger.info('Real-time system optimized', {
          channel,
          metrics,
          suggestionsCount: suggestions.length
        }, 'RealtimeIntegration');
      } catch (error) {
        setError('realtime-optimization', 'Failed to optimize real-time performance');
        logger.error('Real-time optimization failed', { error, channel }, 'RealtimeIntegration');
      }
    }
  }, [enableAutoOptimization, isOptimized, metrics, suggestions, addLoading, optimizePerformance, setSuccess, setError, channel]);

  // Connection health monitoring
  const getConnectionHealth = useCallback(() => {
    if (!isConnected) return 'disconnected';
    if (metrics.connectionLatency > 2000) return 'poor';
    if (metrics.connectionLatency > 1000) return 'fair';
    return 'excellent';
  }, [isConnected, metrics.connectionLatency]);

  // Enhanced broadcast with performance tracking
  const enhancedBroadcast = useCallback((event: any) => {
    const startTime = performance.now();
    
    broadcast(event);
    
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (enablePerformanceTracking && duration > 100) {
      logger.warn('Slow broadcast detected', {
        channel,
        duration,
        eventType: event.type
      }, 'RealtimeIntegration');
    }

    if (enableUserTracking) {
      userExperienceService.trackCustomEvent('realtime_broadcast_sent', {
        channel,
        eventType: event.type,
        duration,
        timestamp: Date.now()
      });
    }
  }, [broadcast, channel, enablePerformanceTracking, enableUserTracking]);

  // Periodic metrics updates
  useEffect(() => {
    if (!enablePerformanceTracking) return;

    const interval = setInterval(updateMetrics, metricsUpdateInterval);
    return () => clearInterval(interval);
  }, [updateMetrics, metricsUpdateInterval, enablePerformanceTracking]);

  // Auto-optimization check
  useEffect(() => {
    handleAutoOptimization();
  }, [handleAutoOptimization]);

  // Reset optimization flag when connection changes
  useEffect(() => {
    if (connectionStatus === 'connected' && isOptimized) {
      setIsOptimized(false);
    }
  }, [connectionStatus, isOptimized]);

  return {
    // Original realtime functionality
    events,
    connectionStatus,
    broadcast: enhancedBroadcast,
    isConnected,
    
    // Enhanced metrics and monitoring
    metrics,
    connectionHealth: getConnectionHealth(),
    isOptimized,
    lastOptimization,
    
    // Utility functions
    updateMetrics,
    forceOptimization: handleAutoOptimization
  };
};
