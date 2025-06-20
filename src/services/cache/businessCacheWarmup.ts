
import { businessCache } from './advancedCacheService';

class BusinessCacheWarmup {
  async warmup(): Promise<void> {
    console.log('Starting business cache warmup...');
    
    try {
      // Warmup popular business data
      await this.warmupPopularBusinesses();
      
      console.log('Business cache warmup completed');
    } catch (error) {
      console.warn('Business cache warmup failed:', error);
    }
  }

  private async warmupPopularBusinesses(): Promise<void> {
    const popularCategories = [
      'technology',
      'healthcare',
      'automotive',
      'retail',
      'construction',
      'education',
      'finance',
      'restaurants'
    ];

    const mockBusinesses = popularCategories.map(category => ({
      category,
      businesses: Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        businessname: `${category} Business ${i + 1}`,
        category,
        rating: 4.0 + Math.random(),
        location: 'Alabama',
        verified: Math.random() > 0.5
      })),
      total: 50 + Math.floor(Math.random() * 100)
    }));

    for (const categoryData of mockBusinesses) {
      businessCache.set(
        `businesses_${categoryData.category}`,
        categoryData,
        {
          ttl: 900000, // 15 minutes
          priority: 'normal',
          tags: ['business', 'category', categoryData.category]
        }
      );
    }
  }

  async warmupBusinessDetails(businessId: string): Promise<void> {
    // Warmup specific business details
    const mockBusiness = {
      id: businessId,
      businessname: `Business ${businessId}`,
      description: 'Sample business description',
      category: 'technology',
      location: 'Alabama',
      rating: 4.5,
      verified: true,
      employees_count: 50,
      tags: ['ai', 'software', 'innovation']
    };

    businessCache.set(
      `business_${businessId}`,
      mockBusiness,
      {
        ttl: 1800000, // 30 minutes
        priority: 'high',
        tags: ['business', 'details', businessId]
      }
    );
  }
}

export const businessCacheWarmup = new BusinessCacheWarmup();
