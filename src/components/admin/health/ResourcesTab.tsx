
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Server, Users, Building2 } from 'lucide-react';

const ResourcesTab = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-5 h-5 text-blue-400" />
            <span className="font-medium text-white">Database</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Connections:</span>
              <span className="text-white">8/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Query Time:</span>
              <span className="text-white">45ms</span>
            </div>
            <Badge className="text-green-400 bg-green-400/20">Healthy</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Server className="w-5 h-5 text-purple-400" />
            <span className="font-medium text-white">Server</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">CPU Usage:</span>
              <span className="text-white">23%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Memory:</span>
              <span className="text-white">1.2GB</span>
            </div>
            <Badge className="text-green-400 bg-green-400/20">Optimal</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-green-400" />
            <span className="font-medium text-white">Active Users</span>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">127</div>
            <div className="text-xs text-gray-400">Online now</div>
            <Badge className="text-blue-400 bg-blue-400/20">Normal</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="w-5 h-5 text-orange-400" />
            <span className="font-medium text-white">Data Quality</span>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">94%</div>
            <div className="text-xs text-gray-400">Completeness</div>
            <Badge className="text-green-400 bg-green-400/20">Excellent</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourcesTab;
