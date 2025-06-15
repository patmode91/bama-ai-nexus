
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMCP } from '@/hooks/useMCP';
import { useGeminiChat } from '@/hooks/useGeminiChat';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'matches' | 'analysis' | 'context';
  data?: any;
}

const EnhancedBamaBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm BamaBot, now powered by our new Model Context Protocol (MCP). I can understand your business needs and work with our specialized agents to find you the perfect AI solutions in Alabama. What can I help you with today?",
      isBot: true,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // MCP hooks
  const { 
    currentSessionId, 
    contexts, 
    processMessage, 
    findBusinessMatches, 
    isLoading 
  } = useMCP();

  // Gemini chat for enhanced responses
  const { sendMessage: sendGeminiMessage } = useGeminiChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateEnhancedResponse = async (userMessage: string, mcpContext?: any): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Use MCP context to provide more intelligent responses
    if (mcpContext) {
      if (mcpContext.industry) {
        return `I understand you're looking for AI solutions in the ${mcpContext.industry} industry. Let me work with our specialized agents to find the best matches for you. I'm now connecting with The Connector to search our database and The Analyst to provide market insights...`;
      }
      
      if (mcpContext.services && mcpContext.services.length > 0) {
        return `Perfect! You're interested in ${mcpContext.services.join(', ')} services. Our MCP system is now coordinating between our agents to find companies that specialize in these exact capabilities. This will include market pricing and availability data...`;
      }
    }
    
    // Fallback responses with MCP context awareness
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! With our new MCP system, I can provide much more intelligent assistance. I work seamlessly with our Connector agent (for business matching), Curator agent (for data insights), and Analyst agent (for market intelligence). What business challenge can we solve together?";
    }
    
    if (lowerMessage.includes('how') && lowerMessage.includes('work')) {
      return "Here's how our MCP-powered system works: When you describe your needs, I extract the context and share it with our specialized agents. The Connector finds matching businesses, the Curator provides enriched data, and the Analyst adds market intelligence. All this happens seamlessly to give you comprehensive, contextual recommendations!";
    }
    
    return "That's interesting! I'm analyzing your request using our Model Context Protocol. This allows me to understand your needs more deeply and coordinate with our other AI agents to provide you with the most relevant and comprehensive response.";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Process message through MCP to extract context
      const mcpContext = await processMessage(inputValue);
      
      // Generate initial response
      const initialResponse = await generateEnhancedResponse(inputValue, mcpContext.entities);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: initialResponse,
        isBot: true,
        timestamp: new Date(),
        type: 'context',
        data: { context: mcpContext }
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // If we have enough context, trigger business matching
      if (mcpContext.industry || (mcpContext.entities.services && mcpContext.entities.services.length > 0)) {
        setTimeout(async () => {
          try {
            const matches = await findBusinessMatches();
            
            if (matches.matches.length > 0) {
              const matchesMessage: Message = {
                id: (Date.now() + 2).toString(),
                text: `Great news! I found ${matches.matches.length} businesses that match your requirements. Here are the top matches with their compatibility scores and reasoning:`,
                isBot: true,
                timestamp: new Date(),
                type: 'matches',
                data: matches
              };
              
              setMessages(prev => [...prev, matchesMessage]);
              
              // Add detailed match information
              const detailsMessage: Message = {
                id: (Date.now() + 3).toString(),
                text: matches.recommendations.join(' ') + (matches.marketInsights ? ` Based on market data, ${matches.marketInsights.averageProjectCost} is typical for similar projects in Alabama.` : ''),
                isBot: true,
                timestamp: new Date(),
                type: 'analysis',
                data: { insights: matches.marketInsights }
              };
              
              setMessages(prev => [...prev, detailsMessage]);
            } else {
              const noMatchesMessage: Message = {
                id: (Date.now() + 2).toString(),
                text: "I didn't find exact matches for your specific requirements, but I can help you refine your search or explore related services. Would you like to broaden the criteria or get suggestions for alternative approaches?",
                isBot: true,
                timestamp: new Date(),
                type: 'text'
              };
              
              setMessages(prev => [...prev, noMatchesMessage]);
            }
          } catch (error) {
            console.error('Error finding matches:', error);
            const errorMessage: Message = {
              id: (Date.now() + 2).toString(),
              text: "I encountered an issue while searching for matches. Let me try a different approach to help you find what you're looking for.",
              isBot: true,
              timestamp: new Date(),
              type: 'text'
            };
            
            setMessages(prev => [...prev, errorMessage]);
          }
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error processing your request. Please try again.',
        isBot: true,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    switch (message.type) {
      case 'matches':
        return (
          <div className="space-y-3">
            <p className="text-sm">{message.text}</p>
            {message.data?.matches?.slice(0, 3).map((match: any, index: number) => (
              <div key={index} className="bg-blue-900/20 rounded-lg p-3 border border-blue-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-blue-300">{match.business.businessname}</h4>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {match.score}% match
                  </Badge>
                </div>
                <p className="text-xs text-gray-300 mb-2">{match.business.description}</p>
                <p className="text-xs text-blue-200">{match.reasoning}</p>
              </div>
            ))}
          </div>
        );
        
      case 'context':
        return (
          <div className="space-y-2">
            <p className="text-sm">{message.text}</p>
            {message.data?.context && (
              <div className="bg-purple-900/20 rounded p-2 border border-purple-700">
                <div className="flex items-center space-x-2 mb-1">
                  <Brain className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-purple-300">MCP Context Extracted</span>
                </div>
                <div className="text-xs text-gray-300">
                  {message.data.context.industry && <span>Industry: {message.data.context.industry} • </span>}
                  {message.data.context.entities.services && <span>Services: {message.data.context.entities.services.join(', ')}</span>}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'analysis':
        return (
          <div className="space-y-2">
            <p className="text-sm">{message.text}</p>
            {message.data?.insights && (
              <div className="bg-green-900/20 rounded p-2 border border-green-700">
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-300">Market Intelligence</span>
                </div>
                <div className="text-xs text-gray-300">
                  Timeline: {message.data.insights.typicalTimeline} • 
                  Trend: {message.data.insights.marketTrend}
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return <p className="text-sm">{message.text}</p>;
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-[#00C2FF] to-blue-600 hover:from-[#00A8D8] hover:to-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
        {currentSessionId && (
          <Badge className="absolute -top-8 right-0 bg-purple-600 text-xs">
            MCP Active
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 bg-white shadow-xl border-0 transition-all duration-200 ${isMinimized ? 'h-14' : 'h-96'}`}>
        <CardHeader className="p-4 bg-gradient-to-r from-[#00C2FF] to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">BamaBot</span>
              <Badge className="bg-purple-600 text-xs">MCP</Badge>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-1 h-6 w-6"
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1 h-6 w-6"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${message.isBot ? 'bg-[#00C2FF]' : 'bg-gray-600'}`}>
                      {message.isBot ? <Bot className="w-3 h-3 text-white" /> : <User className="w-3 h-3 text-white" />}
                    </div>
                    <div className={`rounded-lg p-2 ${message.isBot ? 'bg-gray-100 text-gray-800' : 'bg-[#00C2FF] text-white'}`}>
                      {renderMessage(message)}
                    </div>
                  </div>
                </div>
              ))}
              
              {(isTyping || isLoading) && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    <div className="w-6 h-6 rounded-full bg-[#00C2FF] flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your AI needs..."
                  className="flex-1"
                  disabled={isTyping || isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping || isLoading}
                  className="bg-[#00C2FF] hover:bg-[#00A8D8]"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {currentSessionId && (
                <div className="text-xs text-gray-500 mt-1">
                  MCP Session: {contexts.length} contexts captured
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default EnhancedBamaBot;
