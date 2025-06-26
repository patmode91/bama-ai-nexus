
import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  cpu: number;
  memory: number;
  network: number;
  responseTime: number;
  timestamp: number;
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  resolved: boolean;
}

interface HealthCheck {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  responseTime: number;
  uptime: number;
  lastCheck: number;
}

export const useSystemMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    // Simulate real-time metrics collection
    const metricsInterval = setInterval(() => {
      const newMetric: PerformanceMetrics = {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 100,
        responseTime: Math.random() * 2000 + 100,
        timestamp: Date.now()
      };
      
      setMetrics(prev => [...prev.slice(-19), newMetric]);
      
      // Check for alerts
      if (newMetric.cpu > 90) {
        addAlert('warning', 'High CPU usage detected');
      }
      if (newMetric.memory > 85) {
        addAlert('warning', 'High memory usage detected');
      }
      if (newMetric.responseTime > 1500) {
        addAlert('error', 'Response time threshold exceeded');
      }
    }, 5000);

    // Simulate health checks
    const healthInterval = setInterval(() => {
      updateHealthChecks();
    }, 30000);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(healthInterval);
    };
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const addAlert = useCallback((type: SystemAlert['type'], message: string) => {
    const newAlert: SystemAlert = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now(),
      resolved: false
    };
    
    setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved: true }
          : alert
      )
    );
  }, []);

  const updateHealthChecks = useCallback(() => {
    const services = [
      'Web Server',
      'Database',
      'API Gateway',
      'CDN',
      'Security Services'
    ];

    const updatedChecks = services.map((service, index) => ({
      id: (index + 1).toString(),
      name: service,
      status: Math.random() > 0.1 ? 'healthy' as const : 'warning' as const,
      responseTime: Math.random() * 200 + 10,
      uptime: Math.random() * 2 + 98,
      lastCheck: Date.now()
    }));

    setHealthChecks(updatedChecks);
  }, []);

  const runOptimization = useCallback(async () => {
    addAlert('info', 'Starting system optimization...');
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    addAlert('info', 'System optimization completed successfully');
    
    // Simulate improved metrics
    const optimizedMetric: PerformanceMetrics = {
      cpu: Math.random() * 50 + 20,
      memory: Math.random() * 60 + 30,
      network: Math.random() * 70 + 20,
      responseTime: Math.random() * 800 + 100,
      timestamp: Date.now()
    };
    
    setMetrics(prev => [...prev.slice(-19), optimizedMetric]);
  }, [addAlert]);

  const exportMetrics = useCallback(() => {
    const data = {
      metrics,
      alerts,
      healthChecks,
      exportTime: Date.now()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-metrics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [metrics, alerts, healthChecks]);

  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, [startMonitoring]);

  return {
    metrics,
    alerts,
    healthChecks,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    addAlert,
    resolveAlert,
    runOptimization,
    exportMetrics
  };
};
