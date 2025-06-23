
import { SubscriptionPlan, SubscriptionTier } from '@/types/subscription';

export class SubscriptionService {
  private static plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Community',
      tier: 'free',
      price: 0,
      interval: 'monthly',
      features: [
        'Basic directory access',
        'Limited AI agent queries (10/month)',
        'Community forums',
        'Basic business matching'
      ],
      agentLimits: {
        queries: 10,
        concurrent: 1,
        premium: false
      },
      description: 'Perfect for exploring Alabama\'s AI ecosystem'
    },
    {
      id: 'oracle_lite',
      name: 'Oracle Lite',
      tier: 'oracle_lite',
      price: 29,
      interval: 'monthly',
      features: [
        'Enhanced AI agent queries (100/month)',
        'Basic market insights',
        'Data confidence scores',
        'Email alerts',
        'Priority support'
      ],
      agentLimits: {
        queries: 100,
        concurrent: 2,
        premium: false
      },
      description: 'AI-powered insights for growing businesses'
    },
    {
      id: 'nexus_pro',
      name: 'Nexus Pro',
      tier: 'nexus_pro',
      price: 99,
      interval: 'monthly',
      features: [
        'Unlimited AI agent queries',
        'Full Oracle access',
        'Advanced analytics',
        'Custom reports',
        'API access',
        'White-label options',
        'Dedicated account manager'
      ],
      agentLimits: {
        queries: -1, // unlimited
        concurrent: 5,
        premium: true
      },
      description: 'Complete AI-powered business intelligence platform'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tier: 'enterprise',
      price: 499,
      interval: 'monthly',
      features: [
        'Everything in Nexus Pro',
        'Custom agent development',
        'On-premise deployment',
        'SSO integration',
        'Advanced security',
        '24/7 support',
        'Custom integrations',
        'Dedicated infrastructure'
      ],
      agentLimits: {
        queries: -1,
        concurrent: -1,
        premium: true
      },
      description: 'Enterprise-grade AI solutions with full customization'
    }
  ];

  static getPlans(): SubscriptionPlan[] {
    return this.plans;
  }

  static getPlan(planId: string): SubscriptionPlan | undefined {
    return this.plans.find(plan => plan.id === planId);
  }

  static getPlansByTier(tier: SubscriptionTier): SubscriptionPlan[] {
    return this.plans.filter(plan => plan.tier === tier);
  }

  static canAccessFeature(userTier: SubscriptionTier, feature: string): boolean {
    const tierHierarchy: Record<SubscriptionTier, number> = {
      free: 0,
      oracle_lite: 1,
      nexus_pro: 2,
      enterprise: 3
    };

    const featureRequirements: Record<string, SubscriptionTier> = {
      'unlimited_queries': 'nexus_pro',
      'api_access': 'nexus_pro',
      'custom_reports': 'nexus_pro',
      'data_confidence_scores': 'oracle_lite',
      'premium_insights': 'oracle_lite',
      'custom_agents': 'enterprise',
      'white_label': 'nexus_pro'
    };

    const requiredTier = featureRequirements[feature];
    if (!requiredTier) return true; // Feature doesn't require subscription

    return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
  }

  static getUsageLimit(userTier: SubscriptionTier, metric: 'queries' | 'concurrent'): number {
    const plan = this.plans.find(p => p.tier === userTier);
    return plan?.agentLimits[metric] || 0;
  }
}
