import axios from 'axios';
// Use createClient from supabase-js directly if this service manages its own client,
// or import the shared client if available (e.g. from '@/integrations/supabase/client')
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  generateFacebookURL,
  generateTwitterURL,
  generateLinkedInCompanyURL,
  // generateInstagramURL, // Not used yet by Clearbit data structure
  // generateYouTubeURL,  // Not used yet by Clearbit data structure
} from '../utils/socialMediaUtils';
import type { BusinessSocialMediaLinks } from '../mcp/curator/types';


// --- NewsArticle Interface ---
export interface NewsArticle {
  title: string;
  sourceName: string;
  url: string;
  publishedAt: string;
  description?: string;
  imageUrl?: string;
  content?: string;
}
// --- End NewsArticle Interface ---

// --- ClearbitCompanyData Interface ---
interface ClearbitCompanyGeo {
  streetNumber?: string;
  streetName?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

interface ClearbitCompanyCategory {
  industry?: string;
  sector?: string;
  subIndustry?: string;
}

interface ClearbitCompanySocialMedia {
  facebookHandle?: string;
  linkedinHandle?: string;
  twitterHandle?: string;
}

export interface ClearbitCompanyData {
  name?: string;
  legalName?: string;
  domain?: string;
  description?: string;
  foundedYear?: number;
  url?: string;
  geo?: ClearbitCompanyGeo;
  category?: ClearbitCompanyCategory;
  socialMedia?: ClearbitCompanySocialMedia;
  logoUrl?: string;
  phone?: string;
  employeeCount?: number;
  rawClearbitData?: any;
}
// --- End ClearbitCompanyData Interface ---


interface BusinessDataCacheItem<T> { // Renamed to avoid conflict if interfaces are merged later
  data: T;
  timestamp: number;
}

const BUSINESS_DATA_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours default
const businessDataCache: Record<string, BusinessDataCacheItem<any>> = {}; // Use renamed interface

export class BusinessDataAPI {
  private static instance: BusinessDataAPI;
  private readonly CLEARBIT_API_KEY = import.meta.env.VITE_CLEARBIT_API_KEY;
  private readonly ZOOMINFO_API_KEY = import.meta.env.VITE_ZOOMINFO_API_KEY; // Existing
  private readonly NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY; // Added

  private supabase = createClient( // Existing Supabase client initialization
    import.meta.env.VITE_SUPABASE_URL!, // Added non-null assertion
    import.meta.env.VITE_SUPABASE_ANON_KEY! // Added non-null assertion
  );
  private businessUpdateChannel: RealtimeChannel | null = null;

  private MOCK_CLEARBIT_COMPANY_DATA: ClearbitCompanyData = {
    name: "Mock Company LLC",
    legalName: "Mock Company LLC",
    domain: "mockcompany.com",
    description: "This is a mock company description for development purposes.",
    foundedYear: 2024,
    url: "https://mockcompany.com",
    geo: { city: "Mockville", state: "MS" },
    category: { industry: "Mock Industry" },
    socialMedia: { facebookHandle: "mockcompanyfb", linkedinHandle: "mockcompanyli", twitterHandle: "mockcompanytw" },
    logoUrl: "https://logo.clearbit.com/mockcompany.com",
    phone: "1-800-MOCKDATA",
    employeeCount: 50,
    rawClearbitData: { note: "This is mock data" }
  };

  private constructor() {}

  static getInstance(): BusinessDataAPI {
    if (!BusinessDataAPI.instance) {
      BusinessDataAPI.instance = new BusinessDataAPI();
    }
    return BusinessDataAPI.instance;
  }

  private getCacheKey(identifier: string, endpoint: string): string { // identifier can be domain or companyName
    return `${endpoint}:${identifier}`.toLowerCase();
  }

  // Updated fetchWithCache to accept custom TTL
  private async fetchWithCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = BUSINESS_DATA_CACHE_TTL // Default TTL from the class
  ): Promise<T> {
    const now = Date.now();
    const cached = businessDataCache[key];

    if (cached && now - cached.timestamp < ttl) {
      return cached.data as T;
    }

    try {
      const data = await fetchFn();
      businessDataCache[key] = {
        data,
        timestamp: now
      };
      return data;
    } catch (error) {
      console.error(`Error fetching business data for key ${key}:`, error);
      throw error; // Re-throw to be handled by caller
    }
  }

  /**
   * Fetches enriched company data from Clearbit based on a domain name.
   * (Copied and adapted from marketDataAPI.ts)
   */
  async getCompanyInfo(domain: string): Promise<ClearbitCompanyData | null> {
    const cacheKey = this.getCacheKey(domain, 'clearbit_company_info');

    if (!this.CLEARBIT_API_KEY) {
      console.warn(`CLEARBIT_API_KEY is missing. Returning mock data for Clearbit getCompanyInfo(${domain}).`);
      return { ...this.MOCK_CLEARBIT_COMPANY_DATA, domain: domain, name: `Mock for ${domain.split('.')[0]}`, logoUrl: `https://logo.clearbit.com/${domain}` };
    }

    return this.fetchWithCache(cacheKey, async () => {
      try {
        const response = await axios.get(`https://company.clearbit.com/v2/companies/find`, {
          params: { domain },
          headers: { 'Authorization': `Bearer ${this.CLEARBIT_API_KEY}`, 'Accept': 'application/json' },
          timeout: 10000
        });
        if (response.status === 200 && response.data && response.data.domain) {
          const cbData = response.data;
          return { // Mapped data
            name: cbData.name, legalName: cbData.legalName, domain: cbData.domain, description: cbData.description,
            foundedYear: cbData.foundedYear, url: cbData.site?.url || cbData.url,
            geo: cbData.geo, category: cbData.category, socialMedia: cbData.socialMedia,
            logoUrl: cbData.logo, phone: cbData.phone || cbData.site?.phoneNumbers?.[0],
            employeeCount: cbData.metrics?.employees, rawClearbitData: cbData
          };
        } else if (response.status === 404) {
          console.log(`Clearbit: Company not found for domain ${domain} (404).`);
          return null;
        } else if (response.status === 200 && (!response.data || !response.data.domain)) {
           console.log(`Clearbit: Company data incomplete or pending for domain ${domain}.`);
           return null;
        } else {
          throw new Error(`Clearbit API error: Status ${response.status}`);
        }
      } catch (error: any) {
        // Error logging similar to marketDataAPI version
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 401) console.error("Clearbit API Key is invalid or unauthorized.");
            else if (error.response.status === 402) console.error("Clearbit API call failed: Payment Required.");
            else if (error.response.status === 404) { console.log(`Clearbit: Company not found for domain ${domain} (error path).`); return null; }
            else if (error.response.status === 429) console.warn("Clearbit API rate limit likely exceeded.");
            else console.error(`Clearbit API error for domain ${domain}: Status ${error.response.status}`);
        } else {
            console.error(`Network or other error fetching Clearbit data for ${domain}: ${error.message}`);
        }
        console.warn(`Returning mock data for Clearbit getCompanyInfo(${domain}) due to fetch error.`);
        return { ...this.MOCK_CLEARBIT_COMPANY_DATA, domain: domain, name: `Mock for ${domain.split('.')[0]} (Error)`, logoUrl: `https://logo.clearbit.com/${domain}` };
      }
    });
  }

  // Existing getEnrichedCompanyData (ZoomInfo) - kept as is
  async getEnrichedCompanyData(domain: string) {
    const key = this.getCacheKey(domain, 'zoominfo_enriched'); // Changed key prefix
    return this.fetchWithCache(key, async () => {
      if (!this.ZOOMINFO_API_KEY) {
        console.warn(`ZOOMINFO_API_KEY is missing. Cannot fetch data for domain ${domain}.`);
        return { note: "ZoomInfo API key missing. This is mock data.", domain }; // Return mock/indicator
      }
      const response = await axios.get(`https://api.zoominfo.com/enrich/company`, {
        params: { domain },
        headers: { 'Authorization': `Bearer ${this.ZOOMINFO_API_KEY}`, 'Accept': 'application/json' },
        timeout: 10000
      });
      return response.data; // Assuming direct return is fine, or map to a structure
    });
  }

  // Removed getSocialMediaPresence as its functionality is covered by getCompanyInfo's socialMedia handles

  /**
   * Fetches recent news articles related to a company.
   * (Copied and adapted from marketDataAPI.ts)
   */
  async fetchCompanyNews( companyName: string, domain?: string, language: string = 'en', pageSize: number = 5 ): Promise<NewsArticle[] | null> {
    const cacheKey = this.getCacheKey(domain || companyName, `newsapi_company_news:${language}:${pageSize}`);
    const NEWS_CACHE_TTL = 1 * 60 * 60 * 1000; // 1 hour for news

    if (!this.NEWS_API_KEY) {
      console.warn(`NEWS_API_KEY is missing. Returning mock news for ${companyName}.`);
      return this.getMockNewsArticles(companyName);
    }
    if (!companyName && !domain) {
        console.warn("Cannot fetch news without a company name or domain.");
        return null;
    }

    return this.fetchWithCache(cacheKey, async () => {
      try {
        let searchQuery = `"${companyName}"`;
        if (domain) {
          const coreDomain = domain.replace(/^www\./, '').split('.')[0];
          searchQuery = `("${companyName}") OR ("${companyName}" AND "${coreDomain}")`;
        }
        const response = await axios.get('https://newsapi.org/v2/everything', {
          params: { q: searchQuery, language, pageSize, sortBy: 'relevancy' },
          headers: { 'X-Api-Key': this.NEWS_API_KEY, 'Accept': 'application/json' },
          timeout: 10000
        });
        if (response.status === 200 && response.data?.articles) {
          return response.data.articles.map((article: any): NewsArticle => ({
            title: article.title, sourceName: article.source?.name, url: article.url,
            publishedAt: article.publishedAt, description: article.description,
            imageUrl: article.urlToImage, content: article.content,
          }));
        } else {
          console.warn(`NewsAPI returned status ${response.status} or no articles for ${companyName}.`);
          return this.getMockNewsArticles(companyName, `API status ${response.status}`);
        }
      } catch (error: any) {
        // Error logging similar to marketDataAPI version
         if (axios.isAxiosError(error) && error.response) {
            const apiError = error.response.data?.message || error.message;
            console.error(`NewsAPI error for ${companyName}: Status ${error.response.status} - ${apiError}`);
            if (error.response.status === 401) console.error("NewsAPI Key is invalid or unauthorized.");
            if (error.response.status === 429) console.warn("NewsAPI rate limit likely exceeded.");
        } else {
            console.error(`Network or other error fetching NewsAPI data for ${companyName}: ${error.message}`);
        }
        console.warn(`Returning mock news for ${companyName} due to fetch error.`);
        return this.getMockNewsArticles(companyName, error.message);
      }
    }, NEWS_CACHE_TTL);
  }

  private getMockNewsArticles(companyName: string, note?: string): NewsArticle[] {
    return [
      { title: `Developments at ${companyName}`, sourceName: "Mock News", url: `https://example.com/news/${companyName.toLowerCase().replace(/\s+/g, '-')}-1`, publishedAt: new Date().toISOString(), description: `Mock article. ${note || ''}` },
      { title: `${companyName} Strategy Update`, sourceName: "Fictional Times", url: `https://example.com/news/${companyName.toLowerCase().replace(/\s+/g, '-')}-2`, publishedAt: new Date(Date.now() - 86400000).toISOString(), description: `Mock strategy report. ${note || ''}` }
    ];
  }

  /**
   * Enriches a business profile in the database with data from Clearbit and NewsAPI.
   * (Copied and adapted from marketDataAPI.ts, uses this.supabase)
   */
  async enrichBusinessProfile(businessId: string | number): Promise<any | null> {
    try {
      const { data: business, error: fetchError } = await this.supabase
        .from('businesses')
        .select('id, name, website, clearbit_data, social_profile_urls, recent_news') // Added more fields to select
        .eq('id', businessId)
        .single();

      if (fetchError) { console.error(`Error fetching business ${businessId}:`, fetchError.message); throw fetchError; }
      if (!business) { console.warn(`Business ${businessId} not found.`); return null; }
      if (!business.website) { console.log(`Business ${businessId} has no website for enrichment.`); return business; }

      let domain = '';
      try { domain = new URL(business.website).hostname.replace(/^www\./, ''); }
      catch (e) { console.warn(`Invalid website URL for business ${businessId}: ${business.website}`); return business; }
      if (!domain) { console.log(`Could not extract domain for business ${businessId}.`); return business; }

      const clearbitData = await this.getCompanyInfo(domain);
      const recentNews = await this.fetchCompanyNews(business.name, domain);

      const socialMediaLinks: BusinessSocialMediaLinks = {};
      if (clearbitData?.socialMedia) {
        if (clearbitData.socialMedia.facebookHandle) socialMediaLinks.facebookUrl = generateFacebookURL(clearbitData.socialMedia.facebookHandle);
        if (clearbitData.socialMedia.twitterHandle) socialMediaLinks.twitterUrl = generateTwitterURL(clearbitData.socialMedia.twitterHandle);
        if (clearbitData.socialMedia.linkedinHandle) socialMediaLinks.linkedinCompanyUrl = generateLinkedInCompanyURL(clearbitData.socialMedia.linkedinHandle);
      }

      const updatePayload: { [key: string]: any } = { last_enriched_at: new Date().toISOString() };
      if (clearbitData) {
        updatePayload.clearbit_data = business.clearbit_data ? { ...business.clearbit_data, ...clearbitData.rawClearbitData } : clearbitData.rawClearbitData;
      }
      if (Object.keys(socialMediaLinks).length > 0) {
        updatePayload.social_profile_urls = business.social_profile_urls ? { ...business.social_profile_urls, ...socialMediaLinks } : socialMediaLinks;
      }
      if (recentNews && recentNews.length > 0) {
        updatePayload.recent_news = recentNews; // Overwrites previous news for simplicity
      }

      const { data: updatedBusiness, error: updateError } = await this.supabase
        .from('businesses')
        .update(updatePayload)
        .eq('id', businessId)
        .select() // Select all to get the updated record
        .single();

      if (updateError) { console.error(`Error updating business ${businessId}:`, updateError.message); throw updateError; }
      console.log(`Business ${businessId} successfully enriched.`);
      return updatedBusiness;

    } catch (error) {
      console.error(`Failed to enrich business profile for ID ${businessId}:`, error);
      return null;
    }
  }

  /**
   * Subscribes to real-time updates (inserts, updates, deletes) from the 'businesses' table.
   * @param callback A function to be called with the payload of any change.
   * @returns A function to unsubscribe from the channel.
   */
  onBusinessUpdated(callback: (payload: any) => void): () => void {
    if (this.businessUpdateChannel) {
      console.warn('Already subscribed to business updates. Unsubscribing existing channel before creating a new one.');
      this.businessUpdateChannel.unsubscribe();
      this.businessUpdateChannel = null; // Reset after unsubscribing
    }

    this.businessUpdateChannel = this.supabase
      .channel('public:businesses') // Channel name can be any string, but good to namespace
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'businesses' },
        (payload) => {
          // console.log('Change received!', payload); // For debugging
          callback(payload);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time business updates.');
        } else if (status === 'TIMED_OUT') {
          console.warn('Real-time business updates subscription timed out.');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Real-time business updates subscription error:', err);
        } else if (status === 'CLOSED') {
          console.log('Real-time business updates subscription closed.');
        }
      });

    // Return an unsubscribe function
    const unsubscribe = () => {
      if (this.businessUpdateChannel) {
        this.businessUpdateChannel.unsubscribe()
          .then(status => console.log('Unsubscribe status:', status))
          .catch(error => console.error('Error unsubscribing:', error))
          .finally(() => {
            this.businessUpdateChannel = null;
            console.log('Unsubscribed from real-time business updates.');
          });
      }
    };

    return unsubscribe;
  }

  /**
   * Cleans up any active subscriptions.
   * Should be called when the service instance is no longer needed.
   */
  cleanup() {
    if (this.businessUpdateChannel) {
      this.businessUpdateChannel.unsubscribe()
        .then(status => console.log('Cleanup unsubscribe status:', status))
        .catch(error => console.error('Error unsubscribing during cleanup:', error))
        .finally(() => {
            this.businessUpdateChannel = null;
            console.log('Cleaned up business updates channel.');
        });
    }
  }
}

export const businessDataAPI = BusinessDataAPI.getInstance();
