
import { useState, useEffect } from 'react';
import { useProfile } from './useProfile';

interface UserPreferences {
  industries: string[];
  businessTypes: string[];
  projectBudgetRange: {
    min: number;
    max: number;
  };
  location: string;
  interests: string[];
  experience_level: 'beginner' | 'intermediate' | 'expert';
  collaboration_type: 'client' | 'partner' | 'vendor' | 'investor';
  ai_focus_areas: string[];
}

const defaultPreferences: UserPreferences = {
  industries: [],
  businessTypes: [],
  projectBudgetRange: { min: 1000, max: 100000 },
  location: '',
  interests: [],
  experience_level: 'intermediate',
  collaboration_type: 'client',
  ai_focus_areas: []
};

export const useUserPreferences = () => {
  const { profile, updateProfile } = useProfile();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      // For now, we'll use the industry field and extend it with more data
      // In a real implementation, you'd want to add a preferences JSON field to the profiles table
      const savedPreferences = {
        ...defaultPreferences,
        industries: profile.industry ? [profile.industry] : [],
        location: profile.company || '',
      };
      
      setPreferences(savedPreferences);
    }
    setIsLoading(false);
  }, [profile]);

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);

    // For now, we'll update the industry field with the first selected industry
    // In a real implementation, you'd store this in a JSON preferences field
    try {
      await updateProfile({
        industry: updatedPreferences.industries[0] || ''
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const getMatchingCriteria = () => {
    return {
      industries: preferences.industries,
      budget: preferences.projectBudgetRange,
      location: preferences.location,
      collaboration: preferences.collaboration_type,
      aiAreas: preferences.ai_focus_areas
    };
  };

  return {
    preferences,
    updatePreferences,
    getMatchingCriteria,
    isLoading
  };
};
