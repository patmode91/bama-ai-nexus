
import { supabase } from '@/integrations/supabase/client';
import { SearchIntent } from '@/types/semanticSearch';

export class IntentAnalyzer {
  async analyzeSearchIntent(query: string): Promise<SearchIntent> {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-bamabot', {
        body: {
          message: `Analyze this search query and extract search intent: "${query}"
          
          Return JSON format:
          {
            "intent": "find_businesses|market_research|partnership|investment",
            "extractedCriteria": {
              "technologies": [],
              "industries": [],
              "locations": [],
              "companySize": "",
              "services": [],
              "keywords": []
            },
            "searchTerms": ["relevant", "search", "terms"]
          }`,
          type: 'chat'
        }
      });

      if (error) throw error;

      const response = data.response || '{}';
      try {
        const parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
        return parsed;
      } catch {
        return this.basicIntentAnalysis(query);
      }
    } catch (error) {
      console.error('Intent analysis error:', error);
      return this.basicIntentAnalysis(query);
    }
  }

  private basicIntentAnalysis(query: string): SearchIntent {
    const lowercaseQuery = query.toLowerCase();
    
    let intent: SearchIntent['intent'] = 'find_businesses';
    if (lowercaseQuery.includes('market') || lowercaseQuery.includes('trend')) {
      intent = 'market_research';
    } else if (lowercaseQuery.includes('partner') || lowercaseQuery.includes('collaborate')) {
      intent = 'partnership';
    } else if (lowercaseQuery.includes('invest') || lowercaseQuery.includes('funding')) {
      intent = 'investment';
    }

    const technologies = this.extractTechnologies(query);
    const industries = this.extractIndustries(query);
    const locations = this.extractLocations(query);

    return {
      intent,
      extractedCriteria: {
        technologies,
        industries,
        locations,
        companySize: '',
        services: [],
        keywords: query.split(' ').filter(word => word.length > 3)
      },
      searchTerms: [query]
    };
  }

  private extractTechnologies(query: string): string[] {
    const techKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning',
      'computer vision', 'nlp', 'natural language processing', 'robotics',
      'automation', 'blockchain', 'iot', 'internet of things', 'cloud',
      'saas', 'software', 'mobile app', 'web development', 'data science',
      'analytics', 'big data', 'cybersecurity', 'fintech', 'healthtech'
    ];
    
    return techKeywords.filter(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  private extractIndustries(query: string): string[] {
    const industryKeywords = [
      'healthcare', 'aerospace', 'manufacturing', 'automotive', 'finance',
      'education', 'retail', 'logistics', 'agriculture', 'energy',
      'real estate', 'hospitality', 'media', 'telecommunications',
      'defense', 'government', 'nonprofit'
    ];
    
    return industryKeywords.filter(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  private extractLocations(query: string): string[] {
    const locationKeywords = [
      'birmingham', 'huntsville', 'mobile', 'montgomery', 'tuscaloosa',
      'auburn', 'dothan', 'florence', 'gadsden', 'hoover', 'alabama'
    ];
    
    return locationKeywords.filter(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }
}

export const intentAnalyzer = new IntentAnalyzer();
