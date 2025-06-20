
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, type = 'chat', context, businessId, sector } = await req.json();
    console.log('Enhanced BamaBot request:', { message, type, context });

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Build context-aware prompt
    let systemPrompt = `You are BamaBot 2.0, Alabama's premier AI business intelligence assistant. You specialize in connecting businesses, providing market insights, and facilitating partnerships within Alabama's thriving AI and technology ecosystem.

Key Alabama Business Hubs:
- Birmingham: Healthcare, finance, AI startups
- Huntsville: Aerospace, defense tech, research
- Mobile: Manufacturing, logistics, port operations
- Montgomery: Government tech, healthcare systems

Your capabilities:
1. Business matchmaking and recommendations
2. Market intelligence and trend analysis
3. Partnership facilitation
4. Investment landscape insights
5. Regulatory and compliance guidance

Always provide specific, actionable insights with Alabama context.`;

    // Add business-specific context if provided
    if (businessId) {
      const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();
      
      if (business) {
        systemPrompt += `\n\nCurrent business context: ${business.businessname} (${business.category}) located in ${business.location}. Description: ${business.description}`;
      }
    }

    // Add sector context
    if (sector) {
      systemPrompt += `\n\nFocus sector: ${sector}`;
    }

    // Get recent businesses for context
    const { data: recentBusinesses } = await supabase
      .from('businesses')
      .select('businessname, category, location, description')
      .eq('verified', true)
      .limit(10);

    if (recentBusinesses && recentBusinesses.length > 0) {
      systemPrompt += `\n\nRecent Alabama AI/Tech businesses: ${recentBusinesses.map(b => `${b.businessname} (${b.category})`).join(', ')}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const aiResponse = data.choices[0].message.content;

    // Log interaction for analytics
    await supabase.from('analytics_events').insert({
      event_type: 'bamabot_interaction',
      metadata: {
        message_type: type,
        response_length: aiResponse.length,
        context_provided: !!context,
        business_id: businessId,
        sector
      }
    });

    return new Response(JSON.stringify({
      response: aiResponse,
      type: type,
      timestamp: new Date().toISOString(),
      context: context
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Enhanced BamaBot error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
