import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Star, Clock, Paperclip, Image as ImageIcon, Layout, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface KanbanViewProps {
  tasks: any[];
  onTaskClick: (task: any) => void;
  onUpdateTask: (id: string, updates: any) => void;
}

const PRIORITY_COLUMNS = [
  { id: 'high', label: 'Urgent', color: 'bg-red-500' },
  { id: 'medium', label: 'Moyen', color: 'bg-orange-500' },
  { id: 'low', label: 'Normal', color: 'bg-blue-500' },
];

const STATUS_COLUMNS = [
  { id: 'En attente', label: 'En attente', color: 'bg-gray-500' },
  { id: 'En cours', label: 'En cours', color: 'bg-blue-500' },
  { id: 'En pause', label: 'En pause', color: 'bg-orange-500' },
  { id: 'Terminé', label: 'Terminé', color: 'bg-green-500' },
];

const KanbanView = ({ tasks, onTaskClick, onUpdateTask }: KanbanViewProps) => {
  const [pivot, setPivot] = useState<'priority' | 'status'>('status');
  const columns = pivot === 'priority' ? PRIORITY_COLUMNS : STATUS_COLUMNS;

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newValue = result.destination.droppableId;
    
    if (pivot === 'priority') {
      onUpdateTask(taskId, { priority: newValue });
    } else {
      onUpdateTask(taskId, { status: newValue, is_completed: newValue === 'Terminé' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant={pivot === 'status' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setPivot('status')}
          className="rounded-xl font-bold text-[10px] uppercase tracking-widest"
        >
          <Activity className="w-3 h-3 mr-2" /> Par Statut
        </Button>
        <Button 
          variant={pivot === 'priority' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setPivot('priority')}
          className="rounded-xl font-bold text-[10px] uppercase tracking-widest"
        >
          <Layout className="w-3 h-3 mr-2" /> Par Priorité
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto pb-8 no-scrollbar">
          {columns.map((col) => (
            <div key={col.id} className="flex-none w-80 flex flex-col">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", col.color)} />
                  <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">{col.label}</h3>
                </div>
                <span className="text-[10px] font-bold bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full text-gray-400">
                  {tasks.filter(t => (pivot === 'priority' ? t.priority : t.status) === col.id).length}
                </span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex-1 bg-gray-50/50 dark:bg-white/5 rounded-[2.5rem] p-4 space-y-4 min-h-[200px]"
                  >
                    {tasks.filter(t => (pivot === 'priority' ? t.priority : t.status) === col.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onTaskClick(task)}
                            className="bg-white dark:bg-[#2C2C2E] rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-xl transition-all group cursor-pointer"
                          >
                            {task.header_image && (
                              <div className="h-24 w-full rounded-2xl overflow-hidden mb-3">
                                <img src={task.header_image} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <h4 className="font-bold text-sm mb-2 dark:text-white line-clamp-2">{task.title}</h4>
                            
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2">
                                {task.is_important && <Star className="w-3 h-3 text-pink-500 fill-current" />}
                                {task.due_date && <Clock className="w-3 h-3 text-blue-500" />}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
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