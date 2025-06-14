
export interface Integration {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'zapier' | 'slack' | 'discord' | 'email';
  description: string;
  icon: string;
  isActive: boolean;
  config: Record<string, any>;
  createdAt: string;
  lastTriggered?: string;
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
}

export interface ApiKeyConfig {
  keyName: string;
  permissions: string[];
  expiresAt?: string;
}

export interface ZapierConfig {
  webhookUrl: string;
  triggerEvents: string[];
}

export interface SlackConfig {
  webhookUrl: string;
  channel: string;
  username?: string;
}

export interface IntegrationEvent {
  id: string;
  integrationId: string;
  eventType: string;
  payload: Record<string, any>;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  error?: string;
}
