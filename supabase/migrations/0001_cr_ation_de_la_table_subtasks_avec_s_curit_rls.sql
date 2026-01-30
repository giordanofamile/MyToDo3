-- Table pour les sous-tâches
CREATE TABLE public.subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation de la sécurité RLS
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- Politique : un utilisateur peut gérer les sous-tâches si la tâche parente lui appartient
CREATE POLICY "Users can manage subtasks of their tasks" ON public.subtasks
FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = subtasks.task_id 
    AND tasks.user_id = auth.uid()
  )
);