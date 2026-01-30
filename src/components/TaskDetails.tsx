import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  Clock
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { showError } from '@/utils/toast';
import TagBadge from './TagBadge';

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

  if (!task) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md border-l border-gray-200 bg-[#F5F5F7]/95 backdrop-blur-xl p-0">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-6 bg-white/50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-semibold">Détails</SheetTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <input
                className="w-full text-lg font-medium bg-transparent border-none focus:ring-0 p-0"
                value={task.title}
                onChange={(e) => onUpdate(task.id, { title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Récurrence</label>
                <Select 
                  value={task.recurrence || 'none'} 
                  onValueChange={(val) => onUpdate(task.id, { recurrence: val })}
                >
                  <SelectTrigger className="rounded-xl bg-white border-gray-100 h-11">
                    <RefreshCw className="w-4 h-4 mr-2 text-blue-500" />
                    <SelectValue placeholder="Aucune" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="none">Aucune</SelectItem>
                    <SelectItem value="daily">Quotidien</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Estimation</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3.5 w-4 h-4 text-orange-500" />
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full h-11 pl-10 rounded-xl bg-white border border-gray-100 focus:ring-2 focus:ring-blue-500/20 text-sm"
                    value={task.estimated_minutes || ''}
                    onChange={(e) => onUpdate(task.id, { estimated_minutes: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">ÉTAPES</label>
              <div className="space-y-2">
                {subtasks.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-3 bg-white/50 p-3 rounded-xl group">
                    <button onClick={() => toggleSubtask(sub)}>
                      {sub.is_completed ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </button>
                    <span className={cn("flex-1 text-sm", sub.is_completed && "text-gray-400 line-through")}>
                      {sub.title}
                    </span>
                    <button 
                      onClick={() => deleteSubtask(sub.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <form onSubmit={addSubtask} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                  <Plus className="w-5 h-5 text-blue-500" />
                  <input 
                    placeholder="Ajouter une étape"
                    className="bg-transparent border-none focus:ring-0 text-sm w-full"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                  />
                </form>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">TAGS</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {task.tags?.map((tag: string) => (
                  <TagBadge key={tag} tag={tag} onRemove={removeTag} />
                ))}
              </div>
              <form onSubmit={addTag} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                <TagIcon className="w-4 h-4 text-gray-400" />
                <input 
                  placeholder="Ajouter un tag (Entrée)"
                  className="bg-transparent border-none focus:ring-0 text-sm w-full"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                />
              </form>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">ÉCHÉANCE</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12 rounded-2xl bg-white border-gray-100 shadow-sm",
                      !task.due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
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

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">NOTES</label>
              <Textarea
                placeholder="Ajouter une note..."
                className="min-h-[120px] rounded-2xl bg-white border-gray-100 shadow-sm focus-visible:ring-blue-500 resize-none p-4"
                value={task.notes || ''}
                onChange={(e) => onUpdate(task.id, { notes: e.target.value })}
              />
            </div>

            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-12 rounded-2xl transition-all",
                task.is_important ? "text-pink-500 bg-pink-50" : "text-gray-600 hover:bg-white"
              )}
              onClick={() => onUpdate(task.id, { is_important: !task.is_important })}
            >
              <Star className={cn("mr-2 h-4 w-4", task.is_important && "fill-pink-500")} />
              {task.is_important ? "Marqué comme important" : "Marquer comme important"}
            </Button>
          </div>

          <div className="p-6 bg-white/50 border-t border-gray-200">
            <Button 
              variant="ghost" 
              className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl h-12"
              onClick={() => { onDelete(task.id); onClose(); }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer la tâche
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetails;