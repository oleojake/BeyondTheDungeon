-- ================================================
-- Migration: Fix campaign_members SELECT policy
-- ================================================
-- The original policy only let users see their OWN membership row.
-- DMs need to see ALL members of their campaigns.
-- Note: a self-referential subquery on campaign_members inside its own
-- policy causes infinite recursion, so we use the campaigns table instead.
-- ================================================

DROP POLICY IF EXISTS "Users can view campaign members" ON campaign_members;

CREATE POLICY "Users can view campaign members" ON campaign_members
    FOR SELECT USING (
        -- User can see their own membership
        user_id = auth.uid()
        OR
        -- DM can see all members of their campaigns (safe: subquery on different table)
        campaign_id IN (
            SELECT id FROM campaigns WHERE dm_id = auth.uid()
        )
    );
