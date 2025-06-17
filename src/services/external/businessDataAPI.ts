import axios from 'axios';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';

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
  private businessUpdateChannel: RealtimeChannel | null = null;

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
