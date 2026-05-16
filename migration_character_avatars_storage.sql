-- Migration: character-avatars Storage bucket + RLS policies
-- Run this in Supabase SQL Editor

-- 1. Create the bucket (public so URLs work without signed tokens)
INSERT INTO storage.buckets (id, name, public)
VALUES ('character-avatars', 'character-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload/update their own files
--    Path convention: {userId}/{characterId}.{ext}
CREATE POLICY "Users can upload their own character avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'character-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own character avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'character-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own character avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'character-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow public read (bucket is public, but explicit policy for clarity)
CREATE POLICY "Character avatars are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'character-avatars');
