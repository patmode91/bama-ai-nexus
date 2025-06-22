
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useAgent } from '@/hooks/useAgent';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/services/loggerService';

type AgentType = 'connector' | 'analyst' | 'curator' | 'general';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'agent';
  timestamp: Date;
  error?: boolean;
}

interface AgentChatProps {
  agentType: AgentType;
}

export const AgentChat: React.FC<AgentChatProps> = ({ agentType }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { toast } = useToast();
  
  const { callAgent, isLoading, error } = useAgent(agentType, {
    onSuccess: (data) => {
      logger.info(`Agent ${agentType} response received`, { data }, 'AgentChat');
      addMessage(data?.response || 'Response received', 'agent');
      toast({
        title: "Agent Response",
        description: `${agentType} agent responded successfully`,
      });
    },
    onError: (error) => {
      logger.error(`Agent ${agentType} error`, { error: error.message }, 'AgentChat');
      addMessage(`Error: ${error.message}`, 'agent', true);
      toast({
        title: "Agent Error",
        description: `Failed to get response from ${agentType} agent`,
        variant: "destructive",
      });
    }
  });

  const addMessage = (content: string, role: 'user' | 'agent', isError = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
      error: isError
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    addMessage(userMessage, 'user');
    setInput('');

    try {
      logger.info(`Sending message to ${agentType} agent`, { message: userMessage }, 'AgentChat');
      await callAgent(userMessage);
    } catch (error) {
      logger.error(`Failed to send message to ${agentType} agent`, { error }, 'AgentChat');
    }
  };

  const getAgentTypeLabel = (type: AgentType) => {
    const labels = {
      general: 'General Assistant',
      connector: 'Business Connector',
      analyst: 'Market Analyst',
      curator: 'Data Curator'
    };
    return labels[type];
  };

  const getAgentTypeColor = (type: AgentType) => {
    const colors = {
      general: 'bg-blue-500',
      connector: 'bg-green-500',
      analyst: 'bg-purple-500',
      curator: 'bg-orange-500'
    };
    return colors[type];
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getAgentTypeColor(agentType)}`} />
            <span>{getAgentTypeLabel(agentType)}</span>
          </CardTitle>
          <Badge variant={isLoading ? "secondary" : "default"}>
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Ready
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-64 w-full rounded border border-gray-600 p-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>Start a conversation with the {getAgentTypeLabel(agentType)}</p>
              <p className="text-sm mt-1">Ask questions or request assistance</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 ml-8'
                      : message.error
                      ? 'bg-red-600 mr-8'
                      : 'bg-gray-700 mr-8'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white text-sm">{message.content}</p>
                    </div>
                    {message.error && (
                      <AlertCircle className="w-4 h-4 text-red-300 ml-2 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
              {isLoading && (
                <div className="bg-gray-700 mr-8 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-gray-300 text-sm">Agent is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask the ${getAgentTypeLabel(agentType)}...`}
            disabled={isLoading}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>

        {error && (
          <div className="flex items-center space-x-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Connection error: {error.message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
