-- 1. Création du bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

-- 3. Politique pour permettre la lecture publique (puisque le bucket est public)
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'attachments');

-- 4. Politique pour permettre la suppression de ses propres fichiers
CREATE POLICY "Allow individual delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'attachments' AND (storage.foldername(name))[1] = auth.uid()::text);