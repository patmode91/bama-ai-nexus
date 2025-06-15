
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, BarChart3, AlertTriangle, Info, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MarketInsight {
  id: string;
  type: 'trend' | 'opportunity' | 'risk' | 'data_point' | 'prediction';
  sector: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  data?: {
    value?: number;
    change?: number;
    unit?: string;
    comparison?: string;
  };
  timestamp: string;
  source: 'ai_analysis' | 'market_data' | 'user_activity' | 'external_api';
}

const LiveMarketIntelligence = () => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string>('all');

  const sectors = ['all', 'technology', 'healthcare', 'construction', 'retail', 'food_service', 'manufacturing'];

  useEffect(() => {
    loadInitialInsights();
    if (isLive) {
      subscribeToInsights();
    }
  }, [isLive]);

  const loadInitialInsights = async () => {
    const mockInsights: MarketInsight[] = [
      {
        id: '1',
        type: 'trend',
        sector: 'technology',
        title: 'Rising Demand for AI Services',
        description: 'AI and machine learning services showing 34% increase in inquiries this quarter',
        impact: 'high',
        confidence: 87,
        data: {
          value: 34,
          change: 12,
          unit: '%',
          comparison: 'vs last quarter'
        },
        timestamp: new Date(Date.now() - 300000).toISOString(),
        source: 'ai_analysis'
      },
      {
        id: '2',
        type: 'opportunity',
        sector: 'healthcare',
        title: 'Telehealth Services Gap',
        description: 'Identified underserved rural areas with high demand for telehealth solutions',
        impact: 'high',
        confidence: 92,
        data: {
          value: 15,
          unit: 'counties',
          comparison: 'with unmet demand'
        },
        timestamp: new Date(Date.now() - 600000).toISOString(),
        source: 'market_data'
      },
      {
        id: '3',
        type: 'risk',
        sector: 'construction',
        title: 'Material Cost Volatility',
        description: 'Construction material costs showing increased volatility, affecting project budgets',
        impact: 'medium',
        confidence: 78,
        data: {
          value: 23,
          change: 8,
          unit: '%',
          comparison: 'price fluctuation'
        },
        timestamp: new Date(Date.now() - 900000).toISOString(),
        source: 'external_api'
      },
      {
        id: '4',
        type: 'prediction',
        sector: 'retail',
        title: 'E-commerce Growth Projection',
        description: 'Local e-commerce businesses expected to grow 18% in next 6 months',
        impact: 'medium',
        confidence: 81,
        data: {
          value: 18,
          unit: '%',
          comparison: 'growth expected'
        },
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        source: 'ai_analysis'
      }
    ];
    setInsights(mockInsights);
  };

  const subscribeToInsights = () => {
    const channel = supabase
      .channel('market_intelligence')
      .on('broadcast', { event: 'new_insight' }, (payload) => {
        const newInsight = payload.payload as MarketInsight;
        setInsights(prev => [newInsight, ...prev.slice(0, 19)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'opportunity':
        return <BarChart3 className="w-4 h-4 text-blue-500" />;
      case 'risk':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'prediction':
        return <TrendingDown className="w-4 h-4 text-purple-500" />;
      case 'data_point':
        return <Info className="w-4 h-4 text-cyan-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend':
        return 'border-green-500/20 bg-green-500/5';
      case 'opportunity':
        return 'border-blue-500/20 bg-blue-500/5';
      case 'risk':
        return 'border-red-500/20 bg-red-500/5';
      case 'prediction':
        return 'border-purple-500/20 bg-purple-500/5';
      case 'data_point':
        return 'border-cyan-500/20 bg-cyan-500/5';
      default:
        return 'border-gray-500/20 bg-gray-500/5';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredInsights = selectedSector === 'all' 
    ? insights 
    : insights.filter(insight => insight.sector === selectedSector);

  return (
    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Live Market Intelligence</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? 'Live' : 'Paused'}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {sectors.map((sector) => (
            <Button
              key={sector}
              variant={selectedSector === sector ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSector(sector)}
              className="capitalize text-xs"
            >
              {sector.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {filteredInsights.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No market insights available</p>
              </div>
            ) : (
              filteredInsights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        {getInsightIcon(insight.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-white text-sm">
                          {insight.title}
                        </h4>
                        <Badge className={`${getImpactColor(insight.impact)} border text-xs`}>
                          {insight.impact} impact
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {insight.sector}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-3">
                        {insight.description}
                      </p>
                      
                      {insight.data && (
                        <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-gray-800 rounded-lg">
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Value</div>
                            <div className="text-lg font-semibold text-white flex items-center">
                              {insight.data.value}
                              {insight.data.unit && <span className="text-sm ml-1">{insight.data.unit}</span>}
                              {insight.data.change && (
                                <span className={`text-xs ml-2 ${insight.data.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {insight.data.change > 0 ? '+' : ''}{insight.data.change}%
                                </span>
                              )}
                            </div>
                            {insight.data.comparison && (
                              <div className="text-xs text-gray-400">{insight.data.comparison}</div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Confidence</div>
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-white">{insight.confidence}%</div>
                              <Progress value={insight.confidence} className="h-2" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="capitalize">{insight.source.replace('_', ' ')}</span>
                        <span>{formatDistanceToNow(new Date(insight.timestamp), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveMarketIntelligence;
