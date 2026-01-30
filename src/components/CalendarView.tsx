import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { motion } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AlignLeft } from 'lucide-react';

interface CalendarViewProps {
  tasks: any[];
  onTaskClick: (task: any) => void;
}

const CalendarView = ({ tasks, onTaskClick }: CalendarViewProps) => {
  const tasksWithDates = tasks.filter(t => t.due_date);

  const modifiers = {
    hasTask: (date: Date) => tasksWithDates.some(t => isSameDay(new Date(t.due_date), date))
  };

  const modifiersStyles = {
    hasTask: { 
      fontWeight: 'bold',
      textDecoration: 'underline',
      textDecorationColor: '#3B82F6',
      textDecorationThickness: '2px'
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/50 dark:border-white/10 shadow-xl h-full flex flex-col"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1 overflow-hidden">
        <div className="flex justify-center items-start pt-4">
          <Calendar
            mode="single"
            locale={fr}
            className="rounded-2xl border-none p-0"
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            classNames={{
              day_today: "bg-blue-500/10 text-blue-600 font-bold rounded-xl",
              day_selected: "bg-blue-500 text-white rounded-xl hover:bg-blue-600",
              day: "h-12 w-12 p-0 font-medium aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all",
              head_cell: "text-gray-400 font-bold uppercase text-[10px] tracking-widest pb-4",
              nav_button: "hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl p-1 transition-all",
            }}
          />
        </div>

        <div className="flex flex-col h-full overflow-hidden">
          <h3 className="text-xl font-bold dark:text-white flex items-center gap-2 mb-6 flex-none">
            Échéances à venir
            <Badge variant="secondary" className="rounded-full bg-blue-500/10 text-blue-600 border-none">
              {tasksWithDates.length}
            </Badge>
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {tasksWithDates.length > 0 ? (
              tasksWithDates
                .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                .map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="w-full flex flex-col p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <p className="font-bold text-sm dark:text-white truncate group-hover:text-blue-500 transition-colors">
                        {task.title}
                      </p>
                      <div className={cn(
                        "w-2 h-2 rounded-full ml-4 flex-none",
                        task.is_important ? "bg-pink-500" : "bg-blue-500"
                      )} />
                    </div>
                    
                    {task.description && (
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium mb-2 line-clamp-1">
                        <AlignLeft className="w-3 h-3" />
                        {task.description}
                      </div>
                    )}

                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {format(new Date(task.due_date), 'd MMMM yyyy', { locale: fr })}
                    </p>
                  </button>
                ))
            ) : (
              <p className="text-gray-400 text-sm font-medium text-center py-12">
                Aucune tâche planifiée pour le moment.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarView;