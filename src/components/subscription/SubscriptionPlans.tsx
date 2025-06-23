
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Building2 } from 'lucide-react';
import { SubscriptionService } from '@/services/subscriptionService';
import { SubscriptionTier } from '@/types/subscription';

interface SubscriptionPlansProps {
  currentTier?: SubscriptionTier;
  onSelectPlan: (planId: string) => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  currentTier = 'free',
  onSelectPlan
}) => {
  const plans = SubscriptionService.getPlans();

  const getPlanIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'oracle_lite': return <Star className="w-5 h-5" />;
      case 'nexus_pro': return <Zap className="w-5 h-5" />;
      case 'enterprise': return <Building2 className="w-5 h-5" />;
      default: return null;
    }
  };

  const getPlanColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'oracle_lite': return 'border-yellow-500 bg-yellow-500/5';
      case 'nexus_pro': return 'border-[#00C2FF] bg-[#00C2FF]/5';
      case 'enterprise': return 'border-purple-500 bg-purple-500/5';
      default: return 'border-gray-600 bg-gray-800/50';
    }
  };

  const isCurrentPlan = (tier: SubscriptionTier) => tier === currentTier;
  const isUpgrade = (tier: SubscriptionTier) => {
    const hierarchy = { free: 0, oracle_lite: 1, nexus_pro: 2, enterprise: 3 };
    return hierarchy[tier] > hierarchy[currentTier];
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Choose Your Agentic Advantage</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Unlock the power of AI agents to accelerate your business growth in Alabama's AI ecosystem
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${getPlanColor(plan.tier)} transition-all hover:scale-105`}
          >
            {plan.tier === 'nexus_pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#00C2FF] text-white px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                {getPlanIcon(plan.tier)}
              </div>
              <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-white">
                ${plan.price}
                {plan.price > 0 && <span className="text-sm text-gray-400">/month</span>}
              </div>
              <p className="text-sm text-gray-300">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-400 space-y-1">
                  <div>
                    Queries: {plan.agentLimits.queries === -1 ? 'Unlimited' : `${plan.agentLimits.queries}/month`}
                  </div>
                  <div>
                    Concurrent: {plan.agentLimits.concurrent === -1 ? 'Unlimited' : plan.agentLimits.concurrent}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => onSelectPlan(plan.id)}
                disabled={isCurrentPlan(plan.tier)}
                className={`w-full ${
                  plan.tier === 'nexus_pro'
                    ? 'bg-[#00C2FF] hover:bg-[#00A8D8]'
                    : plan.tier === 'enterprise'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
                variant={isCurrentPlan(plan.tier) ? 'outline' : 'default'}
              >
                {isCurrentPlan(plan.tier)
                  ? 'Current Plan'
                  : isUpgrade(plan.tier)
                  ? 'Upgrade'
                  : plan.price === 0
                  ? 'Get Started'
                  : 'Contact Sales'
                }
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-400">
          All plans include access to our core AI agents and Alabama business directory
        </p>
      </div>
    </div>
  );
};
