-- Enable vector extension for semantic search
create extension if not exists vector with schema extensions;

-- Create enum for agent types
create type agent_type as enum ('connector', 'analyst', 'curator');

-- Create enum for request status
create type request_status as enum ('pending', 'processing', 'completed', 'failed');

-- Table to store agent requests
create table if not exists agent_requests (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid references auth.users(id) on delete cascade,
  query text not null,
  context jsonb,
  status request_status not null default 'pending',
  response jsonb,
  error text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Index for faster lookups
create index if not exists idx_agent_requests_session_id on agent_requests(session_id);
create index if not exists idx_agent_requests_user_id on agent_requests(user_id);
create index if not exists idx_agent_requests_status on agent_requests(status);
create index if not exists idx_agent_requests_created_at on agent_requests(created_at);

-- Table to store search cache
create table if not exists search_cache (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  results jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for cache lookups
create index if not exists idx_search_cache_key on search_cache(key);
create index if not exists idx_search_cache_created_at on search_cache(created_at);

-- Table to store business embeddings for semantic search
create table if not exists business_embeddings (
  id uuid primary key references public.businesses(id) on delete cascade,
  embedding vector(768), -- Adjust dimensions based on your embedding model
  metadata jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Function to update the updated_at column
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'update_business_embeddings_updated_at') then
    create or replace function update_updated_at_column()
    returns trigger as $$
    begin
      new.updated_at = now();
      return new;
    end;
    $$ language plpgsql;

    create trigger update_business_embeddings_updated_at
    before update on business_embeddings
    for each row execute function update_updated_at_column();
  end if;
end $$;

-- Function for semantic similarity search
create or replace function match_businesses(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  business_id uuid,
  name text,
  description text,
  similarity float
)
language sql stable
as $$
  select
    be.id,
    b.id as business_id,
    b.name,
    b.description,
    1 - (be.embedding <=> query_embedding) as similarity
  from business_embeddings be
  join businesses b on be.id = b.id
  where 1 - (be.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

-- Enable Row Level Security
alter table agent_requests enable row level security;
alter table search_cache enable row level security;
alter table business_embeddings enable row level security;

-- RLS Policies for agent_requests
create policy "Users can view their own agent requests"
on agent_requests for select
using (auth.uid() = user_id);

create policy "Users can insert their own agent requests"
on agent_requests for insert
with check (auth.uid() = user_id);

-- RLS Policies for search_cache
create policy "Search cache is public for reading"
on search_cache for select
using (true);

create policy "Search cache can be inserted by authenticated users"
on search_cache for insert
with check (auth.role() = 'authenticated');

-- RLS Policies for business_embeddings
create policy "Business embeddings are readable by authenticated users"
on business_embeddings for select
using (auth.role() = 'authenticated');

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;

-- Create a function to update the updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply the trigger to the agent_requests table
create or replace trigger update_agent_requests_updated_at
before update on agent_requests
for each row execute function update_updated_at_column();
