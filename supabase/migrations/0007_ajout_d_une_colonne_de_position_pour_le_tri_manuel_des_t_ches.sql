ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Initialiser les positions pour les tâches existantes
WITH ranked_tasks AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, list_id ORDER BY created_at DESC) as rn
  FROM public.tasks
)
UPDATE public.tasks
SET position = ranked_tasks.rn
FROM ranked_tasks
WHERE public.tasks.id = ranked_tasks.id;