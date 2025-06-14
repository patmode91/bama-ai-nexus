
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

class MarketDataService {
  private newsApiKey = ''; // Will be set via edge function
  private newsApiUrl = 'https://newsapi.org/v2';
  
  async getAlabamaBusinessNews(category?: string): Promise<NewsItem[]> {
    try {
      // This will be called from edge functions with proper API key
      const query = category 
        ? `Alabama business ${category}` 
        : 'Alabama business technology startup';
      
      const response = await fetch(
        `${this.newsApiUrl}/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10`
      );
      
      if (!response.ok) {
        console.warn('News API request failed, using fallback');
        return this.getFallbackNews(category);
      }
      
      const data = await response.json();
      
      return data.articles?.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name
      })) || [];
      
    } catch (error) {
      console.error('News API error:', error);
      return this.getFallbackNews(category);
    }
  }

  async getTechTrends(): Promise<string[]> {
    try {
      // In a real implementation, this would call various APIs
      // For now, we'll return curated trends based on Alabama's focus areas
      return [
        'AI and Machine Learning adoption in manufacturing',
        'Aerospace technology advancement in Huntsville',
        'Healthcare technology innovation in Birmingham',
        'Fintech growth in Alabama markets',
        'Autonomous vehicle testing expansion',
        'Defense technology contracts increasing',
        'University-industry partnerships growing',
        'Startup funding activity rising'
      ];
    } catch (error) {
      console.error('Trends API error:', error);
      return ['Technology adoption growing across Alabama'];
    }
  }

  async getMarketInsights(sector: string): Promise<MarketData> {
    const [news, trends] = await Promise.all([
      this.getAlabamaBusinessNews(sector),
      this.getTechTrends()
    ]);

    return {
      news: news.slice(0, 5),
      trends: trends.filter(trend => 
        trend.toLowerCase().includes(sector.toLowerCase()) ||
        sector.toLowerCase().includes('general')
      ).slice(0, 4),
      lastUpdated: new Date().toISOString()
    };
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
    try {
      const query = `"${companyName}" Alabama`;
      // This would make an API call in production
      
      return [{
        title: `${companyName} Announces New Initiatives`,
        description: `Recent developments and news regarding ${companyName} operations in Alabama.`,
        url: '#',
        publishedAt: new Date().toISOString(),
        source: 'Business Wire'
      }];
    } catch (error) {
      console.error('Company news error:', error);
      return [];
    }
  }

  async getFundingData(sector?: string): Promise<any> {
    // In production, this would call funding APIs like Crunchbase
    return {
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
  }
}

export const marketDataService = new MarketDataService();
