-- S'assurer que le bucket est public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'attachments';

-- S'assurer qu'une politique de lecture publique existe
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'attachments');