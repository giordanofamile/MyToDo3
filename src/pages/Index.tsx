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
import QuickTaskBar from '@/components/QuickTaskBar';
import EmptyState from '@/components/EmptyState';
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

  useEffect(() => {
    const handleTaskMoved = () => {
      fetchTasks();
    };
    window.addEventListener('task-moved', handleTaskMoved);
    return () => window.removeEventListener('task-moved', handleTaskMoved);
  }, [activeList]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          const quickInput = document.querySelector('input[placeholder="Ajouter une tâche..."]') as HTMLInputElement;
          quickInput?.focus();
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
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        subtasks:subtasks(count)
      `)
      .eq('is_archived', false);
    
    if (activeList === 'important') query = query.eq('is_important', true);
    else if (activeList === 'planned') query = query.not('due_date', 'is', null);
    else if (activeList === 'my-day') query = query.is('list_id', null);
    else if (activeList !== 'tasks' && activeList !== 'calendar') query = query.eq('list_id', activeList);
    
    const { data, error } = await query.order('position', { ascending: true });
    
    if (error) showError(error.message);
    else {
      const formattedTasks = data?.map(t => ({
        ...t,
        subtask_count: t.subtasks?.[0]?.count || 0
      }));
      setTasks(formattedTasks || []);
    }
    setLoading(false);
  };

  const createNewTask = async (taskData?: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newTask = taskData ? {
      ...taskData,
      user_id: user.id,
    } : {
      title: "Nouvelle tâche",
      user_id: user.id,
      list_id: ['my-day', 'important', 'planned', 'tasks', 'dashboard', 'calendar'].includes(activeList) ? null : activeList,
      priority: settings?.tasks_default_priority || 'medium',
      is_important: activeList === 'important'
    };

    const { data, error } = await supabase.from('tasks').insert([newTask]).select();
    if (error) showError(error.message);
    else {
      setTasks([{ ...data[0], subtask_count: 0 }, ...tasks]);
      if (!taskData) setSelectedTask(data[0]);
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

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCompletion = settings?.tasks_show_completed ? true : !t.is_completed;
    return matchesSearch && matchesCompletion;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const listProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

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
      
      <main 
        className={cn(
          "flex-1 flex flex-col relative overflow-hidden h-full transition-all duration-500 bg-cover bg-center",
          currentList?.bg_color || "bg-[#F5F5F7]/40 dark:bg-black/20"
        )}
        style={currentList?.bg_image ? { backgroundImage: `url(${currentList.bg_image})` } : {}}
      >
        {/* Overlay pour le contraste si une image est présente */}
        {currentList?.bg_image && (
          <div className="absolute inset-0 bg-white/30 dark:bg-black/40 backdrop-blur-[2px]" />
        )}

        <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
          <div className={cn(
            "flex-1 flex flex-col w-full h-full px-6 sm:px-10 pt-8 pb-32 overflow-y-auto custom-scrollbar",
            settings?.compact_mode && "px-4 sm:px-6 pt-4"
          )}>
            <header className={cn("mb-8 flex-none", settings?.compact_mode && "mb-4")}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white drop-shadow-sm">
                    {currentList?.name || (activeList === 'my-day' ? 'Ma journée' : activeList === 'important' ? 'Important' : activeList === 'planned' ? 'Planifié' : 'Tâches')}
                  </h1>
                  {totalTasks > 0 && (
                    <div className="flex items-center gap-3 mt-2">
                      <div className="h-1.5 flex-1 max-w-[200px] bg-gray-200/50 dark:bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${listProgress}%` }}
                          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        />
                      </div>
                      <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        {completedTasks}/{totalTasks} Faits
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <ViewSwitcher currentView={viewType} onViewChange={handleViewChange} />
                  <Button variant="ghost" size="icon" onClick={() => setIsShortcutsOpen(true)} className="rounded-full bg-white/50 dark:bg-white/5 shadow-sm backdrop-blur-md">
                    <Zap className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsTimerOpen(!isTimerOpen)} className={cn("rounded-full bg-white/50 dark:bg-white/5 shadow-sm backdrop-blur-md", isTimerOpen && "bg-orange-500 text-white")}>
                    <Timer className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </header>

            <div className="flex-1 w-full h-full min-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeList}-${viewType}-${searchQuery}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full"
                >
                  {viewType === 'dashboard' ? (
                    <Dashboard onClose={() => setViewType('list')} />
                  ) : viewType === 'calendar' ? (
                    <CalendarView tasks={filteredTasks} onTaskClick={setSelectedTask} />
                  ) : viewType === 'kanban' ? (
                    <KanbanView tasks={filteredTasks} onTaskClick={setSelectedTask} onUpdateTask={updateTask} />
                  ) : viewType === 'grid' ? (
                    <GridView tasks={filteredTasks} onTaskClick={setSelectedTask} onToggleComplete={(id, completed) => updateTask(id, { is_completed: completed })} />
                  ) : viewType === 'timeline' ? (
                    <TimelineView tasks={filteredTasks} onTaskClick={setSelectedTask} />
                  ) : viewType === 'gantt' ? (
                    <GanttView tasks={filteredTasks} onTaskClick={setSelectedTask} />
                  ) : viewType === 'reports' ? (
                    <ReportsView tasks={tasks} />
                  ) : (
                    <div className={cn("space-y-3 w-full", settings?.compact_mode && "space-y-1.5")}>
                      {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                          <TaskItem 
                            key={task.id} 
                            task={task} 
                            onToggle={(t) => updateTask(t.id, { is_completed: !t.is_completed })} 
                            onToggleImportant={(t) => updateTask(t.id, { is_important: !t.is_important })} 
                            onDelete={() => {}} 
                            onClick={setSelectedTask} 
                            compact={settings?.compact_mode}
                          />
                        ))
                      ) : (
                        <EmptyState 
                          type={searchQuery ? 'no-search' : totalTasks > 0 ? 'all-done' : 'no-tasks'}
                          title={searchQuery ? 'Aucun résultat' : totalTasks > 0 ? 'Tout est fait !' : 'Liste vide'}
                          description={searchQuery ? `Aucune tâche ne correspond à "${searchQuery}"` : totalTasks > 0 ? 'Vous avez terminé toutes les tâches de cette liste.' : 'Commencez par ajouter une tâche ci-dessous.'}
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {!['dashboard', 'reports'].includes(activeList) && (
          <QuickTaskBar onAdd={createNewTask} activeList={activeList} />
        )}

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