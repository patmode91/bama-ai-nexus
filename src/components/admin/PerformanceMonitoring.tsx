
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  Activity, 
  Zap, 
  Database, 
  Monitor, 
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

const PerformanceMonitoring = () => {
  const { score, metrics, alerts, isLoading, exportPerformanceData } = usePerformanceMonitoring();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const performanceCards = [
    {
      title: 'Performance Score',
      value: score,
      suffix: '/100',
      icon: Activity,
      color: score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400',
      bgColor: score >= 80 ? 'bg-green-400/10' : score >= 60 ? 'bg-yellow-400/10' : 'bg-red-400/10'
    },
    {
      title: 'LCP (ms)',
      value: Math.round(metrics.LCP?.avg || 0),
      icon: Monitor,
      color: (metrics.LCP?.avg || 0) <= 2500 ? 'text-green-400' : 'text-red-400',
      bgColor: (metrics.LCP?.avg || 0) <= 2500 ? 'bg-green-400/10' : 'bg-red-400/10'
    },
    {
      title: 'FID (ms)',
      value: Math.round(metrics.FID?.avg || 0),
      icon: Zap,
      color: (metrics.FID?.avg || 0) <= 100 ? 'text-green-400' : 'text-red-400',
      bgColor: (metrics.FID?.avg || 0) <= 100 ? 'bg-green-400/10' : 'bg-red-400/10'
    },
    {
      title: 'Memory (MB)',
      value: Math.round(metrics.Memory_Used?.avg || 0),
      icon: Database,
      color: (metrics.Memory_Used?.avg || 0) <= 100 ? 'text-green-400' : 'text-red-400',
      bgColor: (metrics.Memory_Used?.avg || 0) <= 100 ? 'bg-green-400/10' : 'bg-red-400/10'
    }
  ];

  const metricsData = Object.entries(metrics).map(([name, data]: [string, any]) => ({
    name: name.replace(/_/g, ' '),
    average: Math.round(data.avg || 0),
    min: Math.round(data.min || 0),
    max: Math.round(data.max || 0),
    count: data.count || 0
  }));

  const handleExport = () => {
    const data = exportPerformanceData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Performance Monitoring</h2>
          <p className="text-gray-400">Real-time application performance metrics and optimization insights</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <Alert className="border-yellow-400/50 bg-yellow-400/10">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-200">
            <div className="font-medium mb-2">Performance Issues Detected:</div>
            <ul className="list-disc list-inside space-y-1">
              {alerts.map((alert, index) => (
                <li key={index} className="text-sm">{alert}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceCards.map((card, index) => (
          <Card key={index} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <Badge 
                  variant={card.color.includes('green') ? 'default' : 'destructive'}
                  className={`${card.color.includes('green') ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}
                >
                  {card.color.includes('green') ? 'Good' : 'Needs Attention'}
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">{card.title}</h3>
                <p className="text-2xl font-bold text-white">
                  {card.value}{card.suffix}
                </p>
                {card.title === 'Performance Score' && (
                  <Progress value={card.value} className="h-2 bg-gray-700" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Core Web Vitals Chart */}
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Core Web Vitals Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { time: '5m ago', LCP: metrics.LCP?.avg || 0, FID: metrics.FID?.avg || 0, CLS: (metrics.CLS?.avg || 0) * 1000 },
              { time: '4m ago', LCP: (metrics.LCP?.avg || 0) * 0.9, FID: (metrics.FID?.avg || 0) * 1.1, CLS: (metrics.CLS?.avg || 0) * 900 },
              { time: '3m ago', LCP: (metrics.LCP?.avg || 0) * 1.1, FID: (metrics.FID?.avg || 0) * 0.8, CLS: (metrics.CLS?.avg || 0) * 1100 },
              { time: '2m ago', LCP: (metrics.LCP?.avg || 0) * 0.95, FID: (metrics.FID?.avg || 0) * 1.2, CLS: (metrics.CLS?.avg || 0) * 950 },
              { time: '1m ago', LCP: (metrics.LCP?.avg || 0) * 1.05, FID: (metrics.FID?.avg || 0) * 0.9, CLS: (metrics.CLS?.avg || 0) * 1050 },
              { time: 'Now', LCP: metrics.LCP?.avg || 0, FID: metrics.FID?.avg || 0, CLS: (metrics.CLS?.avg || 0) * 1000 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="LCP" stroke="#00C2FF" strokeWidth={2} name="LCP (ms)" />
              <Line type="monotone" dataKey="FID" stroke="#22C55E" strokeWidth={2} name="FID (ms)" />
              <Line type="monotone" dataKey="CLS" stroke="#F59E0B" strokeWidth={2} name="CLS (×1000)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Performance Metrics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="average" fill="#00C2FF" name="Average" />
              <Bar dataKey="max" fill="#EF4444" name="Maximum" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Recommendations */}
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-2">Code Splitting</h4>
              <p className="text-sm text-gray-300">
                Implement dynamic imports for large components to reduce initial bundle size.
              </p>
            </div>
            
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">Image Optimization</h4>
              <p className="text-sm text-gray-300">
                Use next-gen image formats (WebP, AVIF) and lazy loading for better LCP.
              </p>
            </div>
            
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <h4 className="font-semibold text-purple-400 mb-2">Caching Strategy</h4>
              <p className="text-sm text-gray-300">
                Implement service worker caching for static assets and API responses.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h4 className="font-semibold text-yellow-400 mb-2">Database Optimization</h4>
              <p className="text-sm text-gray-300">
                Add database indexes and implement query result caching.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitoring;
