
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

interface OptimizationResult {
  beforeScore: number;
  afterScore: number;
  improvement: number;
  optimizationsApplied: any[];
}

interface OptimizationResultAlertProps {
  result: OptimizationResult;
}

const OptimizationResultAlert = ({ result }: OptimizationResultAlertProps) => {
  const isImprovement = result.improvement > 0;
  const colorClass = isImprovement ? 'green' : 'yellow';

  return (
    <Alert className={`border-${colorClass}-400/50 bg-${colorClass}-400/10`}>
      <CheckCircle className={`h-4 w-4 text-${colorClass}-400`} />
      <AlertDescription className={`text-${colorClass}-200`}>
        <div className="font-medium mb-2">Optimization Complete!</div>
        <p>Performance score improved by {result.improvement.toFixed(1)} points 
        ({result.beforeScore.toFixed(1)} → {result.afterScore.toFixed(1)})</p>
      </AlertDescription>
    </Alert>
  );
};

export default OptimizationResultAlert;
