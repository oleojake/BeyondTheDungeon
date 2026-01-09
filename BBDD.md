-- ==============================================================================
-- 1. CONFIGURACIÓN INICIAL Y EXTENSIONES
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. USUARIOS Y PERFILES (Sincronización con Auth)
-- ==============================================================================
CREATE TABLE public.profiles (
id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
username TEXT UNIQUE,
display_name TEXT,
avatar_url TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Seguridad para perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfiles públicos para lectura"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Usuarios pueden editar su propio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- TRIGGER: Crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
INSERT INTO public.profiles (id, username, display_name)
VALUES (new.id, new.email, split_part(new.email, '@', 1));
RETURN new;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 3. SISTEMA DE JUEGO Y COMPENDIO (Público / Lectura)
-- ==============================================================================

-- Sistemas soportados (D&D 5e, Pathfinder, etc.)
CREATE TABLE public.game_systems (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  ruleset_json JSONB DEFAULT '{}' -- Reglas de validación opcionales para el frontend
);

-- Insertar D&D 5e por defecto
INSERT INTO public.game_systems (slug, name, description)
VALUES ('dnd5e', 'Dungeons & Dragons 5th Edition', 'Standard SRD Rules');

-- Bestiario (Monstruos)
CREATE TABLE public.compendium_bestiary (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  system_id TEXT REFERENCES public.game_systems(slug) DEFAULT 'dnd5e',
  name TEXT NOT NULL,
  type TEXT,
  cr_level FLOAT,
  stats JSONB NOT NULL DEFAULT '{}',
  is_official BOOLEAN DEFAULT FALSE, -- Si es True, aparece en búsquedas públicas
  created_by UUID REFERENCES public.profiles(id),
  image_url TEXT
);

-- Hechizos
CREATE TABLE public.compendium_spells (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  system_id TEXT REFERENCES public.game_systems(slug) DEFAULT 'dnd5e',
  name TEXT NOT NULL,
  level INT,
  school TEXT,
  casting_time TEXT,
  range TEXT,
  components TEXT,
  duration TEXT,
  description TEXT,
  is_official BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id)
);

-- Objetos
CREATE TABLE public.compendium_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  system_id TEXT REFERENCES public.game_systems(slug) DEFAULT 'dnd5e',
  name TEXT NOT NULL,
  type TEXT,
  rarity TEXT,
  price TEXT,
  weight TEXT,
  effects_description TEXT,
  stats JSONB DEFAULT '{}',
  is_official BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id)
);

-- RLS: Compendio (Cualquiera lee, solo Admin o Creador edita)
ALTER TABLE public.game_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compendium_bestiary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compendium_spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compendium_items ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública (incluido anónimos si usas cliente público)
CREATE POLICY "Lectura pública de sistemas" ON public.game_systems FOR SELECT USING (true);
CREATE POLICY "Lectura pública de bestiario" ON public.compendium_bestiary FOR SELECT USING (true);
CREATE POLICY "Lectura pública de hechizos" ON public.compendium_spells FOR SELECT USING (true);
CREATE POLICY "Lectura pública de objetos" ON public.compendium_items FOR SELECT USING (true);

-- ==============================================================================
-- 4. CAMPAÑAS Y PARTICIPANTES
-- ==============================================================================
CREATE TABLE public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  gm_id UUID REFERENCES public.profiles(id) NOT NULL,
  system_id TEXT REFERENCES public.game_systems(slug) DEFAULT 'dnd5e',
  banner_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.campaign_members (
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('player', 'spectator')) DEFAULT 'player',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (campaign_id, user_id)
);

-- RLS Campañas
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede ver campañas (para unirse)" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Solo GM crea campañas" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = gm_id);
CREATE POLICY "Solo GM edita sus campañas" ON public.campaigns FOR UPDATE USING (auth.uid() = gm_id);

-- ==============================================================================
-- 5. PERSONAJES (Fichas)
-- ==============================================================================
CREATE TABLE public.characters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  campaign_id UUID REFERENCES public.campaigns(id),
  name TEXT NOT NULL,
  race TEXT,
  class_level TEXT,
  background TEXT,
  stats JSONB DEFAULT '{}',
  inventory JSONB DEFAULT '[]',
  spells_known JSONB DEFAULT '[]',
  is_npc BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Personajes
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver personajes públicos" ON public.characters FOR SELECT USING (is_public = true);
CREATE POLICY "Ver mis personajes" ON public.characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "GM ve personajes de su campaña" ON public.characters FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.campaigns WHERE id = campaign_id AND gm_id = auth.uid())
);
CREATE POLICY "Editar mis personajes" ON public.characters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "GM edita personajes de su campaña" ON public.characters FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.campaigns WHERE id = campaign_id AND gm_id = auth.uid())
);

-- ==============================================================================
-- 6. TABLERO VIRTUAL (VTT)
-- ==============================================================================
CREATE TABLE public.scenes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  map_image_url TEXT,
  grid_data JSONB,
  fog_of_war_data JSONB,
  is_active_scene BOOLEAN DEFAULT FALSE
);

CREATE TABLE public.map_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  scene_id UUID REFERENCES public.scenes(id) ON DELETE CASCADE,
  linked_character_id UUID REFERENCES public.characters(id),
  linked_bestiary_id UUID REFERENCES public.compendium_bestiary(id),
  label TEXT,
  x FLOAT NOT NULL DEFAULT 0,
  y FLOAT NOT NULL DEFAULT 0,
  rotation FLOAT DEFAULT 0,
  scale FLOAT DEFAULT 1,
  bars_data JSONB DEFAULT '{"bar1_value": 0, "bar1_max": 0}',
  is_visible BOOLEAN DEFAULT TRUE,
  conditions JSONB DEFAULT '[]'
);

-- Habilitar Realtime para Tokens (Movimiento en vivo)
ALTER PUBLICATION supabase_realtime ADD TABLE public.map_tokens;

-- RLS Tablero
ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_tokens ENABLE ROW LEVEL SECURITY;

-- (Simplificado) Miembros de la campaña pueden ver escenas y tokens
CREATE POLICY "Miembros ven escenas" ON public.scenes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.campaign_members WHERE campaign_id = scenes.campaign_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.campaigns WHERE id = scenes.campaign_id AND gm_id = auth.uid())
);

CREATE POLICY "Miembros ven tokens" ON public.map_tokens FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.scenes s
          JOIN public.campaign_members cm ON s.campaign_id = cm.campaign_id
          WHERE s.id = map_tokens.scene_id AND cm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.scenes s
          JOIN public.campaigns c ON s.campaign_id = c.id
          WHERE s.id = map_tokens.scene_id AND c.gm_id = auth.uid())
);

-- ==============================================================================
-- 7. STORAGE BUCKETS (Imágenes)
-- ==============================================================================
-- NOTA: Esto normalmente se hace desde la UI de Supabase, pero aquí está la lógica
-- Crea un bucket llamado 'campaign-assets' desde el panel de Supabase > Storage
-- Y luego aplica estas políticas en el panel de Storage Policies:

-- Policy: "Give public access to campaign assets"
-- Definition: bucket_id = 'campaign-assets' (SELECT)

-- Policy: "Authenticated users can upload"
-- Definition: bucket_id = 'campaign-assets' (INSERT)
$$

-- 1. SISTEMAS DE JUEGO (Definimos 2014 y 2024)
CREATE TABLE IF NOT EXISTS public.game_systems (
slug TEXT PRIMARY KEY,
name TEXT NOT NULL,
description TEXT,
ruleset_json JSONB DEFAULT '{}'
);

-- Insertar o actualizar los sistemas
INSERT INTO public.game_systems (slug, name, description) VALUES
('dnd5e-2014', 'D&D 5th Edition (2014)', 'Reglas clásicas (Legacy SRD 5.1)'),
('dnd5e-2024', 'D&D 5th Edition (2024)', 'Reglas revisadas (Free Rules)')
ON CONFLICT (slug) DO NOTHING;

-- 2. TABLAS DEL COMPENDIO (Soportan JSONB para flexibilidad)

-- Clases
CREATE TABLE IF NOT EXISTS public.compendium_classes (
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
system_id TEXT REFERENCES public.game_systems(slug),
name TEXT NOT NULL,
hit_die INT,
full_data JSONB NOT NULL, -- Aquí va toda la info de niveles
is_official BOOLEAN DEFAULT TRUE
);

-- Subclases
CREATE TABLE IF NOT EXISTS public.compendium_subclasses (
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
system_id TEXT REFERENCES public.game_systems(slug),
name TEXT NOT NULL,
parent_class TEXT,
full_data JSONB NOT NULL,
is_official BOOLEAN DEFAULT TRUE
);

-- Razas (Species)
CREATE TABLE IF NOT EXISTS public.compendium_races (
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
system_id TEXT REFERENCES public.game_systems(slug),
name TEXT NOT NULL,
speed INT,
size TEXT,
full_data JSONB NOT NULL,
is_official BOOLEAN DEFAULT TRUE
);

-- Trasfondos (Backgrounds)
CREATE TABLE IF NOT EXISTS public.compendium_backgrounds (
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
system_id TEXT REFERENCES public.game_systems(slug),
name TEXT NOT NULL,
full_data JSONB NOT NULL,
is_official BOOLEAN DEFAULT TRUE
);

-- Hechizos
CREATE TABLE IF NOT EXISTS public.compendium_spells (
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
system_id TEXT REFERENCES public.game_systems(slug),
name TEXT NOT NULL,
level INT,
school TEXT,
casting_time TEXT,
range TEXT,
components TEXT,
duration TEXT,
description TEXT,
is_official BOOLEAN DEFAULT TRUE
);

-- Bestiario
CREATE TABLE IF NOT EXISTS public.compendium_bestiary (
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
system_id TEXT REFERENCES public.game_systems(slug),
name TEXT NOT NULL,
type TEXT,
cr_level FLOAT,
stats JSONB NOT NULL DEFAULT '{}',
image_url TEXT,
is_official BOOLEAN DEFAULT TRUE
);

-- Objetos (Items y Magic Items)
CREATE TABLE IF NOT EXISTS public.compendium_items (
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
system_id TEXT REFERENCES public.game_systems(slug),
name TEXT NOT NULL,
type TEXT,
rarity TEXT,
price TEXT,
weight TEXT,
effects_description TEXT,
stats JSONB DEFAULT '{}',
is_official BOOLEAN DEFAULT TRUE
);

-- Mecánicas (Feats, Conditions, Traits)
CREATE TABLE IF NOT EXISTS public.compendium_mechanics (
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
system_id TEXT REFERENCES public.game_systems(slug),
name TEXT NOT NULL,
type TEXT,
description TEXT,
is_official BOOLEAN DEFAULT TRUE
);

-- 3. POLÍTICAS DE SEGURIDAD (RLS)
-- Habilitamos lectura pública para todas
ALTER TABLE public.compendium_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compendium_subclasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compendium_races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compendium_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compendium_spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compendium_bestiary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compendium_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compendium_mechanics ENABLE ROW LEVEL SECURITY;

-- Crear políticas (si ya existen darán error, puedes ignorarlo o borrarlas antes)
DO $$ BEGIN
CREATE POLICY "Public Read Classes" ON public.compendium_classes FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Public Read Subclasses" ON public.compendium_subclasses FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Public Read Races" ON public.compendium_races FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Public Read Backgrounds" ON public.compendium_backgrounds FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;
-- (Repetir lógica para el resto si es necesario, Supabase suele ser permisivo en el SQL Editor si ejecutas varias veces)
