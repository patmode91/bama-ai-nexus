
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Sparkles, TrendingUp, Building, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { aiService } from '@/services/aiService';
import { useBusinesses } from '@/hooks/useBusinesses';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'business_recommendation' | 'market_insight' | 'content_suggestion';
  data?: any;
}

interface BusinessRecommendation {
  business: any;
  matchScore: number;
  reasons: string[];
}

const EnhancedBamaBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm BamaBot 2.0, your enhanced AI assistant for Alabama's business ecosystem. I have deep knowledge of local industries, market trends, and can provide intelligent business matching. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userContext, setUserContext] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: businesses } = useBusinesses();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateEnhancedResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Business matching queries
    if (lowerMessage.includes('find') && (lowerMessage.includes('business') || lowerMessage.includes('company'))) {
      return generateBusinessRecommendations(userMessage);
    }
    
    // Market insight queries
    if (lowerMessage.includes('market') || lowerMessage.includes('trend') || lowerMessage.includes('industry')) {
      return generateMarketInsights(userMessage);
    }
    
    // Content generation queries
    if (lowerMessage.includes('describe') || lowerMessage.includes('write') || lowerMessage.includes('content')) {
      return generateContentSuggestions(userMessage);
    }
    
    // Location-specific queries
    if (lowerMessage.includes('huntsville') || lowerMessage.includes('birmingham') || lowerMessage.includes('mobile')) {
      return generateLocationInsights(userMessage);
    }
    
    // Knowledge base queries
    const knowledgeResponse = aiService.queryKnowledgeBase(userMessage);
    return {
      id: Date.now().toString(),
      text: knowledgeResponse,
      isBot: true,
      timestamp: new Date(),
      type: 'text'
    };
  };

  const generateBusinessRecommendations = (query: string): Message => {
    if (!businesses || businesses.length === 0) {
      return {
        id: Date.now().toString(),
        text: "I'd love to help you find businesses, but I need access to the business directory first. Please make sure you're connected to see personalized recommendations!",
        isBot: true,
        timestamp: new Date(),
        type: 'text'
      };
    }

    // Extract context from query
    const context = extractUserContext(query);
    const matches = aiService.generateBusinessMatches(context, businesses);
    
    return {
      id: Date.now().toString(),
      text: `Based on your query, I found ${matches.length} excellent business matches for you:`,
      isBot: true,
      timestamp: new Date(),
      type: 'business_recommendation',
      data: matches.slice(0, 3)
    };
  };

  const generateMarketInsights = (query: string): Message => {
    const insights = aiService.generateMarketInsights();
    
    return {
      id: Date.now().toString(),
      text: "Here are the latest market insights for Alabama's business ecosystem:",
      isBot: true,
      timestamp: new Date(),
      type: 'market_insight',
      data: insights.slice(0, 3)
    };
  };

  const generateContentSuggestions = (query: string): Message => {
    // Mock business data for content generation
    const mockBusiness = {
      businessname: "Example Tech Company",
      category: "Technology",
      location: "Birmingham, AL"
    };
    
    const contentSuggestion = aiService.generateBusinessContent(mockBusiness);
    
    return {
      id: Date.now().toString(),
      text: "Here's an AI-generated content suggestion:",
      isBot: true,
      timestamp: new Date(),
      type: 'content_suggestion',
      data: contentSuggestion
    };
  };

  const generateLocationInsights = (query: string): Message => {
    const response = aiService.queryKnowledgeBase(query);
    
    return {
      id: Date.now().toString(),
      text: response,
      isBot: true,
      timestamp: new Date(),
      type: 'text'
    };
  };

  const extractUserContext = (query: string): any => {
    const context: any = {};
    
    // Extract industry
    if (query.includes('tech')) context.industry = 'technology';
    if (query.includes('health')) context.industry = 'healthcare';
    if (query.includes('aerospace')) context.industry = 'aerospace';
    
    // Extract location preferences
    if (query.includes('huntsville')) context.location = 'Huntsville, AL';
    if (query.includes('birmingham')) context.location = 'Birmingham, AL';
    if (query.includes('mobile')) context.location = 'Mobile, AL';
    
    // Extract urgency
    if (query.includes('urgent') || query.includes('immediate')) context.urgency = 'immediate';
    
    return context;
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

    // Update user context based on message
    const newContext = extractUserContext(inputValue);
    setUserContext(prev => ({ ...prev, ...newContext }));

    // Generate enhanced AI response
    setTimeout(() => {
      const botResponse = generateEnhancedResponse(inputValue);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.type === 'business_recommendation' && message.data) {
      return (
        <div className="space-y-3">
          <p className="text-sm mb-3">{message.text}</p>
          {message.data.map((match: any, index: number) => (
            <div key={index} className="bg-white/10 rounded-lg p-3 border border-gray-300">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800">{match.business.businessname}</h4>
                <Badge className="bg-green-500 text-white">
                  {match.matchScore}% Match
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{match.business.description?.slice(0, 100)}...</p>
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <MapPin className="w-3 h-3 mr-1" />
                {match.business.location}
                <Building className="w-3 h-3 ml-3 mr-1" />
                {match.business.category}
              </div>
              <div className="flex flex-wrap gap-1">
                {match.matchReasons.map((reason: string, reasonIndex: number) => (
                  <Badge key={reasonIndex} variant="outline" className="text-xs">
                    {reason}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (message.type === 'market_insight' && message.data) {
      return (
        <div className="space-y-3">
          <p className="text-sm mb-3">{message.text}</p>
          {message.data.map((insight: any, index: number) => (
            <div key={index} className="bg-white/10 rounded-lg p-3 border border-gray-300">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-800">{insight.category}</h4>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                  <span className="text-sm text-green-600">+{insight.growthRate}%</span>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                {insight.insights.slice(0, 2).map((item: string, itemIndex: number) => (
                  <p key={itemIndex}>• {item}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (message.type === 'content_suggestion' && message.data) {
      return (
        <div className="space-y-3">
          <p className="text-sm mb-3">{message.text}</p>
          <div className="bg-white/10 rounded-lg p-3 border border-gray-300">
            <h4 className="font-semibold text-gray-800 mb-2">{message.data.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{message.data.description}</p>
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-700">Tags: </span>
                {message.data.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs mr-1">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div>
                <span className="text-xs font-medium text-gray-700">Marketing Points:</span>
                <ul className="text-xs text-gray-600 mt-1">
                  {message.data.marketingPoints.slice(0, 3).map((point: string, index: number) => (
                    <li key={index}>• {point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return <p className="text-sm">{message.text}</p>;
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 bg-gradient-to-r from-[#00C2FF] to-purple-600 hover:from-[#00A8D8] hover:to-purple-500 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <div className="flex items-center">
            <Sparkles className="w-5 h-5 mr-1" />
            <Bot className="w-5 h-5" />
          </div>
        </Button>
        <div className="absolute -top-2 -left-2 w-5 h-5 bg-purple-500 rounded-full animate-pulse flex items-center justify-center">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 bg-white shadow-xl border-0 transition-all duration-200 ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
        <CardHeader className="p-4 bg-gradient-to-r from-[#00C2FF] to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 mr-1" />
                <Bot className="w-4 h-4" />
              </div>
              <span className="font-semibold">BamaBot 2.0</span>
              <Badge className="bg-purple-500 text-white text-xs">Enhanced AI</Badge>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
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
          <CardContent className="p-0 flex flex-col h-[432px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[85%] ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${message.isBot ? 'bg-gradient-to-r from-[#00C2FF] to-purple-600' : 'bg-gray-600'}`}>
                      {message.isBot ? (
                        <div className="flex items-center">
                          <Sparkles className="w-3 h-3 text-white mr-0.5" />
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <User className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${message.isBot ? 'bg-gray-100 text-gray-800' : 'bg-[#00C2FF] text-white'}`}>
                      {renderMessageContent(message)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[85%]">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#00C2FF] to-purple-600 flex items-center justify-center">
                      <div className="flex items-center">
                        <Sparkles className="w-3 h-3 text-white mr-0.5" />
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about businesses, trends, or insights..."
                  className="flex-1 border-gray-300"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-[#00C2FF] to-purple-600 hover:from-[#00A8D8] hover:to-purple-500"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <Sparkles className="w-3 h-3 mr-1" />
                Enhanced with AI business intelligence
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default EnhancedBamaBot;
