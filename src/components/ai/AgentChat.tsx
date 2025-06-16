import { useState } from 'react';
import { useAgent } from '@/hooks/useAgent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
};

export function AgentChat({ agentType = 'general' }: { agentType?: 'connector' | 'analyst' | 'curator' | 'general' }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { callAgent, isLoading, error } = useAgent(agentType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      // Call the agent
      const response = await callAgent(input);
      
      // Add agent response
      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        content: response.data?.response || 'I received your message but had trouble processing it.',
        sender: 'agent',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, agentMessage]);
    } catch (err) {
      console.error('Error calling agent:', err);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error processing your request.',
        sender: 'agent',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">
          {agentType === 'connector' && 'Business Connector'}
          {agentType === 'analyst' && 'Market Analyst'}
          {agentType === 'curator' && 'Data Curator'}
          {agentType === 'general' && 'AI Assistant'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96 rounded-md border p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Start a conversation with the {agentType} agent...
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                Error: {error.message}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              agentType === 'connector' ? 'Find businesses...' :
              agentType === 'analyst' ? 'Ask about market trends...' :
              agentType === 'curator' ? 'Enhance business data...' :
              'Ask me anything...'
            }
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
