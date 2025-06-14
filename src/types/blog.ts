
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: 'The Scribe' | 'Human Editor';
  category: 'Market Pulse' | 'New Innovator' | 'Funding Roundup' | 'AI Interview' | 'General';
  tags: string[];
  featured_image?: string;
  published_at: string;
  updated_at: string;
  status: 'draft' | 'published' | 'archived';
  metadata?: {
    data_source?: string;
    business_id?: number;
    chart_ids?: string[];
    funding_amount?: number;
    auto_generated: boolean;
  };
  seo_title?: string;
  seo_description?: string;
  read_time_minutes: number;
}

export interface ContentTemplate {
  id: string;
  name: string;
  category: BlogPost['category'];
  template: string;
  variables: string[];
  auto_trigger_conditions?: {
    data_threshold?: number;
    business_criteria?: string[];
    time_interval?: string;
  };
}

export interface BlogGenerationRequest {
  template_id: string;
  data_context: Record<string, any>;
  target_length: 'short' | 'medium' | 'long';
  include_charts: boolean;
  human_review_required: boolean;
}
