
interface WarmupConfig {
  businesses: {
    popular: string[];
    featured: string[];
    recent: string[];
  };
  searches: {
    popular: string[];
    trending: string[];
  };
  ai: {
    commonQueries: string[];
    recommendations: string[];
  };
}

export const warmupConfig: WarmupConfig = {
  businesses: {
    popular: ['tech', 'healthcare', 'manufacturing', 'aerospace'],
    featured: ['verified', 'top-rated', 'recently-updated'],
    recent: ['new-listings', 'updated-profiles']
  },
  searches: {
    popular: ['AI companies', 'Tech startups', 'Birmingham', 'Huntsville'],
    trending: ['machine learning', 'fintech', 'biotech', 'cyber security']
  },
  ai: {
    commonQueries: ['business analysis', 'market insights', 'recommendations'],
    recommendations: ['b2b-matching', 'investment-opportunities']
  }
};
