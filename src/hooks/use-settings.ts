import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();

    // Souscription en temps réel aux changements de paramètres
    const channel = supabase
      .channel('settings_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'user_settings' 
      }, (payload) => {
        setSettings(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) setSettings(data);
    setLoading(false);
  };

  return { settings, loading };
}