
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Brain, 
  Zap, 
  Settings, 
  Activity, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  BarChart3
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  type: 'analyst' | 'curator' | 'matchmaker' | 'assistant';
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  performance: number;
  tasksCompleted: number;
  accuracy: number;
  uptime: number;
  lastActive: number;
}

interface AgentTask {
  id: string;
  agentId: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  startTime: number;
  estimatedCompletion?: number;
}

const AdvancedAgentManager: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'The Analyst',
      type: 'analyst',
      status: 'active',
      performance: 94,
      tasksCompleted: 1247,
      accuracy: 97.2,
      uptime: 99.8,
      lastActive: Date.now() - 30000
    },
    {
      id: '2',
      name: 'The Curator',
      type: 'curator',
      status: 'active',
      performance: 89,
      tasksCompleted: 892,
      accuracy: 95.1,
      uptime: 98.5,
      lastActive: Date.now() - 120000
    },
    {
      id: '3',
      name: 'BamaBot 2.0',
      type: 'assistant',
      status: 'idle',
      performance: 92,
      tasksCompleted: 3421,
      accuracy: 94.8,
      uptime: 99.2,
      lastActive: Date.now() - 300000
    },
    {
      id: '4',
      name: 'Smart Matchmaker',
      type: 'matchmaker',
      status: 'active',
      performance: 96,
      tasksCompleted: 567,
      accuracy: 98.1,
      uptime: 99.9,
      lastActive: Date.now() - 15000
    }
  ]);

  const [tasks, setTasks] = useState<AgentTask[]>([
    {
      id: '1',
      agentId: '1',
      type: 'Market Analysis',
      status: 'processing',
      priority: 'high',
      startTime: Date.now() - 180000,
      estimatedCompletion: Date.now() + 420000
    },
    {
      id: '2',
      agentId: '2',
      type: 'Data Curation',
      status: 'pending',
      priority: 'medium',
      startTime: Date.now()
    },
    {
      id: '3',
      agentId: '4',
      type: 'Business Matching',
      status: 'completed',
      priority: 'high',
      startTime: Date.now() - 600000
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'idle': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'maintenance': return <Settings className="w-4 h-4 text-orange-500" />;
      case 'offline': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'analyst': return <BarChart3 className="w-5 h-5 text-blue-500" />;
      case 'curator': return <Brain className="w-5 h-5 text-purple-500" />;
      case 'matchmaker': return <Users className="w-5 h-5 text-green-500" />;
      case 'assistant': return <MessageSquare className="w-5 h-5 text-orange-500" />;
      default: return <Bot className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const avgPerformance = Math.round(agents.reduce((sum, a) => sum + a.performance, 0) / agents.length);
  const totalTasks = agents.reduce((sum, a) => sum + a.tasksCompleted, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Agents</p>
                <p className="text-2xl font-bold text-white">{activeAgents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Avg Performance</p>
                <p className="text-2xl font-bold text-white">{avgPerformance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-white">{totalTasks.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">System Load</p>
                <p className="text-2xl font-bold text-white">67%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <div className="space-y-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(agent.type)}
                      <div>
                        <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                        <p className="text-sm text-gray-400 capitalize">{agent.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(agent.status)}
                      <Badge 
                        variant={agent.status === 'active' ? 'default' : 'secondary'}
                        className={agent.status === 'active' ? 'bg-green-600' : ''}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Performance</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={agent.performance} className="flex-1" />
                        <span className="text-sm text-white">{agent.performance}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Tasks Completed</p>
                      <p className="text-lg font-semibold text-white">{agent.tasksCompleted.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Accuracy</p>
                      <p className="text-lg font-semibold text-white">{agent.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Last Active</p>
                      <p className="text-lg font-semibold text-white">{formatTimestamp(agent.lastActive)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {tasks.map((task) => {
                    const agent = agents.find(a => a.id === task.agentId);
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {agent && getTypeIcon(agent.type)}
                          <div>
                            <h4 className="font-medium text-white">{task.type}</h4>
                            <p className="text-sm text-gray-400">{agent?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                          >
                            {task.priority}
                          </Badge>
                          <Badge variant="outline">
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-300">{agent.name}</span>
                      <span className="text-sm text-white">{agent.performance}%</span>
                    </div>
                    <Progress value={agent.performance} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">CPU Usage</span>
                    <span className="text-sm text-white">67%</span>
                  </div>
                  <Progress value={67} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Memory Usage</span>
                    <span className="text-sm text-white">84%</span>
                  </div>
                  <Progress value={84} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Response Time</span>
                    <span className="text-sm text-white">125ms</span>
                  </div>
                  <Progress value={25} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAgentManager;
