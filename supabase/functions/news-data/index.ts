
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, category, type } = await req.json();
    
    // In production, you would use a real News API key stored in Supabase secrets
    // const newsApiKey = Deno.env.get('NEWS_API_KEY');
    
    // For now, return structured fallback data that matches the API format
    const fallbackArticles = [
      {
        title: `Alabama Business Update: ${category || 'Technology'} Sector Growth`,
        description: `Latest developments in Alabama's ${category || 'technology'} sector showing positive trends and new opportunities.`,
        url: 'https://example.com/news/1',
        publishedAt: new Date().toISOString(),
        source: { name: 'Alabama Business Journal' }
      },
      {
        title: 'Innovation Hub Expansion in Huntsville',
        description: 'New technology initiatives and partnerships announced for Alabama aerospace corridor.',
        url: 'https://example.com/news/2',
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        source: { name: 'Huntsville Times' }
      },
      {
        title: 'Healthcare Technology Partnerships Grow',
        description: 'Birmingham healthcare providers announce new AI and digital health initiatives.',
        url: 'https://example.com/news/3',
        publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        source: { name: 'Birmingham Business' }
      }
    ];

    return new Response(JSON.stringify({ 
      articles: fallbackArticles,
      totalResults: fallbackArticles.length,
      status: 'ok'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in news-data function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
