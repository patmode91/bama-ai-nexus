
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface BusinessAnalysis {
  marketPosition: string;
  competitiveAdvantages: string[];
  growthOpportunities: string[];
  riskFactors: string[];
  recommendedActions: string[];
}

interface MarketIntelligence {
  trendAnalysis: string;
  competitorInsights: string[];
  fundingLandscape: string;
  opportunityAreas: string[];
  marketSize: string;
}

class GeminiService {
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  
  private getApiKey(): string {
    // This will be called from edge functions where the API key is available
    return '';
  }

  async generateResponse(prompt: string, context?: any): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/gemini-2.0-flash-exp:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: this.buildContextualPrompt(prompt, context)
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'No response generated.';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  async analyzeBusinessProfile(business: any): Promise<BusinessAnalysis> {
    const prompt = `Analyze this Alabama business profile and provide strategic insights:

Business: ${business.businessname}
Category: ${business.category}
Location: ${business.location}
Description: ${business.description}
Employee Count: ${business.employees_count || 'Unknown'}
Founded: ${business.founded_year || 'Unknown'}

Provide analysis in the following format:
1. Market Position: [one paragraph assessment]
2. Competitive Advantages: [3-5 bullet points]
3. Growth Opportunities: [3-5 specific opportunities]
4. Risk Factors: [3-4 potential risks]
5. Recommended Actions: [3-5 actionable recommendations]

Focus on Alabama's business ecosystem and AI/tech opportunities.`;

    const response = await this.generateResponse(prompt);
    return this.parseBusinessAnalysis(response);
  }

  async generateMarketIntelligence(sector: string, location?: string): Promise<MarketIntelligence> {
    const prompt = `Provide comprehensive market intelligence for the ${sector} sector in ${location || 'Alabama'}:

Analyze:
1. Current market trends and growth patterns
2. Key competitors and market leaders
3. Funding landscape and investment activity
4. Emerging opportunity areas
5. Market size and potential

Focus on actionable insights for businesses operating in or entering this market in Alabama.
Include specific data points where possible and highlight AI/technology integration opportunities.`;

    const response = await this.generateResponse(prompt);
    return this.parseMarketIntelligence(response);
  }

  async generateBusinessRecommendations(userProfile: any, businesses: any[]): Promise<any[]> {
    const prompt = `As an AI business advisor for Alabama's ecosystem, analyze these businesses and provide personalized recommendations:

User Profile:
- Industry Interest: ${userProfile.industry || 'General'}
- Location Preference: ${userProfile.location || 'Alabama'}
- Company Size Preference: ${userProfile.companySize || 'Any'}
- Specific Needs: ${userProfile.needs || 'Business partnerships'}

Available Businesses:
${businesses.map(b => `- ${b.businessname} (${b.category}, ${b.location}): ${b.description?.slice(0, 100)}...`).join('\n')}

For each business, provide:
1. Match Score (0-100)
2. Why it's a good match (3-4 reasons)
3. Specific collaboration opportunities
4. Next steps for engagement

Rank by relevance and limit to top 5 matches.`;

    const response = await this.generateResponse(prompt);
    return this.parseBusinessRecommendations(response, businesses);
  }

  async enhancedChatResponse(message: string, context: any): Promise<string> {
    const alabamaContext = `
Alabama Business Ecosystem Context:
- Major hubs: Birmingham (healthcare, finance), Huntsville (aerospace, tech), Mobile (manufacturing, logistics)
- Key industries: Aerospace, Automotive, Healthcare, Technology, Manufacturing
- Growing sectors: AI/ML, Fintech, Healthtech, Defense Technology
- Major companies: Boeing, Mercedes-Benz, Honda, UAB Health, ADTRAN, Shipt
- Universities: Auburn, University of Alabama, UAB, Alabama A&M
- Investment: $45M+ in recent AI/tech funding
- Government support: Alabama Innovation Fund, tax incentives for tech companies
`;

    const prompt = `${alabamaContext}

User Context: ${JSON.stringify(context)}

User Message: "${message}"

As BamaBot 2.0, Alabama's AI business assistant, provide a helpful, knowledgeable response that:
1. Directly addresses the user's question
2. Incorporates relevant Alabama business ecosystem knowledge
3. Suggests specific businesses, opportunities, or connections when appropriate
4. Maintains a friendly, professional tone
5. Offers actionable next steps

If the user is asking about businesses, trends, or opportunities, be specific and reference actual Alabama locations, companies, or resources where relevant.`;

    return await this.generateResponse(prompt, context);
  }

  private buildContextualPrompt(prompt: string, context?: any): string {
    if (!context) return prompt;

    let contextualPrompt = prompt;
    
    if (context.userLocation) {
      contextualPrompt += `\n\nUser Location Context: ${context.userLocation}`;
    }
    
    if (context.recentInteractions) {
      contextualPrompt += `\n\nRecent User Interactions: ${context.recentInteractions.slice(0, 3).join(', ')}`;
    }
    
    if (context.businessPreferences) {
      contextualPrompt += `\n\nUser Business Preferences: ${JSON.stringify(context.businessPreferences)}`;
    }

    return contextualPrompt;
  }

  private parseBusinessAnalysis(response: string): BusinessAnalysis {
    // Simple parsing - in production, you'd want more robust parsing
    const sections = response.split(/\d+\.\s+/);
    
    return {
      marketPosition: this.extractSection(response, 'Market Position') || 'Analysis not available',
      competitiveAdvantages: this.extractListItems(response, 'Competitive Advantages'),
      growthOpportunities: this.extractListItems(response, 'Growth Opportunities'),
      riskFactors: this.extractListItems(response, 'Risk Factors'),
      recommendedActions: this.extractListItems(response, 'Recommended Actions')
    };
  }

  private parseMarketIntelligence(response: string): MarketIntelligence {
    return {
      trendAnalysis: this.extractSection(response, 'trends') || 'Trend analysis not available',
      competitorInsights: this.extractListItems(response, 'competitors'),
      fundingLandscape: this.extractSection(response, 'funding') || 'Funding information not available',
      opportunityAreas: this.extractListItems(response, 'opportunity'),
      marketSize: this.extractSection(response, 'market size') || 'Market size data not available'
    };
  }

  private parseBusinessRecommendations(response: string, businesses: any[]): any[] {
    // Parse the AI response and match with actual business data
    const recommendations = [];
    const lines = response.split('\n');
    
    let currentBusiness = null;
    let matchScore = 0;
    let reasons = [];
    
    for (const line of lines) {
      if (line.includes('Match Score')) {
        matchScore = parseInt(line.match(/\d+/)?.[0] || '0');
      } else if (line.includes('-') && line.length > 10) {
        reasons.push(line.replace(/^-\s*/, '').trim());
      } else if (line.trim() && businesses.some(b => line.includes(b.businessname))) {
        if (currentBusiness) {
          recommendations.push({
            business: currentBusiness,
            matchScore,
            reasons: reasons.slice(0, 4),
            confidence: matchScore > 70 ? 'high' : matchScore > 50 ? 'medium' : 'low'
          });
        }
        currentBusiness = businesses.find(b => line.includes(b.businessname));
        reasons = [];
      }
    }
    
    // Add the last business if exists
    if (currentBusiness) {
      recommendations.push({
        business: currentBusiness,
        matchScore,
        reasons: reasons.slice(0, 4),
        confidence: matchScore > 70 ? 'high' : matchScore > 50 ? 'medium' : 'low'
      });
    }
    
    return recommendations.slice(0, 5);
  }

  private extractSection(text: string, keyword: string): string | null {
    const regex = new RegExp(`${keyword}:?\\s*([^\\n]+(?:\\n(?!\\d+\\.|[A-Z][^:]*:)[^\\n]+)*)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }

  private extractListItems(text: string, section: string): string[] {
    const sectionMatch = text.match(new RegExp(`${section}:?([\\s\\S]*?)(?=\\d+\\.|$)`, 'i'));
    if (!sectionMatch) return [];
    
    const items = sectionMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(item => item.length > 0);
    
    return items.slice(0, 5); // Limit to 5 items
  }
}

export const geminiService = new GeminiService();
