
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CompanyProfile {
  businessname: string;
  description?: string;
  website?: string;
  contactemail?: string;
  location?: string;
  category?: string;
  tags?: string[];
  employees_count?: number;
  founded_year?: number;
}

// Seed data for Alabama AI companies
const seedCompanies: CompanyProfile[] = [
  {
    businessname: "Shipt",
    description: "Same-day delivery marketplace powered by AI-driven logistics optimization and demand forecasting",
    website: "https://www.shipt.com",
    location: "Birmingham, AL",
    category: "E-commerce & Logistics AI",
    tags: ["Machine Learning", "Logistics", "Demand Forecasting", "Marketplace"],
    employees_count: 1000,
    founded_year: 2014
  },
  {
    businessname: "ADTRAN",
    description: "Telecommunications equipment company leveraging AI for network optimization and predictive maintenance",
    website: "https://www.adtran.com",
    location: "Huntsville, AL",
    category: "Telecommunications AI",
    tags: ["Network Optimization", "Predictive Maintenance", "IoT", "5G"],
    employees_count: 2000,
    founded_year: 1985
  },
  {
    businessname: "Velocity Credit Union",
    description: "Financial institution using AI for fraud detection, customer service automation, and risk assessment",
    website: "https://www.velocitycu.com",
    location: "Austin, TX / Birmingham, AL",
    category: "Financial AI",
    tags: ["Fraud Detection", "Chatbots", "Risk Assessment", "Customer Service"],
    employees_count: 500,
    founded_year: 1949
  },
  {
    businessname: "Dynetics",
    description: "Engineering and applied sciences company developing AI solutions for aerospace and defense applications",
    website: "https://www.dynetics.com",
    location: "Huntsville, AL",
    category: "Aerospace & Defense AI",
    tags: ["Computer Vision", "Autonomous Systems", "Defense Technology", "Robotics"],
    employees_count: 2500,
    founded_year: 1974
  },
  {
    businessname: "Torch Technologies",
    description: "Small business providing AI and machine learning solutions for government and commercial clients",
    website: "https://www.torchtechnologies.com",
    location: "Huntsville, AL",
    category: "AI Consulting",
    tags: ["Machine Learning", "Data Analytics", "Government Solutions", "Computer Vision"],
    employees_count: 150,
    founded_year: 2002
  }
];

async function generateCompanyDescription(companyName: string, website?: string): Promise<string> {
  if (!openaiApiKey) {
    return `${companyName} is an innovative AI company based in Alabama, providing cutting-edge solutions and services.`;
  }

  try {
    const prompt = `Generate a professional, SEO-friendly description for an AI company called "${companyName}" ${website ? `with website ${website}` : ''}. The description should be 2-3 sentences, highlight their AI capabilities, and mention their location in Alabama. Keep it factual and professional.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional copywriter specializing in technology company descriptions.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || `${companyName} is an innovative AI company providing advanced solutions and services.`;
  } catch (error) {
    console.error('Error generating description:', error);
    return `${companyName} is an innovative AI company based in Alabama, providing cutting-edge solutions and services.`;
  }
}

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  for (const company of seedCompanies) {
    try {
      // Check if company already exists
      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('businessname', company.businessname)
        .single();

      if (existing) {
        console.log(`Company ${company.businessname} already exists, skipping...`);
        continue;
      }

      // Generate description if not provided
      if (!company.description) {
        company.description = await generateCompanyDescription(company.businessname, company.website);
      }

      // Insert company
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          ...company,
          verified: true, // Mark seed companies as verified
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error(`Error inserting ${company.businessname}:`, error);
      } else {
        console.log(`Successfully added ${company.businessname} with ID ${data.id}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error processing ${company.businessname}:`, error);
    }
  }
  
  console.log('Database seeding completed');
}

async function enrichProfile(companyId: string) {
  try {
    const { data: company, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', companyId)
      .single();

    if (error) throw error;

    // Generate enhanced description if needed
    if (!company.description || company.description.length < 50) {
      const enhancedDescription = await generateCompanyDescription(
        company.businessname,
        company.website
      );

      await supabase
        .from('businesses')
        .update({
          description: enhancedDescription,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId);

      console.log(`Enhanced description for ${company.businessname}`);
    }

    return { success: true, message: 'Profile enriched successfully' };
  } catch (error) {
    console.error('Error enriching profile:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'seed':
        await seedDatabase();
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Database seeding initiated' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'enrich':
        const companyId = url.searchParams.get('companyId');
        if (!companyId) {
          throw new Error('Company ID required for enrichment');
        }
        
        const result = await enrichProfile(companyId);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'status':
        // Return curator status
        const { count } = await supabase
          .from('businesses')
          .select('*', { count: 'exact', head: true });

        return new Response(JSON.stringify({
          totalCompanies: count,
          lastRun: new Date().toISOString(),
          status: 'active'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({
          error: 'Invalid action. Use: seed, enrich, or status'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Curator Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
