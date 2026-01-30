import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Auth from './Auth';
import Sidebar from '@/components/Sidebar';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';
import PomodoroTimer from '@/components/PomodoroTimer';
import Dashboard from '@/components/Dashboard';
import CalendarView from '@/components/CalendarView';
import KanbanView from '@/components/KanbanView';
import GridView from '@/components/GridView';
import TimelineView from '@/components/TimelineView';
import GanttView from '@/components/GanttView';
import ReportsView from '@/components/ReportsView';
import ViewSwitcher, { ViewType } from '@/components/ViewSwitcher';
import ZenFocus from '@/components/ZenFocus';
import ShortcutsModal from '@/components/ShortcutsModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/hooks/use-settings';
import confetti from 'canvas-confetti';

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [activeList, setActiveList] = useState('my-day');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [tasks, setTasks] = useState<any[]>([]);
  const [customLists, setCustomLists] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  
  const isMobile = useIsMobile();
  const { settings } = useSettings();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  // Raccourcis Clavier Globaux
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          createNewTask();
          break;
        case 'f':
          e.preventDefault();
          if (selectedTask) setIsFocusMode(true);
          break;
        case 'p':
          e.preventDefault();
          setIsTimerOpen(!isTimerOpen);
          break;
        case '?':
          e.preventDefault();
          setIsShortcutsOpen(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTask, isTimerOpen]);

  useEffect(() => {
    if (session) {
      fetchTasks();
      fetchLists();
    }
  }, [session, activeList]);

  const fetchLists = async () => {
    const { data } = await supabase.from('lists').select('*').order('created_at', { ascending: true });
    setCustomLists(data || []);
    const current = data?.find(l => l.id === activeList);
    if (current?.preferred_view) setViewType(current.preferred_view as ViewType);
  };

  const fetchTasks = async () => {
    if (activeList === 'dashboard') return;
    setLoading(true);
    let query = supabase.from('tasks').select('*').eq('is_archived', false);
    
    if (!settings?.tasks_show_completed) {
      query = query.eq('is_completed', false);
    }

    if (activeList === 'important') query = query.eq('is_important', true);
    else if (activeList === 'planned') query = query.not('due_date', 'is', null);
    else if (activeList === 'my-day') query = query.is('list_id', null);
    else if (activeList !== 'tasks' && activeList !== 'calendar') query = query.eq('list_id', activeList);
    
    const { data, error } = await query.order('position', { ascending: true });
    if (error) showError(error.message);
    else setTasks(data || []);
    setLoading(false);
  };

  const createNewTask = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newTask = {
      title: "Nouvelle tâche",
      user_id: user.id,
      list_id: ['my-day', 'important', 'planned', 'tasks', 'dashboard', 'calendar'].includes(activeList) ? null : activeList,
      priority: settings?.tasks_default_priority || 'medium',
      is_important: activeList === 'important'
    };

    const { data, error } = await supabase.from('tasks').insert([newTask]).select();
    if (error) showError(error.message);
    else {
      setTasks([data[0], ...tasks]);
      setSelectedTask(data[0]);
    }
  };

  const handleViewChange = async (newView: ViewType) => {
    setViewType(newView);
    if (!['my-day', 'important', 'planned', 'tasks', 'dashboard', 'calendar'].includes(activeList)) {
      await supabase.from('lists').update({ preferred_view: newView }).eq('id', activeList);
    }
  };

  const updateTask = async (id: string, updates: any) => {
    const { error } = await supabase.from('tasks').update(updates).eq('id', id);
    if (error) showError(error.message);
    else {
      setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
      if (selectedTask?.id === id) setSelectedTask({ ...selectedTask, ...updates });
      if (updates.is_completed === true) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const currentList = customLists.find(l => l.id === activeList);

  if (!session) return <Auth />;

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-[#1C1C1E] overflow-hidden font-sans antialiased">
      <AnimatePresence>
        {isFocusMode && <ZenFocus task={selectedTask} onClose={() => setIsFocusMode(false)} onToggleComplete={updateTask} />}
      </AnimatePresence>

      {!isFocusMode && !isMobile && (
        <Sidebar 
          activeList={activeList} 
          setActiveList={setActiveList} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          lists={customLists}
          onListsUpdate={fetchLists}
        />
      )}
      
      <main className={cn(
        "flex-1 flex flex-col relative overflow-hidden h-full transition-all duration-500",
        currentList?.bg_color || "bg-[#F5F5F7]/40 dark:bg-black/20"
      )}>
        <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
          <div className={cn(
            "flex-1 flex flex-col w-full h-full px-6 sm:px-10 pt-8 pb-6 overflow-y-auto custom-scrollbar",
            settings?.compact_mode && "px-4 sm:px-6 pt-4"
          )}>
            <header className={cn("mb-8 flex-none", settings?.compact_mode && "mb-4")}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                    {currentList?.name || (activeList === 'my-day' ? 'Ma journée' : activeList === 'important' ? 'Important' : activeList === 'planned' ? 'Planifié' : 'Tâches')}
                  </h1>
                </div>
                <div className="flex gap-3">
                  <ViewSwitcher currentView={viewType} onViewChange={handleViewChange} />
                  <Button variant="ghost" size="icon" onClick={() => setIsShortcutsOpen(true)} className="rounded-full bg-white/50 dark:bg-white/5 shadow-sm">
                    <Zap className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsTimerOpen(!isTimerOpen)} className={cn("rounded-full bg-white/50 dark:bg-white/5 shadow-sm", isTimerOpen && "bg-orange-500 text-white")}>
                    <Timer className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </header>

            <div className="flex-1 w-full h-full min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeList}-${viewType}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full"
                >
                  {viewType === 'dashboard' ? (
                    <Dashboard onClose={() => setViewType('list')} />
                  ) : viewType === 'calendar' ? (
                    <CalendarView tasks={tasks} onTaskClick={setSelectedTask} />
                  ) : viewType === 'kanban' ? (
                    <KanbanView tasks={tasks} onTaskClick={setSelectedTask} onUpdateTask={updateTask} />
                  ) : viewType === 'grid' ? (
                    <GridView tasks={tasks} onTaskClick={setSelectedTask} onToggleComplete={(id, completed) => updateTask(id, { is_completed: completed })} />
                  ) : viewType === 'timeline' ? (
                    <TimelineView tasks={tasks} onTaskClick={setSelectedTask} />
                  ) : viewType === 'gantt' ? (
                    <GanttView tasks={tasks} onTaskClick={setSelectedTask} />
                  ) : viewType === 'reports' ? (
                    <ReportsView tasks={tasks} />
                  ) : (
                    <div className={cn("space-y-3 w-full pb-20", settings?.compact_mode && "space-y-1.5")}>
                      {tasks.map((task) => (
                        <TaskItem 
                          key={task.id} 
                          task={task} 
                          onToggle={(t) => updateTask(t.id, { is_completed: !t.is_completed })} 
                          onToggleImportant={(t) => updateTask(t.id, { is_important: !t.is_important })} 
                          onDelete={() => {}} 
                          onClick={setSelectedTask} 
                          compact={settings?.compact_mode}
                        />
                      ))}
                      <button 
                        onClick={createNewTask}
                        className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[2rem] text-gray-400 font-bold text-sm hover:border-blue-500/30 hover:text-blue-500 transition-all"
                      >
                        + Ajouter une tâche (N)
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <TaskDetails 
          task={selectedTask} 
          isOpen={!!selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={updateTask} 
          onDelete={() => {}} 
        />
        <PomodoroTimer isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} />
        <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      </main>
    </div>
  );
};

export default Index;