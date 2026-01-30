import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Auth from './Auth';
import Sidebar from '@/components/Sidebar';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';
import PomodoroTimer from '@/components/PomodoroTimer';
import Dashboard from '@/components/Dashboard';
import TagBadge from '@/components/TagBadge';
import ShortcutsModal from '@/components/ShortcutsModal';
import CalendarView from '@/components/CalendarView';
import ZenFocus from '@/components/ZenFocus';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, ArrowUpDown, CheckCircle, Calendar as CalendarIcon, Trash2, Sparkles, Timer, 
  Maximize2, Minimize2, CheckSquare, Square, X, HelpCircle, GripVertical, Menu, 
  LayoutList, CalendarDays, FolderInput, AlertTriangle, Copy, Eraser, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showError, showSuccess } from '@/utils/toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { addDays, addWeeks, addMonths, format, isPast, isToday, endOfDay } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          inputRef.current?.focus();
          break;
        case 'f':
          if (selectedTask) setIsFocusMode(true);
          else showError("Sélectionnez une tâche pour le mode Focus");
          break;
        case 'p':
          setIsTimerOpen(prev => !prev);
          break;
        case 'c':
          setActiveList('calendar');
          break;
        case 'd':
          setActiveList('dashboard');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTask]);

  useEffect(() => {
    if (session) {
      fetchTasks();
      fetchLists();
    }
  }, [session, activeList]);

  const fetchLists = async () => {
    const { data } = await supabase.from('lists').select('*');
    setCustomLists(data || []);
  };

  const fetchTasks = async () => {
    if (activeList === 'dashboard') return;
    setLoading(true);
    
    // Pour le calendrier, on récupère toutes les tâches non archivées
    let query = supabase.from('tasks').select('*').eq('is_archived', false);
    
    if (activeList === 'important') query = query.eq('is_important', true);
    else if (activeList === 'planned') query = query.not('due_date', 'is', null);
    else if (activeList === 'my-day') query = query.is('list_id', null);
    else if (activeList !== 'tasks' && activeList !== 'calendar') query = query.eq('list_id', activeList);

    const { data, error } = await query.order('position', { ascending: true });
    if (error) showError(error.message);
    else setTasks(data || []);
    setLoading(false);
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    const listId = ['my-day', 'important', 'planned', 'tasks', 'dashboard', 'calendar'].includes(activeList) ? null : activeList;
    
    const { data, error } = await supabase.from('tasks').insert([{
      title: newTask,
      user_id: user?.id,
      list_id: listId,
      is_important: activeList === 'important',
      due_date: activeList === 'planned' || activeList === 'calendar' ? new Date().toISOString() : null,
      position: tasks.length
    }]).select();

    if (error) showError(error.message);
    else {
      setTasks([...tasks, data[0]]);
      setNewTask('');
      showSuccess("Tâche ajoutée");
    }
  };

  const updateTask = async (id: string, updates: any) => {
    const { error } = await supabase.from('tasks').update(updates).eq('id', id);
    if (error) showError(error.message);
    else {
      setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
      if (updates.is_completed === true) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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

  const currentList = customLists.find(l => l.id === activeList);

  if (!session) return <Auth />;

  return (
    <div className="flex h-screen bg-white dark:bg-[#1C1C1E] overflow-hidden font-sans antialiased transition-colors duration-500">
      <AnimatePresence>
        {isFocusMode && <ZenFocus task={selectedTask} onClose={() => setIsFocusMode(false)} onToggleComplete={updateTask} />}
      </AnimatePresence>

      {!isFocusMode && !isMobile && (
        <Sidebar activeList={activeList} setActiveList={setActiveList} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      )}
      
      <main className={cn(
        "flex-1 flex flex-col relative transition-all duration-700 overflow-hidden",
        currentList?.bg_color || "bg-[#F5F5F7]/40 dark:bg-black/20"
      )}>
        {currentList?.bg_image && (
          <div className="absolute inset-0 z-0">
            <img src={currentList.bg_image} alt="Background" className="w-full h-full object-cover opacity-10 dark:opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-black/50 dark:to-[#1C1C1E]" />
          </div>
        )}

        <div className="relative z-10 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          {activeList === 'dashboard' ? (
            <Dashboard onClose={() => setActiveList('my-day')} />
          ) : activeList === 'calendar' ? (
            <div className="max-w-6xl w-full mx-auto px-4 sm:px-8 pt-8 sm:pt-16 pb-32">
              <header className="mb-12 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">Calendrier</h1>
                  <p className="text-gray-500 font-medium mt-2">Visualisez vos échéances</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsTimerOpen(!isTimerOpen)} className={cn("rounded-full bg-white/50 dark:bg-white/5 shadow-sm", isTimerOpen && "bg-orange-500 text-white")}>
                  <Timer className="w-5 h-5" />
                </Button>
              </header>
              <CalendarView tasks={tasks} onTaskClick={setSelectedTask} />
            </div>
          ) : (
            <div className="max-w-4xl w-full mx-auto px-4 sm:px-8 pt-8 sm:pt-16 pb-32">
              <header className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1">
                    <motion.h1 key={activeList} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
                      {currentList?.name || (activeList === 'my-day' ? 'Ma journée' : activeList === 'important' ? 'Important' : activeList === 'planned' ? 'Planifié' : 'Tâches')}
                    </motion.h1>
                    {currentList?.description && (
                      <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium text-sm italic">
                        {currentList.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsTimerOpen(!isTimerOpen)} className={cn("rounded-full bg-white/50 dark:bg-white/5 shadow-sm", isTimerOpen && "bg-orange-500 text-white")}>
                      <Timer className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {tasks.length > 0 && (
                  <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/50 dark:border-white/10 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Progression</span>
                      <span className="text-sm font-bold text-blue-600">{Math.round((tasks.filter(t => t.is_completed).length / tasks.length) * 100)}%</span>
                    </div>
                    <Progress value={(tasks.filter(t => t.is_completed).length / tasks.length) * 100} className="h-2" />
                  </div>
                )}
              </header>

              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={(t) => updateTask(t.id, { is_completed: !t.is_completed })} 
                    onToggleImportant={(t) => updateTask(t.id, { is_important: !t.is_important })} 
                    onDelete={deleteTask} 
                    onClick={setSelectedTask} 
                  />
                ))}
                {tasks.length === 0 && !loading && (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">Tout est à jour !</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {activeList !== 'dashboard' && activeList !== 'calendar' && (
          <div className="absolute bottom-10 left-0 right-0 px-8 z-20">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={addTask} className="bg-white/70 dark:bg-[#2C2C2E]/80 backdrop-blur-3xl p-2.5 rounded-[2rem] shadow-2xl border border-white/50 dark:border-white/10 flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-600"><Plus className="w-6 h-6" /></div>
                <Input 
                  ref={inputRef}
                  placeholder="Ajouter une tâche..." 
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="border-none bg-transparent focus-visible:ring-0 text-xl h-14 font-medium" 
                />
                <Button type="submit" className="bg-black dark:bg-white dark:text-black rounded-2xl px-8 h-12 font-bold">Ajouter</Button>
              </form>
            </div>
          </div>
        )}

        <TaskDetails 
          task={selectedTask} 
          isOpen={!!selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={updateTask} 
          onDelete={deleteTask} 
        />
        <PomodoroTimer isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} />
      </main>
    </div>
  );
};

export default Index;