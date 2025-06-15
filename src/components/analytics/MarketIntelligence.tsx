
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Globe,
  Users,
  DollarSign,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const MarketIntelligence = () => {
  const { marketIntelligence, isLoadingIntelligence } = useAnalytics();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock market intelligence data
  const marketTrends = [
    { 
      category: 'AI & Technology', 
      trend: 'Explosive Growth', 
      score: 95, 
      change: '+245%',
      opportunity: 'High',
      risk: 'Low'
    },
    { 
      category: 'Healthcare Tech', 
      trend: 'Strong Growth', 
      score: 88, 
      change: '+156%',
      opportunity: 'High',
      risk: 'Medium'
    },
    { 
      category: 'E-commerce', 
      trend: 'Steady Growth', 
      score: 72, 
      change: '+89%',
      opportunity: 'Medium',
      risk: 'Low'
    },
    { 
      category: 'Traditional Retail', 
      trend: 'Declining', 
      score: 45, 
      change: '-23%',
      opportunity: 'Low',
      risk: 'High'
    },
    { 
      category: 'Remote Services', 
      trend: 'Rapid Growth', 
      score: 82, 
      change: '+178%',
      opportunity: 'High',
      risk: 'Medium'
    }
  ];

  const competitiveAnalysis = [
    { metric: 'Market Share', alabama: 65, competitors: 35 },
    { metric: 'Customer Satisfaction', alabama: 78, competitors: 72 },
    { metric: 'Innovation Index', alabama: 85, competitors: 70 },
    { metric: 'Price Competitiveness', alabama: 72, competitors: 68 },
    { metric: 'Service Quality', alabama: 88, competitors: 75 },
    { metric: 'Digital Presence', alabama: 82, competitors: 79 }
  ];

  const opportunityMapping = [
    {
      opportunity: 'AI Integration Services',
      market_size: 45000000,
      competition: 'Low',
      timeframe: '6-12 months',
      roi_potential: 'Very High',
      risk_level: 'Medium',
      description: 'Growing demand for AI implementation in traditional businesses'
    },
    {
      opportunity: 'Healthcare Digital Transformation',
      market_size: 78000000,
      competition: 'Medium',
      timeframe: '12-18 months',
      roi_potential: 'High',
      risk_level: 'Low',
      description: 'Modernization of healthcare systems and processes'
    },
    {
      opportunity: 'Green Technology Solutions',
      market_size: 32000000,
      competition: 'Low',
      timeframe: '18-24 months',
      roi_potential: 'High',
      risk_level: 'Medium',
      description: 'Sustainable technology adoption across industries'
    },
    {
      opportunity: 'Remote Work Infrastructure',
      market_size: 28000000,
      competition: 'High',
      timeframe: '3-6 months',
      roi_potential: 'Medium',
      risk_level: 'Low',
      description: 'Continued demand for remote work solutions'
    }
  ];

  const recommendations = [
    {
      title: 'Invest in AI & Machine Learning',
      priority: 'High',
      impact: 'Very High',
      effort: 'Medium',
      description: 'The AI sector is experiencing explosive growth. Businesses should prioritize AI integration.',
      action: 'Allocate 25% more resources to AI-related ventures'
    },
    {
      title: 'Expand Healthcare Technology',
      priority: 'High',
      impact: 'High',
      effort: 'High',
      description: 'Healthcare tech presents significant opportunities with lower risk profiles.',
      action: 'Partner with healthcare providers for digital transformation'
    },
    {
      title: 'Diversify from Traditional Retail',
      priority: 'Medium',
      impact: 'Medium',
      effort: 'Low',
      description: 'Traditional retail is declining. Consider pivoting to e-commerce or hybrid models.',
      action: 'Develop transition plans for retail businesses'
    },
    {
      title: 'Strengthen Digital Infrastructure',
      priority: 'High',
      impact: 'High',
      effort: 'Medium',
      description: 'Remote services continue to grow. Improve digital capabilities.',
      action: 'Invest in cloud infrastructure and digital tools'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-400/20 text-red-400 border-red-400/30';
      case 'Medium': return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      case 'Low': return 'bg-green-400/20 text-green-400 border-green-400/30';
      default: return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
    }
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'High': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (isLoadingIntelligence) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-700 rounded"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#00C2FF]" />
            Market Intelligence
          </h2>
          <p className="text-gray-400">AI-powered insights and strategic recommendations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Intelligence Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <Badge className="bg-green-400/20 text-green-400">Strong</Badge>
            </div>
            <h3 className="text-lg font-semibold text-white">Market Health</h3>
            <p className="text-2xl font-bold text-green-400">87/100</p>
            <p className="text-sm text-gray-400">Overall market strength</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-blue-400" />
              <Badge className="bg-blue-400/20 text-blue-400">12 Active</Badge>
            </div>
            <h3 className="text-lg font-semibold text-white">Opportunities</h3>
            <p className="text-2xl font-bold text-blue-400">$183M</p>
            <p className="text-sm text-gray-400">Total market potential</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-400" />
              <Badge className="bg-yellow-400/20 text-yellow-400">4 High</Badge>
            </div>
            <h3 className="text-lg font-semibold text-white">Recommendations</h3>
            <p className="text-2xl font-bold text-yellow-400">94%</p>
            <p className="text-sm text-gray-400">Confidence score</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends Analysis</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Competitive Position</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={competitiveAnalysis}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <PolarRadiusAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                    <Radar 
                      name="Alabama" 
                      dataKey="alabama" 
                      stroke="#00C2FF" 
                      fill="#00C2FF" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar 
                      name="Competitors" 
                      dataKey="competitors" 
                      stroke="#EF4444" 
                      fill="#EF4444" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Market Sentiment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-green-900/20 border-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-200">
                    <strong>Positive Outlook:</strong> Alabama's business ecosystem shows strong growth potential with increasing investor confidence.
                  </AlertDescription>
                </Alert>
                
                <Alert className="bg-blue-900/20 border-blue-600">
                  <Zap className="h-4 w-4" />
                  <AlertDescription className="text-blue-200">
                    <strong>Innovation Drive:</strong> High adoption rate of emerging technologies positions Alabama as a regional leader.
                  </AlertDescription>
                </Alert>
                
                <Alert className="bg-yellow-900/20 border-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-yellow-200">
                    <strong>Watch Areas:</strong> Traditional industries may need modernization to remain competitive.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Industry Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="space-y-2">
                      <h4 className="font-medium text-white">{trend.category}</h4>
                      <p className="text-sm text-gray-400">{trend.trend}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Growth</div>
                        <div className={`font-bold ${
                          trend.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {trend.change}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Score</div>
                        <div className="font-bold text-white">{trend.score}</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Opportunity</div>
                        <div className={`font-bold ${getOpportunityColor(trend.opportunity)}`}>
                          {trend.opportunity}
                        </div>
                      </div>
                      
                      <Badge 
                        variant="outline"
                        className={trend.risk === 'Low' ? 'border-green-400 text-green-400' : 
                                 trend.risk === 'Medium' ? 'border-yellow-400 text-yellow-400' :
                                 'border-red-400 text-red-400'}
                      >
                        {trend.risk} Risk
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid gap-6">
            {opportunityMapping.map((opp, index) => (
              <Card key={index} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{opp.opportunity}</h3>
                      <p className="text-gray-400 mt-1">{opp.description}</p>
                    </div>
                    <Badge className="bg-blue-400/20 text-blue-400">
                      ${(opp.market_size / 1000000).toFixed(0)}M Market
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Competition</div>
                      <div className={`font-medium ${getOpportunityColor(opp.competition)}`}>
                        {opp.competition}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400">Timeframe</div>
                      <div className="font-medium text-white">{opp.timeframe}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400">ROI Potential</div>
                      <div className={`font-medium ${getOpportunityColor(opp.roi_potential)}`}>
                        {opp.roi_potential}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400">Risk Level</div>
                      <div className={`font-medium ${
                        opp.risk_level === 'Low' ? 'text-green-400' :
                        opp.risk_level === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {opp.risk_level}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Card key={index} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{rec.title}</h3>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority} Priority
                        </Badge>
                      </div>
                      <p className="text-gray-400 mb-3">{rec.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">Impact: <span className="text-white">{rec.impact}</span></span>
                        <span className="text-gray-400">Effort: <span className="text-white">{rec.effort}</span></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Recommended Action</span>
                    </div>
                    <p className="text-white">{rec.action}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketIntelligence;
