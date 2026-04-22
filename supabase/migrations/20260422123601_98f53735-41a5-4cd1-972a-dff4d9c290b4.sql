drop policy if exists "notes pdf public read" on storage.objects;

create policy "notes pdf authenticated read"
on storage.objects for select
using (bucket_id = 'notes' and auth.uid() is not null);