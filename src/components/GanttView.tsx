import React from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { GanttChart, ChevronRight, Info } from 'lucide-react';

interface GanttViewProps {
  tasks: any[];
  onTaskClick: (task: any) => void;
}

const GanttView = ({ tasks, onTaskClick }: GanttViewProps) => {
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(addDays(today, 60));
  const days = eachDayOfInterval({ start, end });
  const dayWidth = 40;

  return (
    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-xl border border-white/50 dark:border-white/10 overflow-hidden flex flex-col h-full shadow-2xl">
      {/* Header des dates */}
      <div className="flex border-b border-gray-100 dark:border-white/5 overflow-x-auto no-scrollbar bg-gray-50/50 dark:bg-black/40">
        <div className="flex-none w-64 p-6 font-black text-[10px] uppercase tracking-widest text-gray-400 border-r border-gray-100 dark:border-white/5 sticky left-0 bg-inherit z-20">
          Structure du Projet
        </div>
        <div className="flex">
          {days.map((day) => (
            <div key={day.toISOString()} className={cn(
              "flex-none border-r border-gray-100 dark:border-white/5 flex flex-col items-center justify-center",
              isSameDay(day, today) && "bg-blue-500/10",
              day.getDay() === 0 || day.getDay() === 6 ? "bg-gray-100/30 dark:bg-white/5" : ""
            )} style={{ width: dayWidth }}>
              <span className="text-[8px] font-black text-gray-400 uppercase">{format(day, 'EE', { locale: fr })}</span>
              <span className={cn("text-[10px] font-bold", isSameDay(day, today) ? "text-blue-500" : "dark:text-white")}>
                {format(day, 'd')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Corps du Gantt */}
      <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-auto">
        <div className="relative min-w-max">
          {tasks.filter(t => t.due_date).map((task, idx) => {
            const taskDate = new Date(task.due_date);
            const startIndex = days.findIndex(d => isSameDay(d, taskDate));
            const duration = 3; // Simulation de durée pour le Gantt
            
            return (
              <div key={task.id} className="flex border-b border-gray-100 dark:border-white/5 group hover:bg-blue-500/5 transition-colors h-16">
                <div 
                  onClick={() => onTaskClick(task)}
                  className="flex-none w-64 p-4 border-r border-gray-100 dark:border-white/5 sticky left-0 bg-white dark:bg-[#1C1C1E] z-10 cursor-pointer flex items-center gap-3"
                >
                  <div className={cn("w-2 h-2 rounded-full", task.priority === 'high' ? "bg-red-500" : "bg-blue-500")} />
                  <p className="text-xs font-bold truncate dark:text-white group-hover:text-blue-500 transition-colors">
                    {task.title}
                  </p>
                </div>
                
                <div className="relative flex-1 flex items-center">
                  {/* Grille de fond */}
                  {days.map((day) => (
                    <div key={day.toISOString()} className="flex-none h-full border-r border-gray-100 dark:border-white/5" style={{ width: dayWidth }} />
                  ))}
                  
                  {/* Barre de tâche Gantt */}
                  {startIndex !== -1 && (
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      onClick={() => onTaskClick(task)}
                      className={cn(
                        "absolute h-8 rounded-lg flex items-center px-3 cursor-pointer shadow-lg z-10 group/bar overflow-hidden",
                        task.priority === 'high' 
                          ? "bg-gradient-to-r from-red-500 to-pink-500 text-white" 
                          : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                      )}
                      style={{
                        left: startIndex * dayWidth + 4,
                        width: duration * dayWidth - 8,
                        transformOrigin: 'left'
                      }}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                      <span className="text-[9px] font-black uppercase truncate relative z-10">{task.title}</span>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GanttView;