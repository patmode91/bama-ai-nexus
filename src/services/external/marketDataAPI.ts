import axios from 'axios';
import { supabase } from '@/integrations/supabase/client'; // Assuming shared Supabase client
import {
  generateFacebookURL,
  generateTwitterURL,
  generateLinkedInCompanyURL,
  generateInstagramURL,
  generateYouTubeURL,
} from '../utils/socialMediaUtils'; // Import social media URL generators
import type { BusinessSocialMediaLinks } from '../mcp/curator/types'; // For the structured URLs

// --- NewsArticle Interface ---
export interface NewsArticle {
  title: string;
  sourceName: string; // From NewsAPI: article.source.name
  url: string;
  publishedAt: string; // ISO string date
  description?: string;
  imageUrl?: string; // From NewsAPI: urlToImage
  content?: string; // From NewsAPI: content (often truncated)
}
// --- End NewsArticle Interface ---

// Interface for structured Clearbit Company data
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

export interface ClearbitCompanyData { // Made exportable for potential use elsewhere
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
  rawClearbitData?: any; // To store the original response if needed
}

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
  private readonly CLEARBIT_API_KEY = import.meta.env.VITE_CLEARBIT_API_KEY;
  private readonly NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY; // Added NewsAPI key
  // private readonly ZOOMINFO_API_KEY = import.meta.env.VITE_ZOOMINFO_API_KEY; // For future use


  private MOCK_CLEARBIT_COMPANY_DATA: ClearbitCompanyData = {
    name: "Mock Company LLC",
    legalName: "Mock Company LLC",
    domain: "mockcompany.com",
    description: "This is a mock company description for development purposes.",
    foundedYear: 2024,
    url: "https://mockcompany.com",
    geo: {
      streetNumber: "123",
      streetName: "Mock Street",
      city: "Mockville",
      state: "MS",
      postalCode: "00000",
      country: "USA",
      lat: 34.0522,
      lng: -118.2437,
    },
    category: {
      industry: "Mock Industry",
      sector: "Mock Sector",
      subIndustry: "Mock Sub-Industry",
    },
    socialMedia: {
      facebookHandle: "mockcompanyfb",
      linkedinHandle: "mockcompanyli",
      twitterHandle: "mockcompanytw",
    },
    logoUrl: "https://logo.clearbit.com/mockcompany.com",
    phone: "1-800-MOCKDATA",
    employeeCount: 50,
    rawClearbitData: { note: "This is mock data" }
  };

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

  // --- NewsAPI Company News Fetching ---
  /**
   * Fetches recent news articles related to a company name and optionally its domain.
   * Uses NewsAPI.org.
   * @param {string} companyName - The name of the company to search for.
   * @param {string} [domain] - Optional company domain to refine the search and ensure relevance.
   * @param {string} [language='en'] - The language of the articles.
   * @param {number} [pageSize=5] - The number of articles to return.
   * @returns {Promise<NewsArticle[] | null>} A list of news articles or null/mock if an error occurs.
   * @see https://newsapi.org/docs
   */
  async fetchCompanyNews(
    companyName: string,
    domain?: string,
    language: string = 'en',
    pageSize: number = 5
  ): Promise<NewsArticle[] | null> {
    const cacheKey = `newsapi_company_news:${companyName}:${domain || ''}:${language}:${pageSize}`;
    // News changes frequently, so a shorter TTL, e.g., 1-4 hours.
    // For demonstration, using CACHE_TTL (1 hour) or a specific shorter one.
    const NEWS_CACHE_TTL = 1 * 60 * 60 * 1000; // 1 hour

    if (!this.NEWS_API_KEY) {
      console.warn(
        `NEWS_API_KEY is missing. Returning mock news for ${companyName}. ` +
        `Please set VITE_NEWS_API_KEY in your environment.`
      );
      return this.getMockNewsArticles(companyName);
    }

    if (!companyName && !domain) {
        console.warn("Cannot fetch news without a company name or domain.");
        return null;
    }

    return this.fetchWithCache(cacheKey, async () => {
      try {
        // Construct a targeted query. Example: "Apple Inc." OR ("Apple Inc." AND apple.com)
        // Using exact company name in quotes for better precision.
        let searchQuery = `"${companyName}"`;
        if (domain) {
          // Extract the core part of the domain to avoid issues with "www." or ".com" variations if NewsAPI struggles with full domains as search terms.
          const coreDomain = domain.replace(/^www\./, '').split('.')[0];
          searchQuery = `("${companyName}") OR ("${companyName}" AND "${coreDomain}")`;
        }

        const response = await axios.get('https://newsapi.org/v2/everything', {
          params: {
            q: searchQuery,
            language,
            pageSize,
            sortBy: 'relevancy', // 'publishedAt', 'relevancy', 'popularity'
            // apiKey: this.NEWS_API_KEY, // Some APIs take key in params
          },
          headers: {
            'X-Api-Key': this.NEWS_API_KEY, // NewsAPI uses X-Api-Key header
            'Accept': 'application/json'
          },
          timeout: 10000
        });

        if (response.status === 200 && response.data?.articles) {
          return response.data.articles.map((article: any): NewsArticle => ({
            title: article.title,
            sourceName: article.source?.name,
            url: article.url,
            publishedAt: article.publishedAt,
            description: article.description,
            imageUrl: article.urlToImage,
            content: article.content,
          }));
        } else {
          console.warn(`NewsAPI returned status ${response.status} or no articles for ${companyName}.`);
          return this.getMockNewsArticles(companyName, `API status ${response.status}`);
        }
      } catch (error: any) {
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
      {
        title: `Exciting Developments at ${companyName}`,
        sourceName: "Mock News Source",
        url: `https://example.com/news/${companyName.toLowerCase().replace(/\s+/g, '-')}-1`,
        publishedAt: new Date().toISOString(),
        description: `This is a mock news article about ${companyName}. ${note || 'Generated due to missing API key or API error.'}`,
        imageUrl: "https://via.placeholder.com/150/0000FF/808080?Text=News+Image",
        content: "Further details about the mock developments..."
      },
      {
        title: `${companyName} Announces New Strategy`,
        sourceName: "Fictional Business Times",
        url: `https://example.com/news/${companyName.toLowerCase().replace(/\s+/g, '-')}-2`,
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        description: `A mock report on ${companyName}'s latest strategic moves. ${note || ''}`,
        imageUrl: "https://via.placeholder.com/150/FF0000/FFFFFF?Text=Strategy+News",
        content: "The company plans to mock innovate further..."
      }
    ];
  }

  private getMockCensusData(dataset: string, params: Record<string, string>): any[] {
    // Example: For params like { get: 'NAME,P1_001N', for: 'state:01' }
    const requestedFields = params.get ? params.get.split(',') : ['NAME', 'MOCK_FIELD_1', 'MOCK_FIELD_2'];
    const mockEntry: Record<string, any> = {};
    requestedFields.forEach(field => {
      if (field === 'NAME') {
        mockEntry[field] = `Mock State/County for ${params.for || dataset}`;
      } else {
        mockEntry[field] = (Math.random() * 100000).toFixed(0);
      }
    });
    mockEntry.notes = "Mock data due to missing API key or API error.";
    return [mockEntry]; // Return a single mock entry as an example
  }

  // --- Clearbit Company Enrichment ---
  /**
   * Fetches enriched company data from Clearbit based on a domain name.
   * @param {string} domain - The company domain (e.g., "example.com").
   * @returns {Promise<ClearbitCompanyData | null>} A promise that resolves to mapped company data or null if no data found.
   * Returns mock data if API key is missing or an error occurs.
   * @see https://clearbit.com/docs#enrichment-api-company-api
   */
  async getCompanyInfo(domain: string): Promise<ClearbitCompanyData | null> {
    const cacheKey = `clearbit_company_info:${domain}`; // Using a more specific cache key

    if (!this.CLEARBIT_API_KEY) {
      console.warn(
        `CLEARBIT_API_KEY is missing. Returning mock data for Clearbit getCompanyInfo(${domain}). ` +
        `Please set VITE_CLEARBIT_API_KEY in your environment variables.`
      );
      return {
        ...this.MOCK_CLEARBIT_COMPANY_DATA,
        domain: domain,
        name: `Mock for ${domain.split('.')[0]}`, // Customize mock name
        logoUrl: `https://logo.clearbit.com/${domain}`
      };
    }

    return this.fetchWithCache(cacheKey, async () => {
      try {
        const response = await axios.get(`https://company.clearbit.com/v2/companies/find`, {
          params: { domain },
          headers: {
            'Authorization': `Bearer ${this.CLEARBIT_API_KEY}`,
            'Accept': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        });

        // Clearbit returns 200 even if company not found, but data might be pending or minimal.
        // A 404 means domain not found or invalid.
        // For "Person or company not found" Clearbit might return 200 with an empty body or specific message.
        // Let's assume if response.data is present and has a domain, it's a valid (though possibly partial) find.
        if (response.status === 200 && response.data && response.data.domain) {
          const cbData = response.data;
          const mappedData: ClearbitCompanyData = {
            name: cbData.name,
            legalName: cbData.legalName,
            domain: cbData.domain,
            description: cbData.description,
            foundedYear: cbData.foundedYear,
            url: cbData.site?.url || cbData.url,
            geo: {
              streetNumber: cbData.geo?.streetNumber,
              streetName: cbData.geo?.streetName,
              city: cbData.geo?.city,
              state: cbData.geo?.state,
              postalCode: cbData.geo?.postalCode,
              country: cbData.geo?.country,
              lat: cbData.geo?.lat,
              lng: cbData.geo?.lng,
            },
            category: {
              industry: cbData.category?.industry,
              sector: cbData.category?.sector,
              subIndustry: cbData.category?.subIndustry,
            },
            socialMedia: {
              facebookHandle: cbData.facebook?.handle,
              linkedinHandle: cbData.linkedin?.handle,
              twitterHandle: cbData.twitter?.handle,
            },
            logoUrl: cbData.logo,
            phone: cbData.phone || cbData.site?.phoneNumbers?.[0],
            employeeCount: cbData.metrics?.employees,
            rawClearbitData: cbData
          };
          return mappedData;
        } else if (response.status === 404) {
          console.log(`Clearbit: Company not found for domain ${domain} (404).`);
          return null; // Explicitly null if not found by Clearbit
        } else if (response.status === 200 && (!response.data || !response.data.domain)) {
           console.log(`Clearbit: Company data incomplete or pending for domain ${domain}.`);
           return null; // Treat as not found if essential data like domain is missing in 200 response
        } else {
          // For other non-200 statuses that are not explicit 404s (e.g. 400, 500 from Clearbit)
          console.warn(`Clearbit API returned status ${response.status} for domain ${domain}.`);
          // Fall through to generic error handling which returns mock data
          throw new Error(`Clearbit API error: Status ${response.status}`);
        }
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            // Specific handling for HTTP error statuses
            if (error.response.status === 401) { // Unauthorized
                console.error("Clearbit API Key is invalid or unauthorized.");
            } else if (error.response.status === 402) { // Payment Required
                console.error("Clearbit API call failed: Payment Required or plan limit reached.");
            } else if (error.response.status === 404) { // Not Found (should be caught above ideally, but also here)
                 console.log(`Clearbit: Company not found for domain ${domain} (error path).`);
                 return null; // Return null if truly not found
            } else if (error.response.status === 429) { // Rate limit
                console.warn("Clearbit API rate limit likely exceeded.");
            } else {
                console.error(`Clearbit API error for domain ${domain}: Status ${error.response.status} - ${error.response.data?.error?.message}`);
            }
        } else {
            // Non-Axios errors (network issues, timeouts not caught by axios, etc.)
            console.error(`Network or other error fetching Clearbit data for ${domain}: ${error.message}`);
        }
        console.warn(`Returning mock data for Clearbit getCompanyInfo(${domain}) due to fetch error.`);
        return {
            ...this.MOCK_CLEARBIT_COMPANY_DATA,
            domain: domain,
            name: `Mock for ${domain.split('.')[0]} (Error)`,
            logoUrl: `https://logo.clearbit.com/${domain}`
        };
      }
    });
  }

  /**
   * Enriches a business profile in the database with data from Clearbit.
   * @param businessId The ID of the business in the Supabase 'businesses' table.
   * @returns The updated business profile with enriched data, or null if an error occurs or no domain.
   */
  async enrichBusinessProfile(businessId: string | number): Promise<any | null> {
    try {
      // 1. Fetch business from Supabase
      const { data: business, error: fetchError } = await supabase
        .from('businesses') // Assuming table name is 'businesses'
        .select('id, name, website, clearbit_data') // Select relevant fields, including website for domain
        .eq('id', businessId)
        .single();

      if (fetchError) {
        console.error(`Error fetching business ${businessId} from Supabase:`, fetchError.message);
        throw fetchError;
      }

      if (!business) {
        console.warn(`Business with ID ${businessId} not found.`);
        return null;
      }

      if (!business.website) {
        console.log(`Business ${businessId} (${business.name}) has no website/domain for enrichment.`);
        return business; // Return original business if no domain
      }

      // Attempt to extract domain from website URL
      let domain = '';
      try {
        domain = new URL(business.website).hostname.replace(/^www\./, '');
      } catch (e) {
        console.warn(`Invalid website URL for business ${businessId}: ${business.website}`);
        return business; // Return original if URL is invalid
      }

      if (!domain) {
        console.log(`Could not extract domain from website ${business.website} for business ${businessId}.`);
        return business;
      }

      // 2. Enrich with Clearbit data
      const clearbitData = await this.getCompanyInfo(domain);

      if (!clearbitData) {
        console.log(`No Clearbit enrichment data found for domain ${domain} (business ID ${businessId}).`);
        // Optionally update a field to note that lookup was attempted
        // await supabase.from('businesses').update({ last_clearbit_lookup_at: new Date().toISOString(), social_profile_urls: null }).eq('id', businessId);
        return business; // Return original business if no enrichment
      }

      // 3. Generate Social Media Links from Clearbit Data
      const socialMediaLinks: BusinessSocialMediaLinks = {};
      if (clearbitData.socialMedia) {
        if (clearbitData.socialMedia.facebookHandle) {
          socialMediaLinks.facebookUrl = generateFacebookURL(clearbitData.socialMedia.facebookHandle);
        }
        if (clearbitData.socialMedia.twitterHandle) {
          socialMediaLinks.twitterUrl = generateTwitterURL(clearbitData.socialMedia.twitterHandle);
        }
        if (clearbitData.socialMedia.linkedinHandle) {
          // Assuming Clearbit's linkedinHandle is for company pages for this context
          socialMediaLinks.linkedinCompanyUrl = generateLinkedInCompanyURL(clearbitData.socialMedia.linkedinHandle);
        }
        // Add Instagram and YouTube if Clearbit starts providing those handles in ClearbitCompanyData.socialMedia
        // For now, they are not in the ClearbitCompanyData.socialMedia interface but utilities exist.
      }

      // 4. Prepare update object for Supabase
      // This example updates specific fields if they exist in ClearbitCompanyData and stores raw data + formatted social URLs.
      // Adapt this to your actual 'businesses' table schema.

      // 4a. Fetch Company News
      const recentNews = await this.fetchCompanyNews(business.name, domain);

      const updatePayload: { [key: string]: any } = {
        clearbit_data: clearbitData.rawClearbitData, // Store all raw data
        social_profile_urls: socialMediaLinks, // Store generated social media URLs
        recent_news: recentNews, // Store fetched news articles
        last_enriched_at: new Date().toISOString(),
        // Example of updating specific top-level fields if your schema has them:
        // name: clearbitData.name || business.name, // Preserve original if Clearbit's is null
        // description: clearbitData.description,
        // employee_count: clearbitData.employeeCount,
        // logo_url: clearbitData.logoUrl,
        // phone: clearbitData.phone,
        // industry: clearbitData.category?.industry,
        // (add more mapped fields as per your 'businesses' table structure)
      };

      // Merge existing clearbit_data with new data if clearbit_data is a JSONB field
      if (business.clearbit_data && typeof business.clearbit_data === 'object') {
        // Ensure we don't overwrite the entire object if only new raw data is added
        updatePayload.clearbit_data = { ...business.clearbit_data, ...clearbitData.rawClearbitData };
      }
      // A similar merge could be done for social_profile_urls if it's a JSONB field and might have partial updates.
      // For simplicity, here it overwrites social_profile_urls with the latest generated ones.

      // 5. Update business in Supabase
      const { data: updatedBusiness, error: updateError } = await supabase
        .from('businesses')
        .update(updatePayload)
        .eq('id', businessId)
        .select('*, social_profile_urls, clearbit_data, recent_news') // Ensure new fields are returned
        .single();

      if (updateError) {
        console.error(`Error updating business ${businessId} with Clearbit data:`, updateError.message);
        throw updateError;
      }

      console.log(`Business ${businessId} (${updatedBusiness?.name}) successfully enriched with Clearbit data.`);
      return updatedBusiness;

    } catch (error) {
      console.error(`Failed to enrich business profile for ID ${businessId}:`, error);
      return null;
    }
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
