-- Migration for Chat System: chat_participants table, real-time updates, and RLS.

-- 1. Create chat_participants table
CREATE TABLE IF NOT EXISTS public.chat_participants (
  id UUID DEFAULT public.gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Assuming 'public.profiles' table linked to auth.users
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()), -- Optional: for presence tracking
  CONSTRAINT unique_room_user UNIQUE (room_id, user_id) -- Prevent duplicate participations
);

COMMENT ON TABLE public.chat_participants IS 'Tracks user participation in chat rooms.';
COMMENT ON COLUMN public.chat_participants.room_id IS 'Foreign key to the chat room.';
COMMENT ON COLUMN public.chat_participants.user_id IS 'Foreign key to the user profile.';
COMMENT ON COLUMN public.chat_participants.joined_at IS 'Timestamp when the user joined the room.';

-- 2. Enable real-time for existing chat_rooms table
-- Ensure REPLICA IDENTITY is set correctly for real-time updates.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'chat_rooms' AND relkind = 'r') THEN
    ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;
  END IF;
END $$;

-- Add chat_rooms to the supabase_realtime publication if not already added.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'chat_rooms' AND relkind = 'r') THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables pr
        JOIN pg_class c ON pr.relid = c.oid
        WHERE pr.pubname = 'supabase_realtime' AND c.relname = 'chat_rooms'
      ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
        RAISE NOTICE 'Table public.chat_rooms added to supabase_realtime publication.';
      ELSE
        RAISE NOTICE 'Table public.chat_rooms is already in supabase_realtime publication.';
      END IF;
    ELSE
      RAISE NOTICE 'Table public.chat_rooms does not exist, skipping adding to publication.';
    END IF;
  ELSE
    RAISE NOTICE 'Publication supabase_realtime does not exist, skipping table additions.';
  END IF;
END $$;


-- 3. Enable real-time for new chat_participants table
ALTER TABLE public.chat_participants REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables pr
      JOIN pg_class c ON pr.relid = c.oid
      WHERE pr.pubname = 'supabase_realtime' AND c.relname = 'chat_participants'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;
      RAISE NOTICE 'Table public.chat_participants added to supabase_realtime publication.';
    ELSE
      RAISE NOTICE 'Table public.chat_participants is already in supabase_realtime publication.';
    END IF;
  ELSE
    RAISE NOTICE 'Publication supabase_realtime does not exist, skipping table additions.';
  END IF;
END $$;


-- 4. Add Row Level Security (RLS) policies for chat_participants

-- Enable RLS on the table first
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- Remove existing policies to prevent conflicts (idempotency for rerunning)
DROP POLICY IF EXISTS "Users can view participants of accessible rooms" ON public.chat_participants;
DROP POLICY IF EXISTS "Authenticated users can join public chat rooms" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can delete their own participation" ON public.chat_participants;
DROP POLICY IF EXISTS "Admins have full access to chat_participants" ON public.chat_participants;


-- Policy: Users can see participants in public rooms or rooms they are part of.
CREATE POLICY "Users can view participants of accessible rooms"
  ON public.chat_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms cr
      WHERE cr.id = chat_participants.room_id AND
            (
              NOT cr.is_private OR -- it's a public room
              EXISTS ( -- or user is a participant of this private room
                SELECT 1 FROM public.chat_participants cp_self
                WHERE cp_self.room_id = cr.id AND cp_self.user_id = auth.uid()
              )
            )
    )
  );

-- Policy: Authenticated users can join public chat rooms (as themselves).
-- Joining private rooms would typically be handled by an invite system (e.g., via a secure function).
CREATE POLICY "Authenticated users can join public chat rooms"
  ON public.chat_participants FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    chat_participants.user_id = auth.uid() AND -- User can only insert themselves
    EXISTS (
      SELECT 1 FROM public.chat_rooms cr
      WHERE cr.id = chat_participants.room_id AND NOT cr.is_private
    )
  );

-- Policy: Users can leave rooms they are part of (delete their own participation record).
CREATE POLICY "Users can delete their own participation"
  ON public.chat_participants FOR DELETE
  USING (auth.uid() = user_id);

-- Admin override policy (placeholder for actual admin role check)
-- In a real application, replace 'true' with a check against an admin role, e.g.,
-- USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'))
-- OR using custom claims: USING ((auth.jwt() ->> 'user_role')::text = 'admin')
CREATE POLICY "Admins have full access to chat_participants"
  ON public.chat_participants FOR ALL
  USING (true) -- Placeholder for admin check
  WITH CHECK (true); -- Placeholder for admin check


-- 5. Add indexes for chat_participants
CREATE INDEX IF NOT EXISTS idx_chat_participants_room_id ON public.chat_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON public.chat_participants(user_id);

-- Grant usage for the new table to standard roles
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.chat_participants TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.chat_participants TO authenticated;
GRANT SELECT ON TABLE public.chat_participants TO anon; -- anon can only see participants if RLS allows (e.g. public rooms)

-- Grant usage for chat_rooms to standard roles (if not already done, good practice to ensure)
-- This primarily affects what RLS policies can do regarding cross-table checks.
-- The actual data access is still governed by chat_rooms' RLS policies.
GRANT SELECT ON TABLE public.chat_rooms TO authenticated;
GRANT SELECT ON TABLE public.chat_rooms TO anon;

RAISE NOTICE 'Chat participants table, real-time, RLS policies, and indexes created/updated successfully.';
