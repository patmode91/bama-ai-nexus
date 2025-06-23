
export type PartnershipType = 'academic' | 'government' | 'corporate';
export type PartnershipStatus = 'pending' | 'active' | 'paused' | 'expired';
export type PartnershipTier = 'basic' | 'premium' | 'enterprise';

export interface Partnership {
  id: string;
  name: string;
  type: PartnershipType;
  status: PartnershipStatus;
  tier: PartnershipTier;
  description: string;
  contactEmail: string;
  contactName: string;
  website?: string;
  logoUrl?: string;
  startDate: Date;
  endDate?: Date;
  features: string[];
  metrics: PartnershipMetrics;
  integrations: PartnershipIntegration[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnershipMetrics {
  activeUsers: number;
  dataContributions: number;
  agentQueries: number;
  successfulMatches: number;
  roiScore: number;
}

export interface PartnershipIntegration {
  id: string;
  name: string;
  type: 'api' | 'sso' | 'data_feed' | 'webhook';
  status: 'active' | 'inactive' | 'pending';
  configuration: Record<string, any>;
  lastSync?: Date;
}

export interface PartnershipProposal {
  id: string;
  organizationName: string;
  type: PartnershipType;
  contactName: string;
  contactEmail: string;
  description: string;
  proposedFeatures: string[];
  expectedUsers: number;
  timeline: string;
  status: 'submitted' | 'reviewing' | 'approved' | 'rejected';
  submittedAt: Date;
}
