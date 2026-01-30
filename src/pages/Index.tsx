import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Auth from './Auth';
import Sidebar from '@/components/Sidebar';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showError, showSuccess } from '@/utils/toast';

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [activeList, setActiveList] = useState('my-day');
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
    if (session) fetchTasks();
  }, [session, activeList]);

  const fetchTasks = async () => {
    setLoading(true);
    let query = supabase.from('tasks').select('*');

    // Logique de filtrage
    if (activeList === 'important') {
      query = query.eq('is_important', true);
    } else if (activeList === 'my-day') {
      // On pourrait filtrer par date ici
    } else if (activeList !== 'tasks' && activeList !== 'planned') {
      // C'est une liste personnalisée (UUID)
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
        list_id: isCustomList ? activeList : null
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
      setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
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

  // Filtrage par recherche
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!session) return <Auth />;

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans antialiased">
      <Sidebar 
        activeList={activeList} 
        setActiveList={setActiveList} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <main className="flex-1 flex flex-col bg-[#F5F5F7]/40 relative">
        <div className="max-w-4xl w-full mx-auto px-8 pt-16 pb-32 overflow-y-auto custom-scrollbar">
          <header className="mb-12 flex items-end justify-between">
            <div>
              <motion.h1 
                key={activeList}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-extrabold tracking-tight text-gray-900"
              >
                {activeList === 'my-day' ? 'Ma journée' : 
                 activeList === 'important' ? 'Important' : 
                 activeList === 'tasks' ? 'Tâches' : 'Ma Liste'}
              </motion.h1>
              <p className="text-gray-500 mt-2 font-semibold text-lg">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full bg-white/50 shadow-sm">
                <LayoutGrid className="w-5 h-5 text-gray-500" />
              </Button>
            </div>
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
                <div className="w-24 h-24 bg-white/50 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-white">
                  <Plus className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Prêt à commencer ?</h3>
                <p className="text-gray-400 font-medium">Ajoutez votre première tâche ci-dessous.</p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="absolute bottom-10 left-0 right-0 px-8">
          <div className="max-w-4xl mx-auto">
            <form 
              onSubmit={addTask}
              className="bg-white/70 backdrop-blur-3xl p-2.5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 flex items-center gap-3"
            >
              <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-600">
                <Plus className="w-6 h-6" />
              </div>
              <Input 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Ajouter une tâche..."
                className="border-none bg-transparent focus-visible:ring-0 text-xl placeholder:text-gray-400 h-14 font-medium"
              />
              <Button 
                type="submit"
                disabled={!newTask.trim()}
                className="bg-black hover:bg-gray-800 text-white rounded-2xl px-8 h-12 transition-all font-bold shadow-lg"
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
      </main>
    </div>
  );
};

export default Index;