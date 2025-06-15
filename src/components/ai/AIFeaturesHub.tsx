import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Search, Zap, Network, Sparkles } from 'lucide-react';

const AIFeaturesHub = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-[#00C2FF]" />
            Explore AI Features
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover the power of AI with our advanced features and intelligent agents
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700 hover:border-[#00C2FF]/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-[#00C2FF]" />
                Semantic Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Ask natural language questions and get intelligent, context-aware results.
              </p>
              <Button
                onClick={() => navigate('/ai-search')}
                className="w-full bg-[#00C2FF] hover:bg-[#00A8D8]"
              >
                Try Semantic Search
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                AI Matchmaking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Get personalized recommendations with confidence scores and explanations.
              </p>
              <Button
                onClick={() => navigate('/ai-search?tab=matchmaking')}
                className="w-full bg-purple-600 hover:bg-purple-500"
              >
                Find Matches
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-green-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-400" />
                BamaBot 2.0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Chat with our enhanced AI assistant for instant business intelligence.
              </p>
              <Button
                onClick={() => {
                  // BamaBot will automatically appear as it's already on the page
                  const bamaBotButton = document.querySelector('[data-bamabot-trigger]');
                  if (bamaBotButton) {
                    (bamaBotButton as HTMLElement).click();
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-500"
              >
                Chat with BamaBot
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Intelligence Hub
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Advanced AI intelligence center with predictive analytics and automated insights.
              </p>
              <Button
                onClick={() => navigate('/intelligence-hub')}
                className="w-full bg-purple-600 hover:bg-purple-500"
              >
                Open Intelligence Hub
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AIFeaturesHub;
