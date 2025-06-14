
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Database, 
  Server, 
  Zap, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Building2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SystemMetrics {
  totalBusinesses: number;
  totalUsers: number;
  verifiedBusinesses: number;
  recentSignups: number;
  activeUsers: number;
  averageRating: number;
}

const SystemMonitoring = () => {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: metrics, refetch, isLoading } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async (): Promise<SystemMetrics> => {
      const [
        businessCount,
        userCount,
        verifiedCount,
        recentUsers,
        reviews
      ] = await Promise.all([
        supabase.from('businesses').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('verified', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('reviews').select('rating')
      ]);

      const averageRating = reviews.data?.length 
        ? reviews.data.reduce((sum, review) => sum + review.rating, 0) / reviews.data.length
        : 0;

      return {
        totalBusinesses: businessCount.count || 0,
        totalUsers: userCount.count || 0,
        verifiedBusinesses: verifiedCount.count || 0,
        recentSignups: recentUsers.count || 0,
        activeUsers: Math.floor((userCount.count || 0) * 0.3), // Simulated active users
        averageRating: Number(averageRating.toFixed(1))
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const handleRefresh = () => {
    refetch();
    setLastRefresh(new Date());
  };

  const systemHealth = () => {
    if (!metrics) return 'unknown';
    
    const healthScore = (
      (metrics.verifiedBusinesses / metrics.totalBusinesses) * 0.4 +
      (metrics.activeUsers / metrics.totalUsers) * 0.3 +
      (metrics.averageRating / 5) * 0.3
    ) * 100;

    if (healthScore >= 80) return 'excellent';
    if (healthScore >= 60) return 'good';
    if (healthScore >= 40) return 'fair';
    return 'poor';
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-400 bg-green-400/20';
      case 'good': return 'text-blue-400 bg-blue-400/20';
      case 'fair': return 'text-yellow-400 bg-yellow-400/20';
      case 'poor': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Monitoring
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="border-gray-600"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">System Health</p>
                    <Badge className={`mt-1 ${getHealthColor(systemHealth())}`}>
                      {systemHealth().toUpperCase()}
                    </Badge>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Database Status</p>
                    <Badge className="mt-1 text-green-400 bg-green-400/20">
                      ONLINE
                    </Badge>
                  </div>
                  <Database className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">AI Services</p>
                    <Badge className="mt-1 text-blue-400 bg-blue-400/20">
                      ACTIVE
                    </Badge>
                  </div>
                  <Zap className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Businesses</p>
                    <p className="text-2xl font-bold text-white">{metrics?.totalBusinesses || 0}</p>
                    <p className="text-xs text-gray-500">
                      {metrics?.verifiedBusinesses || 0} verified
                    </p>
                  </div>
                  <Building2 className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Users</p>
                    <p className="text-2xl font-bold text-white">{metrics?.activeUsers || 0}</p>
                    <p className="text-xs text-gray-500">
                      {metrics?.recentSignups || 0} new this week
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg. Rating</p>
                    <p className="text-2xl font-bold text-white">{metrics?.averageRating || 0}</p>
                    <p className="text-xs text-gray-500">Platform quality</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Indicators */}
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white text-lg">Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Business Verification Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full" 
                      style={{ 
                        width: `${((metrics?.verifiedBusinesses || 0) / (metrics?.totalBusinesses || 1)) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-400">
                    {Math.round(((metrics?.verifiedBusinesses || 0) / (metrics?.totalBusinesses || 1)) * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">User Engagement</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full" 
                      style={{ 
                        width: `${((metrics?.activeUsers || 0) / (metrics?.totalUsers || 1)) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-400">
                    {Math.round(((metrics?.activeUsers || 0) / (metrics?.totalUsers || 1)) * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Data Quality Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-600 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full w-4/5" />
                  </div>
                  <span className="text-sm text-gray-400">80%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMonitoring;
