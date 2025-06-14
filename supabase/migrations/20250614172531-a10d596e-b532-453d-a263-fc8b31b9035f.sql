
-- Create forum categories table
CREATE TABLE public.forum_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'message-square',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum topics table
CREATE TABLE public.forum_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.forum_categories NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum replies table
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES public.forum_topics ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum votes table for upvoting/downvoting
CREATE TABLE public.forum_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  topic_id UUID REFERENCES public.forum_topics ON DELETE CASCADE,
  reply_id UUID REFERENCES public.forum_replies ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id),
  UNIQUE(user_id, reply_id),
  CHECK ((topic_id IS NOT NULL AND reply_id IS NULL) OR (topic_id IS NULL AND reply_id IS NOT NULL))
);

-- Enable Row Level Security
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for forum_categories (public read, admin create/update)
CREATE POLICY "Anyone can view forum categories" 
  ON public.forum_categories 
  FOR SELECT 
  USING (true);

-- RLS policies for forum_topics (public read, authenticated create/update own)
CREATE POLICY "Anyone can view forum topics" 
  ON public.forum_topics 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create topics" 
  ON public.forum_topics 
  FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own topics" 
  ON public.forum_topics 
  FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own topics" 
  ON public.forum_topics 
  FOR DELETE 
  USING (auth.uid() = author_id);

-- RLS policies for forum_replies (public read, authenticated create/update own)
CREATE POLICY "Anyone can view forum replies" 
  ON public.forum_replies 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create replies" 
  ON public.forum_replies 
  FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own replies" 
  ON public.forum_replies 
  FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own replies" 
  ON public.forum_replies 
  FOR DELETE 
  USING (auth.uid() = author_id);

-- RLS policies for forum_votes (authenticated users only)
CREATE POLICY "Authenticated users can view votes" 
  ON public.forum_votes 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can vote" 
  ON public.forum_votes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
  ON public.forum_votes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" 
  ON public.forum_votes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Insert default forum categories
INSERT INTO public.forum_categories (name, description, color, icon) VALUES
  ('General Discussion', 'General topics about AI and technology in Alabama', '#3B82F6', 'message-square'),
  ('Business Q&A', 'Questions and answers about AI business solutions', '#10B981', 'help-circle'),
  ('Networking', 'Connect with other professionals and businesses', '#8B5CF6', 'users'),
  ('Industry News', 'Latest news and trends in AI and technology', '#F59E0B', 'newspaper'),
  ('Resources & Tools', 'Share and discover useful AI tools and resources', '#EF4444', 'tool'),
  ('Job Board', 'AI and tech job opportunities in Alabama', '#06B6D4', 'briefcase');
