
import { useState } from 'react';
import { systemOptimizer } from '@/services/systemOptimizer';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import OptimizationHeader from './optimization/OptimizationHeader';
import OptimizationResultAlert from './optimization/OptimizationResultAlert';
import PerformanceStatusCards from './optimization/PerformanceStatusCards';
import PerformanceTrendsChart from './optimization/PerformanceTrendsChart';
import OptimizationSuggestions from './optimization/OptimizationSuggestions';
import RecentOptimizations from './optimization/RecentOptimizations';

const SystemOptimization = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const { score } = usePerformanceMonitoring();

  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    try {
      const result = await systemOptimizer.runOptimization();
      setOptimizationResult(result);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const optimizationHistory = systemOptimizer.getOptimizationHistory().slice(-10);
  const suggestions = systemOptimizer.getOptimizationSuggestions();

  return (
    <div className="space-y-6">
      <OptimizationHeader 
        isOptimizing={isOptimizing}
        onRunOptimization={handleRunOptimization}
      />

      {optimizationResult && (
        <OptimizationResultAlert result={optimizationResult} />
      )}

      <PerformanceStatusCards 
        score={score}
        optimizationHistoryCount={optimizationHistory.length}
      />

      <PerformanceTrendsChart score={score} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OptimizationSuggestions suggestions={suggestions} />
        <RecentOptimizations optimizationHistory={optimizationHistory} />
      </div>
    </div>
  );
};

export default SystemOptimization;
