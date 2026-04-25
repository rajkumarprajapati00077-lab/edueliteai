
-- Make notes bucket private
UPDATE storage.buckets SET public = false WHERE id = 'notes';

-- Drop existing notes storage policies if any, then recreate strict ones
DROP POLICY IF EXISTS "notes storage select" ON storage.objects;
DROP POLICY IF EXISTS "notes storage insert" ON storage.objects;
DROP POLICY IF EXISTS "notes storage update" ON storage.objects;
DROP POLICY IF EXISTS "notes storage delete" ON storage.objects;

CREATE POLICY "notes storage select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'notes'
  AND (
    -- Owner can always read their files (path begins with their uid)
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.notes n
      WHERE n.file_path = name
        AND n.is_private = false
    )
  )
);

CREATE POLICY "notes storage insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'notes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "notes storage update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'notes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "notes storage delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'notes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Explicitly block UPDATE on messages so chat messages remain immutable
DROP POLICY IF EXISTS "messages no update" ON public.messages;
CREATE POLICY "messages no update"
ON public.messages FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);
