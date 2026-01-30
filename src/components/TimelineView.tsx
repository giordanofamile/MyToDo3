import React from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Clock, ChevronRight } from 'lucide-react';

interface TimelineViewProps {
  tasks: any[];
  onTaskClick: (task: any) => void;
}

const TimelineView = ({ tasks, onTaskClick }: TimelineViewProps) => {
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(addDays(today, 30));
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-xl border border-white/50 dark:border-white/10 overflow-hidden flex flex-col h-full">
      <div className="flex border-b border-gray-100 dark:border-white/5 overflow-x-auto no-scrollbar bg-gray-50/50 dark:bg-black/20">
        <div className="flex-none w-48 p-4 font-black text-[10px] uppercase tracking-widest text-gray-400 border-r border-gray-100 dark:border-white/5">
          Tâches
        </div>
        {days.map((day) => (
          <div key={day.toISOString()} className={cn(
            "flex-none w-16 p-4 text-center border-r border-gray-100 dark:border-white/5",
            isSameDay(day, today) && "bg-blue-500/10"
          )}>
            <p className="text-[10px] font-black uppercase text-gray-400">{format(day, 'EEE', { locale: fr })}</p>
            <p className={cn("text-sm font-bold", isSameDay(day, today) ? "text-blue-500" : "dark:text-white")}>
              {format(day, 'd')}
            </p>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {tasks.filter(t => t.due_date).map((task) => (
          <div key={task.id} className="flex border-b border-gray-100 dark:border-white/5 group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
            <div 
              onClick={() => onTaskClick(task)}
              className="flex-none w-48 p-4 border-r border-gray-100 dark:border-white/5 cursor-pointer"
            >
              <p className="text-xs font-bold truncate dark:text-white group-hover:text-blue-500 transition-colors">
                {task.title}
              </p>
            </div>
            <div className="flex-1 relative h-14 flex items-center">
              {days.map((day) => (
                <div key={day.toISOString()} className="flex-none w-16 h-full border-r border-gray-100 dark:border-white/5" />
              ))}
              
              {/* Task Bar */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => onTaskClick(task)}
                className={cn(
                  "absolute h-8 rounded-lg px-4 flex items-center gap-2 cursor-pointer shadow-lg z-10",
                  task.priority === 'high' ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                )}
                style={{
                  left: `${days.findIndex(d => isSameDay(d, new Date(task.due_date))) * 64 + 8}px`,
                  width: '140px'
                }}
              >
                <Clock className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase truncate">{task.title}</span>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineView;