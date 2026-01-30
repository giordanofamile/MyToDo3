-- Ajout des colonnes pour la personnalisation
ALTER TABLE public.lists 
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Hash',
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'text-blue-500';