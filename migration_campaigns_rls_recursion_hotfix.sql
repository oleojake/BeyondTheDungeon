-- ================================================
-- HOTFIX: Fix RLS recursion campaigns <-> campaign_members
-- ================================================
-- Root cause:
--   campaigns SELECT policy checks campaign_members.
--   campaign_members SELECT policy (DM visibility) checked campaigns.
--   This creates circular policy evaluation and triggers:
--   "infinite recursion detected in policy for relation campaigns".
-- ================================================

-- Helper to check whether current user is DM of a campaign without re-entering
-- row policies as caller.
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

-- Recreate campaign_members SELECT policy using the helper function.
DROP POLICY IF EXISTS "Users can view campaign members" ON campaign_members;

CREATE POLICY "Users can view campaign members" ON campaign_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_campaign_dm(campaign_id)
  );
