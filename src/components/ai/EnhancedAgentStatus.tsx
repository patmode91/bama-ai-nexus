
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  Users, 
  TrendingUp, 
  Database, 
  FileText,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAgent } from '@/hooks/useAgent';
import { logger } from '@/services/loggerService';

interface AgentStatus {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  status: 'active' | 'maintenance' | 'error' | 'offline';
  uptime: number;
  responseTime: number;
  color: string;
  description: string;
}

const EnhancedAgentStatus: React.FC = () => {
  const { response: healthCheck, error: healthError } = useAgent('general', {
    autoFetch: true,
    initialQuery: 'health check',
    onError: (error) => {
      logger.error('Agent health check failed', { error: error.message }, 'EnhancedAgentStatus');
    }
  });

  const agents: AgentStatus[] = [
    {
      id: 'general',
      name: 'BamaBot',
      icon: Bot,
      status: healthError ? 'error' : 'active',
      uptime: 99.9,
      responseTime: 1.2,
      color: 'text-blue-400',
      description: 'General AI assistant and query handler'
    },
    {
      id: 'connector',
      name: 'Business Connector',
      icon: Users,
      status: 'active',
      uptime: 99.8,
      responseTime: 0.8,
      color: 'text-green-400',
      description: 'Business matching and connection service'
    },
    {
      id: 'analyst',
      name: 'Market Analyst',
      icon: TrendingUp,
      status: 'active',
      uptime: 99.5,
      responseTime: 2.1,
      color: 'text-purple-400',
      description: 'Market insights and competitive analysis'
    },
    {
      id: 'curator',
      name: 'The Curator',
      icon: Database,
      status: 'maintenance',
      uptime: 95.2,
      responseTime: 3.5,
      color: 'text-orange-400',
      description: 'Data ingestion and quality management'
    },
    {
      id: 'scribe',
      name: 'The Scribe',
      icon: FileText,
      status: 'active',
      uptime: 98.7,
      responseTime: 1.8,
      color: 'text-indigo-400',
      description: 'Content generation and documentation'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'maintenance':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-gray-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'maintenance':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'offline':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'maintenance':
        return 'Maintenance';
      case 'error':
        return 'Error';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const systemHealth = agents.filter(a => a.status === 'active').length / agents.length * 100;
  const hasIssues = agents.some(a => a.status === 'error' || a.status === 'offline');

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#00C2FF]" />
            <span>AI Agent System Status</span>
            <Badge variant={hasIssues ? "destructive" : "default"} className="ml-auto">
              {hasIssues ? "Issues Detected" : "All Systems Operational"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">System Health</span>
                <span className="text-sm font-medium">{Math.round(systemHealth)}%</span>
              </div>
              <Progress value={systemHealth} className="h-2" />
            </div>
            
            {hasIssues && (
              <Alert className="border-yellow-600 bg-yellow-600/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-yellow-400">
                  Some AI agents are experiencing issues. Check individual agent status below.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {agents.map((agent) => (
                <div key={agent.id} className="text-center">
                  <div className="flex justify-center mb-2">
                    <agent.icon className={`w-6 h-6 ${agent.color}`} />
                  </div>
                  <p className="text-xs font-medium text-white mb-1">{agent.name}</p>
                  <Badge variant={getStatusColor(agent.status)} className="text-xs">
                    {getStatusText(agent.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Agent Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <agent.icon className={`w-5 h-5 ${agent.color}`} />
                  <span className="font-medium text-white">{agent.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(agent.status)}
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === 'active' ? 'bg-green-400' :
                    agent.status === 'maintenance' ? 'bg-yellow-400' :
                    agent.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                  }`} />
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mb-3">{agent.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Uptime:</span>
                  <span className="text-white">{agent.uptime}%</span>
                </div>
                <Progress value={agent.uptime} className="h-1" />
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Response Time:</span>
                  <span className="text-white">{agent.responseTime}s</span>
                </div>
                
                <Badge 
                  variant={getStatusColor(agent.status)} 
                  className="w-full justify-center text-xs"
                >
                  <Wifi className="w-3 h-3 mr-1" />
                  {getStatusText(agent.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EnhancedAgentStatus;
