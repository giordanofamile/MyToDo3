-- Ajout des colonnes pour la hiérarchie et le style
ALTER TABLE public.lists 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.lists(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS bg_image TEXT,
ADD COLUMN IF NOT EXISTS bg_color TEXT;

-- Index pour optimiser les requêtes hiérarchiques
CREATE INDEX IF NOT EXISTS idx_lists_parent_id ON public.lists(parent_id);