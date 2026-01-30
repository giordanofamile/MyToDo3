import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar as CalendarIcon, Star, Tag as TagIcon, 
  Paperclip, Image as ImageIcon, Activity, Clock,
  ChevronUp, Send, X
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
  const [isExpanded, setIsExpanded] = useState(false);

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

    // Reset
    setTitle('');
    setPriority('medium');
    setStatus('En attente');
    setDueDate(undefined);
    setTags([]);
    setHeaderImage(null);
    setIsExpanded(false);
  };

  const addTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4">
      <motion.div 
        layout
        className="bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50 dark:border-white/10 p-2"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Nouvelle tâche... (Entrée pour ajouter)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                className="h-12 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm font-bold pl-4"
              />
            </div>
            
            <div className="flex items-center gap-1 pr-2">
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1"
                  >
                    {/* Priorité */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className={cn(
                          "rounded-xl h-9 w-9",
                          priority === 'high' ? "text-red-500 bg-red-500/10" : "text-gray-400"
                        )}>
                          <Star className={cn("w-4 h-4", priority === 'high' && "fill-current")} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-2 rounded-2xl border-none shadow-2xl" side="top">
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
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 text-gray-400">
                          <Activity className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2 rounded-2xl border-none shadow-2xl" side="top">
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
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className={cn(
                          "rounded-xl h-9 w-9",
                          dueDate ? "text-blue-500 bg-blue-500/10" : "text-gray-400"
                        )}>
                          <CalendarIcon className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" side="top">
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
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className={cn(
                          "rounded-xl h-9 w-9",
                          tags.length > 0 ? "text-purple-500 bg-purple-500/10" : "text-gray-400"
                        )}>
                          <TagIcon className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-4 rounded-2xl border-none shadow-2xl" side="top">
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
                              className="h-8 text-xs rounded-lg"
                            />
                            <Button type="submit" size="sm" className="h-8 rounded-lg">Ok</Button>
                          </form>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Image de fond */}
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "rounded-xl h-9 w-9",
                        headerImage ? "text-pink-500 bg-pink-500/10" : "text-gray-400"
                      )}
                      onClick={() => setIsUnsplashOpen(true)}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit"
                disabled={!title.trim()}
                className="h-10 w-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black shadow-lg ml-2"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Preview des propriétés sélectionnées */}
          <AnimatePresence>
            {isExpanded && (dueDate || tags.length > 0 || headerImage) && (
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
        </form>
      </motion.div>

      <UnsplashPicker 
        isOpen={isUnsplashOpen} 
        onClose={() => setIsUnsplashOpen(false)} 
        onSelect={setHeaderImage} 
      />
    </div>
  );
};

export default QuickTaskBar;