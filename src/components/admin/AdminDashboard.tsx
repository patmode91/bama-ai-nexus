
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  BarChart3,
  Activity,
  Database,
  Heart
} from 'lucide-react';
import BusinessManagement from './BusinessManagement';
import UserManagement from './UserManagement';
import SystemMonitoring from './SystemMonitoring';
import CacheMonitoring from './CacheMonitoring';
import EnhancedSystemHealth from './EnhancedSystemHealth';
import BusinessIntelligenceDashboard from './BusinessIntelligenceDashboard';
import AdminDashboardHeader from './dashboard/AdminDashboardHeader';
import AdminStatsOverview from './dashboard/AdminStatsOverview';
import AdminSystemStatus from './dashboard/AdminSystemStatus';
import AdminQuickActions from './dashboard/AdminQuickActions';
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
        <AdminDashboardHeader userRole={userRole} />

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
            <AdminStatsOverview stats={stats} businesses={businesses} />
            <AdminSystemStatus userRole={userRole} />
            <AdminQuickActions hasPermission={hasPermission} setActiveTab={setActiveTab} />
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
