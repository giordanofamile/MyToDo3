import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Star, Trash2, Calendar, FileText, ListTodo, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import TagBadge from './TagBadge';
import { Progress } from '@/components/ui/progress';

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

  const progress = subtaskStats.total > 0 ? (subtaskStats.completed / subtaskStats.total) * 100 : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-500/10';
      case 'medium': return 'text-orange-500 bg-orange-50 dark:bg-orange-500/10';
      case 'low': return 'text-blue-500 bg-blue-50 dark:bg-blue-500/10';
      default: return 'text-gray-400 bg-gray-50 dark:bg-white/5';
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
            {task.priority && task.priority !== 'medium' && (
              <span className={cn("px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter", getPriorityColor(task.priority))}>
                {task.priority === 'high' ? 'Urgent' : 'Basse'}
              </span>
            )}
            {task.recurrence && task.recurrence !== 'none' && (
              <RefreshCw className="w-3 h-3 text-blue-400 animate-spin-slow" />
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-1">
          {subtaskStats.total > 0 && (
            <div className="flex items-center gap-2 flex-1 max-w-[100px]">
              <Progress value={progress} className="h-1 bg-gray-100 dark:bg-white/5" />
              <span className="text-[9px] font-bold text-gray-400">{subtaskStats.completed}/{subtaskStats.total}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {task.estimated_minutes > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-orange-500 font-bold">
                <Clock className="w-3 h-3" />
                {task.estimated_minutes}m
              </div>
            )}

            {task.due_date && (
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-bold",
                isOverdue ? "text-red-500" : "text-blue-500 dark:text-blue-400"
              )}>
                <Calendar className="w-3 h-3" />
                {format(new Date(task.due_date), 'eee d MMM', { locale: fr })}
              </div>
            )}
          </div>
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