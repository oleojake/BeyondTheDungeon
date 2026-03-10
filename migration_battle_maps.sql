-- ==============================================================================
-- TABLA: battle_maps
-- Descripción: Almacena los mapas de batalla cargados por los usuarios
-- ==============================================================================

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS public.battle_maps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_data TEXT NOT NULL, -- Base64 de la imagen
  grid_size INTEGER DEFAULT 50,
  grid_color TEXT DEFAULT 'rgba(255, 255, 255, 0.3)',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columna grid_color si no existe (para migraciones sobre tablas existentes)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'battle_maps' 
    AND column_name = 'grid_color'
  ) THEN
    ALTER TABLE public.battle_maps ADD COLUMN grid_color TEXT DEFAULT 'rgba(255, 255, 255, 0.3)';
  END IF;
END $$;

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_battle_maps_user_id ON public.battle_maps(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_maps_created_at ON public.battle_maps(created_at DESC);

-- ==============================================================================
-- RLS (Row Level Security)
-- ==============================================================================
ALTER TABLE public.battle_maps ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own maps" ON public.battle_maps;
DROP POLICY IF EXISTS "Users can insert their own maps" ON public.battle_maps;
DROP POLICY IF EXISTS "Users can update their own maps" ON public.battle_maps;
DROP POLICY IF EXISTS "Users can delete their own maps" ON public.battle_maps;

-- Los usuarios pueden ver solo sus propios mapas
CREATE POLICY "Users can view their own maps"
  ON public.battle_maps
  FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden insertar sus propios mapas
CREATE POLICY "Users can insert their own maps"
  ON public.battle_maps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar solo sus propios mapas
CREATE POLICY "Users can update their own maps"
  ON public.battle_maps
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar solo sus propios mapas
CREATE POLICY "Users can delete their own maps"
  ON public.battle_maps
  FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGER: Actualizar updated_at automáticamente
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_battle_maps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe y recrearlo
DROP TRIGGER IF EXISTS trigger_update_battle_maps_updated_at ON public.battle_maps;

CREATE TRIGGER trigger_update_battle_maps_updated_at
  BEFORE UPDATE ON public.battle_maps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_battle_maps_updated_at();
