
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const ALABAMA_AI_COMPANIES = [
  {
    businessname: "1st Edge",
    description: "Business information not fully available in provided data",
    category: "Technology",
    website: null,
    location: "Alabama",
    employees_count: 25, // Mid-point of 10-49 range
    founded_year: null,
    verified: false,
    tags: ["SME"],
    contactemail: null,
    contactname: null,
    phone: null
  },
  {
    businessname: "Acclinate",
    description: "Acclinate is a digital health company using AI to address the critical challenge of diversity and inclusion in clinical trials. Through its innovative Enhanced Diversity in Clinical Trials (e-DICT) platform, Acclinate applies AI-powered predictive analytics to identify, engage, and retain traditionally underrepresented populations in clinical research.",
    category: "Digital Health AI",
    website: "https://www.acclinate.com/",
    location: "601 Genome Way, Huntsville, AL 35806",
    employees_count: null,
    founded_year: 2020,
    verified: false,
    tags: ["Digital Health", "Clinical Trials", "Predictive Analytics", "Healthcare AI"],
    contactemail: null,
    contactname: null,
    phone: null
  },
  {
    businessname: "Adtran",
    description: "Adtran is a leading global provider of networking and communications equipment. The company's portfolio includes solutions for fiber access, aggregation, and optical networking. Adtran leverages cloud economics, data analytics, and machine learning to create multi-gigabit platforms that power voice, data, and video services.",
    category: "Networking & Communications",
    website: "https://www.adtran.com/",
    location: "901 Explorer Boulevard, Huntsville, AL 35806",
    employees_count: 3099,
    founded_year: 1985,
    verified: true,
    tags: ["Machine Learning", "Data Analytics", "Networking", "SaaS"],
    contactemail: "investor.relations@adtran.com",
    contactname: null,
    phone: "(256) 963-8000"
  },
  {
    businessname: "Aggressive Hunt",
    description: "Aggressive Hunt is a recruitment and staffing company that integrates artificial intelligence, including generative AI, with experienced recruiters to deliver tailored talent solutions. The company provides customized recruitment strategies to help businesses find the best candidates.",
    category: "AI-Powered Recruitment",
    website: "https://aggressivehunt.com/",
    location: "3348 Monte Doro Drive, Hoover, AL 35215",
    employees_count: null,
    founded_year: null,
    verified: false,
    tags: ["Generative AI", "Recruitment", "Talent Solutions", "HR Technology"],
    contactemail: "support@aggressivehunt.com",
    contactname: null,
    phone: "(205) 772-8390"
  },
  {
    businessname: "Ai-OPs",
    description: "Founded in Mobile, Ai-OPs is a startup focused on engineering applications that enable industrial AI to drive performance in real-world environments. The company develops tools for engineers and data scientists to build, train, and deploy machine learning models directly into industrial control systems.",
    category: "Industrial AI",
    website: "https://ai-op.com/",
    location: "Innovation PortAL, Mobile, AL",
    employees_count: null,
    founded_year: null,
    verified: true,
    tags: ["Industrial AI", "Machine Learning", "Control Systems", "Engineering"],
    contactemail: null,
    contactname: null,
    phone: null
  },
  {
    businessname: "AI Signal Research, Inc. (ASRI)",
    description: "AI Signal Research Inc. (ASRI) is an artificial intelligence firm located in Huntsville, Alabama. Founded in 1990, the midsize team specializes in providing Artificial Intelligence and Application Testing services, primarily serving the defense and government sectors.",
    category: "AI Solutions",
    website: null,
    location: "Huntsville, AL",
    employees_count: 500, // Mid-point of 250-999 range
    founded_year: 1990,
    verified: false,
    tags: ["Defense AI", "Government Services", "Application Testing"],
    contactemail: null,
    contactname: null,
    phone: null
  },
  {
    businessname: "Analytical AI",
    description: "Analytical AI designs and integrates cutting-edge machine learning and artificial intelligence solutions for automated threat recognition (ATR). Their primary goal is to rapidly and effectively identify threats to safety while retaining individual privacy in various screening modalities.",
    category: "AI Security Solutions",
    website: "https://www.analyticalai.com/",
    location: "1531 3rd Ave N, ST. 120, Birmingham, AL 35203",
    employees_count: 25, // Mid-point of 10-49 range
    founded_year: 2018,
    verified: false,
    tags: ["Machine Learning", "Threat Recognition", "Security", "Privacy"],
    contactemail: "info@analyticalai.com",
    contactname: null,
    phone: "(205) 710-0770"
  },
  {
    businessname: "Arcarithm",
    description: "Arcarithm is a leader in AI-driven solutions for defense and commercial sectors. Headquartered in Huntsville, the company develops sophisticated technologies including command and control systems, computer vision, and natural language processing to support complex decision-making and task automation.",
    category: "AI Defense Solutions",
    website: "https://arcarithm.com/",
    location: "1002 Meridian St N, Huntsville, AL 35801",
    employees_count: 25, // Mid-point of 10-49 range
    founded_year: null,
    verified: false,
    tags: ["Computer Vision", "Natural Language Processing", "Defense Technology", "Command & Control"],
    contactemail: "randy.riley@archarithms.com",
    contactname: null,
    phone: "(256) 763-8781"
  },
  {
    businessname: "CFD Research Corporation",
    description: "CFD Research specializes in engineering simulations and innovative designs, applying R&D to develop technology, perform services, and deliver products. Their Cyber & Data Sciences division develops cybersecurity technologies and AI/ML-based solutions for target detection, tracking, and predictive maintenance.",
    category: "Engineering & AI Research",
    website: "https://www.cfd-research.com/",
    location: "6820 Moquin Dr NW, Huntsville, AL 35806",
    employees_count: null,
    founded_year: 1987,
    verified: false,
    tags: ["AI/ML", "Signal Processing", "Predictive Maintenance", "Cybersecurity"],
    contactemail: null,
    contactname: null,
    phone: "(256) 361-0811"
  },
  {
    businessname: "Creole Studios",
    description: "Creole Studios is a digital transformation consulting firm that enables startups and SMEs with cutting-edge technology. Their services include developing generative AI and robotic process automation (RPA) solutions, creating AI-powered chatbots, automating data reporting, and enhancing recruitment with AI tools.",
    category: "Digital Transformation",
    website: "https://www.creolestudios.com/",
    location: "4059 Ida Ln, Vestavia Hills, AL 35243",
    employees_count: 75,
    founded_year: 2014,
    verified: false,
    tags: ["Generative AI", "RPA", "Chatbots", "Digital Solutions"],
    contactemail: "sales@creolestudios.com",
    contactname: null,
    phone: "(205) 417-7500"
  },
  {
    businessname: "Fleetio",
    description: "Fleetio, located in Birmingham, integrates sophisticated AI technologies to transform fleet maintenance practices. Through predictive analytics, the platform processes vast amounts of vehicle operational data, leveraging machine learning algorithms to detect patterns and predict future failures.",
    category: "Fleet Management AI",
    website: "https://www.fleetio.com/",
    location: "Birmingham, AL",
    employees_count: null,
    founded_year: null,
    verified: false,
    tags: ["Predictive Analytics", "Fleet Management", "Machine Learning", "Maintenance"],
    contactemail: null,
    contactname: null,
    phone: "1-800-975-5304"
  },
  {
    businessname: "Gray Analytics",
    description: "Gray Analytics is a cybersecurity risk management company providing best-practice services for government and commercial customers. Their ATHENA.i™ solution uses advanced analytics to correlate open source, commercial, and native agency data, acting as a force multiplier for law enforcement agencies.",
    category: "Cybersecurity Analytics",
    website: "https://grayanalytics.com/",
    location: "4240 Balmoral Drive SW, Suite 400, Huntsville, AL 35801",
    employees_count: 75, // Mid-point of 50-99 range
    founded_year: 2018,
    verified: false,
    tags: ["Cybersecurity", "Predictive Analytics", "Law Enforcement", "Risk Management"],
    contactemail: "ga-humanresources@grayanalytics.com",
    contactname: null,
    phone: "(256) 384-4729"
  },
  {
    businessname: "Hechura",
    description: "Hechura is a software development studio that helps non-technical founders build custom web and mobile applications using an AI-centered development approach. They specialize in delivering scalable, enterprise-grade software quickly and efficiently.",
    category: "AI Software Development",
    website: "https://hechura.co/",
    location: "Huntsville, AL",
    employees_count: 5, // Mid-point of 2-9 range
    founded_year: 2024,
    verified: false,
    tags: ["Custom Software", "Mobile Apps", "AI Development", "MVP"],
    contactemail: null,
    contactname: "Chris Maconi",
    phone: null
  },
  {
    businessname: "Huntsville AI",
    description: "Huntsville Artificial Intelligence is a 501(c)(3) non-profit organization dedicated to advancing AI technologies for the greater good. It focuses on research, education, and community engagement to promote the ethical and responsible development of AI.",
    category: "AI Non-Profit",
    website: "https://huntsvilleai.org/",
    location: "Huntsville, AL",
    employees_count: null,
    founded_year: null,
    verified: false,
    tags: ["Non-Profit", "AI Education", "Research", "Community"],
    contactemail: null,
    contactname: "Christopher Coleman",
    phone: "(520) 370-7734"
  },
  {
    businessname: "Integration Innovation, Inc. (i3)",
    description: "i3 is a 100% team-member-owned, technically diverse business solving the nation's toughest problems. Their capabilities include a dedicated AI, Data Science & Advanced Analytics division, focused on applying AI to build a smarter future for their government and commercial customers.",
    category: "AI & Data Science",
    website: "https://i3-corps.com/",
    location: "8000 Rideout Road SW, Suite 400, Huntsville, AL 35808",
    employees_count: 526,
    founded_year: 2007,
    verified: false,
    tags: ["Data Science", "Advanced Analytics", "Government Solutions", "Systems Integration"],
    contactemail: "hr@i3-corps.com",
    contactname: null,
    phone: "(256) 513-5179"
  },
  {
    businessname: "iRepertoire, Inc.",
    description: "Located at the HudsonAlpha Institute for Biotechnology, iRepertoire are pioneers in sequencing the immune adaptome. They provide comprehensive single-cell and bulk repertoire solutions and use machine learning in their data analysis and research collaborations.",
    category: "Biotech AI",
    website: "https://irepertoire.com/",
    location: "800 Hudson Way, Suite 2304, Huntsville, AL 35806",
    employees_count: null,
    founded_year: null,
    verified: false,
    tags: ["Machine Learning", "Biotechnology", "Immune Research", "Data Analysis"],
    contactemail: "info@irepertoire.com",
    contactname: null,
    phone: "(256) 327-0948"
  },
  {
    businessname: "Kailos Genetics",
    description: "Kailos Genetics, a resident company of the HudsonAlpha Institute for Biotechnology, makes precision medicine accessible and effective. They leverage their proprietary TargetRich™ enrichment technology, next-generation sequencing, and powerful analytics to produce accurate genetic information.",
    category: "Precision Medicine",
    website: "https://www.kailosgenetics.com/",
    location: "601 Genome Way, Suite 2005, Huntsville, AL 35806",
    employees_count: null,
    founded_year: null,
    verified: false,
    tags: ["Precision Medicine", "Genetics", "Analytics", "Healthcare"],
    contactemail: "support@kailosgenetics.com",
    contactname: null,
    phone: "1-866-833-6865"
  },
  {
    businessname: "MotionMobs",
    description: "MotionMobs is a strategic technology partner driving businesses forward through process automation, AI-powered efficiencies, and custom software development. They specialize in creating technical strategies and developing mobile and web applications that deliver measurable growth.",
    category: "Software Development",
    website: "https://motionmobs.com/",
    location: "100 41st Street South, Birmingham, AL 35222",
    employees_count: null,
    founded_year: null,
    verified: false,
    tags: ["Process Automation", "AI", "Custom Software", "Mobile Apps"],
    contactemail: "info@motionmobs.com",
    contactname: null,
    phone: "(205) 538-0240"
  },
  {
    businessname: "nou Systems, Inc.",
    description: "nou Systems is a woman-owned small business headquartered in Huntsville that helps customers transform defense systems with powerful, data-driven insights. They develop solutions for missile defense, cybersecurity, and space control using advanced systems engineering and modeling.",
    category: "Defense Systems",
    website: "https://www.nou-systems.com/",
    location: "7047 Old Madison Pike, Suite 305, Huntsville, AL 35806",
    employees_count: 155,
    founded_year: 2012,
    verified: false,
    tags: ["Defense Systems", "Data Analytics", "Cybersecurity", "Space Control"],
    contactemail: "bd@nou-systems.com",
    contactname: null,
    phone: "(256) 327-5541"
  },
  {
    businessname: "QuantHub",
    description: "QuantHub is revolutionizing how professionals learn data science and analytics. Their proprietary AI-driven microlearning platform uses advanced algorithms to personalize training experiences, adapting educational content based on user interactions and skill levels.",
    category: "AI Education",
    website: "https://www.quanthub.com/",
    location: "Birmingham, AL",
    employees_count: null,
    founded_year: 2018,
    verified: false,
    tags: ["AI-driven Learning", "Data Science Education", "Microlearning", "Analytics Training"],
    contactemail: null,
    contactname: null,
    phone: null
  },
  {
    businessname: "SearchExpress",
    description: "SearchExpress provides enterprise document management and AI solutions to help organizations automate business processes. Their system uses AI models from ChatGPT, Microsoft, and Google to replace manual data entry by extracting data from documents and enabling natural language queries.",
    category: "Document Management AI",
    website: "https://www.searchexpress.com/",
    location: "5346 Stadium Trace Parkway, Hoover, AL 35244",
    employees_count: 5, // Mid-point of 2-9 range
    founded_year: null,
    verified: false,
    tags: ["Document Management", "AI Automation", "Natural Language Processing", "Workflow"],
    contactemail: "sxsales@searchexpress.com",
    contactname: null,
    phone: "(205) 985-7686"
  },
  {
    businessname: "Serina Therapeutics, Inc.",
    description: "Serina Therapeutics is a biotech company located at the HudsonAlpha Institute focused on developing and commercializing innovative treatments. Their proprietary POZ Platform™ technology uses polymer-based drug delivery to enable programmable, targeted delivery of therapeutics.",
    category: "Biotechnology",
    website: "https://serinatherapeutics.com/",
    location: "601 Genome Way, Suite 2001, Huntsville, AL 35806",
    employees_count: 10,
    founded_year: 2006,
    verified: false,
    tags: ["Drug Delivery", "Biotechnology", "Therapeutics", "Innovation"],
    contactemail: null,
    contactname: null,
    phone: null
  },
  {
    businessname: "South Shore Analytics",
    description: "South Shore Analytics (SSA) is a data analytics consulting firm that provides high-quality business suite solutions. They specialize in data collection, transformation, storage, and visualization, building custom data pipelines and creating insights to empower business decisions.",
    category: "Data Analytics",
    website: "https://www.southshore.llc/",
    location: "Birmingham, AL",
    employees_count: null,
    founded_year: null,
    verified: false,
    tags: ["Data Analytics", "Business Intelligence", "Data Visualization", "Consulting"],
    contactemail: null,
    contactname: null,
    phone: null
  },
  {
    businessname: "Torch Technologies",
    description: "Torch Technologies is a 100% employee-owned business providing superior research, development, and engineering services to the Federal Government and Department of Defense. Their Technology Integration and Prototyping Center (TIPC) brings products from concept to life.",
    category: "Defense Technology",
    website: "https://torchtechnologies.com/",
    location: "4090 Memorial Parkway SW, Huntsville, AL 35802",
    employees_count: 1000,
    founded_year: 2002,
    verified: true,
    tags: ["Defense Technology", "R&D", "Systems Engineering", "Cybersecurity"],
    contactemail: "public.affairs@torchtechnologies.com",
    contactname: null,
    phone: "(256) 319-6000"
  },
  {
    businessname: "Trigon Cyber",
    description: "Trigon Cyber is a cybersecurity company headquartered in Huntsville, Alabama. The firm's services include both cybersecurity and artificial intelligence consulting and development. They are also a resident associate company at the HudsonAlpha Institute for Biotechnology.",
    category: "Cybersecurity AI",
    website: "https://www.trigoncyber.com/",
    location: "Huntsville, AL",
    employees_count: 25, // Mid-point of 10-49 range
    founded_year: null,
    verified: false,
    tags: ["Cybersecurity", "AI Consulting", "Development"],
    contactemail: null,
    contactname: null,
    phone: null
  },
  {
    businessname: "Van Heron Labs",
    description: "Van Heron Labs, a resident company at HudsonAlpha, develops platforms to improve biomanufacturing and biological applications. The company utilizes genetics, bioinformatics, and AI to unify nutrient substrates with metabolic fingerprints for optimized cell performance.",
    category: "Biotech AI",
    website: "https://vanheronlabs.com/",
    location: "Huntsville, AL",
    employees_count: null,
    founded_year: null,
    verified: false,
    tags: ["Bioinformatics", "AI", "Biomanufacturing", "Genetics"],
    contactemail: "info@vanheronlabs.com",
    contactname: null,
    phone: null
  },
  {
    businessname: "Zaden Technologies",
    description: "Zaden Technologies delivers AI-powered DevSecOps solutions for secure, scalable cloud software. The company focuses on intelligence augmentation, digital transformation, and software modernization with core competencies in AI/ML, predictive analytics, and deep learning.",
    category: "AI DevSecOps",
    website: "https://www.zadentech.com/",
    location: "7027 Old Madison Pike, Suite 108, Huntsville, AL 35806",
    employees_count: 25, // Mid-point of 10-49 range
    founded_year: 2019,
    verified: false,
    tags: ["DevSecOps", "AI/ML", "Cloud Software", "Digital Transformation"],
    contactemail: "hello@zadentech.com",
    contactname: "Valentine Nwachukwu",
    phone: "(256) 479-5503"
  },
  {
    businessname: "Zactonics AI",
    description: "Zactonics AI is a Montgomery-based firm with a mission to connect people to the technology and tradecraft necessary to make the world a better, safer place. The company provides consulting, research & development, and business management services.",
    category: "AI Consulting",
    website: "http://zactonics.ai",
    location: "1709 North Oakview Court, Montgomery, AL 36110",
    employees_count: null,
    founded_year: null,
    verified: false,
    tags: ["Consulting", "R&D", "Business Management", "Technology"],
    contactemail: null,
    contactname: "Zachary Lewis",
    phone: "(334) 868-1585"
  }
];

export const useAlabamaAIImport = () => {
  const queryClient = useQueryClient();

  const importCompaniesMutation = useMutation({
    mutationFn: async () => {
      console.log('Starting Alabama AI companies import...');
      
      // Check which companies already exist
      const { data: existingCompanies, error: fetchError } = await supabase
        .from('businesses')
        .select('businessname');
      
      if (fetchError) {
        console.error('Error fetching existing companies:', fetchError);
        throw fetchError;
      }
      
      const existingNames = new Set(existingCompanies?.map(c => c.businessname) || []);
      const newCompanies = ALABAMA_AI_COMPANIES.filter(company => 
        !existingNames.has(company.businessname)
      );
      
      console.log(`Found ${newCompanies.length} new Alabama AI companies to import`);
      
      if (newCompanies.length === 0) {
        return { message: 'No new Alabama AI companies to import', count: 0 };
      }
      
      // Insert new companies
      const { data, error } = await supabase
        .from('businesses')
        .insert(newCompanies)
        .select();
      
      if (error) {
        console.error('Error importing Alabama AI companies:', error);
        throw error;
      }
      
      console.log(`Successfully imported ${data?.length || 0} Alabama AI companies`);
      return { 
        message: 'Alabama AI companies imported successfully', 
        count: data?.length || 0, 
        data 
      };
    },
    onSuccess: (result) => {
      // Invalidate and refetch businesses data
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['business-stats'] });
      console.log('Alabama AI import completed:', result);
    },
    onError: (error) => {
      console.error('Alabama AI import failed:', error);
    }
  });

  return {
    importAlabamaAICompanies: importCompaniesMutation.mutate,
    isImporting: importCompaniesMutation.isPending,
    importError: importCompaniesMutation.error,
    importSuccess: importCompaniesMutation.isSuccess,
    totalCompanies: ALABAMA_AI_COMPANIES.length
  };
};
