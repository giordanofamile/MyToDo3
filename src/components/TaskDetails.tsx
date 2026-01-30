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
      <DialogContent className="max-w-[95vw] md:max-w-3xl h-[80vh] p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl bg-white dark:bg-[#1C1C1E]">
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Header - Compact */}
          <div className="flex-none p-5 sm:p-6 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex-1">
                <input
                  className="w-full text-xl sm:text-2xl font-black bg-transparent border-none focus:ring-0 p-0 dark:text-white placeholder:text-gray-300 outline-none"
                  value={task.title}
                  onChange={(e) => onUpdate(task.id, { title: e.target.value })}
                  placeholder="Titre de la tâche"
                />
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1 flex-1 max-w-[150px] bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    {completedSubtasks}/{subtasks.length} Étapes
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-xl h-10 w-10 transition-all",
                    task.is_important ? "text-pink-500" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                  )}
                  onClick={() => onUpdate(task.id, { is_important: !task.is_important })}
                >
                  <Star className={cn("w-5 h-5", task.is_important && "fill-current")} />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl h-10 w-10 text-gray-400">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start bg-transparent h-auto p-0 gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
                <TabsTrigger value="general" className="data-[state=active]:text-blue-500 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 px-0 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all flex items-center gap-2">
                  Général
                </TabsTrigger>
                <TabsTrigger value="steps" className="data-[state=active]:text-orange-500 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 px-0 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all flex items-center gap-2">
                  Étapes
                </TabsTrigger>
                <TabsTrigger value="org" className="data-[state=active]:text-purple-500 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 px-0 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all flex items-center gap-2">
                  Organisation
                </TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:text-teal-500 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-teal-500 px-0 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all flex items-center gap-2">
                  Notes
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content Area - Compact & Borderless */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full"
              >
                {activeTab === 'general' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Priorité</Label>
                        <div className="flex gap-1">
                          {['low', 'medium', 'high'].map((p) => (
                            <button
                              key={p}
                              onClick={() => onUpdate(task.id, { priority: p })}
                              className={cn(
                                "flex-1 h-9 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                task.priority === p 
                                  ? p === 'high' ? "bg-red-500 text-white" 
                                    : p === 'medium' ? "bg-orange-500 text-white"
                                    : "bg-blue-500 text-white"
                                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              )}
                            >
                              {p === 'low' ? 'Basse' : p === 'medium' ? 'Moyenne' : 'Haute'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Récurrence</Label>
                        <Select value={task.recurrence || 'none'} onValueChange={(val) => onUpdate(task.id, { recurrence: val })}>
                          <SelectTrigger className="h-10 rounded-none bg-transparent border-none shadow-none text-sm font-bold focus:ring-0 p-0">
                            <div className="flex items-center gap-2">
                              <RefreshCw className="w-4 h-4 text-blue-500" />
                              <SelectValue placeholder="Aucune" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                            <SelectItem value="none">Aucune</SelectItem>
                            <SelectItem value="daily">Quotidien</SelectItem>
                            <SelectItem value="weekly">Hebdomadaire</SelectItem>
                            <SelectItem value="monthly">Mensuel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Estimation</Label>
                        <Select value={task.estimated_minutes?.toString() || '0'} onValueChange={(val) => onUpdate(task.id, { estimated_minutes: parseInt(val) })}>
                          <SelectTrigger className="h-10 rounded-none bg-transparent border-none shadow-none text-sm font-bold focus:ring-0 p-0">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-orange-500" />
                              <SelectValue placeholder="0 min" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                            <SelectItem value="0">Aucune</SelectItem>
                            <SelectItem value="5">5 min</SelectItem>
                            <SelectItem value="15">15 min</SelectItem>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="60">1 heure</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Échéance</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" className="w-full h-10 rounded-none bg-transparent border-none shadow-none justify-start text-sm font-bold p-0 hover:bg-transparent">
                              <CalendarIcon className="mr-2 h-4 w-4 text-teal-500" />
                              {task.due_date ? format(new Date(task.due_date), 'd MMM yyyy', { locale: fr }) : "Ajouter une date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-xl shadow-2xl border-none" align="start">
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
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-1">
                      {subtasks.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-3 py-2 group">
                          <button onClick={() => toggleSubtask(sub)} className="transition-transform active:scale-90">
                            {sub.is_completed ? (
                              <CheckCircle2 className="w-5 h-5 text-orange-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300" />
                            )}
                          </button>
                          <span className={cn("flex-1 text-sm font-medium", sub.is_completed && "text-gray-400 line-through")}>
                            {sub.title}
                          </span>
                          <button onClick={() => deleteSubtask(sub.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <form onSubmit={addSubtask} className="flex items-center gap-3 py-2">
                        <Plus className="w-4 h-4 text-orange-500" />
                        <input 
                          placeholder="Ajouter une étape..."
                          className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full placeholder:text-gray-400 outline-none p-0"
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                        />
                      </form>
                    </div>
                  </div>
                )}

                {activeTab === 'org' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tags</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {task.tags?.map((tag: string) => (
                          <TagBadge key={tag} tag={tag} onRemove={removeTag} className="h-6 px-2 text-[9px]" />
                        ))}
                      </div>
                      <form onSubmit={addTag} className="flex items-center gap-2 py-2 border-b border-gray-100 dark:border-white/5">
                        <TagIcon className="w-4 h-4 text-purple-500" />
                        <input 
                          placeholder="Nouveau tag..."
                          className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full outline-none p-0"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                        />
                      </form>
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="h-full">
                    <Textarea
                      placeholder="Notes..."
                      className="min-h-[200px] rounded-none bg-transparent border-none shadow-none focus-visible:ring-0 resize-none p-0 text-sm leading-relaxed outline-none"
                      value={task.notes || ''}
                      onChange={(e) => onUpdate(task.id, { notes: e.target.value })}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer - Compact */}
          <div className="flex-none p-5 sm:p-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-xl text-gray-400 hover:text-indigo-500"
                onClick={() => {
                  onUpdate(task.id, { is_archived: !task.is_archived });
                  onClose();
                }}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archiver
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-9 rounded-xl text-gray-400 hover:text-red-500"
                onClick={() => { onDelete(task.id); onClose(); }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
            
            <Button 
              onClick={onClose}
              className="h-10 rounded-xl px-6 bg-black dark:bg-white text-white dark:text-black font-bold text-sm shadow-lg"
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