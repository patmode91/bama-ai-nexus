
import { useState, useEffect } from 'react';
import { Integration, IntegrationEvent } from '@/types/integrations';

// Mock data for now - in a real app this would come from your backend
const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Zapier Webhook',
    type: 'zapier',
    description: 'Send data to Zapier workflows when events occur',
    icon: '⚡',
    isActive: false,
    config: {
      webhookUrl: '',
      triggerEvents: ['new_review', 'profile_update', 'contact_form']
    },
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Slack Notifications',
    type: 'slack',
    description: 'Get notified in Slack when important events happen',
    icon: '💬',
    isActive: false,
    config: {
      webhookUrl: '',
      channel: '#general',
      username: 'Alabama AI Bot'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Custom Webhook',
    type: 'webhook',
    description: 'Send HTTP requests to your custom endpoint',
    icon: '🔗',
    isActive: false,
    config: {
      url: '',
      events: ['new_contact', 'new_review'],
      secret: ''
    },
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'API Access',
    type: 'api',
    description: 'Generate API keys for programmatic access',
    icon: '🔑',
    isActive: false,
    config: {
      keyName: '',
      permissions: ['read_profile', 'read_reviews'],
      expiresAt: ''
    },
    createdAt: new Date().toISOString()
  }
];

export const useIntegrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [events, setEvents] = useState<IntegrationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const updateIntegration = async (id: string, updates: Partial<Integration>) => {
    setIsLoading(true);
    try {
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === id 
            ? { ...integration, ...updates }
            : integration
        )
      );
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating integration:', error);
      return { success: false, error: 'Failed to update integration' };
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIntegration = async (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (!integration) return { success: false, error: 'Integration not found' };

    return updateIntegration(id, { isActive: !integration.isActive });
  };

  const testIntegration = async (id: string) => {
    setIsLoading(true);
    try {
      const integration = integrations.find(i => i.id === id);
      if (!integration) throw new Error('Integration not found');

      // Simulate test payload
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        businessId: 'test-business-id',
        eventType: 'test_event'
      };

      if (integration.type === 'webhook' || integration.type === 'zapier') {
        const url = integration.config.webhookUrl || integration.config.url;
        if (!url) throw new Error('Webhook URL not configured');

        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'no-cors',
          body: JSON.stringify(testPayload)
        });
      }

      return { success: true, message: 'Test successful! Check your endpoint for the test payload.' };
    } catch (error) {
      console.error('Error testing integration:', error);
      return { success: false, error: 'Test failed. Please check your configuration.' };
    } finally {
      setIsLoading(false);
    }
  };

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'ak_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  return {
    integrations,
    events,
    isLoading,
    updateIntegration,
    toggleIntegration,
    testIntegration,
    generateApiKey
  };
};
