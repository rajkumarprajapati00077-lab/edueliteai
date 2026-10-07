DROP POLICY IF EXISTS "notes storage select" ON storage.objects;

CREATE POLICY "notes storage select owner or shared"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'notes'
  AND (
    owner_id = (select auth.uid()::text)
    OR EXISTS (
      SELECT 1 FROM public.notes n
      WHERE n.file_path = storage.objects.name
        AND n.is_private = false
    )
  )
);