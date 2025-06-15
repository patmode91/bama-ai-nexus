
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMCP } from '@/hooks/useMCP';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  agentResponses?: {
    connector?: any;
    analyst?: any;
    curator?: any;
  };
}

const EnhancedBamaBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm BamaBot, powered by advanced AI agents. I can help you find AI companies, analyze market trends, and get enriched business insights. What can I help you with today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { processMessage, runFullAnalysis, isLoading, agentResponses } = useMCP();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = async (userMessage: string): Promise<{ text: string; agentResponses?: any }> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check if the message warrants AI agent analysis
    const needsAIAnalysis = 
      lowerMessage.includes('find') || 
      lowerMessage.includes('company') || 
      lowerMessage.includes('business') ||
      lowerMessage.includes('market') ||
      lowerMessage.includes('trend') ||
      lowerMessage.includes('analysis') ||
      lowerMessage.includes('recommend');

    if (needsAIAnalysis) {
      try {
        // Use MCP agents for comprehensive analysis
        const context = await processMessage(userMessage);
        const fullResults = await runFullAnalysis('find_business_solution', {
          originalQuery: userMessage,
          source: 'bamabot'
        });

        let response = "Based on my AI analysis:\n\n";

        if (fullResults.connector && fullResults.connector.matches.length > 0) {
          const topMatch = fullResults.connector.matches[0];
          response += `🔍 **Top Business Match**: ${topMatch.business.businessname} (${topMatch.score}% compatibility)\n`;
          response += `📍 Location: ${topMatch.business.location || 'Not specified'}\n`;
          response += `💡 Why it's a good fit: ${topMatch.reasoning}\n\n`;
        }

        if (fullResults.analyst && fullResults.analyst.insights) {
          const insights = fullResults.analyst.insights;
          response += `📈 **Market Insights**:\n`;
          response += `• Sector: ${insights.sector}\n`;
          response += `• Market trend: ${insights.marketTrend}\n`;
          response += `• Demand level: ${insights.demandLevel}\n`;
          response += `• Average project cost: $${insights.averageProjectCost.min.toLocaleString()} - $${insights.averageProjectCost.max.toLocaleString()}\n\n`;
        }

        if (fullResults.curator && fullResults.curator.suggestions.length > 0) {
          response += `💎 **Data Insights**:\n`;
          fullResults.curator.suggestions.slice(0, 2).forEach(suggestion => {
            response += `• ${suggestion}\n`;
          });
        }

        response += "\nWould you like me to provide more details about any of these results?";

        return { 
          text: response,
          agentResponses: fullResults
        };

      } catch (error) {
        console.error('MCP Analysis error:', error);
        return {
          text: "I encountered an issue with my AI analysis, but I can still help! " + 
                getSimpleResponse(lowerMessage)
        };
      }
    }

    return { text: getSimpleResponse(lowerMessage) };
  };

  const getSimpleResponse = (lowerMessage: string): string => {
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm here to help you navigate Alabama's AI landscape. Are you looking for AI companies, job opportunities, or market insights?";
    }
    
    if (lowerMessage.includes('company') || lowerMessage.includes('business')) {
      return "I can help you find AI companies in Alabama! Try asking something like 'Find AI companies in Birmingham for healthcare' for a detailed analysis.";
    }
    
    if (lowerMessage.includes('job') || lowerMessage.includes('career')) {
      return "Great! Alabama has a growing AI job market. I can help you find opportunities in machine learning, data science, AI research, and more. What's your background and what type of role interests you?";
    }
    
    if (lowerMessage.includes('huntsville')) {
      return "Huntsville is a major AI hub in Alabama, especially for aerospace and defense applications! The city has strong connections to NASA and defense contractors, making it perfect for AI in robotics and space technology.";
    }
    
    if (lowerMessage.includes('birmingham')) {
      return "Birmingham has a thriving AI scene focused on healthcare, manufacturing, and fintech! The city's medical district and industrial base provide great opportunities for AI applications.";
    }
    
    if (lowerMessage.includes('funding') || lowerMessage.includes('investment')) {
      return "Alabama's AI ecosystem has seen over $45M in total funding! The state offers various incentives for tech companies, and there are active investor networks in Birmingham and Huntsville.";
    }
    
    return "That's a great question! I can provide detailed AI-powered analysis for your business needs. Try asking me to find specific companies or analyze market trends, and I'll use my advanced AI agents to give you comprehensive insights!";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Generate AI-powered response
    try {
      const { text, agentResponses } = await generateBotResponse(inputValue);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text,
        isBot: true,
        timestamp: new Date(),
        agentResponses
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm experiencing some technical difficulties. Please try again in a moment!",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
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
        <div className="absolute -top-2 -left-2">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          <Badge className="absolute -top-1 -right-1 bg-[#00C2FF] text-white text-xs">
            AI
          </Badge>
        </div>
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
              <Badge className="bg-white/20 text-white text-xs">
                <Brain className="w-3 h-3 mr-1" />
                AI
              </Badge>
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
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      {message.agentResponses && (
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <div className="flex gap-1">
                            {message.agentResponses.connector && (
                              <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-600">
                                Connector
                              </Badge>
                            )}
                            {message.agentResponses.analyst && (
                              <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-600">
                                Analyst
                              </Badge>
                            )}
                            {message.agentResponses.curator && (
                              <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-600">
                                Curator
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
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
                      {isLoading && (
                        <p className="text-xs text-gray-500 mt-1">AI agents analyzing...</p>
                      )}
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
                  placeholder="Ask about Alabama's AI scene..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping || isLoading}
                  className="bg-[#00C2FF] hover:bg-[#00A8D8]"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default EnhancedBamaBot;
