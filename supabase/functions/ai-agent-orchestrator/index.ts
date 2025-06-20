
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agent, action, query, context, businessId } = await req.json();
    console.log('Agent orchestrator request:', { agent, action, query });

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    let result;

    switch (agent) {
      case 'connector':
        result = await handleConnectorAgent(supabase, action, query, context);
        break;
      
      case 'analyst':
        result = await handleAnalystAgent(supabase, action, query, context);
        break;
      
      case 'curator':
        result = await handleCuratorAgent(supabase, action, businessId, context);
        break;
      
      default:
        result = await handleGeneralAgent(supabase, query, context);
    }

    // Log the interaction
    await supabase.from('analytics_events').insert({
      event_type: 'agent_request',
      metadata: {
        agent,
        action,
        query_length: query?.length || 0,
        has_context: !!context
      }
    });

    return new Response(JSON.stringify({
      success: true,
      data: result,
      sessionId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Agent orchestrator error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      sessionId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleConnectorAgent(supabase: any, action: string, query: string, context: any) {
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('verified', true)
    .limit(20);

  if (error) throw error;

  // Simple matching algorithm
  const matches = businesses.map((business: any) => {
    let score = 0;
    const reasons = [];

    if (query && business.description?.toLowerCase().includes(query.toLowerCase())) {
      score += 40;
      reasons.push('Description match');
    }

    if (context?.industry && business.category?.toLowerCase().includes(context.industry.toLowerCase())) {
      score += 30;
      reasons.push('Industry match');
    }

    if (context?.location && business.location?.toLowerCase().includes(context.location.toLowerCase())) {
      score += 20;
      reasons.push('Location match');
    }

    if (business.verified) {
      score += 10;
      reasons.push('Verified business');
    }

    return {
      business,
      score,
      reasoning: reasons.join(', '),
      contextMatch: reasons
    };
  }).filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return {
    matches,
    totalMatches: matches.length,
    recommendations: [
      `Found ${matches.length} potential matches`,
      'Consider refining your search criteria for better results'
    ]
  };
}

async function handleAnalystAgent(supabase: any, action: string, query: string, context: any) {
  const sector = context?.industry || 'Technology';
  
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .ilike('category', `%${sector}%`);

  const competitorCount = businesses?.length || 0;

  return {
    insights: {
      sector,
      averageProjectCost: { min: 20000, max: 200000 },
      typicalTimeline: '3-6 months',
      marketTrend: 'growing',
      competitorCount,
      demandLevel: 'high',
      keyFactors: [
        'Alabama business-friendly environment',
        'Growing AI ecosystem',
        'Skilled workforce availability'
      ]
    },
    recommendations: [
      'Market shows strong growth potential',
      'Consider partnerships with local universities',
      'Leverage state AI incentives'
    ],
    riskFactors: [
      'Increasing competition in AI sector',
      'Talent acquisition challenges'
    ],
    opportunities: [
      'Government contracts available',
      'Healthcare AI initiatives',
      'Defense technology partnerships'
    ]
  };
}

async function handleCuratorAgent(supabase: any, action: string, businessId: number, context: any) {
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  if (error) throw error;

  // Generate enriched data
  const enrichedTags = [...(business.tags || [])];
  if (business.category?.toLowerCase().includes('ai')) {
    enrichedTags.push('AI Specialist');
  }
  if (business.location?.includes('Huntsville')) {
    enrichedTags.push('Aerospace Hub');
  }

  const dataQuality = assessDataQuality(business);

  return {
    enrichedBusinesses: [{
      business,
      enrichedTags: [...new Set(enrichedTags)],
      industryInsights: [
        'Strong market position in Alabama',
        'Access to skilled workforce'
      ],
      compatibilityScore: 75,
      dataQuality,
      lastEnriched: new Date()
    }],
    dataQualityReport: {
      totalProcessed: 1,
      highQuality: dataQuality === 'high' ? 1 : 0,
      mediumQuality: dataQuality === 'medium' ? 1 : 0,
      lowQuality: dataQuality === 'low' ? 1 : 0
    },
    suggestions: [
      'Consider adding more detailed service descriptions',
      'Update contact information if needed'
    ]
  };
}

async function handleGeneralAgent(supabase: any, query: string, context: any) {
  return {
    response: `I understand you're asking about: "${query}". How can I help you with Alabama's business ecosystem?`,
    suggestions: [
      'Try asking about specific businesses or industries',
      'Request market analysis for your sector',
      'Ask for business recommendations'
    ]
  };
}

function assessDataQuality(business: any): 'high' | 'medium' | 'low' {
  let score = 0;
  if (business.businessname) score += 1;
  if (business.description && business.description.length > 50) score += 2;
  if (business.website) score += 1;
  if (business.contactemail) score += 1;
  if (business.location) score += 1;
  if (business.verified) score += 2;

  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}
