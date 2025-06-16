import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

interface BusinessDataCache {
  data: any;
  timestamp: number;
}

const BUSINESS_DATA_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const businessDataCache: Record<string, BusinessDataCache> = {};

export class BusinessDataAPI {
  private static instance: BusinessDataAPI;
  private readonly CLEARBIT_API_KEY = import.meta.env.VITE_CLEARBIT_API_KEY;
  private readonly ZOOMINFO_API_KEY = import.meta.env.VITE_ZOOMINFO_API_KEY;
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  private constructor() {}

  static getInstance(): BusinessDataAPI {
    if (!BusinessDataAPI.instance) {
      BusinessDataAPI.instance = new BusinessDataAPI();
    }
    return BusinessDataAPI.instance;
  }

  private getCacheKey(domain: string, endpoint: string): string {
    return `${endpoint}:${domain}`.toLowerCase();
  }

  private async fetchWithCache<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const now = Date.now();
    const cached = businessDataCache[key];

    if (cached && now - cached.timestamp < BUSINESS_DATA_CACHE_TTL) {
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
      throw error;
    }
  }

  async getCompanyInfo(domain: string) {
    const key = this.getCacheKey(domain, 'company');
    return this.fetchWithCache(key, async () => {
      const response = await axios.get(`https://company.clearbit.com/v2/companies/find`, {
        params: { domain },
        headers: {
          'Authorization': `Bearer ${this.CLEARBIT_API_KEY}`
        }
      });
      return response.data;
    });
  }

  async getEnrichedCompanyData(domain: string) {
    const key = this.getCacheKey(domain, 'enriched');
    return this.fetchWithCache(key, async () => {
      const response = await axios.get(`https://api.zoominfo.com/enrich/company`, {
        params: { domain },
        headers: {
          'Authorization': `Bearer ${this.ZOOMINFO_API_KEY}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    });
  }

  async getSocialMediaPresence(domain: string) {
    const key = this.getCacheKey(domain, 'social');
    return this.fetchWithCache(key, async () => {
      const response = await axios.get(`https://company.clearbit.com/v1/domains/find`, {
        params: { name: domain },
        headers: {
          'Authorization': `Bearer ${this.CLEARBIT_API_KEY}`
        }
      });
      return response.data.social || {};
    });
  }

  async getCompanyNews(companyName: string, limit = 5) {
    const key = this.getCacheKey(companyName, 'news');
    return this.fetchWithCache(key, async () => {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: `"${companyName}"`,
          apiKey: import.meta.env.VITE_NEWS_API_KEY,
          pageSize: limit,
          sortBy: 'publishedAt',
          language: 'en'
        }
      });
      return response.data.articles || [];
    });
  }

  async enrichBusinessProfile(businessId: string) {
    try {
      // Get business data from database
      const { data: business, error } = await this.supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error || !business) {
        throw new Error('Business not found');
      }

      // Enrich with external data
      const [companyData, socialData, news] = await Promise.all([
        this.getCompanyInfo(business.website),
        this.getSocialMediaPresence(business.website),
        this.getCompanyNews(business.name, 3)
      ]);

      // Update business with enriched data
      const enrichedData = {
        ...business,
        company_data: companyData,
        social_media: socialData,
        recent_news: news,
        last_updated: new Date().toISOString()
      };

      // Save back to database
      const { error: updateError } = await this.supabase
        .from('businesses')
        .update(enrichedData)
        .eq('id', businessId);

      if (updateError) throw updateError;

      return enrichedData;
    } catch (error) {
      console.error('Error enriching business profile:', error);
      throw error;
    }
  }
}

export const businessDataAPI = BusinessDataAPI.getInstance();
