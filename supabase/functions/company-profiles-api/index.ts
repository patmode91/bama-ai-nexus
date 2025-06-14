
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const method = req.method;
    
    // Extract company ID if provided
    const companyId = segments[segments.length - 1];
    const isNumericId = !isNaN(Number(companyId));

    switch (method) {
      case 'GET':
        if (isNumericId) {
          // Get single company
          const { data: company, error } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', companyId)
            .single();

          if (error) throw error;
          
          return new Response(JSON.stringify(company), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get all companies with filters
          const { searchParams } = url;
          const limit = searchParams.get('limit') || '50';
          const offset = searchParams.get('offset') || '0';
          const category = searchParams.get('category');
          const location = searchParams.get('location');
          const verified = searchParams.get('verified');

          let query = supabase
            .from('businesses')
            .select('*')
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
            .order('created_at', { ascending: false });

          if (category) query = query.eq('category', category);
          if (location) query = query.ilike('location', `%${location}%`);
          if (verified !== null) query = query.eq('verified', verified === 'true');

          const { data: companies, error } = await query;
          if (error) throw error;

          return new Response(JSON.stringify(companies), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        // Create new company
        const newCompanyData = await req.json();
        
        const { data: newCompany, error: createError } = await supabase
          .from('businesses')
          .insert(newCompanyData)
          .select()
          .single();

        if (createError) throw createError;

        return new Response(JSON.stringify(newCompany), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        if (!isNumericId) {
          throw new Error('Company ID required for update');
        }
        
        // Update company
        const updateData = await req.json();
        
        const { data: updatedCompany, error: updateError } = await supabase
          .from('businesses')
          .update(updateData)
          .eq('id', companyId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify(updatedCompany), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        if (!isNumericId) {
          throw new Error('Company ID required for deletion');
        }
        
        // Delete company
        const { error: deleteError } = await supabase
          .from('businesses')
          .delete()
          .eq('id', companyId);

        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response('Method not allowed', { 
          status: 405,
          headers: corsHeaders 
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
