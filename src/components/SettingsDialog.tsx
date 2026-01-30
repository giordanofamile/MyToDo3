import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Settings2, Palette, Timer, Brain, 
  Bell, Layout, Check, Save, Loader2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT_COLORS = [
  { name: 'Bleu', value: 'blue', class: 'bg-blue-500' },
  { name: 'Rose', value: 'pink', class: 'bg-pink-500' },
  { name: 'Violet', value: 'purple', class: 'bg-purple-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Vert', value: 'green', class: 'bg-green-500' },
];

const SettingsDialog = ({ isOpen, onClose }: SettingsDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { setTheme, theme: currentTheme } = useTheme();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (isOpen) fetchSettings();
  }, [isOpen]);

  const fetchSettings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Tenter de récupérer les réglages
    let { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Si les réglages n'existent pas (compte existant avant la migration), on les crée
    if (error && error.code === 'PGRST116') {
      const { data: newData, error: insertError } = await supabase
        .from('user_settings')
        .insert([{ user_id: user.id }])
        .select()
        .single();
      
      if (insertError) {
        showError("Impossible de créer les réglages");
      } else {
        data = newData;
      }
    }

    if (data) setSettings(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', settings.user_id);

    if (error) showError(error.message);
    else {
      showSuccess("Paramètres enregistrés");
      if (settings.theme !== currentTheme) setTheme(settings.theme);
      onClose();
    }
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-[#1C1C1E] overflow-hidden">
        <DialogHeader className="p-8 pb-4 flex-none">
          <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <Settings2 className="w-6 h-6 text-blue-500" />
            </div>
            Réglages
          </DialogTitle>
        </DialogHeader>

        {loading || !settings ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            <Tabs defaultValue="appearance" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="px-8 bg-transparent border-none h-auto p-0 gap-6 overflow-x-auto no-scrollbar flex-none">
                <TabsTrigger value="appearance" className="data-[state=active]:text-blue-500 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 px-0 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Apparence</TabsTrigger>
                <TabsTrigger value="pomodoro" className="data-[state=active]:text-orange-500 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 px-0 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Pomodoro</TabsTrigger>
                <TabsTrigger value="focus" className="data-[state=active]:text-purple-500 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 px-0 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Focus</TabsTrigger>
                <TabsTrigger value="tasks" className="data-[state=active]:text-teal-500 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-teal-500 px-0 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Tâches</TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:text-pink-500 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 px-0 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Alertes</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <TabsContent value="appearance" className="mt-0 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Thème de l'interface</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {['light', 'dark', 'system'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setSettings({ ...settings, theme: t })}
                          className={cn(
                            "h-12 rounded-2xl border-2 transition-all font-bold text-xs capitalize",
                            settings.theme === t ? "border-blue-500 bg-blue-500/5 text-blue-500" : "border-gray-100 dark:border-white/5 text-gray-400"
                          )}
                        >
                          {t === 'light' ? 'Clair' : t === 'dark' ? 'Sombre' : 'Système'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Couleur d'accentuation</Label>
                    <div className="flex gap-3">
                      {ACCENT_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setSettings({ ...settings, accent_color: c.value })}
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            c.class,
                            settings.accent_color === c.value ? "ring-4 ring-blue-500/20 scale-110" : "opacity-60 hover:opacity-100"
                          )}
                        >
                          {settings.accent_color === c.value && <Check className="w-5 h-5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-[2rem]">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Mode Compact</Label>
                      <p className="text-[10px] text-gray-400 font-medium">Réduit l'espacement des listes</p>
                    </div>
                    <Switch 
                      checked={settings.compact_mode} 
                      onCheckedChange={(val) => setSettings({ ...settings, compact_mode: val })} 
                    />
                  </div>
                </TabsContent>

                <TabsContent value="pomodoro" className="mt-0 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Durée de Focus</Label>
                        <span className="text-xs font-bold text-orange-500">{settings.pomodoro_work_duration} min</span>
                      </div>
                      <Slider 
                        value={[settings.pomodoro_work_duration]} 
                        onValueChange={([val]) => setSettings({ ...settings, pomodoro_work_duration: val })} 
                        max={60} min={5} step={5} 
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Petite Pause</Label>
                        <span className="text-xs font-bold text-blue-500">{settings.pomodoro_short_break} min</span>
                      </div>
                      <Slider 
                        value={[settings.pomodoro_short_break]} 
                        onValueChange={([val]) => setSettings({ ...settings, pomodoro_short_break: val })} 
                        max={15} min={1} step={1} 
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-[2rem]">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold">Démarrage Automatique</Label>
                        <p className="text-[10px] text-gray-400 font-medium">Lance la pause dès que le focus finit</p>
                      </div>
                      <Switch 
                        checked={settings.pomodoro_auto_start} 
                        onCheckedChange={(val) => setSettings({ ...settings, pomodoro_auto_start: val })} 
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="focus" className="mt-0 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rythme Respiratoire</Label>
                        <span className="text-xs font-bold text-purple-500">{settings.focus_breathing_duration}s</span>
                      </div>
                      <Slider 
                        value={[settings.focus_breathing_duration]} 
                        onValueChange={([val]) => setSettings({ ...settings, focus_breathing_duration: val })} 
                        max={10} min={2} step={1} 
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ambiance par défaut</Label>
                      <Select value={settings.focus_default_ambience} onValueChange={(val) => setSettings({ ...settings, focus_default_ambience: val })}>
                        <SelectTrigger className="h-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-none font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                          <SelectItem value="none">Silence</SelectItem>
                          <SelectItem value="rain">Pluie</SelectItem>
                          <SelectItem value="forest">Forêt</SelectItem>
                          <SelectItem value="cafe">Café</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tasks" className="mt-0 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Priorité par défaut</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {['low', 'medium', 'high'].map((p) => (
                          <button
                            key={p}
                            onClick={() => setSettings({ ...settings, tasks_default_priority: p })}
                            className={cn(
                              "h-12 rounded-2xl border-2 transition-all font-bold text-[10px] uppercase tracking-widest",
                              settings.tasks_default_priority === p ? "border-teal-500 bg-teal-500/5 text-teal-500" : "border-gray-100 dark:border-white/5 text-gray-400"
                            )}
                          >
                            {p === 'low' ? 'Basse' : p === 'medium' ? 'Moyenne' : 'Haute'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-[2rem]">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold">Afficher les tâches terminées</Label>
                        <p className="text-[10px] text-gray-400 font-medium">Garde les tâches faites visibles</p>
                      </div>
                      <Switch 
                        checked={settings.tasks_show_completed} 
                        onCheckedChange={(val) => setSettings({ ...settings, tasks_show_completed: val })} 
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="mt-0 space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-[2rem]">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold">Notifications Bureau</Label>
                        <p className="text-[10px] text-gray-400 font-medium">Alertes système pour les échéances</p>
                      </div>
                      <Switch 
                        checked={settings.notifications_enabled} 
                        onCheckedChange={(val) => setSettings({ ...settings, notifications_enabled: val })} 
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-[2rem]">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold">Sons de l'application</Label>
                        <p className="text-[10px] text-gray-400 font-medium">Effets sonores lors de la complétion</p>
                      </div>
                      <Switch 
                        checked={settings.notifications_sound} 
                        onCheckedChange={(val) => setSettings({ ...settings, notifications_sound: val })} 
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <div className="p-8 pt-4 flex-none border-t border-gray-100 dark:border-white/5">
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="w-full h-14 rounded-[1.5rem] bg-black dark:bg-white text-white dark:text-black font-black text-lg shadow-xl active:scale-95 transition-all"
              >
                {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Enregistrer les réglages</>}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;