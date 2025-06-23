
import { Partnership, PartnershipProposal, PartnershipType, PartnershipTier } from '@/types/partnerships';

export class PartnershipService {
  private static partnerships: Partnership[] = [
    {
      id: 'univ-alabama',
      name: 'University of Alabama',
      type: 'academic',
      status: 'active',
      tier: 'premium',
      description: 'Leading research university partnership for AI innovation and student entrepreneurship',
      contactEmail: 'partnerships@ua.edu',
      contactName: 'Dr. Sarah Johnson',
      website: 'https://ua.edu',
      startDate: new Date('2024-01-15'),
      features: [
        'Student access to Nexus Pro',
        'Research data integration',
        'Custom agent development',
        'Startup incubator connections'
      ],
      metrics: {
        activeUsers: 2847,
        dataContributions: 156,
        agentQueries: 8432,
        successfulMatches: 298,
        roiScore: 8.4
      },
      integrations: [
        {
          id: 'ua-sso',
          name: 'University SSO',
          type: 'sso',
          status: 'active',
          configuration: { domain: 'ua.edu' },
          lastSync: new Date('2024-01-20')
        }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 'alabama-commerce',
      name: 'Alabama Department of Commerce',
      type: 'government',
      status: 'active',
      tier: 'enterprise',
      description: 'State partnership for economic development and business growth initiatives',
      contactEmail: 'tech@commerce.alabama.gov',
      contactName: 'Mark Williams',
      website: 'https://commerce.alabama.gov',
      startDate: new Date('2024-02-01'),
      features: [
        'Economic development analytics',
        'Business incentive matching',
        'State program integration',
        'Custom reporting dashboard'
      ],
      metrics: {
        activeUsers: 145,
        dataContributions: 89,
        agentQueries: 1205,
        successfulMatches: 67,
        roiScore: 9.2
      },
      integrations: [
        {
          id: 'commerce-api',
          name: 'Commerce Data API',
          type: 'api',
          status: 'active',
          configuration: { endpoint: 'api.commerce.alabama.gov' }
        }
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-01')
    }
  ];

  static getPartnerships(): Partnership[] {
    return this.partnerships;
  }

  static getPartnership(id: string): Partnership | undefined {
    return this.partnerships.find(p => p.id === id);
  }

  static getPartnershipsByType(type: PartnershipType): Partnership[] {
    return this.partnerships.filter(p => p.type === type);
  }

  static getPartnershipFeatures(tier: PartnershipTier): string[] {
    const featureMap: Record<PartnershipTier, string[]> = {
      basic: [
        'Directory access',
        'Basic agent queries (50/month)',
        'Community forum access',
        'Monthly reports'
      ],
      premium: [
        'Enhanced agent queries (500/month)',
        'Custom branding',
        'API access',
        'Advanced analytics',
        'Priority support',
        'Integration support'
      ],
      enterprise: [
        'Unlimited agent queries',
        'Custom agent development',
        'Dedicated infrastructure',
        'White-label options',
        'SLA guarantees',
        'Custom integrations',
        'Dedicated account manager'
      ]
    };
    return featureMap[tier];
  }

  static calculateROI(partnership: Partnership): {
    costSavings: number;
    timeEfficiency: number;
    matchSuccess: number;
    overallScore: number;
  } {
    const { metrics } = partnership;
    
    // Sample ROI calculations
    const costSavings = (metrics.successfulMatches * 2500) + (metrics.dataContributions * 150);
    const timeEfficiency = metrics.agentQueries * 0.5; // hours saved
    const matchSuccess = (metrics.successfulMatches / metrics.agentQueries) * 100;
    const overallScore = (costSavings / 10000) + timeEfficiency + matchSuccess;

    return {
      costSavings,
      timeEfficiency,
      matchSuccess,
      overallScore: Math.min(overallScore, 10)
    };
  }
}
