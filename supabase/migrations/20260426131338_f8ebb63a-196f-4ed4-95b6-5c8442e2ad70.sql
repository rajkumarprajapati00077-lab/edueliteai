-- Drop overly broad authenticated-read policy (any logged-in user could read everything)
DROP POLICY IF EXISTS "notes pdf authenticated read" ON storage.objects;

-- Drop duplicate / unused upload+owner policies (kept the "notes storage *" set which already enforces owner folder)
DROP POLICY IF EXISTS "notes pdf auth upload" ON storage.objects;
DROP POLICY IF EXISTS "notes pdf owner update" ON storage.objects;
DROP POLICY IF EXISTS "notes pdf owner delete" ON storage.objects;