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
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ArrowUpDown, 
  CheckCircle, 
  Calendar as CalendarIcon, 
  Trash2, 
  Sparkles, 
  Timer, 
  Maximize2, 
  Minimize2,
  CheckSquare,
  Square,
  X,
  HelpCircle,
  GripVertical,
  Menu,
  LayoutList,
  CalendarDays
} from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { addDays, addWeeks, addMonths, format } from 'date-fns';
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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'created' | 'importance' | 'alphabetical' | 'manual'>('manual');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

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
      } else if (e.key === '?') {
        setIsShortcutsOpen(true);
      } else if (e.key === 'Escape' && selectionMode) {
        setSelectionMode(false);
        setSelectedIds([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectionMode]);

  const fetchLists = async () => {
    const { data } = await supabase.from('lists').select('*');
    setCustomLists(data || []);
  };

  const fetchTasks = async () => {
    if (activeList === 'dashboard') return;
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

    const { data, error } = await query.order('position', { ascending: true });

    if (error) showError(error.message);
    else setTasks(data || []);
    setLoading(false);
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);
    setSortBy('manual');

    const updates = items.map((task, index) => ({
      id: task.id,
      position: index
    }));

    for (const update of updates) {
      await supabase.from('tasks').update({ position: update.position }).eq('id', update.id);
    }
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
        position: tasks.length,
        tags: []
      }])
      .select();

    if (error) showError(error.message);
    else {
      setTasks([...tasks, data[0]]);
      setNewTask('');
      showSuccess("Tâche ajoutée");
    }
  };

  const handleRecurrence = async (task: any) => {
    if (!task.recurrence || task.recurrence === 'none') return;

    let nextDate = task.due_date ? new Date(task.due_date) : new Date();
    if (task.recurrence === 'daily') nextDate = addDays(nextDate, 1);
    else if (task.recurrence === 'weekly') nextDate = addWeeks(nextDate, 1);
    else if (task.recurrence === 'monthly') nextDate = addMonths(nextDate, 1);

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...task,
        id: undefined,
        is_completed: false,
        due_date: nextDate.toISOString(),
        created_at: undefined,
        updated_at: undefined,
        position: tasks.length
      }])
      .select();

    if (!error && data) {
      setTasks(prev => [...prev, data[0]]);
      showSuccess(`Nouvelle occurrence créée pour ${format(nextDate, 'd MMM')}`);
    }
  };

  const updateTask = async (id: string, updates: any) => {
    const { error } = await supabase.from('tasks').update(updates).eq('id', id);
    if (error) showError(error.message);
    else {
      const updatedTasks = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
      setTasks(updatedTasks);
      
      if (updates.is_completed === true) {
        const task = tasks.find(t => t.id === id);
        if (task) handleRecurrence(task);

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

  const handleBatchAction = async (action: 'complete' | 'delete') => {
    if (selectedIds.length === 0) return;

    if (action === 'delete' && !confirm(`Supprimer les ${selectedIds.length} tâches sélectionnées ?`)) return;

    const { error } = action === 'complete' 
      ? await supabase.from('tasks').update({ is_completed: true }).in('id', selectedIds)
      : await supabase.from('tasks').delete().in('id', selectedIds);

    if (error) showError(error.message);
    else {
      if (action === 'complete') {
        setTasks(tasks.map(t => selectedIds.includes(t.id) ? { ...t, is_completed: true } : t));
        showSuccess(`${selectedIds.length} tâches terminées`);
      } else {
        setTasks(tasks.filter(t => !selectedIds.includes(t.id)));
        showSuccess(`${selectedIds.length} tâches supprimées`);
      }
      setSelectionMode(false);
      setSelectedIds([]);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const allTags = Array.from(new Set(tasks.flatMap(t => t.tags || [])));

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'importance') return (b.is_important ? 1 : 0) - (a.is_important ? 1 : 0);
    if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
    if (sortBy === 'created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return a.position - b.position;
  });

  const filteredTasks = sortedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.tags?.some((t: string) => `#${t.toLowerCase()}`.includes(searchQuery.toLowerCase()));
    const matchesTag = !selectedTag || task.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const completedCount = tasks.filter(t => t.is_completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (!session) return <Auth />;

  const getTitle = () => {
    switch(activeList) {
      case 'dashboard': return 'Insights';
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
        {!isFocusMode && !isMobile && (
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
        {activeList === 'dashboard' ? (
          <Dashboard onClose={() => setActiveList('my-day')} />
        ) : (
          <div className="max-w-4xl w-full mx-auto px-4 sm:px-8 pt-8 sm:pt-16 pb-32 overflow-y-auto custom-scrollbar">
            <header className="mb-8 sm:mb-12">
              <div className="flex items-center justify-between mb-6">
                {isMobile && !isFocusMode && (
                  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full bg-white/50 dark:bg-white/5 shadow-sm">
                        <Menu className="w-5 h-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72 border-none">
                      <Sidebar 
                        activeList={activeList} 
                        setActiveList={(id) => { setActiveList(id); setIsMobileMenuOpen(false); }} 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                      />
                    </SheetContent>
                  </Sheet>
                )}
                <div className="flex-1 ml-4 sm:ml-0">
                  <motion.h1 
                    key={activeList}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white"
                  >
                    {getTitle()}
                  </motion.h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 font-semibold text-sm sm:text-lg">
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <div className="flex gap-1 sm:gap-2">
                  {activeList === 'planned' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
                      className="rounded-full bg-white/50 dark:bg-white/5 shadow-sm"
                      title="Changer de vue"
                    >
                      {viewMode === 'list' ? <CalendarDays className="w-5 h-5" /> : <LayoutList className="w-5 h-5" />}
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsShortcutsOpen(true)}
                    className="rounded-full bg-white/50 dark:bg-white/5 shadow-sm hidden sm:flex"
                    title="Aide ( ? )"
                  >
                    <HelpCircle className="w-5 h-5 text-gray-400" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectionMode(!selectionMode)}
                    className={cn(
                      "rounded-full bg-white/50 dark:bg-white/5 shadow-sm transition-all",
                      selectionMode && "bg-indigo-500 text-white hover:bg-indigo-600"
                    )}
                    title="Mode Sélection"
                  >
                    <CheckSquare className="w-5 h-5" />
                  </Button>
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
                    {isFocusMode ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full bg-white/50 dark:bg-white/5 shadow-sm">
                        <ArrowUpDown className="w-5 h-5 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 dark:bg-[#2C2C2E]">
                      <DropdownMenuItem onClick={() => setSortBy('manual')} className="rounded-xl">Ordre manuel</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('created')} className="rounded-xl">Plus récent</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('importance')} className="rounded-xl">Importance</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('alphabetical')} className="rounded-xl">Alphabétique</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                      !selectedTag ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-200/50 dark:bg-white/5 text-gray-500"
                    )}
                  >
                    Tous
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    >
                      <TagBadge 
                        tag={tag} 
                        className={cn(
                          "cursor-pointer",
                          selectedTag === tag ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-black" : "opacity-60 hover:opacity-100"
                        )} 
                      />
                    </button>
                  ))}
                </div>
              )}

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

            {activeList === 'planned' && viewMode === 'calendar' ? (
              <CalendarView tasks={tasks} onTaskClick={setSelectedTask} />
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="tasks">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef} 
                      className="space-y-3"
                    >
                      {filteredTasks.map((task, index) => (
                        <Draggable 
                          key={task.id} 
                          draggableId={task.id} 
                          index={index}
                          isDragDisabled={sortBy !== 'manual' || selectionMode}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "flex items-center gap-2 sm:gap-3 transition-all",
                                snapshot.isDragging && "scale-105 z-50"
                              )}
                            >
                              {selectionMode ? (
                                <button 
                                  onClick={() => toggleSelection(task.id)}
                                  className="p-2 text-gray-400 hover:text-indigo-500 transition-colors"
                                >
                                  {selectedIds.includes(task.id) ? <CheckSquare className="w-6 h-6 text-indigo-500" /> : <Square className="w-6 h-6" />}
                                </button>
                              ) : sortBy === 'manual' && (
                                <div {...provided.dragHandleProps} className="p-2 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing hidden sm:block">
                                  <GripVertical className="w-4 h-4" />
                                </div>
                              )}
                              <div className="flex-1">
                                <TaskItem
                                  task={task}
                                  onToggle={(t) => updateTask(t.id, { is_completed: !t.is_completed })}
                                  onToggleImportant={(t) => updateTask(t.id, { is_important: !t.is_important })}
                                  onDelete={deleteTask}
                                  onClick={setSelectedTask}
                                />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
            
            {!loading && filteredTasks.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32"
              >
                <div className="w-24 h-24 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-white dark:border-white/10">
                  {activeList === 'planned' ? <CalendarIcon className="w-10 h-10 text-gray-300" /> : <Plus className="w-10 h-10 text-gray-300" />}
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
        )}

        <AnimatePresence>
          {selectionMode && selectedIds.length > 0 && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="absolute bottom-32 left-0 right-0 px-4 sm:px-8 z-40"
            >
              <div className="max-w-md mx-auto bg-indigo-600 text-white p-4 rounded-[2rem] shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 ml-2">
                  <span className="font-bold">{selectedIds.length} sélectionnés</span>
                  <button onClick={() => { setSelectionMode(false); setSelectedIds([]); }} className="p-1 hover:bg-white/10 rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    className="hover:bg-white/10 text-white rounded-xl"
                    onClick={() => handleBatchAction('complete')}
                  >
                    Terminer
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="hover:bg-red-500 text-white rounded-xl"
                    onClick={() => handleBatchAction('delete')}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeList !== 'dashboard' && (
          <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 px-4 sm:px-8">
            <div className="max-w-4xl mx-auto">
              <form 
                onSubmit={addTask}
                className="bg-white/70 dark:bg-[#2C2C2E]/80 backdrop-blur-3xl p-2 sm:p-2.5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 dark:border-white/10 flex items-center gap-2 sm:gap-3"
              >
                <div className="p-2 sm:p-2.5 bg-blue-500/10 rounded-2xl text-blue-600">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <Input 
                  ref={inputRef}
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder={isMobile ? "Ajouter..." : "Ajouter une tâche... (N)"}
                  className="border-none bg-transparent focus-visible:ring-0 text-lg sm:text-xl placeholder:text-gray-400 dark:text-white h-12 sm:h-14 font-medium"
                />
                <Button 
                  type="submit"
                  disabled={!newTask.trim()}
                  className="bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-white rounded-2xl px-4 sm:px-8 h-10 sm:h-12 transition-all font-bold shadow-lg"
                >
                  {isMobile ? <Plus className="w-5 h-5" /> : "Ajouter"}
                </Button>
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

        <PomodoroTimer 
          isOpen={isTimerOpen} 
          onClose={() => setIsTimerOpen(false)} 
        />

        <ShortcutsModal 
          isOpen={isShortcutsOpen} 
          onClose={() => setIsShortcutsOpen(false)} 
        />
      </main>
    </div>
  );
};

export default Index;