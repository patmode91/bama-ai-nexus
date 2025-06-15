
import { useState, useEffect, useCallback } from 'react';
import { enterpriseIntegrationsService } from '@/services/integrations/enterpriseIntegrationsService';

export const useEnterpriseIntegrations = () => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(() => {
    setIntegrations(enterpriseIntegrationsService.getIntegrations());
    setStats(enterpriseIntegrationsService.getIntegrationStats());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const enableIntegration = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const success = await enterpriseIntegrationsService.enableIntegration(id);
      if (success) {
        loadData();
      }
      return success;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  const disableIntegration = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const success = await enterpriseIntegrationsService.disableIntegration(id);
      if (success) {
        loadData();
      }
      return success;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  const testIntegration = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const success = await enterpriseIntegrationsService.testIntegration(id);
      loadData();
      return success;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  const syncIntegration = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const success = await enterpriseIntegrationsService.syncIntegration(id);
      loadData();
      return success;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  const getIntegration = useCallback((id: string) => {
    return enterpriseIntegrationsService.getIntegration(id);
  }, []);

  const getWebhookEvents = useCallback(() => {
    return enterpriseIntegrationsService.getWebhookEvents();
  }, []);

  return {
    integrations,
    stats,
    loading,
    enableIntegration,
    disableIntegration,
    testIntegration,
    syncIntegration,
    getIntegration,
    getWebhookEvents,
    loadData
  };
};
