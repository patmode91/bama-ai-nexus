
import { Button } from '@/components/ui/button';
import { Play, RotateCcw } from 'lucide-react';

interface OptimizationHeaderProps {
  isOptimizing: boolean;
  onRunOptimization: () => void;
}

const OptimizationHeader = ({ isOptimizing, onRunOptimization }: OptimizationHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white">System Optimization</h2>
        <p className="text-gray-400">Automated performance optimization and system tuning</p>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRunOptimization}
          disabled={isOptimizing}
        >
          {isOptimizing ? (
            <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
        </Button>
      </div>
    </div>
  );
};

export default OptimizationHeader;
