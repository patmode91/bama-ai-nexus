-- Migration for creating the mcp_sessions table, RLS, indexes, and triggers.

-- 1. Create mcp_sessions table
CREATE TABLE IF NOT EXISTS public.mcp_sessions (
  session_id TEXT PRIMARY KEY,
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  contexts JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'completed')),
  metadata JSONB NULL
);

COMMENT ON TABLE public.mcp_sessions IS 'Stores session contexts for the Multi-Context Processing (MCP) system.';
COMMENT ON COLUMN public.mcp_sessions.session_id IS 'Client-generated unique session identifier.';
COMMENT ON COLUMN public.mcp_sessions.user_id IS 'Authenticated user associated with the session, if any. Refs auth.users.';
COMMENT ON COLUMN public.mcp_sessions.contexts IS 'Array of context objects associated with the session.';
COMMENT ON COLUMN public.mcp_sessions.created_at IS 'Timestamp of when the session was created.';
COMMENT ON COLUMN public.mcp_sessions.last_activity_at IS 'Timestamp of the last activity in the session.';
COMMENT ON COLUMN public.mcp_sessions.status IS 'Current status of the session (active, expired, completed).';
COMMENT ON COLUMN public.mcp_sessions.metadata IS 'Additional metadata for the session.';


-- 2. Add Indexes
CREATE INDEX IF NOT EXISTS idx_mcp_sessions_user_id ON public.mcp_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_sessions_last_activity_at ON public.mcp_sessions(last_activity_at);
-- Index on session_id is automatically created due to PRIMARY KEY constraint.


-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.mcp_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, for idempotency
DROP POLICY IF EXISTS "Users can manage their own mcp_sessions" ON public.mcp_sessions;
-- DROP POLICY IF EXISTS "Service role has full access to mcp_sessions" ON public.mcp_sessions; -- Not adding explicit service_role policy, relying on bypass

-- Policy: Users can manage (select, insert, update, delete) their own sessions.
-- The `WITH CHECK` clause applies to INSERT and UPDATE.
-- For INSERT, user_id must be their own auth.uid().
-- For UPDATE, user_id must remain their own auth.uid() if they are changing it (though typically user_id isn't changed post-creation).
CREATE POLICY "Users can manage their own mcp_sessions"
  ON public.mcp_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Note: Sessions created without a user_id (i.e., user_id IS NULL) initially:
-- - Cannot be selected by any regular authenticated user via this policy.
-- - Cannot be inserted by an authenticated user if they don't set user_id = auth.uid().
-- - Anonymous users (if anon role has any grants) would also be restricted by auth.uid() = user_id, effectively blocking them.
-- This implies that sessions for anonymous users or pre-login sessions need careful handling:
--   - They might be inserted by a service role function.
--   - Or, a separate policy for 'anon' role could allow inserting with user_id IS NULL, if applicable.
-- For now, this policy assumes sessions are primarily tied to authenticated users.
-- If a user starts a session as anon (user_id IS NULL) and then logs in, an Edge Function would typically update the session's user_id.


-- 4. Trigger for last_activity_at
CREATE OR REPLACE FUNCTION public.update_mcp_sessions_last_activity_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists, for idempotency
DROP TRIGGER IF EXISTS update_mcp_sessions_last_activity_at ON public.mcp_sessions;

CREATE TRIGGER update_mcp_sessions_last_activity_at
  BEFORE UPDATE ON public.mcp_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mcp_sessions_last_activity_at_column();

COMMENT ON TRIGGER update_mcp_sessions_last_activity_at ON public.mcp_sessions IS 'Automatically updates last_activity_at on row update.';


-- 5. Grants
-- Authenticated users can interact with their own sessions as per RLS.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mcp_sessions TO authenticated;
-- Service role has implicit bypass for RLS and full access. Explicit grant for clarity if desired.
GRANT ALL ON TABLE public.mcp_sessions TO service_role;
-- Anon users should typically not have direct access unless specific use case and RLS policy allows.
REVOKE ALL ON TABLE public.mcp_sessions FROM anon;
GRANT USAGE ON SCHEMA public TO anon; -- Ensure anon can 'see' the schema if needed for other operations, but not this table.


RAISE NOTICE 'Migration for mcp_sessions table completed successfully.';
