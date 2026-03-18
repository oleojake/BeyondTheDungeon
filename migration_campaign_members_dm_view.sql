-- ================================================
-- Migration: Fix campaign_members SELECT policy
-- ================================================
-- The original policy only let users see their OWN membership row.
-- DMs need to see ALL members of their campaigns.
-- IMPORTANT: querying campaigns directly from this policy can create a
-- circular dependency with campaigns policies. Use a SECURITY DEFINER helper.
-- ================================================

DROP FUNCTION IF EXISTS public.is_campaign_dm(uuid);

CREATE OR REPLACE FUNCTION public.is_campaign_dm(p_campaign_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM campaigns c
        WHERE c.id = p_campaign_id
            AND c.dm_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.is_campaign_dm(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_campaign_dm(uuid) TO authenticated;

DROP POLICY IF EXISTS "Users can view campaign members" ON campaign_members;

CREATE POLICY "Users can view campaign members" ON campaign_members
    FOR SELECT USING (
        -- User can see their own membership
        user_id = auth.uid()
        OR
                -- DM can see all members of their campaigns
                public.is_campaign_dm(campaign_id)
    );
