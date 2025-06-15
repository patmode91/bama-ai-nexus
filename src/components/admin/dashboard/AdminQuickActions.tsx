
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, Heart, BarChart3 } from 'lucide-react';

interface AdminQuickActionsProps {
  hasPermission: (permission: string) => boolean;
  setActiveTab: (tab: string) => void;
}

const AdminQuickActions = ({ hasPermission, setActiveTab }: AdminQuickActionsProps) => {
  return (
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
  );
};

export default AdminQuickActions;
