-- ================================================
-- Migration: Add 'map' to scene_entities entity_type CHECK constraint
-- ================================================
-- The existing CHECK constraint only allows: ('monster', 'item', 'spell', 'npc')
-- This adds 'map' so that battle maps can be linked to scenes.
-- ================================================

-- Drop the old constraint and add an updated one that includes 'map'
ALTER TABLE scene_entities
  DROP CONSTRAINT IF EXISTS scene_entities_entity_type_check;

ALTER TABLE scene_entities
  ADD CONSTRAINT scene_entities_entity_type_check
  CHECK (entity_type IN ('monster', 'item', 'spell', 'npc', 'map'));
