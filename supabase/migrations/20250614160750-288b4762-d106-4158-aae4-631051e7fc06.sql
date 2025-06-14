
-- Add columns for new search filters
ALTER TABLE public.businesses ADD COLUMN certifications TEXT[] NULL;
ALTER TABLE public.businesses ADD COLUMN project_budget_min INTEGER NULL;
ALTER TABLE public.businesses ADD COLUMN project_budget_max INTEGER NULL;
