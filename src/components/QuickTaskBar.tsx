import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar as CalendarIcon, Star, Tag as TagIcon, 
  Image as ImageIcon, Activity, X, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import TagBadge from './TagBadge';
import UnsplashPicker from './UnsplashPicker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuickTaskBarProps {
  onAdd: (taskData: any) => void;
  activeList: string;
}

const QuickTaskBar = ({ onAdd, activeList }: QuickTaskBarProps) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('En attente');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [isUnsplashOpen, setIsUnsplashOpen] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title,
      priority,
      status,
      due_date: dueDate,
      tags,
      header_image: headerImage,
      list_id: ['my-day', 'important', 'planned', 'tasks', 'dashboard', 'calendar'].includes(activeList) ? null : activeList,
      is_important: priority === 'high' || activeList === 'important'
    });

    setTitle('');
    setPriority('medium');
    setStatus('En attente');
    setDueDate(undefined);
    setTags([]);
    setHeaderImage(null);
  };

  const addTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 p-6 bg-gradient-to-t from-white dark:from-[#1C1C1E] via-white/80 dark:via-[#1C1C1E]/80 to-transparent">
      <TooltipProvider delayDuration={0}>
        <motion.div 
          layout
          className="w-full bg-white/90 dark:bg-[#2C2C2E]/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-white/5 p-2 flex flex-col gap-2"
        >
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="flex-1 flex items-center pl-4">
              <Plus className="w-5 h-5 text-gray-400 mr-3" />
              <Input
                placeholder="Ajouter une tâche..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 bg-transparent border-none shadow-none focus-visible:ring-0 text-base font-semibold p-0 dark:text-white placeholder:text-gray-400"
              />
            </div>
            
            <div className="flex items-center gap-1 pr-2">
              {/* Priorité */}
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className={cn(
                        "rounded-xl h-10 w-10 transition-all",
                        priority === 'high' ? "text-red-500 bg-red-500/10" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                      )}>
                        <Star className={cn("w-5 h-5", priority === 'high' && "fill-current")} />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Priorité</TooltipContent>
                </Tooltip>
                <PopoverContent className="w-40 p-2 rounded-2xl border-none shadow-2xl" side="top" align="end">
                  <div className="flex flex-col gap-1">
                    {['low', 'medium', 'high'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-left transition-all",
                          priority === p ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400"
                        )}
                      >
                        {p === 'low' ? 'Basse' : p === 'medium' ? 'Moyenne' : 'Haute'}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Statut */}
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5">
                        <Activity className="w-5 h-5" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Statut</TooltipContent>
                </Tooltip>
                <PopoverContent className="w-48 p-2 rounded-2xl border-none shadow-2xl" side="top" align="end">
                  <div className="flex flex-col gap-1">
                    {['En attente', 'En cours', 'En pause', 'Terminé'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-left transition-all",
                          status === s ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Date */}
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className={cn(
                        "rounded-xl h-10 w-10 transition-all",
                        dueDate ? "text-blue-500 bg-blue-500/10" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                      )}>
                        <CalendarIcon className="w-5 h-5" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Échéance</TooltipContent>
                </Tooltip>
                <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" side="top" align="end">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Tags */}
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className={cn(
                        "rounded-xl h-10 w-10 transition-all",
                        tags.length > 0 ? "text-purple-500 bg-purple-500/10" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                      )}>
                        <TagIcon className="w-5 h-5" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Tags</TooltipContent>
                </Tooltip>
                <PopoverContent className="w-64 p-4 rounded-2xl border-none shadow-2xl" side="top" align="end">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {tags.map(tag => (
                        <TagBadge key={tag} tag={tag} onRemove={(t) => setTags(tags.filter(x => x !== t))} />
                      ))}
                    </div>
                    <form onSubmit={addTag} className="flex gap-2">
                      <Input 
                        placeholder="Nouveau tag..." 
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="h-9 text-xs rounded-xl bg-gray-50 dark:bg-white/5 border-none"
                      />
                      <Button type="submit" size="sm" className="h-9 rounded-xl">Ok</Button>
                    </form>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Image */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-xl h-10 w-10 transition-all",
                      headerImage ? "text-pink-500 bg-pink-500/10" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                    )}
                    onClick={() => setIsUnsplashOpen(true)}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Image de fond</TooltipContent>
              </Tooltip>

              <div className="w-px h-6 bg-gray-100 dark:bg-white/10 mx-2" />

              <Button 
                type="submit"
                disabled={!title.trim()}
                className="h-10 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-sm shadow-lg hover:scale-105 transition-all active:scale-95"
              >
                Ajouter
              </Button>
            </div>
          </form>

          {/* Preview des propriétés sélectionnées */}
          <AnimatePresence>
            {(dueDate || tags.length > 0 || headerImage) && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pb-2 flex flex-wrap gap-2 items-center border-t border-gray-100 dark:border-white/5 pt-2"
              >
                {dueDate && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-500/5 px-2 py-1 rounded-lg">
                    <CalendarIcon className="w-3 h-3" />
                    {format(dueDate, 'd MMM', { locale: fr })}
                    <X className="w-3 h-3 cursor-pointer ml-1" onClick={() => setDueDate(undefined)} />
                  </div>
                )}
                {headerImage && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-pink-500 bg-pink-500/5 px-2 py-1 rounded-lg">
                    <ImageIcon className="w-3 h-3" />
                    Image
                    <X className="w-3 h-3 cursor-pointer ml-1" onClick={() => setHeaderImage(null)} />
                  </div>
                )}
                {tags.map(tag => (
                  <TagBadge key={tag} tag={tag} onRemove={(t) => setTags(tags.filter(x => x !== t))} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </TooltipProvider>

      <UnsplashPicker 
        isOpen={isUnsplashOpen} 
        onClose={() => setIsUnsplashOpen(false)} 
        onSelect={setHeaderImage} 
      />
    </div>
  );
};

export default QuickTaskBar;