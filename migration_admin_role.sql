-- ==============================================================================
-- MIGRATION: Admin Role
-- Añade el campo is_admin a la tabla profiles y crea una función RPC
-- para que el backend pueda obtener estadísticas de uso (con service_role).
-- ==============================================================================

-- 1. Añadir columna is_admin a profiles (solo si no existe)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Actualizar la política de lectura pública (ya existe, no hace falta tocarla)
-- Los perfiles siguen siendo de lectura pública.

-- 3. (Opcional) Marcar un usuario como admin manualmente por su email:
-- UPDATE public.profiles
--   SET is_admin = TRUE
--   WHERE email = 'tu_email_admin@ejemplo.com';

-- ==============================================================================
-- NOTA: Para que el backend pueda leer is_admin sin RLS, usa el cliente con
-- SUPABASE_SERVICE_ROLE_KEY (ya lo hace el supabase admin client en index.js).
-- ==============================================================================
