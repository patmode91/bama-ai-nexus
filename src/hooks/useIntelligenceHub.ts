
import { useState, useEffect, useCallback } from 'react';
import { intelligenceHubService } from '@/services/ai/intelligenceHubService';

export const useIntelligenceHub = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [automationRules, setAutomationRules] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [insightsData, modelsData, rulesData, summaryData] = await Promise.all([
        Promise.resolve(intelligenceHubService.getInsights()),
        Promise.resolve(intelligenceHubService.getModels()),
        Promise.resolve(intelligenceHubService.getAutomationRules()),
        Promise.resolve(intelligenceHubService.getAnalysisSummary())
      ]);

      setInsights(insightsData);
      setModels(modelsData);
      setAutomationRules(rulesData);
      setSummary(summaryData);
    } catch (err) {
      setError('Failed to load intelligence data');
      console.error('Error loading intelligence data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    
    // Set up real-time updates
    const interval = setInterval(loadData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [loadData]);

  const getInsightsByType = useCallback((type: string) => {
    return intelligenceHubService.getInsights(type as any);
  }, []);

  const generatePrediction = useCallback(async (modelId: string, data: any) => {
    setLoading(true);
    try {
      const prediction = intelligenceHubService.generatePrediction(modelId, data);
      await loadData(); // Refresh data after generating prediction
      return prediction;
    } catch (err) {
      setError('Failed to generate prediction');
      console.error('Error generating prediction:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  const createAutomationRule = useCallback(async (rule: any) => {
    setLoading(true);
    try {
      const newRule = intelligenceHubService.addAutomationRule(rule);
      await loadData(); // Refresh data after creating rule
      return newRule;
    } catch (err) {
      setError('Failed to create automation rule');
      console.error('Error creating automation rule:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  const updateAutomationRule = useCallback(async (id: string, updates: any) => {
    setLoading(true);
    try {
      const success = intelligenceHubService.updateAutomationRule(id, updates);
      if (success) {
        await loadData(); // Refresh data after updating rule
      }
      return success;
    } catch (err) {
      setError('Failed to update automation rule');
      console.error('Error updating automation rule:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  const deleteAutomationRule = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const success = intelligenceHubService.deleteAutomationRule(id);
      if (success) {
        await loadData(); // Refresh data after deleting rule
      }
      return success;
    } catch (err) {
      setError('Failed to delete automation rule');
      console.error('Error deleting automation rule:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  return {
    insights,
    models,
    automationRules,
    summary,
    loading,
    error,
    loadData,
    getInsightsByType,
    generatePrediction,
    createAutomationRule,
    updateAutomationRule,
    deleteAutomationRule
  };
};
