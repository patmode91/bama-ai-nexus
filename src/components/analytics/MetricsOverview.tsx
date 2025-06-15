
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  Star, 
  Eye,
  Calendar,
  DollarSign,
  Target,
  Activity
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const MetricsOverview = () => {
  const { metrics, isLoading, isLoadingMetrics } = useAnalytics();

  if (isLoading || isLoadingMetrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-700 rounded mb-4"></div>
              <div className="h-8 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Total Businesses',
      value: metrics?.totalBusinesses || 0,
      change: '+12.5%',
      trend: 'up',
      icon: Building2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      title: 'Active Users',
      value: metrics?.activeUsers || 0,
      change: '+8.3%',
      trend: 'up',
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      title: 'Verified Businesses',
      value: metrics?.verifiedBusinesses || 0,
      change: '+15.7%',
      trend: 'up',
      icon: Star,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    {
      title: 'Average Rating',
      value: metrics?.averageRating || 0,
      change: '+0.2',
      trend: 'up',
      icon: Star,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      suffix: '/5.0'
    },
    {
      title: 'Page Views',
      value: 24589,
      change: '+18.2%',
      trend: 'up',
      icon: Eye,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    },
    {
      title: 'Monthly Revenue',
      value: 45230,
      change: '+22.1%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      prefix: '$'
    },
    {
      title: 'Conversion Rate',
      value: 3.2,
      change: '+0.8%',
      trend: 'up',
      icon: Target,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10',
      suffix: '%'
    },
    {
      title: 'Engagement Score',
      value: 87,
      change: '+5.4%',
      trend: 'up',
      icon: Activity,
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/10',
      suffix: '/100'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Key Metrics Overview</h2>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Last 30 days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <Card key={index} className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-gray-600 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <Badge 
                  variant={metric.trend === 'up' ? 'default' : 'destructive'}
                  className={`flex items-center space-x-1 ${
                    metric.trend === 'up' 
                      ? 'bg-green-400/20 text-green-400 border-green-400/30' 
                      : 'bg-red-400/20 text-red-400 border-red-400/30'
                  }`}
                >
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{metric.change}</span>
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">{metric.title}</h3>
                <p className="text-2xl font-bold text-white">
                  {metric.prefix}{metric.value.toLocaleString()}{metric.suffix}
                </p>
              </div>

              {/* Progress bar for percentage metrics */}
              {metric.suffix === '%' && (
                <div className="mt-4">
                  <Progress 
                    value={metric.value} 
                    className="h-2 bg-gray-700"
                  />
                </div>
              )}

              {/* Progress bar for score metrics */}
              {metric.suffix === '/100' && (
                <div className="mt-4">
                  <Progress 
                    value={metric.value} 
                    className="h-2 bg-gray-700"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">94.2%</div>
              <div className="text-sm text-gray-400">Overall Health Score</div>
              <Progress value={94.2} className="mt-2 h-2 bg-gray-700" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">76.8%</div>
              <div className="text-sm text-gray-400">User Satisfaction</div>
              <Progress value={76.8} className="mt-2 h-2 bg-gray-700" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">89.1%</div>
              <div className="text-sm text-gray-400">Data Quality Score</div>
              <Progress value={89.1} className="mt-2 h-2 bg-gray-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsOverview;
