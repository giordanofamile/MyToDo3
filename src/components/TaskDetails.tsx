import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Calendar as CalendarIcon, 
  Star, 
  Trash2, 
  X, 
  Plus, 
  Circle, 
  CheckCircle2, 
  Tag as TagIcon,
  RefreshCw,
  Clock,
  Archive,
  Layout,
  ListChecks,
  Hash,
  StickyNote
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { showError, showSuccess } from '@/utils/toast';
import TagBadge from './TagBadge';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskDetailsProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
}

const TaskDetails = ({ task, isOpen, onClose, onUpdate, onDelete }: TaskDetailsProps) => {
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (task?.id && isOpen) {
      fetchSubtasks();
    }
  }, [task?.id, isOpen]);

  const fetchSubtasks = async () => {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', task.id)
      .order('created_at', { ascending: true });
    
    if (error) showError(error.message);
    else setSubtasks(data || []);
  };

  const addSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;

    const { data, error } = await supabase
      .from('subtasks')
      .insert([{ title: newSubtask, task_id: task.id }])
      .select();

    if (error) showError(error.message);
    else {
      setSubtasks([...subtasks, data[0]]);
      setNewSubtask('');
    }
  };

  const toggleSubtask = async (subtask: any) => {
    const { error } = await supabase
      .from('subtasks')
      .update({ is_completed: !subtask.is_completed })
      .eq('id', subtask.id);

    if (error) showError(error.message);
    else {
      setSubtasks(subtasks.map(s => s.id === subtask.id ? { ...s, is_completed: !s.is_completed } : s));
    }
  };

  const deleteSubtask = async (id: string) => {
    const { error } = await supabase.from('subtasks').delete().eq('id', id);
    if (error) showError(error.message);
    else setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const addTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    const currentTags = task.tags || [];
    if (currentTags.includes(newTag.trim())) return;
    
    onUpdate(task.id, { tags: [...currentTags, newTag.trim()] });
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    onUpdate(task.id, { tags: task.tags.filter((t: string) => t !== tagToRemove) });
  };

  const completedSubtasks = subtasks.filter(s => s.is_completed).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl h-[90vh] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-[#F8F9FA] dark:bg-[#1C1C1E]">
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Header - Fixed Height */}
          <div className="flex-none p-6 sm:p-8 bg-white dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex-1">
                <input
                  className="w-full text-2xl sm:text-3xl font-black bg-transparent border-none focus:ring-0 p-0 dark:text-white placeholder:text-gray-300 outline-none"
                  value={task.title}
                  onChange={(e) => onUpdate(task.id, { title: e.target.value })}
                  placeholder="Titre de la tâche"
                />
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1.5 flex-1 max-w-[200px] bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {completedSubtasks}/{subtasks.length} Étapes
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-2xl h-12 w-12 transition-all",
                    task.is_important ? "bg-pink-500/10 text-pink-500" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                  )}
                  onClick={() => onUpdate(task.id, { is_important: !task.is_important })}
                >
                  <Star className={cn("w-6 h-6", task.is_important && "fill-current")} />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl h-12 w-12 text-gray-400">
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start bg-transparent h-auto p-0 gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
                <TabsTrigger value="general" className="data-[state=active]:text-blue-500 data-[state=active]:bg-blue-500/10 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-all flex items-center gap-2">
                  <Layout className="w-4 h-4" /> Général
                </TabsTrigger>
                <TabsTrigger value="steps" className="data-[state=active]:text-orange-500 data-[state=active]:bg-orange-500/10 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-all flex items-center gap-2">
                  <ListChecks className="w-4 h-4" /> Étapes
                </TabsTrigger>
                <TabsTrigger value="org" className="data-[state=active]:text-purple-500 data-[state=active]:bg-purple-500/10 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-all flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Organisation
                </TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:text-teal-500 data-[state=active]:bg-teal-500/10 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-all flex items-center gap-2">
                  <StickyNote className="w-4 h-4" /> Notes
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-transparent">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {activeTab === 'general' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Priorité</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {['low', 'medium', 'high'].map((p) => (
                            <button
                              key={p}
                              onClick={() => onUpdate(task.id, { priority: p })}
                              className={cn(
                                "h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                task.priority === p 
                                  ? p === 'high' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                                    : p === 'medium' ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                    : "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                  : "bg-white dark:bg-white/5 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10"
                              )}
                            >
                              {p === 'low' ? 'Basse' : p === 'medium' ? 'Moyenne' : 'Haute'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Récurrence</Label>
                        <Select value={task.recurrence || 'none'} onValueChange={(val) => onUpdate(task.id, { recurrence: val })}>
                          <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-white/5 border-none shadow-none text-sm font-bold focus:ring-0">
                            <div className="flex items-center gap-3">
                              <RefreshCw className="w-5 h-5 text-blue-500" />
                              <SelectValue placeholder="Aucune" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            <SelectItem value="none">Aucune</SelectItem>
                            <SelectItem value="daily">Quotidien</SelectItem>
                            <SelectItem value="weekly">Hebdomadaire</SelectItem>
                            <SelectItem value="monthly">Mensuel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Estimation</Label>
                        <Select value={task.estimated_minutes?.toString() || '0'} onValueChange={(val) => onUpdate(task.id, { estimated_minutes: parseInt(val) })}>
                          <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-white/5 border-none shadow-none text-sm font-bold focus:ring-0">
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-orange-500" />
                              <SelectValue placeholder="0 min" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            <SelectItem value="0">Aucune</SelectItem>
                            <SelectItem value="5">5 min</SelectItem>
                            <SelectItem value="15">15 min</SelectItem>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="60">1 heure</SelectItem>
                            <SelectItem value="120">2 heures</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Échéance</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" className="w-full h-14 rounded-2xl bg-white dark:bg-white/5 border-none shadow-none justify-start text-sm font-bold hover:bg-white/80 dark:hover:bg-white/10">
                              <CalendarIcon className="mr-3 h-5 w-5 text-teal-500" />
                              {task.due_date ? format(new Date(task.due_date), 'PPP', { locale: fr }) : "Ajouter une date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none" align="start">
                            <Calendar
                              mode="single"
                              selected={task.due_date ? new Date(task.due_date) : undefined}
                              onSelect={(date) => onUpdate(task.id, { due_date: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'steps' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-3">
                      {subtasks.map((sub) => (
                        <motion.div 
                          layout
                          key={sub.id} 
                          className="flex items-center gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl group border-none transition-all shadow-sm"
                        >
                          <button onClick={() => toggleSubtask(sub)} className="transition-transform active:scale-90">
                            {sub.is_completed ? (
                              <CheckCircle2 className="w-6 h-6 text-orange-500" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-300" />
                            )}
                          </button>
                          <span className={cn("flex-1 text-sm font-medium", sub.is_completed && "text-gray-400 line-through")}>
                            {sub.title}
                          </span>
                          <button 
                            onClick={() => deleteSubtask(sub.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                      <form onSubmit={addSubtask} className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/5 transition-all group">
                        <div className="p-1 bg-orange-500/10 rounded-lg text-orange-500 group-hover:scale-110 transition-transform">
                          <Plus className="w-5 h-5" />
                        </div>
                        <input 
                          placeholder="Ajouter une étape..."
                          className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full placeholder:text-gray-400 outline-none"
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                        />
                      </form>
                    </div>
                  </div>
                )}

                {activeTab === 'org' && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tags</Label>
                      <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-white/5 rounded-[2rem] min-h-[100px] shadow-sm">
                        {task.tags?.map((tag: string) => (
                          <TagBadge key={tag} tag={tag} onRemove={removeTag} className="h-8 px-4 text-xs" />
                        ))}
                        {(!task.tags || task.tags.length === 0) && (
                          <p className="text-gray-400 text-xs font-medium italic flex items-center gap-2">
                            <TagIcon className="w-4 h-4" /> Aucun tag pour le moment
                          </p>
                        )}
                      </div>
                      <form onSubmit={addTag} className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-white/5 shadow-sm">
                        <TagIcon className="w-5 h-5 text-purple-500" />
                        <input 
                          placeholder="Nouveau tag (Entrée)"
                          className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full outline-none"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                        />
                      </form>
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Notes détaillées</Label>
                    <Textarea
                      placeholder="Écrivez vos pensées, liens ou détails ici..."
                      className="min-h-[300px] rounded-[2rem] bg-white dark:bg-white/5 border-none shadow-sm focus-visible:ring-0 resize-none p-8 text-base leading-relaxed outline-none"
                      value={task.notes || ''}
                      onChange={(e) => onUpdate(task.id, { notes: e.target.value })}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer - Fixed Height, Always Visible */}
          <div className="flex-none p-6 sm:p-8 bg-white dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                className={cn(
                  "flex-1 sm:flex-none h-12 rounded-2xl px-6 font-bold transition-all",
                  task.is_archived ? "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
                )}
                onClick={() => {
                  onUpdate(task.id, { is_archived: !task.is_archived });
                  onClose();
                  showSuccess(task.is_archived ? "Tâche désarchivée" : "Tâche archivée");
                }}
              >
                <Archive className="mr-2 h-4 w-4" />
                {task.is_archived ? "Désarchiver" : "Archiver"}
              </Button>
              <Button 
                variant="ghost" 
                className="flex-1 sm:flex-none h-12 rounded-2xl px-6 font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                onClick={() => { onDelete(task.id); onClose(); }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
            
            <Button 
              onClick={onClose}
              className="w-full sm:w-auto h-14 rounded-2xl px-12 bg-black dark:bg-white text-white dark:text-black font-black text-lg shadow-xl hover:scale-105 transition-all active:scale-95"
            >
              Terminer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetails;