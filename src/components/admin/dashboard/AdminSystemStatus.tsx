
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Bot } from 'lucide-react';

interface AdminSystemStatusProps {
  userRole: any;
}

const AdminSystemStatus = ({ userRole }: AdminSystemStatusProps) => {
  return (
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
  );
};

export default AdminSystemStatus;
