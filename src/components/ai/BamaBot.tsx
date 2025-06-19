
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const BamaBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm BamaBot, your AI assistant for Alabama's AI ecosystem. I can help you find AI companies, understand market trends, or answer questions about Alabama's tech scene. What can I help you with today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Access Supabase URL and Anon Key from environment variables (Vite specific)
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Placeholder for actual Supabase auth client if available globally or via context
  // For now, assuming a way to get the current session/token.
  // In a real app, you'd use the Supabase client instance: e.g., supabase.auth.getSession()
  const getAuthToken = async () => {
    // This is a placeholder. Replace with your actual Supabase auth token retrieval logic.
    // const { data: { session } } = await supabase.auth.getSession();
    // return session?.access_token;
    return 'your-placeholder-jwt-if-needed-for-testing-without-auth'; // Or null if no auth
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // generateBotResponse function is removed.

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    // Add user message to state immediately
    // Keep a reference to current messages for chat history
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    const currentInputValue = inputValue; // Store before clearing
    setInputValue('');
    setIsTyping(true);

    try {
      const authToken = await getAuthToken(); // Placeholder for actual token
      const requestBody = {
        sessionId: "bamabot_session_placeholder_" + new Date().getTime(), // Basic unique session for now
        userId: "bamabot_user_placeholder_123", // Static user for now
        task: "bamabot_chat_interaction",
        payload: {
          queryText: userMessage.text,
          chatHistory: currentMessages.slice(-6, -1).map(m => ({ // Send up to 5 previous messages
            text: m.text,
            sender: m.isBot ? 'bot' : 'user'
          }))
        },
        clientContext: {
          clientType: "BamaBotUI"
        }
      };

      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-agent-orchestrator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY, // Supabase Anon Key
          'Authorization': `Bearer ${authToken}`, // User's JWT or Service Role Key if appropriate
        },
        body: JSON.stringify(requestBody),
      });

      setIsTyping(false);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error or invalid JSON response" }));
        console.error('BamaBot API Error:', errorData);
        const errorMessage = errorData?.error || `Error: ${response.status} ${response.statusText}`;
        const botErrorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Sorry, I encountered an error: ${errorMessage}`,
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botErrorMessage]);
        return;
      }

      const responseData = await response.json();

      if (responseData.success && responseData.data?.textResponse) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: responseData.data.textResponse,
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
        // Optionally log or use responseData.data.classification
        console.log("BamaBot Classification:", responseData.data.classification);
      } else {
        const errorMessageText = responseData.error || "Sorry, I couldn't get a proper response.";
        const botErrorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: errorMessageText,
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botErrorMessage]);
      }

    } catch (error: any) {
      setIsTyping(false);
      console.error('BamaBot send message error:', error);
      const botErrorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, something went wrong: ${error.message || "Network request failed."}`,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botErrorMessage]);
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
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 h-96 bg-white shadow-xl border-0 transition-all duration-200 ${isMinimized ? 'h-14' : 'h-96'}`}>
        <CardHeader className="p-4 bg-gradient-to-r from-[#00C2FF] to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">BamaBot</span>
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
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
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
                  placeholder="Ask me about Alabama's AI scene..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
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

export default BamaBot;
