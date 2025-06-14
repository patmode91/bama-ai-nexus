
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Business {
  id: number;
  businessname: string | null;
  description: string | null;
  category: string | null;
  contactname: string | null;
  contactemail: string | null;
  website: string | null;
  location: string | null;
  employees_count: number | null;
  founded_year: number | null;
  logo_url: string | null;
  verified: boolean | null;
  rating: number | null;
  tags: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useBusinesses = () => {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: async (): Promise<Business[]> => {
      console.log('Fetching businesses from Supabase...');
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching businesses:', error);
        throw error;
      }

      console.log('Fetched businesses:', data);
      return data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
  });
};

export const useBusinessStats = () => {
  return useQuery({
    queryKey: ['business-stats'],
    queryFn: async () => {
      console.log('Fetching business statistics...');
      
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('category, employees_count, founded_year, verified');

      if (error) {
        console.error('Error fetching business stats:', error);
        throw error;
      }

      // Calculate statistics
      const totalCompanies = businesses?.length || 0;
      const verifiedCompanies = businesses?.filter(b => b.verified).length || 0;
      const categories = [...new Set(businesses?.map(b => b.category).filter(Boolean))];
      const avgEmployees = businesses?.reduce((acc, b) => acc + (b.employees_count || 0), 0) / totalCompanies;
      
      return {
        totalCompanies,
        verifiedCompanies,
        categories: categories.length,
        avgEmployees: Math.round(avgEmployees || 0),
        recentCompanies: businesses?.filter(b => {
          if (!b.founded_year) return false;
          return b.founded_year >= new Date().getFullYear() - 2;
        }).length || 0
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });
};
