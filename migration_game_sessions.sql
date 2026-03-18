-- ================================================
-- MIGRATION: Game Sessions (Partidas Online)
-- ================================================
-- Purpose: Tables for online VTT game sessions:
--          game_sessions  → active/paused/ended sessions per campaign
--          session_tokens → tokens placed on the battle map
--          combat_state   → D&D 5e initiative-order combat tracker
-- Date: 2026-03-14
-- ================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLE: game_sessions
-- ================================================
-- One row per campaign session (active or historical).
-- Only one session should have status='active' per campaign.
-- session_state JSONB stores map viewport (pan, zoom, grid) so
-- the DM can resume exactly where things were left off.
-- ================================================

CREATE TABLE game_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    dm_id           UUID NOT NULL REFERENCES auth.users(id),
    status          TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'paused', 'ended')),
    session_number  INT  NOT NULL DEFAULT 1,          -- 1st session, 2nd, …
    current_scene_id TEXT,                            -- scenes.id (TEXT cast)
    current_map_id   TEXT,                            -- battle_maps.id (TEXT cast)
    -- Map viewport state so DM can resume exactly
    session_state   JSONB NOT NULL DEFAULT '{
        "mapPanX": 0,
        "mapPanY": 0,
        "mapZoom": 1,
        "mapGridSize": 50,
        "mapGridColor": "rgba(255,255,255,0.3)",
        "mapShowGrid": true
    }',
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- TABLE: session_tokens
-- ================================================
-- One row per token (player character, enemy or NPC) present in
-- a game session.  Supabase Realtime is enabled so connected
-- clients see position / HP changes without polling.
--
-- token_type  : 'player' | 'enemy' | 'npc'
-- character_id: links to characters.id for player tokens
-- user_id     : the player who controls this token (nullable, DM controls rest)
-- entity_ref_id: scene_entities.id (or any string) for enemy/NPC tokens
-- entity_image : base64 avatar stored in the token (copy from characters.avatar_url)
-- x, y        : position in MAP pixel coordinates (not grid cells)
-- is_on_map   : true once the DM has placed the token on the canvas
-- ================================================

CREATE TABLE session_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    token_type      TEXT NOT NULL CHECK (token_type IN ('player', 'enemy', 'npc')),
    character_id    UUID REFERENCES characters(id) ON DELETE SET NULL,
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    entity_ref_id   TEXT,           -- scene_entities.id or compendium index
    entity_name     TEXT NOT NULL,
    entity_image    TEXT,           -- base64 avatar / URL
    x               FLOAT NOT NULL DEFAULT 0,
    y               FLOAT NOT NULL DEFAULT 0,
    current_hp      INT   NOT NULL DEFAULT 0,
    max_hp          INT   NOT NULL DEFAULT 0,
    initiative_value INT  NOT NULL DEFAULT 0,
    is_on_map       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Supabase Realtime so clients receive live updates
ALTER PUBLICATION supabase_realtime ADD TABLE session_tokens;

-- ================================================
-- TABLE: combat_state
-- ================================================
-- One row per session (UNIQUE on session_id).
-- initiative_order: JSON array of token IDs in turn order.
-- Supabase Realtime enabled so all players see whose turn it is.
-- ================================================

CREATE TABLE combat_state (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id          UUID NOT NULL UNIQUE REFERENCES game_sessions(id) ON DELETE CASCADE,
    is_active           BOOLEAN NOT NULL DEFAULT FALSE,
    current_turn_index  INT     NOT NULL DEFAULT 0,
    round_number        INT     NOT NULL DEFAULT 1,
    -- Array of token UUIDs in initiative order (DM can reorder freely)
    initiative_order    JSONB   NOT NULL DEFAULT '[]',
    -- 'none' | 'heroes' | 'enemies'  (which side was surprised)
    surprise            TEXT    NOT NULL DEFAULT 'none'
                            CHECK (surprise IN ('none', 'heroes', 'enemies')),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE combat_state;
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX idx_game_sessions_campaign  ON game_sessions(campaign_id);
CREATE INDEX idx_game_sessions_status    ON game_sessions(status);
CREATE INDEX idx_session_tokens_session  ON session_tokens(session_id);
CREATE INDEX idx_session_tokens_user     ON session_tokens(user_id);
CREATE INDEX idx_combat_state_session    ON combat_state(session_id);

-- ================================================
-- TRIGGERS: updated_at
-- ================================================

-- Reuse function created in migration_campaigns.sql if it exists;
-- otherwise create it.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_game_sessions_updated_at
    BEFORE UPDATE ON game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_tokens_updated_at
    BEFORE UPDATE ON session_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_combat_state_updated_at
    BEFORE UPDATE ON combat_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE game_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE combat_state   ENABLE ROW LEVEL SECURITY;

-- game_sessions: any campaign member can read; only DM writes
CREATE POLICY "Members can view game sessions" ON game_sessions
    FOR SELECT USING (true);

CREATE POLICY "DM can create game sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = dm_id);

CREATE POLICY "DM can update game sessions" ON game_sessions
    FOR UPDATE USING (auth.uid() = dm_id);

-- session_tokens: all campaign members see them; backend enforces write auth
CREATE POLICY "Members can view session tokens" ON session_tokens
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can write session tokens" ON session_tokens
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update session tokens" ON session_tokens
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete session tokens" ON session_tokens
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- combat_state: same pattern
CREATE POLICY "Members can view combat state" ON combat_state
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can write combat state" ON combat_state
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update combat state" ON combat_state
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE game_sessions  IS 'Online VTT sessions per campaign (active/paused/ended)';
COMMENT ON TABLE session_tokens IS 'Player, enemy and NPC tokens placed on the battle map during a session';
COMMENT ON TABLE combat_state   IS 'D&D 5e initiative-order combat tracker for a game session';

-- ================================================
-- END OF MIGRATION
-- ================================================
