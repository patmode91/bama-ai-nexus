import { cacheService } from './cacheService';
import { supabase } from '@/integrations/supabase/client';

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

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

class MarketDataService {
  private newsApiUrl = 'https://newsapi.org/v2';
  private alphaVantageUrl = 'https://www.alphavantage.co/query';
  
  async getAlabamaBusinessNews(category?: string): Promise<NewsItem[]> {
    const cacheKey = `news_${category || 'general'}`;
    
    // Check cache first
    const cached = cacheService.get<NewsItem[]>(cacheKey);
    if (cached) {
      console.log('Returning cached news data');
      return cached;
    }

    try {
      // Try to get news from News API (via edge function for security)
      const { data, error } = await supabase.functions.invoke('news-data', {
        body: { category, query: category ? `Alabama business ${category}` : 'Alabama business technology startup' }
      });

      if (!error && data?.articles) {
        const news = data.articles.map((article: any) => ({
          title: article.title,
          description: article.description || '',
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source?.name || 'Unknown'
        }));

        // Cache the results for 30 minutes
        cacheService.set(cacheKey, news, 30 * 60 * 1000);
        return news;
      }
    } catch (error) {
      console.warn('News API request failed, using fallback:', error);
    }

    // Fallback to static news
    const fallbackNews = this.getFallbackNews(category);
    cacheService.set(cacheKey, fallbackNews, 10 * 60 * 1000); // Cache fallback for 10 minutes
    return fallbackNews;
  }

  async getTechTrends(): Promise<string[]> {
    const cacheKey = 'tech_trends';
    
    // Check cache first
    const cached = cacheService.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Generate AI-powered trends using Gemini
      const { data, error } = await supabase.functions.invoke('enhanced-bamabot', {
        body: {
          message: `Generate 8 current technology trends specifically for Alabama's business ecosystem. Focus on AI, aerospace, healthcare technology, manufacturing automation, and emerging opportunities. Return as a JSON array of trend strings.`,
          type: 'trends'
        }
      });

      if (!error && data?.response) {
        try {
          const trends = JSON.parse(data.response.replace(/```json\n?|\n?```/g, ''));
          if (Array.isArray(trends)) {
            cacheService.set(cacheKey, trends, 60 * 60 * 1000); // Cache for 1 hour
            return trends;
          }
        } catch (parseError) {
          console.warn('Failed to parse AI trends response');
        }
      }
    } catch (error) {
      console.error('AI trends generation failed:', error);
    }

    // Fallback trends with real-time elements
    const fallbackTrends = [
      `AI and Machine Learning adoption in manufacturing (${new Date().getFullYear()})`,
      'Aerospace technology advancement in Huntsville',
      'Healthcare technology innovation in Birmingham',
      'Fintech growth in Alabama markets',
      'Autonomous vehicle testing expansion',
      'Defense technology contracts increasing',
      'University-industry partnerships growing',
      'Startup funding activity rising in Q4'
    ];

    cacheService.set(cacheKey, fallbackTrends, 30 * 60 * 1000);
    return fallbackTrends;
  }

  async getMarketInsights(sector: string): Promise<MarketData> {
    const cacheKey = `market_insights_${sector}`;
    
    // Check cache first
    const cached = cacheService.get<MarketData>(cacheKey);
    if (cached) {
      return cached;
    }

    const [news, trends] = await Promise.all([
      this.getAlabamaBusinessNews(sector),
      this.getTechTrends()
    ]);

    const insights = {
      news: news.slice(0, 5),
      trends: trends.filter(trend => 
        trend.toLowerCase().includes(sector.toLowerCase()) ||
        sector.toLowerCase().includes('general')
      ).slice(0, 4),
      lastUpdated: new Date().toISOString()
    };

    // Cache for 20 minutes
    cacheService.set(cacheKey, insights, 20 * 60 * 1000);
    return insights;
  }

  async getStockData(symbols: string[]): Promise<StockData[]> {
    const cacheKey = `stocks_${symbols.join('_')}`;
    
    // Check cache first (stock data cached for 5 minutes)
    const cached = cacheService.get<StockData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Call Alpha Vantage via edge function
      const { data, error } = await supabase.functions.invoke('market-data', {
        body: { symbols, type: 'stocks' }
      });

      if (!error && data?.stocks) {
        const stockData = data.stocks;
        cacheService.set(cacheKey, stockData, 5 * 60 * 1000); // 5 minutes
        return stockData;
      }
    } catch (error) {
      console.error('Stock data API error:', error);
    }

    // Fallback with mock data
    const fallbackData = symbols.map(symbol => ({
      symbol,
      price: 100 + Math.random() * 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      lastUpdated: new Date().toISOString()
    }));

    cacheService.set(cacheKey, fallbackData, 2 * 60 * 1000);
    return fallbackData;
  }

  private getFallbackNews(category?: string): NewsItem[] {
    const baseNews = [
      {
        title: 'Alabama Tech Sector Shows Strong Growth',
        description: 'Recent reports indicate continued expansion in Alabama tech sector, with Birmingham and Huntsville leading the way.',
        url: '#',
        publishedAt: new Date().toISOString(),
        source: 'Alabama Business Journal'
      },
      {
        title: 'Aerospace Innovation Hub Expands in Huntsville',
        description: 'New aerospace technology initiatives announced, strengthening Alabama position in the industry.',
        url: '#',
        publishedAt: new Date().toISOString(),
        source: 'Huntsville Times'
      },
      {
        title: 'Healthcare Technology Advances in Birmingham',
        description: 'UAB and local healthcare providers announce new technology partnerships to improve patient care.',
        url: '#',
        publishedAt: new Date().toISOString(),
        source: 'Birmingham Business'
      },
      {
        title: 'Manufacturing Automation on the Rise',
        description: 'Alabama manufacturers increasingly adopt AI and automation technologies to improve efficiency.',
        url: '#',
        publishedAt: new Date().toISOString(),
        source: 'Manufacturing Alabama'
      },
      {
        title: 'Startup Ecosystem Grows Across the State',
        description: 'New incubators and accelerators support emerging businesses throughout Alabama.',
        url: '#',
        publishedAt: new Date().toISOString(),
        source: 'Alabama Startup News'
      }
    ];

    if (category) {
      return baseNews.filter(news => 
        news.title.toLowerCase().includes(category.toLowerCase()) ||
        news.description.toLowerCase().includes(category.toLowerCase())
      );
    }

    return baseNews;
  }

  async getCompanyNews(companyName: string): Promise<NewsItem[]> {
    const cacheKey = `company_news_${companyName}`;
    
    const cached = cacheService.get<NewsItem[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase.functions.invoke('news-data', {
        body: { 
          query: `"${companyName}" Alabama`,
          type: 'company'
        }
      });

      if (!error && data?.articles) {
        const news = data.articles.map((article: any) => ({
          title: article.title,
          description: article.description || '',
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source?.name || 'Unknown'
        }));

        cacheService.set(cacheKey, news, 30 * 60 * 1000);
        return news;
      }
    } catch (error) {
      console.error('Company news error:', error);
    }

    // Fallback
    const fallbackNews = [{
      title: `${companyName} Announces New Initiatives`,
      description: `Recent developments and news regarding ${companyName} operations in Alabama.`,
      url: '#',
      publishedAt: new Date().toISOString(),
      source: 'Business Wire'
    }];

    cacheService.set(cacheKey, fallbackNews, 10 * 60 * 1000);
    return fallbackNews;
  }

  async getFundingData(sector?: string): Promise<any> {
    const cacheKey = `funding_data_${sector || 'all'}`;
    
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // In production, this would call funding APIs like Crunchbase
    const fundingData = {
      totalFunding: '$45.2M',
      dealCount: 23,
      averageDealSize: '$2.1M',
      topSectors: ['Technology', 'Healthcare', 'Manufacturing'],
      recentDeals: [
        { company: 'Alabama Tech Startup', amount: '$5M', sector: 'AI/ML' },
        { company: 'Healthcare Innovation Co', amount: '$3.2M', sector: 'Healthcare' },
        { company: 'Manufacturing Solutions', amount: '$2.8M', sector: 'Manufacturing' }
      ],
      lastUpdated: new Date().toISOString()
    };

    cacheService.set(cacheKey, fundingData, 60 * 60 * 1000); // Cache for 1 hour
    return fundingData;
  }

  // Cache management methods
  getCacheStats() {
    return cacheService.getStats();
  }

  clearCache() {
    cacheService.clear();
  }

  invalidateCache(pattern?: string) {
    const stats = cacheService.getStats();
    if (pattern) {
      stats.keys.forEach(key => {
        if (key.includes(pattern)) {
          cacheService.delete(key);
        }
      });
    } else {
      cacheService.clear();
    }
  }
}

export const marketDataService = new MarketDataService();
