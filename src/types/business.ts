
export interface Business {
  id: number;
  businessname: string | null;
  category: string | null;
  contactemail: string | null;
  contactname: string | null;
  created_at: string | null;
  description: string | null;
  employees_count: number | null;
  founded_year: number | null;
  interestcheckbox: boolean | null;
  location: string | null;
  logo_url: string | null;
  owner_id: string | null;
  rating: number | null;
  tags: string[] | null;
  updated_at: string | null;
  verified: boolean | null;
  website: string | null;
  certifications: string[] | null;
  project_budget_min: number | null;
  project_budget_max: number | null;
  phone?: string | null;
  annual_revenue?: string | null;
}
