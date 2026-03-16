-- ================================================
-- HOTFIX: Characters RLS for DM visibility/edit
-- ================================================
-- Some environments had policies referencing campaigns.gm_id (legacy),
-- while current schema uses campaigns.dm_id.
-- This hotfix standardizes policies to use public.is_campaign_dm(campaign_id).

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ver personajes públicos" ON public.characters;
DROP POLICY IF EXISTS "Ver mis personajes" ON public.characters;
DROP POLICY IF EXISTS "GM ve personajes de su campaña" ON public.characters;
DROP POLICY IF EXISTS "Crear mis personajes" ON public.characters;
DROP POLICY IF EXISTS "Editar mis personajes" ON public.characters;
DROP POLICY IF EXISTS "GM edita personajes de su campaña" ON public.characters;

CREATE POLICY "Ver personajes públicos"
  ON public.characters FOR SELECT
  USING (is_public = true);

CREATE POLICY "Ver mis personajes"
  ON public.characters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "DM ve personajes de su campaña"
  ON public.characters FOR SELECT
  USING (public.is_campaign_dm(campaign_id));

CREATE POLICY "Crear mis personajes"
  ON public.characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Editar mis personajes"
  ON public.characters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "DM edita personajes de su campaña"
  ON public.characters FOR UPDATE
  USING (public.is_campaign_dm(campaign_id));
