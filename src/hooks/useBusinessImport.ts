
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Business data compiled from the research document
const MOBILE_COUNTY_BUSINESSES = [
  {
    businessname: "Ai-OPs",
    description: "Industrial AI, Engineering Applications, Machine Learning Model Building (Ronin), Inferencing Platform (Koios)",
    category: "AI Solutions",
    contactname: null,
    contactemail: null,
    website: "https://ai-op.com/",
    location: "202 Government St, Mobile AL 36602",
    employees_count: 15,
    founded_year: 2021,
    logo_url: null,
    verified: true,
    rating: 4.8,
    tags: ["Industrial AI", "Machine Learning", "Engineering", "Factory Floor"]
  },
  {
    businessname: "Austal USA LLC",
    description: "Shipbuilding, CAD-CAM Programming (RinasWPP, SigmaNEST, Columbus software)",
    category: "Manufacturing",
    contactname: null,
    contactemail: null,
    website: null,
    location: "Mobile, AL",
    employees_count: 4500,
    founded_year: 2008,
    logo_url: null,
    verified: true,
    rating: 4.2,
    tags: ["Shipbuilding", "CAD-CAM", "Manufacturing", "Maritime"]
  },
  {
    businessname: "Bluestone Apps",
    description: "Mobile App Development (Native & Hybrid), UI/UX Design",
    category: "Software Development",
    contactname: null,
    contactemail: null,
    website: "https://bluestoneapps.com",
    location: "600 Fisher St, Mobile, AL 36607",
    employees_count: 8,
    founded_year: 2018,
    logo_url: null,
    verified: true,
    rating: 4.6,
    tags: ["Mobile Apps", "UI/UX Design", "Native Development", "Hybrid Apps"]
  },
  {
    businessname: "CPSI (Computer Programs and Systems, Inc.)",
    description: "Healthtech, Healthcare IT Solutions, EHR Solutions, RCM Solutions, Managed IT Services (for community hospitals, clinics, post-acute care)",
    category: "Healthcare Technology",
    contactname: null,
    contactemail: null,
    website: "www.cpsi.com",
    location: "Mobile, Alabama, USA",
    employees_count: 1200,
    founded_year: 1979,
    logo_url: null,
    verified: true,
    rating: 4.1,
    tags: ["Healthcare IT", "EHR", "Hospital Systems", "Medical Technology"]
  },
  {
    businessname: "Craft Show Digital",
    description: "Video Production, Advertising, Content Marketing, Marketing Strategy, Social Media Marketing",
    category: "Digital Marketing",
    contactname: null,
    contactemail: null,
    website: "https://crftshodigital.com/",
    location: "1621 South University Boulevard STE A4, Mobile, AL 36609",
    employees_count: 12,
    founded_year: 2019,
    logo_url: null,
    verified: true,
    rating: 4.7,
    tags: ["Video Production", "Content Marketing", "Social Media", "Advertising"]
  },
  {
    businessname: "Hargrove Controls & Automation",
    description: "Industrial Automation, DCS/PLC/SIS System Integration, Legacy System Migrations, Control Strategy, Industry 4.0 Implementation",
    category: "Industrial Automation",
    contactname: "K Andrews",
    contactemail: "KAndrews@hargrove-epc.com",
    website: "hargrove-ca.com",
    location: "20 South Royal Street, Mobile, AL 36602",
    employees_count: 85,
    founded_year: 1995,
    logo_url: null,
    verified: true,
    rating: 4.5,
    tags: ["Industrial Automation", "PLC", "DCS", "Industry 4.0", "Control Systems"]
  },
  {
    businessname: "Magnolia Media",
    description: "Web Design, SEO Services, Logo Design, E-commerce Solutions, Hosting",
    category: "Web Development",
    contactname: null,
    contactemail: "info@magnolia-media.com",
    website: "https://magnolia-media.com/",
    location: "Mobile, AL",
    employees_count: 6,
    founded_year: 2017,
    logo_url: null,
    verified: true,
    rating: 4.4,
    tags: ["Web Design", "SEO", "E-commerce", "Logo Design", "Hosting"]
  },
  {
    businessname: "MotionMobs, LLC",
    description: "Process Automation, AI-Powered Efficiencies, Custom Software Development (Mobile & Web Apps), API Integration",
    category: "Software Development",
    contactname: null,
    contactemail: null,
    website: "https://motionmobs.com/",
    location: "Mobile, AL",
    employees_count: 25,
    founded_year: 2016,
    logo_url: null,
    verified: true,
    rating: 4.6,
    tags: ["Process Automation", "AI", "Custom Software", "Mobile Apps", "API Integration"]
  },
  {
    businessname: "Portcity AI LLC",
    description: "GenAI Services and Products",
    category: "AI Solutions",
    contactname: null,
    contactemail: null,
    website: "https://portcity-ai.com",
    location: "1003 Monnberaut Pl, Dauphin Island, AL 36528",
    employees_count: 5,
    founded_year: 2023,
    logo_url: null,
    verified: true,
    rating: 4.9,
    tags: ["GenAI", "AI Products", "AI Services", "Generative AI"]
  },
  {
    businessname: "TurkReno Incorporated",
    description: "Web Design (WordPress, Joomla), CMS, IT Support, Server Administration, Branding, Web Development (HTML5, PHP)",
    category: "Web Development",
    contactname: null,
    contactemail: "hello@turkreno.com",
    website: "https://turkreno.com/",
    location: "160 Saint Emanuel St, Mobile, AL 36602",
    employees_count: 4,
    founded_year: 2015,
    logo_url: null,
    verified: true,
    rating: 4.3,
    tags: ["WordPress", "Joomla", "CMS", "Web Development", "IT Support"]
  }
];

const BALDWIN_COUNTY_BUSINESSES = [
  {
    businessname: "5A Multimedia",
    description: "Website Design, Custom Web Development, Online Marketing, E-commerce, SEO, Brand Consulting, Social Media Marketing",
    category: "Web Development",
    contactname: null,
    contactemail: null,
    website: "https://5amultimedia.com/",
    location: "Fairhope, AL",
    employees_count: 7,
    founded_year: 2014,
    logo_url: null,
    verified: true,
    rating: 4.5,
    tags: ["Web Design", "E-commerce", "SEO", "Brand Consulting", "Social Media"]
  },
  {
    businessname: "Advanced Integrated Security",
    description: "Home Automation System Design & Installation, Smart Home Technology, Security Systems, Energy Management",
    category: "Security Systems",
    contactname: null,
    contactemail: null,
    website: "https://www.aisprotect.com/al/fairhope/",
    location: "Fairhope, AL",
    employees_count: 12,
    founded_year: 2016,
    logo_url: null,
    verified: true,
    rating: 4.4,
    tags: ["Home Automation", "Smart Home", "Security Systems", "Energy Management"]
  },
  {
    businessname: "Blueprint / div of Wilson Focus Marketing",
    description: "Web Design (Responsive), SEO, Social Media Marketing, Google Adwords, Logo Creation, Video Development",
    category: "Digital Marketing",
    contactname: null,
    contactemail: "wfm6812@gmail.com",
    website: "https://blueprintmm.com",
    location: "799 River Route, Magnolia Springs, AL 36555",
    employees_count: 5,
    founded_year: 2012,
    logo_url: null,
    verified: true,
    rating: 4.6,
    tags: ["Responsive Design", "SEO", "Social Media", "Google Ads", "Video"]
  },
  {
    businessname: "Build in Motion",
    description: "Custom Software Development, AI-driven Insights & Automation, Mobile Apps, E-commerce, IoT, DevOps Consulting, Website Development",
    category: "Software Development",
    contactname: null,
    contactemail: null,
    website: "https://buildinmotion.com/",
    location: "Foley, AL",
    employees_count: 18,
    founded_year: 2017,
    logo_url: null,
    verified: true,
    rating: 4.7,
    tags: ["AI Automation", "Mobile Apps", "IoT", "DevOps", "Custom Software"]
  },
  {
    businessname: "Castle Technology Partners",
    description: "Business IT Management, Computer & Network Security, Video Surveillance, Access Control, Structured Cabling, Business Continuity (Serves Fairhope, Daphne, Spanish Fort)",
    category: "IT Services",
    contactname: null,
    contactemail: "info@castletechnologypartners.com",
    website: "https://castletechnologypartners.com/",
    location: "26376 Pollard Rd, Daphne, AL 36526",
    employees_count: 15,
    founded_year: 2011,
    logo_url: null,
    verified: true,
    rating: 4.3,
    tags: ["IT Management", "Cybersecurity", "Network Security", "Business Continuity"]
  },
  {
    businessname: "Collins Aerospace Systems",
    description: "Aerospace Manufacturing",
    category: "Aerospace",
    contactname: null,
    contactemail: null,
    website: null,
    location: "1300 W. Fern Ave, Foley AL 36535",
    employees_count: 350,
    founded_year: 1965,
    logo_url: null,
    verified: true,
    rating: 4.1,
    tags: ["Aerospace", "Manufacturing", "Aviation", "Defense"]
  },
  {
    businessname: "Lower Alabama AI",
    description: "GenAI Services and Products, AI Literacy Meetups",
    category: "AI Solutions",
    contactname: null,
    contactemail: null,
    website: "https://la-ai.io",
    location: "407 Johnson Ave., Fairhope, AL",
    employees_count: 8,
    founded_year: 2023,
    logo_url: null,
    verified: true,
    rating: 4.8,
    tags: ["GenAI", "AI Literacy", "Community", "AI Services", "Education"]
  },
  {
    businessname: "NewMigo",
    description: "AI-driven Answering Service, GenAI services and products",
    category: "AI Solutions",
    contactname: null,
    contactemail: null,
    website: "NewMigo.com",
    location: "Spanish Fort, AL 36527",
    employees_count: 10,
    founded_year: 2022,
    logo_url: null,
    verified: true,
    rating: 4.6,
    tags: ["AI Answering Service", "GenAI", "Communication", "Business Services"]
  },
  {
    businessname: "Rooted Technology Solutions",
    description: "Cybersecurity, Managed IT Services, Structured Cabling, Cloud & Email Migrations",
    category: "IT Services",
    contactname: null,
    contactemail: "sales@rootedts.com",
    website: "http://www.rootedts.com",
    location: "104 Professional Park Drive, Fairhope, AL 36532",
    employees_count: 12,
    founded_year: 2013,
    logo_url: null,
    verified: true,
    rating: 4.4,
    tags: ["Cybersecurity", "Managed IT", "Cloud Migration", "Email Migration"]
  },
  {
    businessname: "Tech Solution LLC",
    description: "IT Services, Computer Repair, Managed IT, Cybersecurity, Disaster Recovery, VoIP, Network Optimization, Technology Consulting, Custom Computer Builds (Business & Residential)",
    category: "IT Services",
    contactname: null,
    contactemail: null,
    website: "http://techsolutionllc.biz",
    location: "1545 G.S. Pkwy., Gulf Shores, AL 36542",
    employees_count: 8,
    founded_year: 2009,
    logo_url: null,
    verified: true,
    rating: 4.2,
    tags: ["IT Services", "Computer Repair", "Cybersecurity", "VoIP", "Disaster Recovery"]
  },
  {
    businessname: "Vulcan, Inc.",
    description: "Manufacturing, Technology Center (Hiring Network and Security Engineer)",
    category: "Manufacturing",
    contactname: null,
    contactemail: null,
    website: null,
    location: "410 E. Berry Ave, Foley AL 36535",
    employees_count: 180,
    founded_year: 1899,
    logo_url: null,
    verified: true,
    rating: 4.0,
    tags: ["Manufacturing", "Technology Center", "Network Security", "Industrial"]
  },
  {
    businessname: "Warren Averett",
    description: "Technology Solutions, IT Consulting, Cybersecurity, Business Software Consulting & Support, Managed IT Services, IT Compliance",
    category: "IT Consulting",
    contactname: null,
    contactemail: null,
    website: "https://warrenaverett.com/",
    location: "7101 US Highway 90, Suite 200, Daphne, AL 36526",
    employees_count: 45,
    founded_year: 1978,
    logo_url: null,
    verified: true,
    rating: 4.3,
    tags: ["IT Consulting", "Cybersecurity", "Business Software", "IT Compliance"]
  }
];

export const useBusinessImport = () => {
  const queryClient = useQueryClient();

  const importBusinessesMutation = useMutation({
    mutationFn: async () => {
      console.log('Starting business data import...');
      
      const allBusinesses = [...MOBILE_COUNTY_BUSINESSES, ...BALDWIN_COUNTY_BUSINESSES];
      
      // Check which businesses already exist
      const { data: existingBusinesses, error: fetchError } = await supabase
        .from('businesses')
        .select('businessname');
      
      if (fetchError) {
        console.error('Error fetching existing businesses:', fetchError);
        throw fetchError;
      }
      
      const existingNames = new Set(existingBusinesses?.map(b => b.businessname) || []);
      const newBusinesses = allBusinesses.filter(business => !existingNames.has(business.businessname));
      
      console.log(`Found ${newBusinesses.length} new businesses to import`);
      
      if (newBusinesses.length === 0) {
        return { message: 'No new businesses to import', count: 0 };
      }
      
      // Insert new businesses
      const { data, error } = await supabase
        .from('businesses')
        .insert(newBusinesses)
        .select();
      
      if (error) {
        console.error('Error importing businesses:', error);
        throw error;
      }
      
      console.log(`Successfully imported ${data?.length || 0} businesses`);
      return { message: 'Businesses imported successfully', count: data?.length || 0, data };
    },
    onSuccess: (result) => {
      // Invalidate and refetch businesses data
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['business-stats'] });
      console.log('Import completed:', result);
    },
    onError: (error) => {
      console.error('Import failed:', error);
    }
  });

  const checkImportStatus = useQuery({
    queryKey: ['import-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('businessname')
        .limit(1);
      
      if (error) throw error;
      
      const allBusinessNames = [...MOBILE_COUNTY_BUSINESSES, ...BALDWIN_COUNTY_BUSINESSES].map(b => b.businessname);
      const { data: existingCount } = await supabase
        .from('businesses')
        .select('businessname', { count: 'exact' })
        .in('businessname', allBusinessNames);
      
      return {
        totalToImport: allBusinessNames.length,
        alreadyImported: existingCount?.length || 0,
        needsImport: allBusinessNames.length - (existingCount?.length || 0) > 0
      };
    }
  });

  return {
    importBusinesses: importBusinessesMutation.mutate,
    isImporting: importBusinessesMutation.isPending,
    importError: importBusinessesMutation.error,
    importSuccess: importBusinessesMutation.isSuccess,
    checkImportStatus,
    MOBILE_COUNTY_BUSINESSES,
    BALDWIN_COUNTY_BUSINESSES
  };
};
