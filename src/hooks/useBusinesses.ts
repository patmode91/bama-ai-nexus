
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/loggerService';

export interface Business {
  id: number;
  businessname: string | null;
  category: string | null;
  contactemail: string | null;
  contactname: string | null;
  created_at: string | null;
  description: string | null;
  employees_count: number | null;
  founded_year: number | null;
  interestcheckbox: boolean | null;
  location: string | null;
  logo_url: string | null;
  owner_id: string | null;
  rating: number | null;
  tags: string[] | null;
  updated_at: string | null;
  verified: boolean | null;
  website: string | null;
  certifications: string[] | null;
  project_budget_min: number | null;
  project_budget_max: number | null;
  phone?: string | null;
  annual_revenue?: string | null;
}

interface BusinessFilters {
  category?: string;
  location?: string;
  verified?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export const useBusinesses = (filters?: BusinessFilters) => {
  const query = useQuery({
    queryKey: ['businesses', filters],
    queryFn: async (): Promise<Business[]> => {
      try {
        logger.info('Fetching businesses from Supabase', { filters }, 'useBusinesses');
        
        let queryBuilder = supabase
          .from('businesses')
          .select('*');

        // Apply filters
        if (filters?.category) {
          queryBuilder = queryBuilder.eq('category', filters.category);
        }
        
        if (filters?.location) {
          queryBuilder = queryBuilder.ilike('location', `%${filters.location}%`);
        }
        
        if (filters?.verified !== undefined) {
          queryBuilder = queryBuilder.eq('verified', filters.verified);
        }
        
        if (filters?.tags && filters.tags.length > 0) {
          queryBuilder = queryBuilder.overlaps('tags', filters.tags);
        }

        // Apply pagination
        if (filters?.limit) {
          queryBuilder = queryBuilder.limit(filters.limit);
        }
        
        if (filters?.offset) {
          queryBuilder = queryBuilder.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
        }

        queryBuilder = queryBuilder.order('created_at', { ascending: false });

        const { data, error } = await queryBuilder;

        if (error) {
          logger.error('Error fetching businesses', { error: error.message }, 'useBusinesses');
          throw error;
        }

        logger.info('Successfully fetched businesses', { count: data?.length || 0 }, 'useBusinesses');
        return data || [];
      } catch (error) {
        logger.error('Failed to fetch businesses', { error }, 'useBusinesses');
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116') return false; // Table doesn't exist
      return failureCount < 3;
    },
  });

  const getBusiness = async (id: number): Promise<Business | null> => {
    try {
      logger.info('Fetching business by ID', { id }, 'useBusinesses');
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching business', { error: error.message, id }, 'useBusinesses');
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to fetch business', { error, id }, 'useBusinesses');
      throw error;
    }
  };

  return {
    ...query,
    getBusiness
  };
};

export const useBusinessStats = () => {
  return useQuery({
    queryKey: ['business-stats'],
    queryFn: async () => {
      try {
        logger.info('Fetching business statistics', {}, 'useBusinessStats');
        
        const { data: businesses, error } = await supabase
          .from('businesses')
          .select('category, employees_count, founded_year, verified');

        if (error) {
          logger.error('Error fetching business stats', { error: error.message }, 'useBusinessStats');
          throw error;
        }

        // Calculate statistics
        const totalCompanies = businesses?.length || 0;
        const verifiedCompanies = businesses?.filter(b => b.verified).length || 0;
        const categories = [...new Set(businesses?.map(b => b.category).filter(Boolean))];
        const avgEmployees = businesses?.reduce((acc, b) => acc + (b.employees_count || 0), 0) / totalCompanies;
        
        const stats = {
          totalCompanies,
          verifiedCompanies,
          categories: categories.length,
          avgEmployees: Math.round(avgEmployees || 0),
          recentCompanies: businesses?.filter(b => {
            if (!b.founded_year) return false;
            return b.founded_year >= new Date().getFullYear() - 2;
          }).length || 0
        };

        logger.info('Successfully calculated business stats', stats, 'useBusinessStats');
        return stats;
      } catch (error) {
        logger.error('Failed to fetch business stats', { error }, 'useBusinessStats');
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
