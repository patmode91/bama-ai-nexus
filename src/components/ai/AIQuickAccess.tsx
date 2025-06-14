
import { Brain, Search, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const AIQuickAccess = () => {
  return (
    <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Brain className="w-6 h-6 text-[#00C2FF]" />
          AI-Powered Discovery
          <Badge variant="secondary" className="bg-[#00C2FF]/20 text-[#00C2FF] text-xs">
            NEW
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300">
          Experience intelligent business discovery with our AI-powered search and matchmaking engine.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-[#00C2FF]" />
              <h4 className="font-medium text-white">Semantic Search</h4>
            </div>
            <p className="text-sm text-gray-400">
              Ask natural language questions to find exactly what you need
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h4 className="font-medium text-white">Smart Matching</h4>
            </div>
            <p className="text-sm text-gray-400">
              Get personalized recommendations with confidence scores
            </p>
          </div>
        </div>
        
        <Button asChild className="w-full bg-[#00C2FF] hover:bg-[#00A8D8]">
          <Link to="/ai-search" className="flex items-center gap-2">
            Try AI Search
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIQuickAccess;
