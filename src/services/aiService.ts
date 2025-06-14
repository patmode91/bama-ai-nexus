
import { supabase } from '@/integrations/supabase/client';

export interface BusinessMatch {
  business: any;
  matchScore: number;
  matchReasons: string[];
  confidence: number;
}

export interface MarketInsight {
  category: string;
  trend: 'growing' | 'stable' | 'declining';
  growthRate: number;
  insights: string[];
  opportunities: string[];
}

export interface ContentSuggestion {
  title: string;
  description: string;
  tags: string[];
  marketingPoints: string[];
}

class AIService {
  private knowledgeBase: Map<string, any> = new Map();

  constructor() {
    this.initializeKnowledgeBase();
  }

  private initializeKnowledgeBase() {
    // Alabama business ecosystem knowledge
    this.knowledgeBase.set('alabama_sectors', {
      aerospace: {
        strength: 'high',
        locations: ['Huntsville', 'Mobile'],
        companies: ['Boeing', 'Lockheed Martin', 'NASA Marshall'],
        opportunities: ['Space technology', 'Defense systems', 'Satellite communications']
      },
      automotive: {
        strength: 'high',
        locations: ['Montgomery', 'Birmingham', 'Tuscaloosa'],
        companies: ['Mercedes-Benz', 'Honda', 'Hyundai'],
        opportunities: ['Electric vehicles', 'Autonomous systems', 'Manufacturing automation']
      },
      healthcare: {
        strength: 'medium',
        locations: ['Birmingham', 'Mobile', 'Montgomery'],
        companies: ['UAB Health', 'Children\'s Hospital'],
        opportunities: ['Telemedicine', 'Health analytics', 'Medical devices']
      },
      technology: {
        strength: 'growing',
        locations: ['Birmingham', 'Huntsville', 'Auburn'],
        companies: ['Shipt', 'ADTRAN', 'Velocity Credit Union'],
        opportunities: ['Fintech', 'AI/ML', 'Cybersecurity', 'IoT']
      }
    });

    this.knowledgeBase.set('ai_trends', {
      'machine_learning': {
        demand: 'high',
        applications: ['Predictive analytics', 'Process optimization', 'Quality control'],
        skills_needed: ['Python', 'TensorFlow', 'Data science']
      },
      'robotics': {
        demand: 'medium',
        applications: ['Manufacturing automation', 'Warehouse logistics', 'Healthcare assistance'],
        skills_needed: ['ROS', 'Computer vision', 'Mechanical engineering']
      },
      'data_analytics': {
        demand: 'very_high',
        applications: ['Business intelligence', 'Customer insights', 'Operations optimization'],
        skills_needed: ['SQL', 'Tableau', 'Statistical analysis']
      }
    });
  }

  // Enhanced business matching algorithm
  generateBusinessMatches(userProfile: any, businesses: any[]): BusinessMatch[] {
    const matches: BusinessMatch[] = [];

    businesses.forEach(business => {
      const score = this.calculateMatchScore(userProfile, business);
      const reasons = this.generateMatchReasons(userProfile, business, score);
      const confidence = this.calculateConfidence(score, business);

      if (score > 50) {
        matches.push({
          business,
          matchScore: score,
          matchReasons: reasons,
          confidence
        });
      }
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  }

  private calculateMatchScore(userProfile: any, business: any): number {
    let score = 0;

    // Industry alignment (40% weight)
    if (userProfile.industry && business.category) {
      const industryMatch = this.getIndustryAlignment(userProfile.industry, business.category);
      score += industryMatch * 40;
    }

    // Location preference (20% weight)
    if (userProfile.location && business.location) {
      const locationMatch = this.getLocationAlignment(userProfile.location, business.location);
      score += locationMatch * 20;
    }

    // Company size preference (15% weight)
    if (userProfile.companySize && business.employees_count) {
      const sizeMatch = this.getSizeAlignment(userProfile.companySize, business.employees_count);
      score += sizeMatch * 15;
    }

    // Technology stack alignment (15% weight)
    if (userProfile.technologies && business.tags) {
      const techMatch = this.getTechnologyAlignment(userProfile.technologies, business.tags);
      score += techMatch * 15;
    }

    // Business maturity (10% weight)
    if (business.verified) score += 5;
    if (business.rating && business.rating > 4) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  private generateMatchReasons(userProfile: any, business: any, score: number): string[] {
    const reasons: string[] = [];

    if (userProfile.industry && business.category) {
      const alignment = this.getIndustryAlignment(userProfile.industry, business.category);
      if (alignment > 0.7) reasons.push('Strong industry alignment');
      else if (alignment > 0.4) reasons.push('Related industry experience');
    }

    if (business.verified) reasons.push('Verified business');
    if (business.rating && business.rating > 4.5) reasons.push('Excellent customer rating');
    if (business.employees_count && business.employees_count <= 50) reasons.push('Agile team size');

    if (userProfile.urgency === 'immediate' && business.tags?.includes('available')) {
      reasons.push('Immediate availability');
    }

    if (score > 85) reasons.push('Perfect match profile');
    else if (score > 70) reasons.push('Strong compatibility');

    return reasons.slice(0, 4);
  }

  private calculateConfidence(score: number, business: any): number {
    let confidence = score / 100;

    // Boost confidence for verified businesses
    if (business.verified) confidence += 0.1;
    
    // Boost confidence for businesses with reviews
    if (business.rating && business.rating > 0) confidence += 0.1;
    
    // Reduce confidence for incomplete profiles
    if (!business.description || business.description.length < 50) confidence -= 0.1;

    return Math.min(1, Math.max(0, confidence));
  }

  // Market intelligence generation
  generateMarketInsights(category?: string): MarketInsight[] {
    const insights: MarketInsight[] = [];
    const sectors = this.knowledgeBase.get('alabama_sectors');

    Object.entries(sectors).forEach(([key, data]: [string, any]) => {
      if (!category || key.includes(category.toLowerCase())) {
        const insight: MarketInsight = {
          category: key.charAt(0).toUpperCase() + key.slice(1),
          trend: this.determineTrend(key),
          growthRate: this.calculateGrowthRate(key),
          insights: this.generateCategoryInsights(key, data),
          opportunities: data.opportunities || []
        };
        insights.push(insight);
      }
    });

    return insights;
  }

  private determineTrend(sector: string): 'growing' | 'stable' | 'declining' {
    const growingSectors = ['technology', 'healthcare'];
    const stableSectors = ['aerospace', 'automotive'];
    
    if (growingSectors.includes(sector)) return 'growing';
    if (stableSectors.includes(sector)) return 'stable';
    return 'stable';
  }

  private calculateGrowthRate(sector: string): number {
    const rates = {
      technology: 15.3,
      healthcare: 8.7,
      aerospace: 5.2,
      automotive: 3.8
    };
    return rates[sector] || 5.0;
  }

  private generateCategoryInsights(category: string, data: any): string[] {
    const insights = [
      `${data.strength.charAt(0).toUpperCase() + data.strength.slice(1)} market presence in Alabama`,
      `Key locations: ${data.locations.join(', ')}`,
      `Major players established in the region`
    ];

    if (category === 'technology') {
      insights.push('Emerging startup ecosystem with university partnerships');
      insights.push('Growing venture capital interest in the region');
    }

    return insights;
  }

  // Content generation for businesses
  generateBusinessContent(businessData: any): ContentSuggestion {
    const category = businessData.category?.toLowerCase() || 'business';
    const location = businessData.location || 'Alabama';

    const templates = this.getContentTemplates(category);
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

    return {
      title: this.generateTitle(businessData, selectedTemplate),
      description: this.generateDescription(businessData, selectedTemplate),
      tags: this.generateTags(businessData),
      marketingPoints: this.generateMarketingPoints(businessData)
    };
  }

  private getContentTemplates(category: string) {
    const templates = {
      technology: [
        { focus: 'innovation', tone: 'cutting-edge' },
        { focus: 'solutions', tone: 'professional' },
        { focus: 'transformation', tone: 'forward-thinking' }
      ],
      healthcare: [
        { focus: 'care', tone: 'compassionate' },
        { focus: 'outcomes', tone: 'results-driven' },
        { focus: 'innovation', tone: 'pioneering' }
      ],
      default: [
        { focus: 'service', tone: 'professional' },
        { focus: 'quality', tone: 'reliable' },
        { focus: 'innovation', tone: 'forward-thinking' }
      ]
    };

    return templates[category] || templates.default;
  }

  private generateTitle(businessData: any, template: any): string {
    const name = businessData.businessname || 'Your Business';
    const category = businessData.category || 'Services';
    
    if (template.focus === 'innovation') {
      return `${name}: Pioneering ${category} Solutions in Alabama`;
    } else if (template.focus === 'transformation') {
      return `Transform Your Business with ${name}'s ${category} Expertise`;
    }
    
    return `${name} - Leading ${category} Provider in Alabama`;
  }

  private generateDescription(businessData: any, template: any): string {
    const name = businessData.businessname || 'this company';
    const category = businessData.category || 'industry';
    const location = businessData.location || 'Alabama';

    let description = `${name} is a ${template.tone} ${category.toLowerCase()} company`;
    
    if (location) {
      description += ` based in ${location}`;
    }

    description += `. Specializing in cutting-edge solutions and exceptional service delivery, `;
    description += `we help businesses transform their operations and achieve sustainable growth. `;
    description += `Our expert team combines industry knowledge with innovative approaches to deliver `;
    description += `measurable results for our clients across ${location} and beyond.`;

    return description;
  }

  private generateTags(businessData: any): string[] {
    const baseTags = ['Alabama', 'Professional Services'];
    
    if (businessData.category) baseTags.push(businessData.category);
    if (businessData.location) baseTags.push(businessData.location);
    
    // Add industry-specific tags
    const category = businessData.category?.toLowerCase();
    if (category?.includes('tech')) {
      baseTags.push('Innovation', 'Digital Transformation', 'Technology Solutions');
    } else if (category?.includes('health')) {
      baseTags.push('Healthcare', 'Patient Care', 'Medical Services');
    }

    return baseTags.slice(0, 6);
  }

  private generateMarketingPoints(businessData: any): string[] {
    const points = [
      'Proven track record of success',
      'Local expertise with regional insights',
      'Customized solutions for your needs'
    ];

    if (businessData.verified) points.push('Verified and trusted business');
    if (businessData.employees_count && businessData.employees_count > 10) {
      points.push('Experienced professional team');
    }

    return points;
  }

  // Enhanced BamaBot knowledge base queries
  queryKnowledgeBase(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    // Business ecosystem queries
    if (lowerQuery.includes('sector') || lowerQuery.includes('industry')) {
      return this.generateSectorResponse(lowerQuery);
    }
    
    // Location-based queries
    if (lowerQuery.includes('huntsville') || lowerQuery.includes('birmingham') || lowerQuery.includes('mobile')) {
      return this.generateLocationResponse(lowerQuery);
    }
    
    // AI trends queries
    if (lowerQuery.includes('trend') || lowerQuery.includes('future') || lowerQuery.includes('ai')) {
      return this.generateTrendResponse(lowerQuery);
    }
    
    // Investment and funding queries
    if (lowerQuery.includes('funding') || lowerQuery.includes('investment') || lowerQuery.includes('capital')) {
      return this.generateFundingResponse();
    }

    return this.generateGeneralResponse();
  }

  private generateSectorResponse(query: string): string {
    const sectors = this.knowledgeBase.get('alabama_sectors');
    
    if (query.includes('tech')) {
      const tech = sectors.technology;
      return `Alabama's technology sector is ${tech.strength} and rapidly expanding! Key locations include ${tech.locations.join(', ')}. Major opportunities exist in ${tech.opportunities.join(', ')}. The state is seeing increased investment in fintech, AI/ML, and cybersecurity sectors.`;
    }
    
    if (query.includes('aerospace')) {
      const aero = sectors.aerospace;
      return `Alabama has a ${aero.strength} aerospace presence, especially in ${aero.locations.join(' and ')}. With companies like ${aero.companies.join(', ')}, the state is a leader in ${aero.opportunities.join(', ')}.`;
    }
    
    return `Alabama's key business sectors include aerospace (Huntsville), automotive (Montgomery/Birmingham), technology (growing), and healthcare. Each sector offers unique opportunities for AI integration and innovation.`;
  }

  private generateLocationResponse(query: string): string {
    if (query.includes('huntsville')) {
      return `Huntsville is Alabama's tech and aerospace hub! Known as "Rocket City," it's home to NASA Marshall Space Flight Center, major defense contractors, and a growing AI/tech startup scene. The city offers excellent opportunities for aerospace, defense technology, and emerging AI applications.`;
    }
    
    if (query.includes('birmingham')) {
      return `Birmingham is Alabama's largest city and business center, with strong healthcare, financial services, and emerging tech sectors. The city has a growing startup ecosystem, major medical institutions like UAB, and increasing investment in AI and fintech companies.`;
    }
    
    if (query.includes('mobile')) {
      return `Mobile is Alabama's port city and manufacturing center, with strong aerospace (Airbus), automotive, and logistics sectors. The city offers opportunities in manufacturing automation, supply chain optimization, and maritime technology.`;
    }
    
    return `Alabama's major business centers each offer unique opportunities: Huntsville (aerospace/tech), Birmingham (healthcare/finance), Mobile (manufacturing/logistics), Montgomery (government/automotive), and Tuscaloosa (research/manufacturing).`;
  }

  private generateTrendResponse(query: string): string {
    const trends = this.knowledgeBase.get('ai_trends');
    
    return `Current AI trends in Alabama show high demand for data analytics and machine learning solutions. Key growth areas include:\n\n• Manufacturing automation and quality control\n• Healthcare analytics and telemedicine\n• Financial services and fraud detection\n• Supply chain optimization\n• Aerospace simulation and testing\n\nThe state is investing heavily in AI education and workforce development through its universities.`;
  }

  private generateFundingResponse(): string {
    return `Alabama's AI ecosystem has attracted over $45M in funding recently! Key funding sources include:\n\n• Alabama Innovation Fund\n• EDPA venture programs\n• University research grants\n• Federal SBIR/STTR programs\n• Private angel networks in Birmingham/Huntsville\n\nThe state offers various tax incentives for tech companies and R&D activities.`;
  }

  private generateGeneralResponse(): string {
    return `I'm here to help you navigate Alabama's AI ecosystem! I can provide insights on local companies, industry trends, funding opportunities, and business connections. What specific aspect of Alabama's AI landscape interests you most?`;
  }

  // Utility methods for alignment calculations
  private getIndustryAlignment(userIndustry: string, businessCategory: string): number {
    const alignmentMap = new Map([
      ['technology-software', 0.9],
      ['technology-consulting', 0.8],
      ['healthcare-medical', 0.9],
      ['aerospace-defense', 0.9],
      ['automotive-manufacturing', 0.8]
    ]);

    const key = `${userIndustry.toLowerCase()}-${businessCategory.toLowerCase()}`;
    return alignmentMap.get(key) || 0.3;
  }

  private getLocationAlignment(userLocation: string, businessLocation: string): number {
    if (userLocation.toLowerCase() === businessLocation.toLowerCase()) return 1.0;
    
    // Same state bonus
    if (userLocation.includes('Alabama') || businessLocation.includes('Alabama')) return 0.8;
    
    // Regional proximity
    const userCity = userLocation.split(',')[0].toLowerCase();
    const businessCity = businessLocation.split(',')[0].toLowerCase();
    
    if (userCity === businessCity) return 1.0;
    
    return 0.4;
  }

  private getSizeAlignment(preferredSize: string, actualSize: number): number {
    const sizeRanges = {
      'startup': [1, 10],
      'small': [11, 50],
      'medium': [51, 200],
      'large': [201, 1000]
    };

    const range = sizeRanges[preferredSize.toLowerCase()];
    if (!range) return 0.5;

    if (actualSize >= range[0] && actualSize <= range[1]) return 1.0;
    if (actualSize < range[0] && actualSize >= range[0] - 10) return 0.7;
    if (actualSize > range[1] && actualSize <= range[1] + 20) return 0.7;
    
    return 0.3;
  }

  private getTechnologyAlignment(userTech: string[], businessTags: string[]): number {
    if (!userTech || !businessTags) return 0.3;
    
    const matches = userTech.filter(tech => 
      businessTags.some(tag => 
        tag.toLowerCase().includes(tech.toLowerCase()) ||
        tech.toLowerCase().includes(tag.toLowerCase())
      )
    );
    
    return matches.length / Math.max(userTech.length, 1);
  }
}

export const aiService = new AIService();
