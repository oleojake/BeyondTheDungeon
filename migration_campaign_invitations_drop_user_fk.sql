-- ================================================
-- Migration: Drop FK constraint on campaign_invitations.invited_user_id
-- ================================================
-- The FK references auth.users(id), but the authenticated role
-- does not have SELECT permission on auth.users. This causes
-- "permission denied for table users" on INSERT.
-- The column is kept; the user UUID is still stored (trusting
-- profiles.id = auth.users.id), just without DB-level enforcement.
-- ================================================

ALTER TABLE campaign_invitations
  DROP CONSTRAINT IF EXISTS campaign_invitations_invited_user_id_fkey;
