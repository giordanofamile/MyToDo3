import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Star, Trash2, Calendar, FileText, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import TagBadge from './TagBadge';

interface TaskItemProps {
  task: any;
  onToggle: (task: any) => void;
  onToggleImportant: (task: any) => void;
  onDelete: (id: string) => void;
  onClick: (task: any) => void;
}

const TaskItem = ({ task, onToggle, onToggleImportant, onDelete, onClick }: TaskItemProps) => {
  const [subtaskStats, setSubtaskStats] = useState({ total: 0, completed: 0 });
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) && !task.is_completed;

  useEffect(() => {
    fetchSubtaskStats();
  }, [task.id]);

  const fetchSubtaskStats = async () => {
    const { data, error } = await supabase
      .from('subtasks')
      .select('is_completed')
      .eq('task_id', task.id);
    
    if (!error && data) {
      setSubtaskStats({
        total: data.length,
        completed: data.filter(s => s.is_completed).length
      });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex items-center gap-4 bg-white/70 dark:bg-white/5 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-md hover:bg-white dark:hover:bg-white/10 transition-all duration-300 cursor-pointer"
      onClick={() => onClick(task)}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); onToggle(task); }}
        className="text-gray-300 dark:text-gray-600 hover:text-blue-500 transition-colors"
      >
        {task.is_completed ? (
          <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-50 dark:fill-blue-500/10" />
        ) : (
          <Circle className="w-6 h-6" />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={cn(
            "text-[15px] font-medium transition-all duration-300 truncate",
            task.is_completed ? "text-gray-400 dark:text-gray-600 line-through" : "text-gray-900 dark:text-white"
          )}>
            {task.title}
          </p>
          <div className="flex gap-1 overflow-hidden">
            {task.tags?.slice(0, 2).map((tag: string) => (
              <TagBadge key={tag} tag={tag} className="px-1.5 py-0" />
            ))}
            {task.tags?.length > 2 && (
              <span className="text-[9px] text-gray-400 font-bold">+{task.tags.length - 2}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Tâches</span>
          
          {subtaskStats.total > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md">
              <ListTodo className="w-3 h-3" />
              {subtaskStats.completed}/{subtaskStats.total}
            </div>
          )}

          {task.due_date && (
            <div className={cn(
              "flex items-center gap-1 text-[11px] font-medium",
              isOverdue ? "text-red-500" : "text-blue-500 dark:text-blue-400"
            )}>
              <Calendar className="w-3 h-3" />
              {format(new Date(task.due_date), 'eee d MMM', { locale: fr })}
            </div>
          )}
          {task.notes && <FileText className="w-3 h-3 text-gray-400 dark:text-gray-500" />}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleImportant(task); }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
        >
          <Star className={cn("w-4 h-4 transition-all", 
            task.is_important ? "fill-pink-500 text-pink-500 scale-110" : "text-gray-300 dark:text-gray-600 hover:text-pink-400"
          )} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskItem;