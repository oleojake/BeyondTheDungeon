-- Migration: forum-images Storage bucket + RLS policies
-- Run this in Supabase SQL Editor

-- 1. Create the bucket (public so URLs work without signed tokens)
INSERT INTO storage.buckets (id, name, public)
VALUES ('forum-images', 'forum-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload their own files
--    Path convention: {userId}/{postOrThreadId}.{ext}
CREATE POLICY "Users can upload their own forum images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'forum-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own forum images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'forum-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own forum images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'forum-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Public read
CREATE POLICY "Forum images are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'forum-images');
