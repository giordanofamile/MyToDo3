import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Auth from './Auth';
import Sidebar from '@/components/Sidebar';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';
import PomodoroTimer from '@/components/PomodoroTimer';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, ArrowUpDown, CheckCircle, Calendar, Trash2, Sparkles, Timer, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showError, showSuccess } from '@/utils/toast';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [activeList, setActiveList] = useState('my-day');
  const [tasks, setTasks] = useState<any[]>([]);
  const [customLists, setCustomLists] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'importance' | 'alphabetical'>('created');
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchTasks();
      fetchLists();
    }
  }, [session, activeList]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key.toLowerCase() === 'f') {
        setIsFocusMode(prev => !prev);
      } else if (e.key.toLowerCase() === 'p') {
        setIsTimerOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchLists = async () => {
    const { data } = await supabase.from('lists').select('*');
    setCustomLists(data || []);
  };

  const fetchTasks = async () => {
    setLoading(true);
    let query = supabase.from('tasks').select('*');

    if (activeList === 'important') {
      query = query.eq('is_important', true);
    } else if (activeList === 'planned') {
      query = query.not('due_date', 'is', null);
    } else if (activeList === 'my-day') {
      query = query.is('list_id', null);
    } else if (activeList !== 'tasks') {
      query = query.eq('list_id', activeList);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) showError(error.message);
    else setTasks(data || []);
    setLoading(false);
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const isCustomList = !['my-day', 'important', 'planned', 'tasks'].includes(activeList);

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ 
        title: newTask, 
        user_id: session.user.id,
        is_completed: false,
        is_important: activeList === 'important',
        list_id: isCustomList ? activeList : null,
        due_date: activeList === 'planned' ? new Date().toISOString() : null,
        tags: []
      }])
      .select();

    if (error) showError(error.message);
    else {
      setTasks([data[0], ...tasks]);
      setNewTask('');
      showSuccess("Tâche ajoutée");
    }
  };

  const updateTask = async (id: string, updates: any) => {
    const { error } = await supabase.from('tasks').update(updates).eq('id', id);
    if (error) showError(error.message);
    else {
      const updatedTasks = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
      setTasks(updatedTasks);
      
      if (updates.is_completed === true) {
        const allCompleted = updatedTasks.length > 0 && updatedTasks.every(t => t.is_completed);
        if (allCompleted) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B', '#10B981']
          });
        }
      }

      if (selectedTask?.id === id) setSelectedTask({ ...selectedTask, ...updates });
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) showError(error.message);
    else {
      setTasks(tasks.filter(t => t.id !== id));
      showSuccess("Tâche supprimée");
    }
  };

  const clearCompleted = async () => {
    const completedIds = tasks.filter(t => t.is_completed).map(t => t.id);
    if (completedIds.length === 0) return;
    if (!confirm(`Supprimer les ${completedIds.length} tâches terminées ?`)) return;

    const { error } = await supabase.from('tasks').delete().in('id', completedIds);
    if (error) showError(error.message);
    else {
      setTasks(tasks.filter(t => !t.is_completed));
      showSuccess(`${completedIds.length} tâches supprimées`);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'importance') return (b.is_important ? 1 : 0) - (a.is_important ? 1 : 0);
    if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const filteredTasks = sortedTasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedCount = tasks.filter(t => t.is_completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (!session) return <Auth />;

  const getTitle = () => {
    switch(activeList) {
      case 'my-day': return 'Ma journée';
      case 'important': return 'Important';
      case 'planned': return 'Planifié';
      case 'tasks': return 'Tâches';
      default: {
        const list = customLists.find(l => l.id === activeList);
        return list ? list.name : 'Ma Liste';
      }
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#1C1C1E] overflow-hidden font-sans antialiased transition-colors duration-500">
      <AnimatePresence>
        {!isFocusMode && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <Sidebar 
              activeList={activeList} 
              setActiveList={setActiveList} 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className={cn(
        "flex-1 flex flex-col bg-[#F5F5F7]/40 dark:bg-black/20 relative transition-all duration-500",
        isFocusMode && "bg-white dark:bg-[#1C1C1E]"
      )}>
        <div className="max-w-4xl w-full mx-auto px-8 pt-16 pb-32 overflow-y-auto custom-scrollbar">
          <header className="mb-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <motion.h1 
                  key={activeList}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white"
                >
                  {getTitle()}
                </motion.h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-semibold text-lg">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className={cn(
                    "rounded-full bg-white/50 dark:bg-white/5 shadow-sm transition-all",
                    isFocusMode && "bg-blue-500 text-white hover:bg-blue-600"
                  )}
                  title="Mode Focus (F)"
                >
                  {isFocusMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsTimerOpen(!isTimerOpen)}
                  className={cn(
                    "rounded-full bg-white/50 dark:bg-white/5 shadow-sm transition-all",
                    isTimerOpen && "bg-orange-500 text-white hover:bg-orange-600"
                  )}
                  title="Minuteur Pomodoro (P)"
                >
                  <Timer className="w-5 h-5" />
                </Button>
                {completedCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={clearCompleted}
                    className="rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all"
                    title="Supprimer les terminées"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full bg-white/50 dark:bg-white/5 shadow-sm">
                      <ArrowUpDown className="w-5 h-5 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 dark:bg-[#2C2C2E]">
                    <DropdownMenuItem onClick={() => setSortBy('created')} className="rounded-xl">Plus récent</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('importance')} className="rounded-xl">Importance</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('alphabetical')} className="rounded-xl">Alphabétique</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {tasks.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/60 dark:bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/50 dark:border-white/10 shadow-sm mb-8"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {progress === 100 ? (
                      <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {progress === 100 ? "Tout est terminé !" : `${completedCount} sur ${tasks.length} terminées`}
                    </span>
                  </div>
                  <span className={cn(
                    "text-sm font-bold transition-colors",
                    progress === 100 ? "text-yellow-600 dark:text-yellow-400" : "text-blue-600 dark:text-blue-400"
                  )}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress 
                  value={progress} 
                  className={cn(
                    "h-2 bg-gray-200/50 dark:bg-white/10",
                    progress === 100 && "bg-yellow-500/20"
                  )} 
                />
              </motion.div>
            )}
          </header>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={(t) => updateTask(t.id, { is_completed: !t.is_completed })}
                  onToggleImportant={(t) => updateTask(t.id, { is_important: !t.is_important })}
                  onDelete={deleteTask}
                  onClick={setSelectedTask}
                />
              ))}
            </AnimatePresence>
            
            {!loading && filteredTasks.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32"
              >
                <div className="w-24 h-24 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-white dark:border-white/10">
                  {activeList === 'planned' ? <Calendar className="w-10 h-10 text-gray-300" /> : <Plus className="w-10 h-10 text-gray-300" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {activeList === 'planned' ? 'Rien de prévu' : 'Prêt à commencer ?'}
                </h3>
                <p className="text-gray-400 font-medium">
                  {activeList === 'planned' ? 'Les tâches avec une date apparaîtront ici.' : 'Ajoutez votre première tâche ci-dessous.'}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="absolute bottom-10 left-0 right-0 px-8">
          <div className="max-w-4xl mx-auto">
            <form 
              onSubmit={addTask}
              className="bg-white/70 dark:bg-[#2C2C2E]/80 backdrop-blur-3xl p-2.5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 dark:border-white/10 flex items-center gap-3"
            >
              <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-600">
                <Plus className="w-6 h-6" />
              </div>
              <Input 
                ref={inputRef}
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Ajouter une tâche... (N)"
                className="border-none bg-transparent focus-visible:ring-0 text-xl placeholder:text-gray-400 dark:text-white h-14 font-medium"
              />
              <Button 
                type="submit"
                disabled={!newTask.trim()}
                className="bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-white rounded-2xl px-8 h-12 transition-all font-bold shadow-lg"
              >
                Ajouter
              </Button>
            </form>
          </div>
        </div>

        <TaskDetails
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />

        <PomodoroTimer 
          isOpen={isTimerOpen} 
          onClose={() => setIsTimerOpen(false)} 
        />
      </main>
    </div>
  );
};

export default Index;