
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Download,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { enterpriseAnalyticsService } from '@/services/analytics/enterpriseAnalyticsService';

const EnterpriseAnalyticsDashboard = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReportType, setSelectedReportType] = useState<'revenue' | 'engagement' | 'growth' | 'market' | 'performance'>('revenue');
  const [isGenerating, setIsGenerating] = useState(false);
  const [analyticsOverview, setAnalyticsOverview] = useState<any>(null);

  useEffect(() => {
    loadAnalyticsOverview();
    generateInitialReports();
  }, []);

  const loadAnalyticsOverview = () => {
    const overview = enterpriseAnalyticsService.getAnalyticsOverview();
    setAnalyticsOverview(overview);
  };

  const generateInitialReports = async () => {
    const reportTypes: Array<'revenue' | 'engagement' | 'growth' | 'market' | 'performance'> = 
      ['revenue', 'engagement', 'growth', 'market', 'performance'];
    
    const initialReports = reportTypes.map(type => 
      enterpriseAnalyticsService.generateBusinessIntelligenceReport(type)
    );
    
    setReports(initialReports);
  };

  const generateReport = async (type: typeof selectedReportType) => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate generation time
      const report = enterpriseAnalyticsService.generateBusinessIntelligenceReport(type);
      setReports(prev => {
        const filtered = prev.filter(r => r.type !== type);
        return [...filtered, report];
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = (report: any) => {
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentReport = reports.find(r => r.type === selectedReportType);

  const chartColors = ['#00C2FF', '#0099CC', '#007299', '#004C66', '#002633'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Enterprise Analytics</h1>
          <p className="text-gray-400 mt-2">Comprehensive business intelligence and reporting</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadAnalyticsOverview}
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {currentReport && (
            <Button
              onClick={() => exportReport(currentReport)}
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Analytics Overview */}
      {analyticsOverview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Events</p>
                  <p className="text-2xl font-bold text-white">{analyticsOverview.totalEvents}</p>
                </div>
                <Activity className="w-8 h-8 text-[#00C2FF]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Event Types</p>
                  <p className="text-2xl font-bold text-white">{analyticsOverview.uniqueEventTypes}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-[#00C2FF]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tracked Metrics</p>
                  <p className="text-2xl font-bold text-white">{analyticsOverview.trackedMetrics.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-[#00C2FF]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Session ID</p>
                  <p className="text-sm font-mono text-white truncate">{analyticsOverview.sessionId.slice(-12)}</p>
                </div>
                <Users className="w-8 h-8 text-[#00C2FF]" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Generation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Business Intelligence Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedReportType} onValueChange={(value: any) => setSelectedReportType(value)}>
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-gray-700">
                <TabsTrigger value="revenue" className="data-[state=active]:bg-[#00C2FF]">Revenue</TabsTrigger>
                <TabsTrigger value="engagement" className="data-[state=active]:bg-[#00C2FF]">Engagement</TabsTrigger>
                <TabsTrigger value="growth" className="data-[state=active]:bg-[#00C2FF]">Growth</TabsTrigger>
                <TabsTrigger value="market" className="data-[state=active]:bg-[#00C2FF]">Market</TabsTrigger>
                <TabsTrigger value="performance" className="data-[state=active]:bg-[#00C2FF]">Performance</TabsTrigger>
              </TabsList>
              
              <Button
                onClick={() => generateReport(selectedReportType)}
                disabled={isGenerating}
                className="bg-[#00C2FF] hover:bg-[#0099CC]"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>

            {currentReport && (
              <>
                <TabsContent value="revenue" className="space-y-6">
                  {selectedReportType === 'revenue' && (
                    <div className="space-y-6">
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Revenue Trends</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={currentReport.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                              labelStyle={{ color: '#F3F4F6' }}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#00C2FF" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="engagement" className="space-y-6">
                  {selectedReportType === 'engagement' && (
                    <div className="space-y-6">
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Engagement Metrics</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={currentReport.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="metric" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                              labelStyle={{ color: '#F3F4F6' }}
                            />
                            <Bar dataKey="value" fill="#00C2FF" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="growth" className="space-y-6">
                  {selectedReportType === 'growth' && (
                    <div className="space-y-6">
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Growth Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {currentReport.data.map((item: any, index: number) => (
                            <div key={index} className="bg-gray-800 p-4 rounded-lg">
                              <h4 className="font-semibold text-white">{item.period}</h4>
                              <p className="text-2xl font-bold text-[#00C2FF]">{item.newUsers}</p>
                              <p className="text-sm text-gray-400">New Users</p>
                              <div className="flex items-center mt-2">
                                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                                <span className="text-green-400 text-sm">+{item.growth}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="market" className="space-y-6">
                  {selectedReportType === 'market' && (
                    <div className="space-y-6">
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Market Share Analysis</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={currentReport.data}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="marketShare"
                              label={(entry) => `${entry.category}: ${(entry.marketShare * 100).toFixed(1)}%`}
                            >
                              {currentReport.data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                              labelStyle={{ color: '#F3F4F6' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                  {selectedReportType === 'performance' && (
                    <div className="space-y-6">
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Performance Metrics</h3>
                        <div className="space-y-4">
                          {currentReport.data.map((metric: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                              <div>
                                <h4 className="font-semibold text-white">{metric.metric}</h4>
                                <p className="text-sm text-gray-400">{metric.value} {metric.unit}</p>
                              </div>
                              <Badge 
                                variant={metric.status === 'excellent' ? 'default' : metric.status === 'good' ? 'secondary' : 'destructive'}
                                className={
                                  metric.status === 'excellent' ? 'bg-green-600' :
                                  metric.status === 'good' ? 'bg-[#00C2FF]' : 'bg-red-600'
                                }
                              >
                                {metric.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Insights and Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Key Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {currentReport.insights.map((insight: string, index: number) => (
                          <li key={index} className="text-gray-300 text-sm flex items-start">
                            <span className="w-2 h-2 bg-[#00C2FF] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {currentReport.recommendations.map((recommendation: string, index: number) => (
                          <li key={index} className="text-gray-300 text-sm flex items-start">
                            <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnterpriseAnalyticsDashboard;
