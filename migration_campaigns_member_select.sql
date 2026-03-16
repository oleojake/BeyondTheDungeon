-- ================================================
-- MIGRATION: Allow campaign members to read campaigns
-- ================================================
-- Problem:
--   "Users can view their campaigns" only allowed auth.uid() = dm_id.
--   Players present in campaign_members could not see campaigns in /mis-campanas.
-- ================================================

DROP POLICY IF EXISTS "Users can view their campaigns" ON campaigns;

CREATE POLICY "Users can view their campaigns" ON campaigns
    FOR SELECT USING (
        auth.uid() = dm_id
        OR EXISTS (
            SELECT 1
            FROM campaign_members cm
            WHERE cm.campaign_id = campaigns.id
              AND cm.user_id = auth.uid()
        )
    );
