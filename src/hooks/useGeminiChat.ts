
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: string;
  data?: any;
}

interface ChatOptions {
  type?: 'chat' | 'business_analysis' | 'market_intelligence' | 'recommendations';
  context?: any;
  businessId?: number;
  sector?: string;
}

export const useGeminiChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (
    message: string, 
    options: ChatOptions = {}
  ) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('enhanced-bamabot', {
        body: {
          message,
          type: options.type || 'chat',
          context: options.context,
          businessId: options.businessId,
          sector: options.sector
        }
      });

      if (error) throw error;

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response || data.summary || 'Response received',
        isBot: true,
        timestamp: new Date(),
        type: data.type,
        data: data
      };

      setMessages(prev => [...prev, botMessage]);

      return data;
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isBot: true,
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    clearMessages
  };
};
