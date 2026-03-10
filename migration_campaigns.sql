-- ================================================
-- MIGRATION: Campaign System
-- ================================================
-- Purpose: Create tables for D&D campaign management
--          including chapters, scenes, and player invitations
-- Date: 2026-03-10
-- ================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- DROP EXISTING TABLES (in dependency order)
-- ================================================
-- Drop in reverse order to respect foreign key constraints

DROP TABLE IF EXISTS scene_entities CASCADE;
DROP TABLE IF EXISTS scenes CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS campaign_invitations CASCADE;
DROP TABLE IF EXISTS campaign_members CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;

-- ================================================
-- TABLE: campaigns
-- ================================================
-- Stores campaign data (title, description, notes)
-- dm_id references auth.users - the Dungeon Master
-- ================================================

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dm_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    notes TEXT, -- Private DM notes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- TABLE: campaign_members
-- ================================================
-- Stores player membership in campaigns
-- role: 'dm' or 'player'
-- ================================================

CREATE TABLE campaign_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('dm', 'player')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, user_id) -- A user can only be in a campaign once
);

-- ================================================
-- TABLE: campaign_invitations
-- ================================================
-- Stores pending invitations to campaigns
-- status: 'pending', 'accepted', 'rejected'
-- ================================================

CREATE TABLE campaign_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL if invited by email not in system
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    token TEXT UNIQUE NOT NULL DEFAULT uuid_generate_v4()::TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- ================================================
-- TABLE: chapters
-- ================================================
-- Stores chapters within a campaign
-- order_index: determines the order of chapters
-- ================================================

CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT, -- Rich text content for the chapter
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- TABLE: scenes
-- ================================================
-- Stores scenes within a chapter
-- narration_text: Text to be narrated to players (formatted)
-- dm_notes: Private DM notes
-- battle_map_id: Optional reference to a battle map
-- ================================================

CREATE TABLE scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT, -- General content/description
    narration_text TEXT, -- Text formatted for narration (bold, dialogue boxes)
    dm_notes TEXT, -- Private notes only for DM
    battle_map_id UUID REFERENCES battle_maps(id) ON DELETE SET NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- TABLE: scene_entities
-- ================================================
-- Associates entities (monsters, items, spells, etc.) with scenes
-- entity_type: 'monster', 'item', 'spell', 'npc'
-- entity_id: The index from the compendium (e.g., monster index)
-- entity_data: JSON with additional data (position, HP, etc.)
-- ================================================

CREATE TABLE scene_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('monster', 'item', 'spell', 'npc')),
    entity_id TEXT NOT NULL, -- Index from the compendium
    entity_name TEXT NOT NULL, -- Cached name for quick display
    entity_data JSONB, -- Additional data (HP, position on map, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX idx_campaigns_dm ON campaigns(dm_id);
CREATE INDEX idx_campaign_members_campaign ON campaign_members(campaign_id);
CREATE INDEX idx_campaign_members_user ON campaign_members(user_id);
CREATE INDEX idx_campaign_invitations_campaign ON campaign_invitations(campaign_id);
CREATE INDEX idx_campaign_invitations_email ON campaign_invitations(email);
CREATE INDEX idx_campaign_invitations_token ON campaign_invitations(token);
CREATE INDEX idx_chapters_campaign ON chapters(campaign_id);
CREATE INDEX idx_scenes_chapter ON scenes(chapter_id);
CREATE INDEX idx_scene_entities_scene ON scene_entities(scene_id);

-- ================================================
-- TRIGGERS: updated_at
-- ================================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
CREATE TRIGGER update_chapters_updated_at
    BEFORE UPDATE ON chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scenes_updated_at ON scenes;
CREATE TRIGGER update_scenes_updated_at
    BEFORE UPDATE ON scenes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_entities ENABLE ROW LEVEL SECURITY;

-- ================================================
-- RLS POLICIES: campaigns
-- ================================================
-- Simplified to avoid infinite recursion

DROP POLICY IF EXISTS "Users can view their campaigns" ON campaigns;
CREATE POLICY "Users can view their campaigns" ON campaigns
    FOR SELECT USING (auth.uid() = dm_id);

DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
CREATE POLICY "Users can create campaigns" ON campaigns
    FOR INSERT WITH CHECK (auth.uid() = dm_id);

DROP POLICY IF EXISTS "DM can update their campaigns" ON campaigns;
CREATE POLICY "DM can update their campaigns" ON campaigns
    FOR UPDATE USING (auth.uid() = dm_id);

DROP POLICY IF EXISTS "DM can delete their campaigns" ON campaigns;
CREATE POLICY "DM can delete their campaigns" ON campaigns
    FOR DELETE USING (auth.uid() = dm_id);

-- ================================================
-- RLS POLICIES: campaign_members
-- ================================================

DROP POLICY IF EXISTS "Users can view campaign members" ON campaign_members;
CREATE POLICY "Users can view campaign members" ON campaign_members
    FOR SELECT USING (
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "DM can add campaign members" ON campaign_members;
CREATE POLICY "DM can add campaign members" ON campaign_members
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "DM can update campaign members" ON campaign_members;
CREATE POLICY "DM can update campaign members" ON campaign_members
    FOR UPDATE USING (
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "DM can remove campaign members" ON campaign_members;
CREATE POLICY "DM can remove campaign members" ON campaign_members
    FOR DELETE USING (
        user_id = auth.uid()
    );

-- ================================================
-- RLS POLICIES: campaign_invitations
-- ================================================

DROP POLICY IF EXISTS "Users can view invitations" ON campaign_invitations;
CREATE POLICY "Users can view invitations" ON campaign_invitations
    FOR SELECT USING (
        invited_user_id = auth.uid() OR
        invited_by = auth.uid() OR
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "DM can create invitations" ON campaign_invitations;
CREATE POLICY "DM can create invitations" ON campaign_invitations
    FOR INSERT WITH CHECK (
        invited_by = auth.uid()
    );

DROP POLICY IF EXISTS "Users can update their invitations" ON campaign_invitations;
CREATE POLICY "Users can update their invitations" ON campaign_invitations
    FOR UPDATE USING (
        invited_user_id = auth.uid() OR
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "DM can delete invitations" ON campaign_invitations;
CREATE POLICY "DM can delete invitations" ON campaign_invitations
    FOR DELETE USING (
        invited_by = auth.uid()
    );

-- ================================================
-- RLS POLICIES: chapters
-- ================================================
-- Simplified policies - backend handles authorization

DROP POLICY IF EXISTS "Campaign members can view chapters" ON chapters;
CREATE POLICY "Campaign members can view chapters" ON chapters
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "DM can create chapters" ON chapters;
CREATE POLICY "DM can create chapters" ON chapters
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "DM can update chapters" ON chapters;
CREATE POLICY "DM can update chapters" ON chapters
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "DM can delete chapters" ON chapters;
CREATE POLICY "DM can delete chapters" ON chapters
    FOR DELETE USING (true);

-- ================================================
-- RLS POLICIES: scenes
-- ================================================
-- Simplified policies - backend handles authorization

DROP POLICY IF EXISTS "Campaign members can view scenes" ON scenes;
CREATE POLICY "Campaign members can view scenes" ON scenes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "DM can create scenes" ON scenes;
CREATE POLICY "DM can create scenes" ON scenes
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "DM can update scenes" ON scenes;
CREATE POLICY "DM can update scenes" ON scenes
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "DM can delete scenes" ON scenes;
CREATE POLICY "DM can delete scenes" ON scenes
    FOR DELETE USING (true);

-- ================================================
-- RLS POLICIES: scene_entities
-- ================================================
-- Simplified policies - backend handles authorization

DROP POLICY IF EXISTS "Campaign members can view scene entities" ON scene_entities;
CREATE POLICY "Campaign members can view scene entities" ON scene_entities
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "DM can create scene entities" ON scene_entities;
CREATE POLICY "DM can create scene entities" ON scene_entities
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "DM can update scene entities" ON scene_entities;
CREATE POLICY "DM can update scene entities" ON scene_entities
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "DM can delete scene entities" ON scene_entities;
CREATE POLICY "DM can delete scene entities" ON scene_entities
    FOR DELETE USING (true);

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE campaigns IS 'D&D campaign data with title, description, and DM notes';
COMMENT ON TABLE campaign_members IS 'Players and DM membership in campaigns';
COMMENT ON TABLE campaign_invitations IS 'Pending invitations to join campaigns';
COMMENT ON TABLE chapters IS 'Chapters within a campaign';
COMMENT ON TABLE scenes IS 'Scenes within chapters with narration and DM notes';
COMMENT ON TABLE scene_entities IS 'References to monsters, items, spells, NPCs in scenes';

-- ================================================
-- END OF MIGRATION
-- ================================================
