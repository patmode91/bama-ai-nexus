
export type SubscriptionTier = 'free' | 'oracle_lite' | 'nexus_pro' | 'enterprise';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  agentLimits: {
    queries: number;
    concurrent: number;
    premium: boolean;
  };
  description: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}
