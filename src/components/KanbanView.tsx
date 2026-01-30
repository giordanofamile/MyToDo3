import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { 
  Star, Clock, Paperclip, Image as ImageIcon, Layout, 
  Activity, AlignLeft, Calendar, Tag as TagIcon, ChevronDown 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format, startOfDay, startOfMonth, startOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanViewProps {
  tasks: any[];
  onTaskClick: (task: any) => void;
  onUpdateTask: (id: string, updates: any) => void;
}

type PivotType = 'status' | 'priority' | 'date_day' | 'date_month' | 'date_year' | 'tags';

const KanbanView = ({ tasks, onTaskClick, onUpdateTask }: KanbanViewProps) => {
  const [pivot, setPivot] = useState<PivotType>('status');

  const columns = useMemo(() => {
    const cols: { id: string; label: string; color: string }[] = [];
    
    if (pivot === 'status') {
      return [
        { id: 'En attente', label: 'En attente', color: 'bg-gray-500' },
        { id: 'En cours', label: 'En cours', color: 'bg-blue-500' },
        { id: 'En pause', label: 'En pause', color: 'bg-orange-500' },
        { id: 'Terminé', label: 'Terminé', color: 'bg-green-500' },
      ];
    }
    
    if (pivot === 'priority') {
      return [
        { id: 'high', label: 'Urgent', color: 'bg-red-500' },
        { id: 'medium', label: 'Moyen', color: 'bg-orange-500' },
        { id: 'low', label: 'Normal', color: 'bg-blue-500' },
      ];
    }

    if (pivot.startsWith('date_')) {
      const dates = new Set<string>();
      tasks.forEach(t => {
        if (t.due_date) {
          const d = new Date(t.due_date);
          if (pivot === 'date_day') dates.add(format(startOfDay(d), 'yyyy-MM-dd'));
          if (pivot === 'date_month') dates.add(format(startOfMonth(d), 'yyyy-MM'));
          if (pivot === 'date_year') dates.add(format(startOfYear(d), 'yyyy'));
        }
      });
      
      const sortedDates = Array.from(dates).sort();
      sortedDates.forEach(d => {
        const dateObj = new Date(d);
        let label = d;
        if (pivot === 'date_day') label = format(dateObj, 'd MMM yyyy', { locale: fr });
        if (pivot === 'date_month') label = format(dateObj, 'MMMM yyyy', { locale: fr });
        if (pivot === 'date_year') label = format(dateObj, 'yyyy');
        cols.push({ id: d, label, color: 'bg-teal-500' });
      });
      cols.push({ id: 'none', label: 'Sans date', color: 'bg-gray-300' });
      return cols;
    }

    if (pivot === 'tags') {
      const tags = new Set<string>();
      tasks.forEach(t => t.tags?.forEach((tag: string) => tags.add(tag)));
      Array.from(tags).sort().forEach(tag => {
        cols.push({ id: tag, label: tag, color: 'bg-purple-500' });
      });
      cols.push({ id: 'none', label: 'Sans tag', color: 'bg-gray-300' });
      return cols;
    }

    return cols;
  }, [pivot, tasks]);

  const getTaskGroup = (task: any) => {
    if (pivot === 'status') return task.status || 'En attente';
    if (pivot === 'priority') return task.priority || 'medium';
    if (pivot.startsWith('date_')) {
      if (!task.due_date) return 'none';
      const d = new Date(task.due_date);
      if (pivot === 'date_day') return format(startOfDay(d), 'yyyy-MM-dd');
      if (pivot === 'date_month') return format(startOfMonth(d), 'yyyy-MM');
      if (pivot === 'date_year') return format(startOfYear(d), 'yyyy');
    }
    if (pivot === 'tags') {
      return task.tags?.[0] || 'none';
    }
    return 'none';
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newValue = result.destination.droppableId;
    
    if (pivot === 'priority') onUpdateTask(taskId, { priority: newValue });
    else if (pivot === 'status') onUpdateTask(taskId, { status: newValue, is_completed: newValue === 'Terminé' });
    else if (pivot === 'tags') {
      const task = tasks.find(t => t.id === taskId);
      const otherTags = task.tags?.filter((t: string) => t !== task.tags?.[0]) || [];
      onUpdateTask(taskId, { tags: newValue === 'none' ? otherTags : [newValue, ...otherTags] });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 h-10 px-4 border-none bg-white dark:bg-white/5 shadow-sm">
              <Layout className="w-4 h-4 text-blue-500" />
              Regrouper par : {pivot.replace('_', ' ')}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xl border-none shadow-2xl p-2">
            <DropdownMenuItem onClick={() => setPivot('status')} className="rounded-lg gap-2 font-bold text-xs">
              <Activity className="w-4 h-4 text-blue-500" /> Statut
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPivot('priority')} className="rounded-lg gap-2 font-bold text-xs">
              <Star className="w-4 h-4 text-orange-500" /> Priorité
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPivot('date_day')} className="rounded-lg gap-2 font-bold text-xs">
              <Calendar className="w-4 h-4 text-teal-500" /> Par Jour
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPivot('date_month')} className="rounded-lg gap-2 font-bold text-xs">
              <Calendar className="w-4 h-4 text-teal-500" /> Par Mois
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPivot('tags')} className="rounded-lg gap-2 font-bold text-xs">
              <TagIcon className="w-4 h-4 text-purple-500" /> Par Tags
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto pb-8 no-scrollbar">
          {columns.map((col) => (
            <div key={col.id} className="flex-none w-80 flex flex-col">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", col.color)} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest dark:text-white opacity-60">{col.label}</h3>
                </div>
                <span className="text-[10px] font-bold bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full text-gray-400">
                  {tasks.filter(t => getTaskGroup(t) === col.id).length}
                </span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex-1 bg-gray-50/50 dark:bg-white/5 rounded-2xl p-4 space-y-4 min-h-[200px] border border-transparent hover:border-blue-500/10 transition-colors"
                  >
                    {tasks.filter(t => getTaskGroup(t) === col.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onTaskClick(task)}
                            className="bg-white dark:bg-[#2C2C2E] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-xl transition-all group cursor-pointer"
                          >
                            {task.header_image && (
                              <div className="h-24 w-full rounded-lg overflow-hidden mb-3">
                                <img src={task.header_image} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <h4 className="font-bold text-sm mb-1 dark:text-white line-clamp-2">{task.title}</h4>
                            
                            {task.description && (
                              <p className="text-[10px] text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                {task.is_important && <Star className="w-3 h-3 text-pink-500 fill-current" />}
                                {task.due_date && <Clock className="w-3 h-3 text-blue-500" />}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                {task.description && <AlignLeft className="w-3 h-3" />}
                                <ImageIcon className="w-3 h-3" />
                                <Paperclip className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanView;