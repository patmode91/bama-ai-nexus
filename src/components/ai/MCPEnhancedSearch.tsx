
import { useState } from 'react';
import { Search, Sparkles, Brain, Database, TrendingUp, Building2, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMCP } from '@/hooks/useMCP';
import { ConnectorResponse } from '@/services/mcp/MCPAgentConnector';
import { AnalystResponse } from '@/services/mcp/MCPAgentAnalyst';
import { CuratorResponse } from '@/services/mcp/MCPAgentCurator';

interface MCPSearchResult {
  connector?: ConnectorResponse;
  analyst?: AnalystResponse;
  curator?: CuratorResponse;
  context?: any;
}

const MCPEnhancedSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MCPSearchResult | null>(null);
  const { processMessage, runFullAnalysis, isLoading } = useMCP();

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      // Process the user message to extract context and entities
      const context = await processMessage(query);
      
      // Run full analysis with all three agents
      const fullResults = await runFullAnalysis(
        'find_business_solution',
        {
          originalQuery: query,
          timestamp: new Date().toISOString()
        }
      );

      setResults(fullResults);
    } catch (error) {
      console.error('MCP Search error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe what you're looking for... (e.g., 'AI company in Birmingham for healthcare automation')"
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={!query.trim() || isLoading}
          className="bg-gradient-to-r from-[#00C2FF] to-blue-600 hover:from-[#00A8D8] hover:to-blue-500"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              AI Search
            </>
          )}
        </Button>
      </div>

      {/* Agent Status Indicators */}
      {isLoading && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-blue-400 animate-pulse" />
                <span className="text-white">The Connector</span>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  Finding Matches
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-400 animate-pulse" />
                <span className="text-white">The Analyst</span>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                  Market Analysis
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-green-400 animate-pulse" />
                <span className="text-white">The Curator</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  Data Enrichment
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Business Matches from The Connector */}
          {results.connector && results.connector.matches.length > 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-400" />
                  Business Matches ({results.connector.totalMatches} found)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {results.connector.matches.slice(0, 5).map((match, index) => (
                    <div
                      key={match.business.id}
                      className="p-4 bg-gray-700 rounded-lg border border-gray-600"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {match.business.businessname}
                          </h3>
                          <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                            {match.business.description}
                          </p>
                          <p className="text-gray-400 text-xs">{match.reasoning}</p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                          {match.score}% match
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {match.business.category}
                        </span>
                        {match.business.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {match.business.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {results.connector.recommendations.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <h4 className="text-white font-medium mb-2">Recommendations:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {results.connector.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Market Insights from The Analyst */}
          {results.analyst && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Market Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">Market Overview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sector:</span>
                        <span className="text-white">{results.analyst.insights.sector}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Market Trend:</span>
                        <Badge className={
                          results.analyst.insights.marketTrend === 'growing' ? 'bg-green-500' :
                          results.analyst.insights.marketTrend === 'stable' ? 'bg-yellow-500' : 'bg-red-500'
                        }>
                          {results.analyst.insights.marketTrend}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Demand Level:</span>
                        <Badge className={
                          results.analyst.insights.demandLevel === 'high' ? 'bg-green-500' :
                          results.analyst.insights.demandLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }>
                          {results.analyst.insights.demandLevel}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Competitors:</span>
                        <span className="text-white">{results.analyst.insights.competitorCount}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-3">Project Insights</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Budget Range:</span>
                        <span className="text-white">
                          ${results.analyst.insights.averageProjectCost.min.toLocaleString()} - 
                          ${results.analyst.insights.averageProjectCost.max.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Timeline:</span>
                        <span className="text-white">{results.analyst.insights.typicalTimeline}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {results.analyst.insights.keyFactors.length > 0 && (
                  <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <h4 className="text-white font-medium mb-2">Key Market Factors:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {results.analyst.insights.keyFactors.map((factor, index) => (
                        <li key={index}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Data Quality Report from The Curator */}
          {results.curator && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-400" />
                  Data Quality & Enrichment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-white">
                      {results.curator.dataQualityReport.totalProcessed}
                    </div>
                    <div className="text-gray-400 text-sm">Total Processed</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {results.curator.dataQualityReport.highQuality}
                    </div>
                    <div className="text-gray-400 text-sm">High Quality</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">
                      {results.curator.dataQualityReport.needsImprovement}
                    </div>
                    <div className="text-gray-400 text-sm">Need Enhancement</div>
                  </div>
                </div>

                {results.curator.suggestions.length > 0 && (
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="text-white font-medium mb-2">Data Suggestions:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {results.curator.suggestions.map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {query && !results && !isLoading && (
        <Card className="text-center p-8 bg-gray-800 border-gray-700">
          <CardContent>
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">
              Click "AI Search" to discover businesses with intelligent analysis from our AI agents.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MCPEnhancedSearch;
