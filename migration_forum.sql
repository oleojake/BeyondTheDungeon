-- ─── Forum Tables ────────────────────────────────────────────────────────────
-- Hilos del foro
CREATE TABLE public.forum_threads (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text        NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  content     text        NOT NULL CHECK (char_length(content) >= 1),
  author_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

-- Mensajes de un hilo
CREATE TABLE public.forum_posts (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id   uuid        NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  content     text        NOT NULL CHECK (char_length(content) >= 1),
  author_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- ─── Índices ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_forum_threads_updated_at ON public.forum_threads(updated_at DESC);
CREATE INDEX idx_forum_posts_thread_id    ON public.forum_posts(thread_id);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts   ENABLE ROW LEVEL SECURITY;

-- Hilos: lectura pública, escritura autenticada, borrado solo por el autor
CREATE POLICY "forum_threads_select" ON public.forum_threads
  FOR SELECT USING (true);

CREATE POLICY "forum_threads_insert" ON public.forum_threads
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "forum_threads_delete" ON public.forum_threads
  FOR DELETE USING (auth.uid() = author_id);

-- Mensajes: lectura pública, escritura autenticada, borrado solo por el autor
CREATE POLICY "forum_posts_select" ON public.forum_posts
  FOR SELECT USING (true);

CREATE POLICY "forum_posts_insert" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "forum_posts_delete" ON public.forum_posts
  FOR DELETE USING (auth.uid() = author_id);

-- ─── Trigger updated_at ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.touch_forum_thread_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_forum_threads_updated_at
  BEFORE UPDATE ON public.forum_threads
  FOR EACH ROW EXECUTE FUNCTION public.touch_forum_thread_updated_at();
