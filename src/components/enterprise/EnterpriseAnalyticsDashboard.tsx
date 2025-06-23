
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  Award,
  FileText,
  BarChart3,
  Target,
  Zap,
  ChevronUp,
  ChevronDown,
  Download,
  Calendar
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useEnterpriseAnalytics } from '@/hooks/useEnterpriseAnalytics';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#00C2FF', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6'];

export const EnterpriseAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '12m'>('30d');
  const { overview, generateReport, exportData } = useEnterpriseAnalytics();
  const { metrics, userEngagement, benchmarks } = useAnalytics();

  // Mock enterprise-specific data - in real app, this would come from analytics service
  const institutionalMetrics = {
    researcherHoursSaved: 2847,
    grantSuccessRate: 87.3,
    grantIncreaseAmount: 2340000,
    collaborationsEnabled: 156,
    publicationsSupported: 89,
    costPerResearcherHour: 12.50,
    institutionROI: 340.2,
    activeResearchers: 342,
    averageProjectValue: 145000
  };

  const productivityData = [
    { month: 'Jan', hoursSaved: 180, grants: 12, collaborations: 8 },
    { month: 'Feb', hoursSaved: 220, grants: 15, collaborations: 12 },
    { month: 'Mar', hoursSaved: 340, grants: 18, collaborations: 14 },
    { month: 'Apr', hoursSaved: 290, grants: 22, collaborations: 16 },
    { month: 'May', hoursSaved: 420, grants: 28, collaborations: 19 },
    { month: 'Jun', hoursSaved: 380, grants: 24, collaborations: 21 }
  ];

  const grantSuccessData = [
    { name: 'Successful', value: 87, color: '#00C2FF' },
    { name: 'Pending', value: 8, color: '#FCD34D' },
    { name: 'Declined', value: 5, color: '#EF4444' }
  ];

  const departmentROI = [
    { department: 'Engineering', roi: 420, researchers: 89, hoursSaved: 1240 },
    { department: 'Medicine', roi: 380, researchers: 67, hoursSaved: 890 },
    { department: 'Computer Science', roi: 340, researchers: 45, hoursSaved: 760 },
    { department: 'Physics', roi: 290, researchers: 34, hoursSaved: 520 },
    { department: 'Chemistry', roi: 260, researchers: 28, hoursSaved: 440 }
  ];

  const handleExportReport = async () => {
    const report = generateReport('performance', {
      start: Date.now() - (30 * 24 * 60 * 60 * 1000),
      end: Date.now()
    });
    
    // Mock export functionality
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enterprise-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Enterprise Analytics Dashboard</h1>
            <p className="text-gray-400">B2B/B2I ROI metrics and institutional performance insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="12m">Last 12 months</option>
            </select>
            <Button onClick={handleExportReport} className="bg-[#00C2FF] hover:bg-[#00A8D8]">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key ROI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Researcher Hours Saved</p>
                  <p className="text-2xl font-bold text-white">{institutionalMetrics.researcherHoursSaved.toLocaleString()}</p>
                  <p className="text-green-400 text-sm flex items-center">
                    <ChevronUp className="w-3 h-3 mr-1" />
                    +23% vs last period
                  </p>
                </div>
                <div className="bg-[#00C2FF]/20 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-[#00C2FF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Grant Success Rate</p>
                  <p className="text-2xl font-bold text-white">{institutionalMetrics.grantSuccessRate}%</p>
                  <p className="text-green-400 text-sm flex items-center">
                    <ChevronUp className="w-3 h-3 mr-1" />
                    +15% improvement
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <Award className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Grant Funding Increase</p>
                  <p className="text-2xl font-bold text-white">${(institutionalMetrics.grantIncreaseAmount / 1000000).toFixed(1)}M</p>
                  <p className="text-green-400 text-sm flex items-center">
                    <ChevronUp className="w-3 h-3 mr-1" />
                    +$450K this quarter
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Institution ROI</p>
                  <p className="text-2xl font-bold text-white">{institutionalMetrics.institutionROI}%</p>
                  <p className="text-green-400 text-sm flex items-center">
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Exceeds target by 140%
                  </p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="productivity" className="space-y-6">
          <TabsList className="bg-gray-800 w-full">
            <TabsTrigger value="productivity" className="flex-1">Productivity Impact</TabsTrigger>
            <TabsTrigger value="grants" className="flex-1">Grant Performance</TabsTrigger>
            <TabsTrigger value="departments" className="flex-1">Department Analysis</TabsTrigger>
            <TabsTrigger value="benchmarks" className="flex-1">Industry Benchmarks</TabsTrigger>
          </TabsList>

          <TabsContent value="productivity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Research Productivity Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={productivityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="hoursSaved" stroke="#00C2FF" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Cost-Benefit Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Monthly Subscription Cost</h4>
                    <p className="text-2xl font-bold text-white">$12,500</p>
                    <p className="text-sm text-gray-400">Enterprise Plan for 342 researchers</p>
                  </div>
                  
                  <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                    <h4 className="text-green-400 font-medium mb-2">Value Generated</h4>
                    <p className="text-2xl font-bold text-green-400">$42,600</p>
                    <p className="text-sm text-gray-400">Based on {institutionalMetrics.researcherHoursSaved} hours saved @ ${institutionalMetrics.costPerResearcherHour}/hour</p>
                  </div>

                  <div className="bg-[#00C2FF]/10 p-4 rounded-lg border border-[#00C2FF]/20">
                    <h4 className="text-[#00C2FF] font-medium mb-2">Net ROI</h4>
                    <p className="text-2xl font-bold text-[#00C2FF]">{institutionalMetrics.institutionROI}%</p>
                    <p className="text-sm text-gray-400">Monthly return on investment</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Research Impact Metrics */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Research Impact Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#00C2FF] mb-2">{institutionalMetrics.collaborationsEnabled}</div>
                    <div className="text-sm text-gray-400">Cross-institutional collaborations enabled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{institutionalMetrics.publicationsSupported}</div>
                    <div className="text-sm text-gray-400">Publications supported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">${(institutionalMetrics.averageProjectValue / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-gray-400">Average project value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grants" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Grant Success Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={grantSuccessData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {grantSuccessData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Grant Funding Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productivityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="grants" fill="#00C2FF" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Department Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentROI.map((dept, index) => (
                    <div key={dept.department} className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-white font-medium">{dept.department}</h4>
                        <Badge className="bg-[#00C2FF] text-white">{dept.roi}% ROI</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Researchers: </span>
                          <span className="text-white">{dept.researchers}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Hours Saved: </span>
                          <span className="text-white">{dept.hoursSaved}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Value: </span>
                          <span className="text-green-400">${(dept.hoursSaved * institutionalMetrics.costPerResearcherHour).toLocaleString()}</span>
                        </div>
                      </div>
                      <Progress value={(dept.roi / 500) * 100} className="mt-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benchmarks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Industry Benchmarks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Average Industry ROI</span>
                      <span className="text-white">180%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Your Institution ROI</span>
                      <span className="text-[#00C2FF] font-bold">{institutionalMetrics.institutionROI}%</span>
                    </div>
                    <Progress value={89} className="mt-2" />
                    <p className="text-xs text-green-400 mt-1">89th percentile performance</p>
                  </div>

                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Avg. Grant Success Rate</span>
                      <span className="text-white">65%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Your Success Rate</span>
                      <span className="text-green-400 font-bold">{institutionalMetrics.grantSuccessRate}%</span>
                    </div>
                    <Progress value={95} className="mt-2" />
                    <p className="text-xs text-green-400 mt-1">Top 5% performance</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Performance Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-[#00C2FF]/10 border border-[#00C2FF]/30 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Zap className="w-4 h-4 text-[#00C2FF]" />
                      <span className="text-[#00C2FF] font-medium text-sm">High Impact</span>
                    </div>
                    <p className="text-xs text-gray-300">
                      Expand AI agent usage to Chemistry dept for potential 40% ROI increase
                    </p>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Target className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-medium text-sm">Optimization</span>
                    </div>
                    <p className="text-xs text-gray-300">
                      Implement advanced collaboration features for 25% productivity boost
                    </p>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <BarChart3 className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium text-sm">Analytics</span>
                    </div>
                    <p className="text-xs text-gray-300">
                      Enable detailed tracking for Physics dept to improve success metrics
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnterpriseAnalyticsDashboard;
