import { supabase } from '@/integrations/supabase/client';
import { SearchFilters } from '@/types/semanticSearch';

export class QueryBuilder {
  buildSearchQuery(criteria: any, filters: SearchFilters = {}): any {
    let query = supabase.from('businesses').select('*');

    // Apply text search
    if (criteria.keywords?.length > 0) {
      const searchTerms = criteria.keywords.join(' | ');
      query = query.or(`businessname.ilike.%${searchTerms}%,description.ilike.%${searchTerms}%,category.ilike.%${searchTerms}%`);
    }

    // Apply location filter
    if (filters.location || criteria.locations?.length > 0) {
      const location = filters.location || criteria.locations[0];
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }
    }

    // Apply category filter
    if (filters.category || criteria.industries?.length > 0) {
      const category = filters.category || criteria.industries[0];
      if (category) {
        query = query.ilike('category', `%${category}%`);
      }
    }

    // Apply verified filter
    if (filters.verified !== undefined) {
      query = query.eq('verified', filters.verified);
    }

    return query;
  }
}

export const queryBuilder = new QueryBuilder();
