-- Ajouter la colonne header_image à la table tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS header_image TEXT;

-- Créer la table attachments
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur attachments
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour attachments
CREATE POLICY "Users can manage their own attachments" ON public.attachments
FOR ALL TO authenticated USING (auth.uid() = user_id);