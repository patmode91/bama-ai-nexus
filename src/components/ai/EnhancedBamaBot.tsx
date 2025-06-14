
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Sparkles, TrendingUp, Building, MapPin, Zap, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useBusinesses } from '@/hooks/useBusinesses';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'business_analysis' | 'market_intelligence' | 'recommendations' | 'error';
  data?: any;
}

const EnhancedBamaBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm BamaBot 2.0, powered by advanced AI and deep knowledge of Alabama's business ecosystem. I can help you with intelligent business matching, market analysis, and strategic insights. What would you like to explore today?",
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

  const callGeminiService = async (message: string, type: string = 'chat') => {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-bamabot', {
        body: {
          message,
          context: userContext,
          type,
          businessId: type === 'business_analysis' ? extractBusinessId(message) : undefined,
          sector: type === 'market_intelligence' ? extractSector(message) : undefined
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Gemini service error:', error);
      throw error;
    }
  };

  const extractBusinessId = (message: string): number | undefined => {
    // Simple extraction - in production, you'd want more sophisticated entity recognition
    const businessMatch = businesses?.find(b => 
      message.toLowerCase().includes(b.businessname.toLowerCase())
    );
    return businessMatch?.id;
  };

  const extractSector = (message: string): string => {
    const sectors = ['technology', 'healthcare', 'aerospace', 'automotive', 'manufacturing', 'finance'];
    const foundSector = sectors.find(sector => 
      message.toLowerCase().includes(sector)
    );
    return foundSector || 'general';
  };

  const determineRequestType = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('analyze') && (lowerMessage.includes('business') || lowerMessage.includes('company'))) {
      return 'business_analysis';
    }
    
    if (lowerMessage.includes('market') || lowerMessage.includes('trend') || lowerMessage.includes('intelligence')) {
      return 'market_intelligence';
    }
    
    if (lowerMessage.includes('recommend') || lowerMessage.includes('match') || lowerMessage.includes('find businesses')) {
      return 'recommendations';
    }
    
    return 'chat';
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
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Update user context
    const newContext = extractUserContext(currentInput);
    setUserContext(prev => ({ ...prev, ...newContext }));

    try {
      const requestType = determineRequestType(currentInput);
      const response = await callGeminiService(currentInput, requestType);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response || response.summary || 'I received your request and processed it successfully.',
        isBot: true,
        timestamp: new Date(),
        type: response.type || 'text',
        data: response
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Add follow-up suggestions if provided
      if (response.suggestions && response.suggestions.length > 0) {
        setTimeout(() => {
          const suggestionMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: "Here are some follow-up questions you might find helpful:",
            isBot: true,
            timestamp: new Date(),
            type: 'text',
            data: { suggestions: response.suggestions }
          };
          setMessages(prev => [...prev, suggestionMessage]);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment, or rephrase your question.",
        isBot: true,
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const extractUserContext = (query: string): any => {
    const context: any = {};
    
    // Extract industry
    const industries = ['technology', 'healthcare', 'aerospace', 'automotive', 'manufacturing', 'finance'];
    const foundIndustry = industries.find(ind => query.toLowerCase().includes(ind));
    if (foundIndustry) context.industry = foundIndustry;
    
    // Extract location
    const locations = ['birmingham', 'huntsville', 'mobile', 'montgomery', 'tuscaloosa'];
    const foundLocation = locations.find(loc => query.toLowerCase().includes(loc));
    if (foundLocation) context.userLocation = foundLocation;
    
    // Extract company size preferences
    if (query.includes('startup')) context.companySize = 'startup';
    if (query.includes('small business')) context.companySize = 'small';
    if (query.includes('large company')) context.companySize = 'large';
    
    // Add to recent interactions
    if (!context.recentInteractions) context.recentInteractions = [];
    context.recentInteractions.unshift(query);
    context.recentInteractions = context.recentInteractions.slice(0, 5);
    
    return context;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const renderMessageContent = (message: Message) => {
    if (message.type === 'business_analysis' && message.data?.analysis) {
      const { business, analysis } = message.data;
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Building className="w-4 h-4 mr-2" />
              {business.businessname} Analysis
            </h4>
            <p className="text-sm text-blue-800">{analysis.marketPosition}</p>
          </div>
          
          <div className="grid gap-3">
            <div className="bg-green-50 rounded p-3 border border-green-200">
              <h5 className="font-medium text-green-900 mb-2">Competitive Advantages</h5>
              <ul className="text-sm text-green-800 space-y-1">
                {analysis.competitiveAdvantages.map((advantage: string, index: number) => (
                  <li key={index}>• {advantage}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-purple-50 rounded p-3 border border-purple-200">
              <h5 className="font-medium text-purple-900 mb-2">Growth Opportunities</h5>
              <ul className="text-sm text-purple-800 space-y-1">
                {analysis.growthOpportunities.slice(0, 3).map((opportunity: string, index: number) => (
                  <li key={index}>• {opportunity}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (message.type === 'market_intelligence' && message.data?.intelligence) {
      const { intelligence, sector } = message.data;
      return (
        <div className="space-y-4">
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-2 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              {sector.charAt(0).toUpperCase() + sector.slice(1)} Market Intelligence
            </h4>
            <p className="text-sm text-indigo-800">{intelligence.trendAnalysis}</p>
          </div>
          
          <div className="grid gap-3">
            <div className="bg-orange-50 rounded p-3 border border-orange-200">
              <h5 className="font-medium text-orange-900 mb-2">Key Opportunities</h5>
              <ul className="text-sm text-orange-800 space-y-1">
                {intelligence.opportunityAreas?.slice(0, 3).map((area: string, index: number) => (
                  <li key={index}>• {area}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-teal-50 rounded p-3 border border-teal-200">
              <h5 className="font-medium text-teal-900 mb-2">Alabama Advantages</h5>
              <ul className="text-sm text-teal-800 space-y-1">
                {intelligence.alabamaAdvantages?.slice(0, 3).map((advantage: string, index: number) => (
                  <li key={index}>• {advantage}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (message.type === 'recommendations' && message.data?.recommendations) {
      return (
        <div className="space-y-3">
          <p className="text-sm mb-3">{message.text}</p>
          {message.data.recommendations.slice(0, 3).map((rec: any, index: number) => (
            <div key={index} className="bg-white/10 rounded-lg p-3 border border-gray-300">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800">{rec.business.businessname}</h4>
                <Badge className="bg-green-500 text-white">
                  {rec.matchScore}% Match
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{rec.business.description?.slice(0, 100)}...</p>
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <MapPin className="w-3 h-3 mr-1" />
                {rec.business.location}
                <Building className="w-3 h-3 ml-3 mr-1" />
                {rec.business.category}
              </div>
              <div className="flex flex-wrap gap-1">
                {rec.matchReasons?.slice(0, 3).map((reason: string, reasonIndex: number) => (
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

    // Handle suggestions
    if (message.data?.suggestions) {
      return (
        <div className="space-y-3">
          <p className="text-sm">{message.text}</p>
          <div className="flex flex-wrap gap-2">
            {message.data.suggestions.map((suggestion: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                {suggestion}
              </Button>
            ))}
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
          data-bamabot-trigger
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
              <Badge className="bg-purple-500 text-white text-xs">Gemini AI</Badge>
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
                  placeholder="Ask about businesses, analyze companies, get market insights..."
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
                <Zap className="w-3 h-3 mr-1" />
                Powered by Google Gemini 2.0 Flash
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default EnhancedBamaBot;
