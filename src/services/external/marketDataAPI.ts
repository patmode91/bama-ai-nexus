import axios from 'axios';
// Supabase client might still be needed if getIndustryGrowth or other methods use it directly
// For now, assuming it's not needed if BLS/Census calls are direct http.
// If getIndustryGrowth (which calls BLS/Census methods in this class) needs a supabase client
// for some reason (e.g. storing results, or if those methods were refactored to use it),
// then this import should remain. Based on current implementation of BLS/Census methods,
// they use axios directly.
// import { supabase } from '@/integrations/supabase/client'; // Removed as it's not used by remaining methods.


// NewsArticle, ClearbitCompanyData, and related social media imports are removed as they are moved.

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

interface MarketDataCache { // This cache is specific to MarketDataAPI
  data: any;
  timestamp: number;
}

const marketDataCache: Record<string, MarketDataCache> = {}; // Stays for BLS/Census caching

export class MarketDataAPI {
  private static instance: MarketDataAPI;
  private readonly BLS_API_KEY = import.meta.env.VITE_BLS_API_KEY;
  private readonly CENSUS_API_KEY = import.meta.env.VITE_CENSUS_API_KEY;
  // CLEARBIT_API_KEY and NEWS_API_KEY are removed.
  // ZOOMINFO_API_KEY can be removed if not used by any remaining method.

  // MOCK_CLEARBIT_COMPANY_DATA removed.

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

  /**
   * Fetches time series data from the Bureau of Labor Statistics (BLS) API v2.
   * @param {string} seriesId - The BLS series ID (e.g., 'LNS14000000' for unemployment rate).
   * @param {string} startYear - The starting year for the data.
   * @param {string} endYear - The ending year for the data.
   * @returns {Promise<Array<Object>|null>} A promise that resolves to an array of data points or null if fetching fails.
   * Each data point typically includes year, period, periodName, value, and footnotes.
   * @see https://www.bls.gov/developers/home.htm for API documentation and to request an API key.
   * @example
   * // Fetch Civilian Unemployment Rate (Series ID: LNS14000000)
   * const unemploymentData = await marketDataAPI.getLaborStatistics('LNS14000000', '2020', '2023');
   */
  async getLaborStatistics(seriesId: string, startYear: string, endYear: string): Promise<any[] | null> {
    const key = `bls-${seriesId}-${startYear}-${endYear}`;

    if (!this.BLS_API_KEY) {
      console.warn(
        `BLS_API_KEY is missing. Returning mock data for getLaborStatistics(${seriesId}). ` +
        `Please obtain a key from https://data.bls.gov/registrationEngine/`
      );
      return this.getMockBLSData(seriesId, startYear, endYear);
    }

    return this.fetchWithCache(key, async () => {
      try {
        const response = await axios.post(
          'https://api.bls.gov/publicAPI/v2/timeseries/data/',
          {
            seriesid: [seriesId],
            startyear: startYear,
            endyear: endYear,
            registrationkey: this.BLS_API_KEY,
            catalog: false, // Optional: Set to true to get series PctChange/NetChange calculations
            calculations: false, // Optional: Set to true to get series PctChange/NetChange calculations
            annualaverage: false // Optional: Set to true to get series annual average calculations
          },
          { timeout: 10000 } // 10 second timeout
        );

        if (response.data.status === 'REQUEST_NOT_PROCESSED' || response.data.Results?.series?.length === 0) {
          console.warn(
            `BLS API request not processed for series ${seriesId}. Message: ${response.data.message?.join(', ')}. ` +
            `This might be due to an invalid API key or series ID. Returning mock data.`
          );
          return this.getMockBLSData(seriesId, startYear, endYear);
        }

        // Safely access data
        const seriesData = response.data.Results?.series?.[0]?.data;
        if (!seriesData || seriesData.length === 0) {
            console.warn(`No data returned from BLS for series ${seriesId}. Returning mock data.`);
            return this.getMockBLSData(seriesId, startYear, endYear);
        }
        return seriesData;

      } catch (error: any) {
        console.error(`Error fetching BLS data for series ${seriesId}:`, error.message);
        if (axios.isAxiosError(error) && error.response) {
          console.error('BLS API Error Response:', error.response.data);
        }
        console.warn(`Returning mock data for BLS series ${seriesId} due to fetch error.`);
        return this.getMockBLSData(seriesId, startYear, endYear);
      }
    });
  }

  private getMockBLSData(seriesId: string, startYear: string, endYear: string): any[] {
    const mockData: any[] = [];
    let currentYear = parseInt(startYear);
    const finalYear = parseInt(endYear);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    while(currentYear <= finalYear) {
      for(let i=0; i<12; i++) {
        mockData.push({
          year: currentYear.toString(),
          period: `M${(i+1).toString().padStart(2,'0')}`,
          periodName: months[i],
          value: (Math.random() * 10 + 5).toFixed(1), // Random value between 5.0 and 15.0
          footnotes: [{text: "Mock data"}]
        });
      }
      currentYear++;
    }
    // Return data for the most recent period for simplicity in some mock scenarios
    return mockData.slice(-12); // Return last 12 months as an example
  }

  /**
   * Fetches data from the U.S. Census Bureau API.
   * @param {string} dataset - The Census dataset path (e.g., '2020/dec/dhc' for 2020 Decennial Census, 'timeseries/poverty/saipe' for SAIPE).
   * @param {Record<string, string>} params - Parameters for the API query, typically including 'get' (variables) and 'for' (geography).
   * @returns {Promise<Array<Object>|null>} A promise that resolves to an array of data objects or null if fetching fails.
   * The structure of objects depends on the 'get' parameter and the dataset.
   * @see https://www.census.gov/data/developers/data-sets.html for dataset information and API details.
   * @example
   * // Fetch population (P1_001N) and median age (P4_001N) for all counties in Alabama (state:01) from 2020 Decennial Census
   * const alabamaCountyData = await marketDataAPI.getCensusData('2020/dec/pl', {
   *   get: 'NAME,P1_001N,P4_001N',
   *   for: 'county:*',
   *   in: 'state:01'
   * });
   */
  async getCensusData(dataset: string, params: Record<string, string>): Promise<any[] | null> {
    const key = `census-${dataset}-${JSON.stringify(params)}`;

    if (!this.CENSUS_API_KEY) {
      console.warn(
        `CENSUS_API_KEY is missing. Returning mock data for getCensusData(${dataset}). ` +
        `A key can be requested from https://api.census.gov/data/key_signup.html`
      );
      return this.getMockCensusData(dataset, params);
    }

    return this.fetchWithCache(key, async () => {
      try {
        const url = new URL(`https://api.census.gov/data/${dataset}`);
        url.search = new URLSearchParams({
          ...params,
          key: this.CENSUS_API_KEY
        }).toString();

        const response = await axios.get(url.toString(), { timeout: 10000 });

        if (!response.data || response.data.length < 2) { // Census data includes a header row
          console.warn(`No data or invalid data returned from Census API for dataset ${dataset} with params ${JSON.stringify(params)}. Returning mock data.`);
          return this.getMockCensusData(dataset, params);
        }

        // Transform array of arrays into array of objects
        const header = response.data[0];
        const dataRows = response.data.slice(1);
        const formattedData = dataRows.map((row: any[]) => {
          const obj: Record<string, any> = {};
          header.forEach((colName: string, index: number) => {
            obj[colName] = row[index];
          });
          return obj;
        });

        return formattedData;

      } catch (error: any) {
        console.error(`Error fetching Census data for dataset ${dataset}:`, error.message);
        if (axios.isAxiosError(error) && error.response) {
          console.error('Census API Error Response Status:', error.response.status);
          console.error('Census API Error Response Data:', error.response.data);
        }
        console.warn(`Returning mock data for Census dataset ${dataset} due to fetch error.`);
        return this.getMockCensusData(dataset, params);
      }
    });
  }

  // All methods related to Clearbit, NewsAPI, and the `enrichBusinessProfile` that uses them
  // have been moved to businessDataAPI.ts.
  // Also removing their specific mock data and API key constants.

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
