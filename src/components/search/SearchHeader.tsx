
import { Brain, Search, Target } from 'lucide-react';

const SearchHeader = () => {
  return (
    <div className="text-center space-y-4 mb-8">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Brain className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">AI-Powered Business Discovery</h1>
      </div>
      
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Discover Alabama's AI and technology ecosystem with semantic search and intelligent matching
      </p>
      
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          <span>Semantic Search</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          <span>AI Matching</span>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          <span>Smart Recommendations</span>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;
