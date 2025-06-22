
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Users, 
  TrendingUp, 
  Database, 
  FileText,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useAgent } from '@/hooks/useAgent';

interface AgentStatusDashboardProps {
  compact?: boolean;
}

const AgentStatusDashboard: React.FC<AgentStatusDashboardProps> = ({ compact = false }) => {
  const { response: generalStatus } = useAgent('general', {
    autoFetch: true,
    initialQuery: 'system health check'
  });

  const agents = [
    {
      id: 'general',
      name: 'BamaBot',
      icon: Bot,
      status: 'active',
      uptime: 99.9,
      responseTime: 1.2,
      color: 'text-blue-400'
    },
    {
      id: 'connector',
      name: 'Business Connector',
      icon: Users,
      status: 'active',
      uptime: 99.8,
      responseTime: 0.8,
      color: 'text-green-400'
    },
    {
      id: 'analyst',
      name: 'Market Analyst',
      icon: TrendingUp,
      status: 'active',
      uptime: 99.5,
      responseTime: 2.1,
      color: 'text-purple-400'
    },
    {
      id: 'curator',
      name: 'The Curator',
      icon: Database,
      status: 'maintenance',
      uptime: 95.2,
      responseTime: 3.5,
      color: 'text-orange-400'
    },
    {
      id: 'scribe',
      name: 'The Scribe',
      icon: FileText,
      status: 'active',
      uptime: 98.7,
      responseTime: 1.8,
      color: 'text-indigo-400'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'maintenance':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'maintenance':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  if (compact) {
    return (
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#00C2FF]" />
            <span>AI Agent Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {agents.map((agent) => (
              <div key={agent.id} className="text-center">
                <div className="flex justify-center mb-1">
                  <agent.icon className={`w-4 h-4 ${agent.color}`} />
                </div>
                <Badge variant={getStatusColor(agent.status)} className="text-xs">
                  {agent.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#00C2FF]" />
            <span>AI Agent System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="bg-gray-800 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <agent.icon className={`w-5 h-5 ${agent.color}`} />
                      <span className="font-medium">{agent.name}</span>
                    </div>
                    {getStatusIcon(agent.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Uptime:</span>
                      <span className="text-white">{agent.uptime}%</span>
                    </div>
                    <Progress value={agent.uptime} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Response Time:</span>
                      <span className="text-white">{agent.responseTime}s</span>
                    </div>
                    
                    <Badge variant={getStatusColor(agent.status)} className="w-full justify-center">
                      {agent.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentStatusDashboard;
