
import { useState, useEffect } from 'react';
import { marketDataService } from '@/services/marketDataService';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

interface MarketData {
  news: NewsItem[];
  trends: string[];
  lastUpdated: string;
}

export const useMarketData = (sector: string = 'general') => {
  const [data, setData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const marketData = await marketDataService.getMarketInsights(sector);
        setData(marketData);
      } catch (err) {
        console.error('Failed to fetch market data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, [sector]);

  const refetch = async () => {
    // Clear cache for this sector and refetch
    marketDataService.invalidateCache(sector);
    
    try {
      setIsLoading(true);
      setError(null);
      const marketData = await marketDataService.getMarketInsights(sector);
      setData(marketData);
    } catch (err) {
      console.error('Failed to refetch market data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
};

export const useCompanyNews = (companyName: string) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyNews = async () => {
      if (!companyName) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const companyNews = await marketDataService.getCompanyNews(companyName);
        setNews(companyNews);
      } catch (err) {
        console.error('Failed to fetch company news:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch company news');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyNews();
  }, [companyName]);

  return {
    news,
    isLoading,
    error
  };
};
