
import { useState } from 'react';
import { useBusinesses, Business } from '@/hooks/useBusinesses';
import { SearchFilters } from '@/types/search';

export const useIndexPage = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [filteredCompanies, setFilteredCompanies] = useState<Business[]>([]);
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState<'directory' | 'categories'>('directory');
  const [comparisonList, setComparisonList] = useState<number[]>([]);

  const { data: businesses, isLoading: businessesLoading, error: businessesError } = useBusinesses();

  const addOrRemoveFromComparison = (businessId: number) => {
    setComparisonList(prev => {
      if (prev.includes(businessId)) {
        return prev.filter(id => id !== businessId);
      }
      if (prev.length < 4) {
        return [...prev, businessId];
      }
      // Note: We could add a toast notification here to inform the user about the limit.
      return prev;
    });
  };

  const isCompared = (businessId: number) => {
    return comparisonList.includes(businessId);
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const handleQuizComplete = (answers: Record<string, string>) => {
    setUserAnswers(answers);
    setQuizCompleted(true);
    setShowQuiz(false);
  };

  const handleSearch = (query: string, filters: SearchFilters) => {
    if (businesses) {
      let filtered = businesses;
      
      if (query) {
        filtered = filtered.filter(business => 
          business.businessname?.toLowerCase().includes(query.toLowerCase()) ||
          business.description?.toLowerCase().includes(query.toLowerCase()) ||
          business.category?.toLowerCase().includes(query.toLowerCase()) ||
          business.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
      }
      
      if (filters.category && filters.category !== '') {
        filtered = filtered.filter(business => 
          business.category?.toLowerCase() === filters.category.toLowerCase()
        );
      }
      
      if (filters.location && filters.location !== '') {
        filtered = filtered.filter(business => 
          business.location?.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      
      if (filters.employeeRange && filters.employeeRange !== '') {
        filtered = filtered.filter(business => {
          const count = business.employees_count;
          if (!count) return false;
          
          switch (filters.employeeRange) {
            case '1-10': return count <= 10;
            case '11-50': return count >= 11 && count <= 50;
            case '51-200': return count >= 51 && count <= 200;
            case '201-500': return count >= 201 && count <= 500;
            case '500+': return count > 500;
            default: return true;
          }
        });
      }
      
      if (filters.foundedYearRange && filters.foundedYearRange !== '') {
        filtered = filtered.filter(business => {
          const year = business.founded_year;
          if (!year) return false;
          
          switch (filters.foundedYearRange) {
            case '2020-2024': return year >= 2020;
            case '2015-2019': return year >= 2015 && year <= 2019;
            case '2010-2014': return year >= 2010 && year <= 2014;
            case '2000-2009': return year >= 2000 && year <= 2009;
            case 'Before 2000': return year < 2000;
            default: return true;
          }
        });
      }
      
      if (filters.projectBudgetRange && filters.projectBudgetRange !== '') {
        filtered = filtered.filter(business => {
          const min = business.project_budget_min;
          const max = business.project_budget_max;

          if (min === null || max === null) return false;

          switch (filters.projectBudgetRange) {
            case '<$10k': return max < 10000;
            case '$10k-$50k': return min < 50000 && max >= 10000;
            case '$50k-$100k': return min < 100000 && max >= 50000;
            case '$100k-$250k': return min < 250000 && max >= 100000;
            case '>$250k': return min > 250000;
            default: return true;
          }
        });
      }
      
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(business => {
          if (!business.tags && !business.certifications) return false;
          const businessTags = business.tags?.map(t => t.toLowerCase()) || [];
          const businessCerts = business.certifications?.map(c => c.toLowerCase()) || [];
          const combined = [...businessTags, ...businessCerts];
          return filters.tags.every((filterTag: string) => combined.includes(filterTag.toLowerCase()));
        });
      }
      
      if (filters.verified !== null) {
        filtered = filtered.filter(business => 
          business.verified === filters.verified
        );
      }
      
      setFilteredCompanies(filtered);
      setCurrentView('directory');
    }
  };

  const handleCategorySelect = (category: string) => {
    if (category) {
      const filtered = businesses?.filter(business => 
        business.category?.toLowerCase() === category.toLowerCase()
      ) || [];
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies([]);
    }
    setCurrentView('directory');
  };

  const featuredCompanies = businesses?.slice(0, 6) || [];
  const displayedCompanies = filteredCompanies.length > 0 ? filteredCompanies : (businesses || []);

  const comparisonBusinesses = businesses?.filter(b => comparisonList.includes(b.id)) || [];

  return {
    showQuiz,
    setShowQuiz,
    quizCompleted,
    userAnswers,
    filteredCompanies,
    setFilteredCompanies,
    showAuth,
    setShowAuth,
    currentView,
    setCurrentView,
    businesses,
    businessesLoading,
    businessesError,
    handleQuizComplete,
    handleSearch,
    handleCategorySelect,
    displayedCompanies,
    comparisonList,
    comparisonBusinesses,
    addOrRemoveFromComparison,
    isCompared,
    clearComparison,
  };
};
