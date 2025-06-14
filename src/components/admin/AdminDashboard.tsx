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
  Activity
} from 'lucide-react';
import TheCurator from '@/components/ai/TheCurator';
import BusinessManagement from './BusinessManagement';
import UserManagement from './UserManagement';
import SystemMonitoring from './SystemMonitoring';
import CacheMonitoring from './CacheMonitoring';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const { data: businesses } = useBusinesses();
  const [activeTab, setActiveTab] = useState('overview');

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

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Manage the Alabama AI business ecosystem</p>
          </div>
          <Badge variant="secondary" className="bg-green-400/20 text-green-400">
            System Online
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-800 w-full grid grid-cols-5">
            <TabsTrigger value="overview" className="flex-1">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="businesses" className="flex-1">
              <Building2 className="w-4 h-4 mr-2" />
              Businesses
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex-1">
              <Activity className="w-4 h-4 mr-2" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="cache" className="flex-1">
              <Database className="w-4 h-4 mr-2" />
              Cache
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Businesses</p>
                      <p className="text-2xl font-bold text-white">{stats?.businesses || 0}</p>
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
                    </div>
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Verified Businesses</p>
                      <p className="text-2xl font-bold text-white">{getVerifiedBusinesses()}</p>
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
                    </div>
                    <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Platform Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Verified Businesses</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full" 
                          style={{ 
                            width: `${(getVerifiedBusinesses() / (stats?.businesses || 1)) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">
                        {Math.round((getVerifiedBusinesses() / (stats?.businesses || 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Data Quality</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-400 h-2 rounded-full w-4/5" />
                      </div>
                      <span className="text-sm text-gray-400">80%</span>
                    </div>
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
                    <span className="text-gray-300">Last Content Generation</span>
                    <span className="text-sm text-gray-400">2 hours ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">AI Recommendations</span>
                    <Badge variant="secondary" className="bg-blue-400/20 text-blue-400">
                      Running
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="curator">
            <TheCurator />
          </TabsContent>

          <TabsContent value="businesses">
            <BusinessManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="monitoring">
            <SystemMonitoring />
          </TabsContent>

          <TabsContent value="cache">
            <CacheMonitoring />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
