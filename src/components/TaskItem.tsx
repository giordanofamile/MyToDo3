import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Star, Trash2, Calendar, FileText } from 'lucide-react';
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

const TaskItem = ({ task, onToggle, onToggleImportant, onDelete, onClick }: TaskItemProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex items-center gap-4 bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:bg-white transition-all duration-300 cursor-pointer"
      onClick={() => onClick(task)}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); onToggle(task); }}
        className="text-gray-300 hover:text-blue-500 transition-colors"
      >
        {task.is_completed ? (
          <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-50" />
        ) : (
          <Circle className="w-6 h-6" />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-[15px] font-medium transition-all duration-300 truncate",
          task.is_completed ? "text-gray-400 line-through" : "text-gray-900"
        )}>
          {task.title}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Tâches</span>
          {task.due_date && (
            <div className="flex items-center gap-1 text-[11px] text-blue-500 font-medium">
              <Calendar className="w-3 h-3" />
              {format(new Date(task.due_date), 'eee d MMM', { locale: fr })}
            </div>
          )}
          {task.notes && <FileText className="w-3 h-3 text-gray-400" />}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleImportant(task); }}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Star className={cn("w-4 h-4 transition-all", 
            task.is_important ? "fill-pink-500 text-pink-500 scale-110" : "text-gray-300 hover:text-pink-400"
          )} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="p-2 hover:bg-red-50 rounded-xl text-gray-300 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskItem;