-- Migración: Agregar columna experience_points y verificar políticas RLS
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar columna experience_points
ALTER TABLE public.characters 
ADD COLUMN IF NOT EXISTS experience_points INT DEFAULT 0;

COMMENT ON COLUMN public.characters.experience_points IS 'Puntos de experiencia del personaje';

-- 2. Verificar y recrear políticas RLS para characters
-- Primero eliminamos las políticas existentes para evitar duplicados
DROP POLICY IF EXISTS "Ver personajes públicos" ON public.characters;
DROP POLICY IF EXISTS "Ver mis personajes" ON public.characters;
DROP POLICY IF EXISTS "GM ve personajes de su campaña" ON public.characters;
DROP POLICY IF EXISTS "Editar mis personajes" ON public.characters;
DROP POLICY IF EXISTS "GM edita personajes de su campaña" ON public.characters;
DROP POLICY IF EXISTS "Crear mis personajes" ON public.characters;

-- Recrear políticas
CREATE POLICY "Ver personajes públicos" 
  ON public.characters FOR SELECT 
  USING (is_public = true);

CREATE POLICY "Ver mis personajes" 
  ON public.characters FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "GM ve personajes de su campaña" 
  ON public.characters FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE id = campaign_id AND gm_id = auth.uid()
    )
  );

CREATE POLICY "Crear mis personajes" 
  ON public.characters FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Editar mis personajes" 
  ON public.characters FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "GM edita personajes de su campaña" 
  ON public.characters FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE id = campaign_id AND gm_id = auth.uid()
    )
  );

-- Asegurarse de que RLS está habilitado
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

