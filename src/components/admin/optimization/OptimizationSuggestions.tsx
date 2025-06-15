
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, CheckCircle } from 'lucide-react';

interface OptimizationSuggestion {
  type: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

interface OptimizationSuggestionsProps {
  suggestions: OptimizationSuggestion[];
}

const OptimizationSuggestions = ({ suggestions }: OptimizationSuggestionsProps) => {
  return (
    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
          Optimization Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-300">All systems optimized!</p>
            <p className="text-sm text-gray-400">No immediate optimizations needed</p>
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-white">{suggestion.type} Optimization</h4>
                <Badge 
                  variant={suggestion.priority === 'high' ? 'destructive' : 'secondary'}
                  className={`text-xs ${
                    suggestion.priority === 'high' 
                      ? 'bg-red-400/20 text-red-400' 
                      : 'bg-yellow-400/20 text-yellow-400'
                  }`}
                >
                  {suggestion.priority}
                </Badge>
              </div>
              <p className="text-sm text-gray-300">{suggestion.message}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default OptimizationSuggestions;
