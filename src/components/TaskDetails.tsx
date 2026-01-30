import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Star, Trash2, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TaskDetailsProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
}

const TaskDetails = ({ task, isOpen, onClose, onUpdate, onDelete }: TaskDetailsProps) => {
  if (!task) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md border-l border-gray-200 bg-[#F5F5F7]/95 backdrop-blur-xl p-0">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-6 bg-white/50 border-bottom border-gray-200">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-semibold">Détails</SheetTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <input
                className="w-full text-lg font-medium bg-transparent border-none focus:ring-0 p-0"
                value={task.title}
                onChange={(e) => onUpdate(task.id, { title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-gray-500 ml-2">ÉCHÉANCE</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12 rounded-2xl bg-white border-gray-100 shadow-sm",
                      !task.due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                    {task.due_date ? format(new Date(task.due_date), 'PPP', { locale: fr }) : "Ajouter une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none" align="start">
                  <Calendar
                    mode="single"
                    selected={task.due_date ? new Date(task.due_date) : undefined}
                    onSelect={(date) => onUpdate(task.id, { due_date: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-gray-500 ml-2">NOTES</label>
              <Textarea
                placeholder="Ajouter une note..."
                className="min-h-[150px] rounded-2xl bg-white border-gray-100 shadow-sm focus-visible:ring-blue-500 resize-none p-4"
                value={task.notes || ''}
                onChange={(e) => onUpdate(task.id, { notes: e.target.value })}
              />
            </div>

            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-12 rounded-2xl transition-all",
                task.is_important ? "text-pink-500 bg-pink-50" : "text-gray-600 hover:bg-white"
              )}
              onClick={() => onUpdate(task.id, { is_important: !task.is_important })}
            >
              <Star className={cn("mr-2 h-4 w-4", task.is_important && "fill-pink-500")} />
              {task.is_important ? "Marqué comme important" : "Marquer comme important"}
            </Button>
          </div>

          <div className="p-6 bg-white/50 border-t border-gray-200">
            <Button 
              variant="ghost" 
              className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl h-12"
              onClick={() => { onDelete(task.id); onClose(); }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer la tâche
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetails;