
import { useState } from 'react';
import { useBusinesses } from '@/hooks/useBusinesses';

export const useIndexPage = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState<'directory' | 'categories'>('directory');

  const { data: businesses, isLoading: businessesLoading, error: businessesError } = useBusinesses();

  const handleQuizComplete = (answers: Record<string, string>) => {
    setUserAnswers(answers);
    setQuizCompleted(true);
    setShowQuiz(false);
  };

  const handleSearch = (query: string, filters: any) => {
    if (businesses) {
      let filtered = businesses;
      
      // Text search
      if (query) {
        filtered = filtered.filter(business => 
          business.businessname?.toLowerCase().includes(query.toLowerCase()) ||
          business.description?.toLowerCase().includes(query.toLowerCase()) ||
          business.category?.toLowerCase().includes(query.toLowerCase()) ||
          business.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
      }
      
      // Category filter
      if (filters.category && filters.category !== '') {
        filtered = filtered.filter(business => 
          business.category?.toLowerCase() === filters.category.toLowerCase()
        );
      }
      
      // Location filter
      if (filters.location && filters.location !== '') {
        filtered = filtered.filter(business => 
          business.location?.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      
      // Employee range filter
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
      
      // Founded year range filter
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
      
      // Verification filter
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
  const displayedCompanies = filteredCompanies.length > 0 ? filteredCompanies : featuredCompanies;

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
    businessesLoading,
    businessesError,
    handleQuizComplete,
    handleSearch,
    handleCategorySelect,
    displayedCompanies,
  };
};
