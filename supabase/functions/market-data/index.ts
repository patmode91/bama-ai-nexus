
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
    const { symbols, type } = await req.json();
    
    // In production, you would use Alpha Vantage API or similar
    // const alphaVantageKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    
    if (type === 'stocks' && symbols) {
      // Generate realistic mock stock data
      const stocks = symbols.map((symbol: string) => {
        const basePrice = 50 + Math.random() * 200;
        const change = (Math.random() - 0.5) * 10;
        const changePercent = (change / basePrice) * 100;
        
        return {
          symbol,
          price: Number(basePrice.toFixed(2)),
          change: Number(change.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          lastUpdated: new Date().toISOString()
        };
      });

      return new Response(JSON.stringify({ 
        stocks,
        status: 'success'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Invalid request parameters' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in market-data function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
