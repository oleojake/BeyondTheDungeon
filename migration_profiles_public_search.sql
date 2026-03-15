-- ================================================
-- Migration: Allow authenticated users to search all profiles
-- ================================================
-- By default Supabase restricts profiles reads to own row only.
-- This adds a SELECT policy so that any authenticated user can
-- look up other users by username or email (needed for campaign
-- invitation search and for displaying member names).
-- ================================================

-- Add SELECT policy for authenticated users to read all profiles
CREATE POLICY "Authenticated users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);
