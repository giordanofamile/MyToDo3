import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Paperclip, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GridViewProps {
  tasks: any[];
  onTaskClick: (task: any) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
}

const GridView = ({ tasks, onTaskClick, onToggleComplete }: GridViewProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <motion.div
          key={task.id}
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -5 }}
          onClick={() => onTaskClick(task)}
          className="bg-white dark:bg-[#1C1C1E] rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-2xl transition-all group cursor-pointer flex flex-col"
        >
          {/* Header Image */}
          <div className="h-32 w-full relative overflow-hidden">
            {task.header_image ? (
              <img src={task.header_image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
            )}
            <div className="absolute top-4 right-4">
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id, !task.is_completed); }}
                className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-md flex items-center justify-center shadow-lg transition-transform active:scale-90"
              >
                {task.is_completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h4 className={cn(
                "font-bold text-lg leading-tight dark:text-white line-clamp-2",
                task.is_completed && "text-gray-400 line-through"
              )}>
                {task.title}
              </h4>
              {task.is_important && <Star className="w-5 h-5 text-pink-500 fill-current flex-shrink-0" />}
            </div>

            <div className="mt-auto space-y-4">
              {/* Progress Bar Placeholder (Simulated based on subtasks if available) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Progression</span>
                  <span>{task.is_completed ? '100%' : '45%'}</span>
                </div>
                <Progress value={task.is_completed ? 100 : 45} className="h-1.5 bg-gray-100 dark:bg-white/5" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-white/5">
                <div className="flex items-center gap-3">
                  {task.due_date && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500">
                      <Clock className="w-3 h-3" />
                      {format(new Date(task.due_date), 'd MMM', { locale: fr })}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                    <Paperclip className="w-3 h-3" />
                    2
                  </div>
                </div>
                
                <div className={cn(
                  "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter",
                  task.priority === 'high' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                )}>
                  {task.priority || 'Normal'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default GridView;