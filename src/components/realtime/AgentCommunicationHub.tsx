
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, Search, Zap, MessageSquare, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AgentCommunication {
  id: string;
  agent: 'connector' | 'analyst' | 'curator';
  type: 'request' | 'response' | 'notification' | 'error' | 'status';
  message: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: {
    session_id?: string;
    query?: string;
    results_count?: number;
    processing_time?: number;
  };
  timestamp: string;
  user_id?: string;
}

const AgentCommunicationHub = () => {
  const [communications, setCommunications] = useState<AgentCommunication[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isLive, setIsLive] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCommunications();
    if (isLive) {
      subscribeToAgentUpdates();
    }
  }, [isLive]);

  const loadCommunications = async () => {
    const mockCommunications: AgentCommunication[] = [
      {
        id: '1',
        agent: 'connector',
        type: 'response',
        message: 'Found 12 highly compatible businesses for your search criteria',
        priority: 'high',
        status: 'completed',
        metadata: {
          session_id: 'sess_123',
          query: 'tech companies in Birmingham',
          results_count: 12,
          processing_time: 850
        },
        timestamp: new Date(Date.now() - 180000).toISOString()
      },
      {
        id: '2',
        agent: 'analyst',
        type: 'notification',
        message: 'Market analysis complete: Technology sector showing strong growth',
        priority: 'medium',
        status: 'completed',
        metadata: {
          session_id: 'sess_123',
          processing_time: 1200
        },
        timestamp: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: '3',
        agent: 'curator',
        type: 'request',
        message: 'Processing data enrichment for 8 business profiles',
        priority: 'medium',
        status: 'processing',
        metadata: {
          session_id: 'sess_124',
          results_count: 8
        },
        timestamp: new Date(Date.now() - 120000).toISOString()
      },
      {
        id: '4',
        agent: 'connector',
        type: 'error',
        message: 'Unable to process search due to insufficient criteria',
        priority: 'high',
        status: 'failed',
        metadata: {
          session_id: 'sess_125'
        },
        timestamp: new Date(Date.now() - 600000).toISOString()
      }
    ];
    setCommunications(mockCommunications);
  };

  const subscribeToAgentUpdates = () => {
    const channel = supabase
      .channel('agent_communications')
      .on('broadcast', { event: 'agent_update' }, (payload) => {
        const newComm = payload.payload as AgentCommunication;
        setCommunications(prev => [newComm, ...prev.slice(0, 49)]);
        
        // Show toast for high priority communications
        if (newComm.priority === 'high') {
          toast({
            title: `${newComm.agent.toUpperCase()} Agent`,
            description: newComm.message,
            variant: newComm.type === 'error' ? 'destructive' : 'default'
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case 'connector':
        return <Search className="w-4 h-4" />;
      case 'analyst':
        return <Brain className="w-4 h-4" />;
      case 'curator':
        return <Zap className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'connector':
        return 'bg-blue-600';
      case 'analyst':
        return 'bg-purple-600';
      case 'curator':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredCommunications = filter === 'all' 
    ? communications 
    : communications.filter(comm => comm.agent === filter);

  return (
    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Agent Communications</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? 'Live' : 'Paused'}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {['all', 'connector', 'analyst', 'curator'].map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType)}
              className="capitalize text-xs"
            >
              {filterType}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {filteredCommunications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No agent communications yet</p>
              </div>
            ) : (
              filteredCommunications.map((comm) => (
                <div
                  key={comm.id}
                  className="p-3 rounded-lg border border-gray-700 bg-gray-800/50 transition-all hover:bg-gray-800"
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className={`w-8 h-8 ${getAgentColor(comm.agent)}`}>
                      <AvatarFallback className="text-white">
                        {getAgentIcon(comm.agent)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-white text-sm capitalize">
                          {comm.agent} Agent
                        </h4>
                        <Badge className={`${getPriorityColor(comm.priority)} border text-xs`}>
                          {comm.priority}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(comm.status)}
                          <span className="text-xs text-gray-400 capitalize">{comm.status}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-2">
                        {comm.message}
                      </p>
                      
                      {comm.metadata && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {comm.metadata.results_count && (
                            <Badge variant="outline" className="text-xs">
                              {comm.metadata.results_count} results
                            </Badge>
                          )}
                          {comm.metadata.processing_time && (
                            <Badge variant="outline" className="text-xs">
                              {comm.metadata.processing_time}ms
                            </Badge>
                          )}
                          {comm.metadata.session_id && (
                            <Badge variant="outline" className="text-xs">
                              {comm.metadata.session_id}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comm.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AgentCommunicationHub;
