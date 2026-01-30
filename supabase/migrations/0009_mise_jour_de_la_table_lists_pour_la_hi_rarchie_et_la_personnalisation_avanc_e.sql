-- Ajout des colonnes nécessaires
ALTER TABLE public.lists ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.lists(id) ON DELETE CASCADE;
ALTER TABLE public.lists ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.lists ADD COLUMN IF NOT EXISTS bg_image TEXT;
ALTER TABLE public.lists ADD COLUMN IF NOT EXISTS bg_color TEXT;

-- Index pour optimiser les requêtes récursives
CREATE INDEX IF NOT EXISTS idx_lists_parent_id ON public.lists(parent_id);