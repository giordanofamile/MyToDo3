-- Création de la table des paramètres utilisateur
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system',
  accent_color TEXT DEFAULT 'blue',
  compact_mode BOOLEAN DEFAULT false,
  pomodoro_work_duration INTEGER DEFAULT 25,
  pomodoro_short_break INTEGER DEFAULT 5,
  pomodoro_long_break INTEGER DEFAULT 15,
  pomodoro_auto_start BOOLEAN DEFAULT false,
  focus_breathing_duration INTEGER DEFAULT 4,
  focus_default_ambience TEXT DEFAULT 'none',
  tasks_default_priority TEXT DEFAULT 'medium',
  tasks_show_completed BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  notifications_sound BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation de la RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Users can manage their own settings" ON public.user_settings
FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Fonction pour créer les paramètres par défaut à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$;

-- Trigger pour les paramètres
DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_settings();