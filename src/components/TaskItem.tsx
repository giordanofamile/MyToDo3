import React from 'react';
import { motion } from 'framer-motion';
import { 
  Circle, 
  CheckCircle2, 
  Star, 
  Calendar, 
  Paperclip, 
  MessageSquare,
  AlignLeft,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TaskItemProps {
  task: any;
  onToggle: (task: any) => void;
  onToggleImportant: (task: any) => void;
  onDelete: (id: string) => void;
  onClick: (task: any) => void;
}

const TaskItem = ({ task, onToggle, onToggleImportant, onClick }: TaskItemProps) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group flex items-center gap-4 p-4 rounded-[2rem] transition-all cursor-pointer",
        "bg-white dark:bg-[#2C2C2E] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:scale-[1.01]",
        task.is_completed && "opacity-60 grayscale-[0.5]"
      )}
      onClick={() => onClick(task)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task);
        }}
        className="flex-none transition-transform active:scale-90"
      >
        {task.is_completed ? (
          <CheckCircle2 className="w-6 h-6 text-blue-500" />
        ) : (
          <Circle className="w-6 h-6 text-gray-300 group-hover:text-blue-400" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className={cn(
            "text-sm font-bold truncate dark:text-white",
            task.is_completed && "line-through text-gray-400"
          )}>
            {task.title}
          </h3>
          {task.priority === 'high' && (
            <span className="flex-none w-1.5 h-1.5 rounded-full bg-red-500" />
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {task.description && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 truncate max-w-[200px]">
              <AlignLeft className="w-3 h-3" />
              <span className="truncate">{task.description}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
            {task.due_date && (
              <div className={cn(
                "flex items-center gap-1",
                isOverdue ? "text-red-500" : "text-gray-400"
              )}>
                <Calendar className="w-3 h-3" />
                {format(new Date(task.due_date), 'd MMM', { locale: fr })}
              </div>
            )}
            
            {task.estimated_minutes > 0 && (
              <div className="flex items-center gap-1 text-orange-500">
                <Clock className="w-3 h-3" />
                {task.estimated_minutes}m
              </div>
            )}

            {task.status && (
              <div className={cn(
                "px-2 py-0.5 rounded-full text-[8px] font-black",
                task.status === 'En cours' ? "bg-blue-500/10 text-blue-500" :
                task.status === 'Terminé' ? "bg-green-500/10 text-green-500" :
                "bg-gray-500/10 text-gray-500"
              )}>
                {task.status}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleImportant(task);
          }}
          className={cn(
            "p-2 rounded-xl transition-colors",
            task.is_important ? "text-pink-500" : "text-gray-300 hover:text-pink-400"
          )}
        >
          <Star className={cn("w-4 h-4", task.is_important && "fill-current")} />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskItem;