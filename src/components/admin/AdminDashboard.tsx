
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  Users, 
  Building2, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Bot,
  Zap,
  BarChart3,
  Activity,
  Shield,
  Heart
} from 'lucide-react';
import TheCurator from '@/components/ai/TheCurator';
import BusinessManagement from './BusinessManagement';
import UserManagement from './UserManagement';
import SystemMonitoring from './SystemMonitoring';
import CacheMonitoring from './CacheMonitoring';
import EnhancedSystemHealth from './EnhancedSystemHealth';
import BusinessIntelligenceDashboard from './BusinessIntelligenceDashboard';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const { data: businesses } = useBusinesses();
  const [activeTab, setActiveTab] = useState('overview');
  const { hasPermission, userRole, loading: permissionsLoading } = useAdminPermissions();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [businessCount, userCount, verificationCount, claimCount] = await Promise.all([
        supabase.from('businesses').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('verification_requests').select('*', { count: 'exact', head: true }),
        supabase.from('business_claims').select('*', { count: 'exact', head: true })
      ]);

      return {
        businesses: businessCount.count || 0,
        users: userCount.count || 0,
        verificationRequests: verificationCount.count || 0,
        businessClaims: claimCount.count || 0
      };
    }
  });

  const getVerifiedBusinesses = () => {
    return businesses?.filter(b => b.verified).length || 0;
  };

  const getUnverifiedBusinesses = () => {
    return businesses?.filter(b => !b.verified).length || 0;
  };

  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading permissions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Advanced Admin Dashboard</h1>
            <p className="text-gray-400">Comprehensive management and intelligence platform</p>
            {userRole && (
              <Badge variant="secondary" className="mt-2">
                {userRole.name} - Level {userRole.level}
              </Badge>
            )}
          </div>
          <Badge variant="secondary" className="bg-green-400/20 text-green-400">
            <CheckCircle className="w-4 h-4 mr-2" />
            System Online
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-800 w-full grid grid-cols-7">
            <TabsTrigger value="overview" className="flex-1">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            {hasPermission('users.view') && (
              <TabsTrigger value="users" className="flex-1">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
            )}
            {hasPermission('businesses.view') && (
              <TabsTrigger value="businesses" className="flex-1">
                <Building2 className="w-4 h-4 mr-2" />
                Businesses
              </TabsTrigger>
            )}
            {hasPermission('analytics.view') && (
              <TabsTrigger value="intelligence" className="flex-1">
                <TrendingUp className="w-4 h-4 mr-2" />
                Intelligence
              </TabsTrigger>
            )}
            {hasPermission('system.monitor') && (
              <TabsTrigger value="health" className="flex-1">
                <Heart className="w-4 h-4 mr-2" />
                Health
              </TabsTrigger>
            )}
            {hasPermission('system.monitor') && (
              <TabsTrigger value="monitoring" className="flex-1">
                <Activity className="w-4 h-4 mr-2" />
                Monitoring
              </TabsTrigger>
            )}
            {hasPermission('system.config') && (
              <TabsTrigger value="cache" className="flex-1">
                <Database className="w-4 h-4 mr-2" />
                Cache
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Businesses</p>
                      <p className="text-2xl font-bold text-white">{stats?.businesses || 0}</p>
                      <p className="text-xs text-green-400">
                        {getVerifiedBusinesses()} verified
                      </p>
                    </div>
                    <Building2 className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-white">{stats?.users || 0}</p>
                      <p className="text-xs text-blue-400">Active platform users</p>
                    </div>
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Verification Rate</p>
                      <p className="text-2xl font-bold text-white">
                        {Math.round((getVerifiedBusinesses() / (stats?.businesses || 1)) * 100)}%
                      </p>
                      <p className="text-xs text-green-400">Business quality</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Pending Reviews</p>
                      <p className="text-2xl font-bold text-white">
                        {(stats?.verificationRequests || 0) + (stats?.businessClaims || 0)}
                      </p>
                      <p className="text-xs text-yellow-400">Require attention</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Status Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Admin Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Current Role</span>
                    <Badge variant="secondary" className="bg-blue-400/20 text-blue-400">
                      {userRole?.name || 'Unknown'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Permission Level</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full" 
                          style={{ width: `${(userRole?.level || 0)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">{userRole?.level || 0}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Active Permissions</span>
                    <span className="text-sm text-gray-400">
                      {userRole?.permissions.length || 0} granted
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    AI Operations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">The Curator Status</span>
                    <Badge variant="secondary" className="bg-green-400/20 text-green-400">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">System Health</span>
                    <Badge variant="secondary" className="bg-green-400/20 text-green-400">
                      Optimal
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Performance Score</span>
                    <span className="text-sm text-gray-400">95/100</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {hasPermission('businesses.verify') && (
                    <Button 
                      variant="outline" 
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => setActiveTab('businesses')}
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Verify Businesses
                    </Button>
                  )}
                  {hasPermission('users.view') && (
                    <Button 
                      variant="outline" 
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => setActiveTab('users')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                  )}
                  {hasPermission('system.monitor') && (
                    <Button 
                      variant="outline" 
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => setActiveTab('health')}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      System Health
                    </Button>
                  )}
                  {hasPermission('analytics.view') && (
                    <Button 
                      variant="outline" 
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => setActiveTab('intelligence')}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {hasPermission('users.view') && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}

          {hasPermission('businesses.view') && (
            <TabsContent value="businesses">
              <BusinessManagement />
            </TabsContent>
          )}

          {hasPermission('analytics.view') && (
            <TabsContent value="intelligence">
              <BusinessIntelligenceDashboard />
            </TabsContent>
          )}

          {hasPermission('system.monitor') && (
            <TabsContent value="health">
              <EnhancedSystemHealth />
            </TabsContent>
          )}

          {hasPermission('system.monitor') && (
            <TabsContent value="monitoring">
              <SystemMonitoring />
            </TabsContent>
          )}

          {hasPermission('system.config') && (
            <TabsContent value="cache">
              <CacheMonitoring />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
