-- Table pour les listes personnalisées
CREATE TABLE public.lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'Hash',
  color TEXT DEFAULT 'text-blue-500',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les tâches
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  notes TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  is_important BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMP WITH TIME ZONE,
  list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation de la sécurité RLS
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Politiques pour les listes
CREATE POLICY "Users can manage their own lists" ON public.lists
FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Politiques pour les tâches
CREATE POLICY "Users can manage their own tasks" ON public.tasks
FOR ALL TO authenticated USING (auth.uid() = user_id);