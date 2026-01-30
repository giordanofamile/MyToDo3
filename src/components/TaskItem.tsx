import React from 'react';
import { motion } from 'framer-motion';
import { 
  Circle, 
  CheckCircle2, 
  Star, 
  Calendar, 
  AlignLeft,
  Clock,
  GripVertical
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
  compact?: boolean;
}

const TaskItem = ({ task, onToggle, onToggleImportant, onClick, compact }: TaskItemProps) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_completed;

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('id', task.id);
    e.dataTransfer.setData('type', 'task');
    e.dataTransfer.effectAllowed = 'move';
    
    const dragImage = document.createElement('div');
    dragImage.className = "bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-2xl";
    dragImage.innerText = task.title;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStart={onDragStart as any}
      className={cn(
        "group flex items-center gap-4 rounded-xl transition-all cursor-pointer relative",
        "bg-white dark:bg-[#2C2C2E] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md",
        compact ? "p-2 gap-3" : "p-3.5 gap-4",
        task.is_completed && "opacity-60 grayscale-[0.5]"
      )}
      onClick={() => onClick(task)}
    >
      <div className="absolute left-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <GripVertical className="w-3 h-3 text-gray-300" />
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task);
        }}
        className="flex-none transition-transform active:scale-90 ml-2"
      >
        {task.is_completed ? (
          <CheckCircle2 className={cn("text-blue-500", compact ? "w-4 h-4" : "w-5 h-5")} />
        ) : (
          <Circle className={cn("text-gray-300 group-hover:text-blue-400", compact ? "w-4 h-4" : "w-5 h-5")} />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className={cn(
            "font-semibold truncate dark:text-white",
            compact ? "text-xs" : "text-sm",
            task.is_completed && "line-through text-gray-400"
          )}>
            {task.title}
          </h3>
          {task.priority === 'high' && (
            <span className="flex-none w-1.5 h-1.5 rounded-full bg-red-500" />
          )}
        </div>
        
        {!compact && (
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
            </div>
          </div>
        )}
      </div>

      <div className={cn(
        "flex items-center gap-1 transition-opacity",
        compact ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleImportant(task);
          }}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            task.is_important ? "text-pink-500" : "text-gray-300 hover:text-pink-400"
          )}
        >
          <Star className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5", task.is_important && "fill-current")} />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskItem;