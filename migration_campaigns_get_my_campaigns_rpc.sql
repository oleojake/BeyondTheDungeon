-- ================================================
-- MIGRATION: RPC to list campaigns for current user
-- ================================================
-- Returns campaigns where auth.uid() is DM or member.
-- Uses SECURITY DEFINER so backend/frontend can query consistently even if
-- campaigns SELECT policy is restrictive.

DROP FUNCTION IF EXISTS public.get_my_campaigns();

CREATE OR REPLACE FUNCTION public.get_my_campaigns()
RETURNS SETOF campaigns
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.*
  FROM campaigns c
  WHERE c.dm_id = auth.uid()
     OR EXISTS (
       SELECT 1
       FROM campaign_members cm
       WHERE cm.campaign_id = c.id
         AND cm.user_id = auth.uid()
     )
  ORDER BY c.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_my_campaigns() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_campaigns() TO authenticated;
