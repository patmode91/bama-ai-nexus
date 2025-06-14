
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  context?: {
    userLocation?: string;
    industry?: string;
    companySize?: string;
    recentInteractions?: string[];
    businessPreferences?: any;
  };
  type: 'chat' | 'business_analysis' | 'market_intelligence' | 'recommendations';
  businessId?: number;
  sector?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GOOGLE_AI_API_KEY) {
      throw new Error('Google AI API key not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { message, context, type, businessId, sector }: ChatRequest = await req.json();

    let response;

    switch (type) {
      case 'chat':
        response = await handleChatRequest(message, context, GOOGLE_AI_API_KEY);
        break;
      
      case 'business_analysis':
        if (!businessId) throw new Error('Business ID required for analysis');
        response = await handleBusinessAnalysis(businessId, supabase, GOOGLE_AI_API_KEY);
        break;
      
      case 'market_intelligence':
        response = await handleMarketIntelligence(sector || 'general', context?.userLocation, GOOGLE_AI_API_KEY);
        break;
      
      case 'recommendations':
        response = await handleBusinessRecommendations(context, supabase, GOOGLE_AI_API_KEY);
        break;
      
      default:
        throw new Error('Invalid request type');
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Enhanced BamaBot error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: "I'm experiencing some technical difficulties. Please try asking your question in a different way, or check back in a few moments."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleChatRequest(message: string, context: any, apiKey: string) {
  const alabamaContext = `
Alabama Business Ecosystem Knowledge:
- Economic Hubs: Birmingham (finance, healthcare, tech), Huntsville (aerospace, defense tech), Mobile (manufacturing, logistics), Montgomery (government, automotive)
- Key Industries: Aerospace & Defense, Automotive Manufacturing, Healthcare & Biotech, Financial Services, Technology & AI
- Major Employers: Boeing, Mercedes-Benz, Honda, Hyundai, UAB Health System, Children's Hospital, ADTRAN, Shipt, BBVA
- Universities: Auburn University, University of Alabama, UAB, Alabama A&M, Troy University
- Tech Growth: $45M+ in recent AI/tech investments, Alabama Innovation Fund, growing startup ecosystem
- Strengths: Low cost of living, business-friendly policies, skilled workforce, strong university partnerships
- AI Opportunities: Manufacturing automation, healthcare analytics, aerospace simulation, financial services, agriculture tech
`;

  const enhancedPrompt = `${alabamaContext}

User Context: ${JSON.stringify(context || {})}
User Message: "${message}"

As BamaBot 2.0, Alabama's premier AI business assistant, provide a comprehensive, helpful response that:

1. Directly addresses the user's question with specific, actionable information
2. Incorporates relevant Alabama business ecosystem knowledge
3. Suggests specific businesses, opportunities, or resources when appropriate
4. References actual Alabama locations, companies, or institutions where relevant
5. Provides clear next steps or recommendations
6. Maintains an enthusiastic but professional tone about Alabama's business potential

If discussing businesses or opportunities, be specific about locations (Birmingham, Huntsville, Mobile, etc.) and mention relevant local resources, companies, or institutions.

Keep responses conversational but informative, and always aim to connect users with Alabama's business ecosystem.`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: enhancedPrompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.candidates[0]?.content?.parts[0]?.text || 'I apologize, but I couldn\'t generate a response. Please try rephrasing your question.';

  return {
    response: aiResponse,
    type: 'chat',
    confidence: 'high',
    suggestions: generateFollowUpSuggestions(message, context)
  };
}

async function handleBusinessAnalysis(businessId: number, supabase: any, apiKey: string) {
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  if (error || !business) {
    throw new Error('Business not found');
  }

  const analysisPrompt = `Analyze this Alabama business and provide strategic insights:

Business: ${business.businessname}
Category: ${business.category}
Location: ${business.location}
Description: ${business.description}
Employees: ${business.employees_count || 'Unknown'}
Founded: ${business.founded_year || 'Unknown'}
Website: ${business.website || 'Not provided'}

Provide a comprehensive business analysis in JSON format with these sections:
{
  "marketPosition": "One paragraph assessment of their market position in Alabama",
  "competitiveAdvantages": ["3-5 specific competitive advantages"],
  "growthOpportunities": ["3-5 specific growth opportunities in Alabama market"],
  "riskFactors": ["3-4 potential business risks"],
  "recommendedActions": ["3-5 actionable recommendations"],
  "alabamaConnections": ["Relevant Alabama resources, partners, or opportunities"]
}

Focus on Alabama's business ecosystem, including local partnerships, university connections, state resources, and sector-specific opportunities.`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: analysisPrompt }]
      }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1536,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.candidates[0]?.content?.parts[0]?.text || '{}';

  try {
    const analysis = JSON.parse(aiResponse.replace(/```json\n?|\n?```/g, ''));
    return {
      business,
      analysis,
      type: 'business_analysis',
      confidence: 'high'
    };
  } catch (parseError) {
    console.error('Failed to parse analysis JSON:', parseError);
    return {
      business,
      analysis: {
        marketPosition: 'Analysis temporarily unavailable',
        competitiveAdvantages: ['Established presence in Alabama market'],
        growthOpportunities: ['Digital transformation opportunities'],
        riskFactors: ['Market competition'],
        recommendedActions: ['Continue building local partnerships'],
        alabamaConnections: ['Connect with local business networks']
      },
      type: 'business_analysis',
      confidence: 'medium'
    };
  }
}

async function handleMarketIntelligence(sector: string, location: string = 'Alabama', apiKey: string) {
  const intelligencePrompt = `Provide comprehensive market intelligence for the ${sector} sector in ${location}:

Generate a detailed market analysis in JSON format:
{
  "trendAnalysis": "Current market trends and growth patterns",
  "competitorLandscape": ["Key competitors and market leaders"],
  "fundingActivity": "Recent funding and investment activity",
  "opportunityAreas": ["Emerging opportunity areas"],
  "marketSize": "Market size and growth potential",
  "alabamaAdvantages": ["Specific advantages of operating in Alabama"],
  "keyPlayerProfiles": [{"name": "Company", "focus": "Description"}],
  "recommendedStrategies": ["Strategic recommendations for entering/growing in this market"]
}

Focus on actionable insights for businesses in Alabama's ecosystem. Include specific data points where possible and highlight AI/technology integration opportunities.`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: intelligencePrompt }]
      }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1536,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.candidates[0]?.content?.parts[0]?.text || '{}';

  try {
    const intelligence = JSON.parse(aiResponse.replace(/```json\n?|\n?```/g, ''));
    return {
      sector,
      location,
      intelligence,
      type: 'market_intelligence',
      confidence: 'high',
      lastUpdated: new Date().toISOString()
    };
  } catch (parseError) {
    console.error('Failed to parse intelligence JSON:', parseError);
    return {
      sector,
      location,
      intelligence: {
        trendAnalysis: 'Market analysis temporarily unavailable',
        competitorLandscape: ['Analysis in progress'],
        fundingActivity: 'Funding data being compiled',
        opportunityAreas: ['Emerging opportunities identified'],
        marketSize: 'Market sizing in progress',
        alabamaAdvantages: ['Strong business environment', 'Skilled workforce'],
        keyPlayerProfiles: [],
        recommendedStrategies: ['Continue market research']
      },
      type: 'market_intelligence',
      confidence: 'medium',
      lastUpdated: new Date().toISOString()
    };
  }
}

async function handleBusinessRecommendations(context: any, supabase: any, apiKey: string) {
  // Get businesses from database
  let query = supabase.from('businesses').select('*');
  
  if (context?.userLocation) {
    query = query.ilike('location', `%${context.userLocation}%`);
  }
  
  const { data: businesses, error } = await query.limit(20);
  
  if (error) {
    throw new Error('Failed to fetch businesses');
  }

  const recommendationPrompt = `As Alabama's AI business advisor, analyze these businesses and provide personalized recommendations:

User Profile:
${JSON.stringify(context || {}, null, 2)}

Available Businesses:
${businesses.map(b => `- ${b.businessname} (${b.category}, ${b.location}): ${b.description?.slice(0, 150)}...`).join('\n')}

Provide recommendations in JSON format:
{
  "recommendations": [
    {
      "businessName": "Company Name",
      "matchScore": 85,
      "matchReasons": ["Reason 1", "Reason 2", "Reason 3"],
      "collaborationOpportunities": ["Opportunity 1", "Opportunity 2"],
      "nextSteps": ["Action 1", "Action 2"],
      "confidence": "high"
    }
  ],
  "summary": "Brief summary of why these matches were selected"
}

Rank by relevance and provide top 5 matches. Focus on Alabama-specific advantages and local opportunities.`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: recommendationPrompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.candidates[0]?.content?.parts[0]?.text || '{}';

  try {
    const recommendationData = JSON.parse(aiResponse.replace(/```json\n?|\n?```/g, ''));
    
    // Match AI recommendations with actual business objects
    const enrichedRecommendations = recommendationData.recommendations?.map((rec: any) => {
      const business = businesses.find(b => 
        b.businessname.toLowerCase().includes(rec.businessName.toLowerCase()) ||
        rec.businessName.toLowerCase().includes(b.businessname.toLowerCase())
      );
      
      return {
        business: business || { businessname: rec.businessName },
        matchScore: rec.matchScore || 75,
        matchReasons: rec.matchReasons || ['Good potential match'],
        collaborationOpportunities: rec.collaborationOpportunities || ['Partnership opportunities'],
        nextSteps: rec.nextSteps || ['Contact for more information'],
        confidence: rec.confidence || 'medium'
      };
    }) || [];

    return {
      recommendations: enrichedRecommendations.slice(0, 5),
      summary: recommendationData.summary || 'Personalized business recommendations based on your profile',
      type: 'recommendations',
      confidence: 'high'
    };
  } catch (parseError) {
    console.error('Failed to parse recommendations JSON:', parseError);
    
    // Fallback recommendations
    const fallbackRecommendations = businesses.slice(0, 3).map(business => ({
      business,
      matchScore: 70,
      matchReasons: ['Local Alabama business', 'Verified company profile'],
      collaborationOpportunities: ['Partnership potential', 'Service collaboration'],
      nextSteps: ['Contact directly', 'Schedule consultation'],
      confidence: 'medium'
    }));

    return {
      recommendations: fallbackRecommendations,
      summary: 'Basic recommendations based on available businesses',
      type: 'recommendations',
      confidence: 'medium'
    };
  }
}

function generateFollowUpSuggestions(message: string, context: any): string[] {
  const suggestions = [
    "Tell me about Birmingham's tech scene",
    "What AI companies are in Huntsville?",
    "Show me healthcare businesses in Alabama",
    "Find aerospace companies near me",
    "What are the latest market trends?"
  ];

  if (message.toLowerCase().includes('funding')) {
    suggestions.unshift("What funding opportunities are available in Alabama?");
  }
  
  if (message.toLowerCase().includes('startup')) {
    suggestions.unshift("Connect me with startup resources in Alabama");
  }

  return suggestions.slice(0, 3);
}
