import axios from 'axios';

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

interface MarketDataCache {
  data: any;
  timestamp: number;
}

const marketDataCache: Record<string, MarketDataCache> = {};

export class MarketDataAPI {
  private static instance: MarketDataAPI;
  private readonly BLS_API_KEY = import.meta.env.VITE_BLS_API_KEY;
  private readonly CENSUS_API_KEY = import.meta.env.VITE_CENSUS_API_KEY;

  private constructor() {}

  static getInstance(): MarketDataAPI {
    if (!MarketDataAPI.instance) {
      MarketDataAPI.instance = new MarketDataAPI();
    }
    return MarketDataAPI.instance;
  }

  private async fetchWithCache<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const now = Date.now();
    const cached = marketDataCache[key];

    if (cached && now - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }

    try {
      const data = await fetchFn();
      marketDataCache[key] = {
        data,
        timestamp: now
      };
      return data;
    } catch (error) {
      console.error(`Error fetching market data for key ${key}:`, error);
      throw error;
    }
  }

  async getLaborStatistics(seriesId: string, startYear: string, endYear: string) {
    const key = `bls-${seriesId}-${startYear}-${endYear}`;
    return this.fetchWithCache(key, async () => {
      const response = await axios.post(
        'https://api.bls.gov/publicAPI/v2/timeseries/data/',
        {
          seriesid: [seriesId],
          startyear: startYear,
          endyear: endYear,
          registrationkey: this.BLS_API_KEY
        }
      );
      return response.data.Results.series[0].data;
    });
  }

  async getCensusData(dataset: string, params: Record<string, string>) {
    const key = `census-${dataset}-${JSON.stringify(params)}`;
    return this.fetchWithCache(key, async () => {
      const url = new URL(`https://api.census.gov/data/${dataset}`);
      url.search = new URLSearchParams({
        ...params,
        key: this.CENSUS_API_KEY
      }).toString();
      
      const response = await axios.get(url.toString());
      return response.data;
    });
  }

  async getIndustryGrowth(naicsCode: string, location: string) {
    // Combine BLS and Census data for comprehensive industry analysis
    const [employmentData, businessData] = await Promise.all([
      this.getLaborStatistics(`ENU${location}${naicsCode}01`, '2019', '2023'),
      this.getCensusData('2019/cbp', {
        get: 'ESTAB,EMP,PAYANN',
        for: `state:${location}`,
        NAICS: naicsCode
      })
    ]);

    return {
      employmentTrend: employmentData,
      businessData
    };
  }

  // Add more market data retrieval methods as needed
}

export const marketDataAPI = MarketDataAPI.getInstance();
