
import { MCPContext } from '../MCPContextManager';
import type { EnrichedBusinessData, BusinessSocialMediaLinks } from './types'; // Import BusinessSocialMediaLinks
import { ClearbitCompanyData } from '../../external/marketDataAPI'; // For type hint
import { isValidURL } from '../../utils/validationUtils'; // Import the real isValidURL
import {
  generateFacebookURL,
  generateTwitterURL,
  generateLinkedInCompanyURL,
  generateInstagramURL,
  generateYouTubeURL,
} from '../../utils/socialMediaUtils';

export class BusinessEnricher {
  async enrichSingleBusiness(business: any, context: MCPContext): Promise<EnrichedBusinessData> {
    // Assume business object might have a 'clearbit_data' field from marketDataAPI.enrichBusinessProfile
    const clearbitData = business.clearbit_data as ClearbitCompanyData | undefined;

    const enrichedTags = await this.generateEnrichedTags(business, context);
    const industryInsights = this.generateIndustryInsights(business, context);
    const compatibilityScore = this.calculateCompatibilityScore(business, context);
    const dataQuality = this.assessDataQuality(business);
    const socialMediaUrls = this.generateSocialMediaLinks(business, clearbitData);


    return {
      business,
      enrichedTags,
      industryInsights,
      compatibilityScore,
      dataQuality,
      socialMediaUrls, // Added social media URLs
      lastEnriched: new Date()
    };
  }

  private generateSocialMediaLinks(business: any, clearbitData?: ClearbitCompanyData): BusinessSocialMediaLinks {
    const links: BusinessSocialMediaLinks = {};

    // Handles could be directly on the business object or from Clearbit data
    const fbHandle = clearbitData?.socialMedia?.facebookHandle || business.facebook_handle;
    const twHandle = clearbitData?.socialMedia?.twitterHandle || business.twitter_handle;
    // LinkedIn from Clearbit is often just the domain or a path, best to use the company specific one if available
    const liHandle = clearbitData?.socialMedia?.linkedinHandle || business.linkedin_handle || business.linkedin_vanity_name;
    // Note: Instagram and YouTube handles are not available in ClearbitCompanySocialMedia interface
    const igHandle = business.instagram_handle;
    const ytHandle = business.youtube_handle;

    if (fbHandle) links.facebookUrl = generateFacebookURL(fbHandle);
    if (twHandle) links.twitterUrl = generateTwitterURL(twHandle);
    if (liHandle) links.linkedinCompanyUrl = generateLinkedInCompanyURL(liHandle);
    if (igHandle) links.instagramUrl = generateInstagramURL(igHandle);
    if (ytHandle) links.youtubeUrl = generateYouTubeURL(ytHandle);

    // Fallback: if business object has full URLs already, use them (prefer generated ones if handles exist)
    if (!links.facebookUrl && isValidURL(business.facebook_url)) links.facebookUrl = business.facebook_url;
    if (!links.twitterUrl && isValidURL(business.twitter_url)) links.twitterUrl = business.twitter_url;
    if (!links.linkedinCompanyUrl && isValidURL(business.linkedin_url)) links.linkedinCompanyUrl = business.linkedin_url;
    if (!links.instagramUrl && isValidURL(business.instagram_url)) links.instagramUrl = business.instagram_url;
    if (!links.youtubeUrl && isValidURL(business.youtube_url)) links.youtubeUrl = business.youtube_url;

    return links;
  }

  // Temporary isValidURL removed, will use imported version.

  private async generateEnrichedTags(business: any, context: MCPContext): Promise<string[]> {
    const existingTags = business.tags || [];
    const enrichedTags = [...existingTags];

    // Add context-based tags
    if (context.industry && business.category?.toLowerCase().includes(context.industry.toLowerCase())) {
      enrichedTags.push(`${context.industry} Specialist`);
    }

    // Add service-based tags
    const services = context.entities.services || [];
    services.forEach(service => {
      if (business.description?.toLowerCase().includes(service.toLowerCase())) {
        enrichedTags.push(`${service} Provider`);
      }
    });

    // Add location-based tags
    if (context.location && business.location?.includes(context.location)) {
      enrichedTags.push('Local Provider');
    }

    // Add capability tags based on business description
    if (business.description) {
      const description = business.description.toLowerCase();
      
      if (description.includes('ai') || description.includes('artificial intelligence')) {
        enrichedTags.push('AI Capable');
      }
      if (description.includes('cloud')) {
        enrichedTags.push('Cloud Services');
      }
      if (description.includes('consulting')) {
        enrichedTags.push('Consulting Services');
      }
      if (description.includes('enterprise')) {
        enrichedTags.push('Enterprise Ready');
      }
    }

    // Remove duplicates and return
    return [...new Set(enrichedTags)];
  }

  private generateIndustryInsights(business: any, context: MCPContext): string[] {
    const insights: string[] = [];

    // Industry-specific insights
    if (context.industry) {
      const industry = context.industry.toLowerCase();
      
      if (industry.includes('legal') && business.category?.toLowerCase().includes('legal')) {
        insights.push('Specializes in legal technology solutions');
        insights.push('Understands compliance and regulatory requirements');
      } else if (industry.includes('healthcare') && business.category?.toLowerCase().includes('health')) {
        insights.push('HIPAA compliance experience likely');
        insights.push('Healthcare data security expertise');
      } else if (industry.includes('finance') && business.category?.toLowerCase().includes('financ')) {
        insights.push('Financial services regulations knowledge');
        insights.push('Security and compliance focus');
      }
    }

    // Size-based insights
    if (business.employees_count) {
      if (business.employees_count < 50) {
        insights.push('Agile and responsive service delivery');
        insights.push('Direct access to senior expertise');
      } else if (business.employees_count > 200) {
        insights.push('Enterprise-scale project capability');
        insights.push('Comprehensive service offerings');
      }
    }

    // Location-based insights
    if (business.location) {
      if (business.location.includes('Huntsville')) {
        insights.push('Access to aerospace and defense expertise');
      } else if (business.location.includes('Birmingham')) {
        insights.push('Financial and healthcare sector experience');
      }
    }

    return insights;
  }

  private calculateCompatibilityScore(business: any, context: MCPContext): number {
    let score = 50; // Base score

    // Industry match
    if (context.industry && business.category?.toLowerCase().includes(context.industry.toLowerCase())) {
      score += 25;
    }

    // Service match
    const services = context.entities.services || [];
    const businessDesc = business.description?.toLowerCase() || '';
    const serviceMatches = services.filter(service => 
      businessDesc.includes(service.toLowerCase())
    ).length;
    score += serviceMatches * 10;

    // Location match
    if (context.location && business.location?.includes(context.location)) {
      score += 15;
    }

    // Verification bonus
    if (business.verified) {
      score += 10;
    }

    // Rating bonus
    if (business.rating > 4.0) {
      score += 5;
    }

    // Size compatibility
    if (context.entities.companySize) {
      const sizeMatch = this.checkSizeCompatibility(context.entities.companySize, business.employees_count);
      if (sizeMatch) score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  private checkSizeCompatibility(preferredSize: string, employeeCount: number): boolean {
    if (!employeeCount) return true;

    switch (preferredSize.toLowerCase()) {
      case 'startup':
      case 'small':
        return employeeCount <= 50;
      case 'medium':
        return employeeCount > 50 && employeeCount <= 500;
      case 'large':
      case 'enterprise':
        return employeeCount > 500;
      default:
        return true;
    }
  }

  private assessDataQuality(business: any): 'high' | 'medium' | 'low' {
    let qualityScore = 0;

    if (business.businessname) qualityScore += 1;
    if (business.description && business.description.length > 50) qualityScore += 2;
    if (business.website) qualityScore += 1;
    if (business.contactemail) qualityScore += 1;
    if (business.location) qualityScore += 1;
    if (business.category) qualityScore += 1;
    if (business.tags && business.tags.length > 0) qualityScore += 1;
    if (business.verified) qualityScore += 2;

    if (qualityScore >= 8) return 'high';
    if (qualityScore >= 5) return 'medium';
    return 'low';
  }
}
