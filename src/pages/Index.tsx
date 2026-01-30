import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Auth from './Auth';
import Sidebar from '@/components/Sidebar';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
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

    if (activeList === 'important') {
      query = query.eq('is_important', true);
    } else if (activeList === 'my-day') {
      // Pour simplifier, on affiche tout dans "Ma journée" pour l'instant
      // On pourrait filtrer par created_at = today
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) showError(error.message);
    else setTasks(data || []);
    setLoading(false);
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ 
        title: newTask, 
        user_id: session.user.id,
        is_completed: false,
        is_important: activeList === 'important'
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

  if (!session) return <Auth />;

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans antialiased">
      <Sidebar activeList={activeList} setActiveList={setActiveList} />
      
      <main className="flex-1 flex flex-col bg-[#F5F5F7]/30 relative">
        <div className="max-w-4xl w-full mx-auto px-8 pt-16 pb-32 overflow-y-auto">
          <header className="mb-12">
            <motion.h1 
              key={activeList}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold tracking-tight text-gray-900"
            >
              {activeList === 'my-day' ? 'Ma journée' : 
               activeList === 'important' ? 'Important' : 'Toutes les tâches'}
            </motion.h1>
            <p className="text-gray-500 mt-1 font-medium">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </header>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
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
            </AnimatePresence>
            
            {!loading && tasks.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">Aucune tâche ici. Commencez par en ajouter une !</p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 px-8">
          <div className="max-w-4xl mx-auto">
            <form 
              onSubmit={addTask}
              className="bg-white/60 backdrop-blur-2xl p-2 rounded-[1.5rem] shadow-2xl border border-white/40 flex items-center gap-2"
            >
              <div className="p-2 text-blue-500">
                <Plus className="w-6 h-6" />
              </div>
              <Input 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Ajouter une tâche"
                className="border-none bg-transparent focus-visible:ring-0 text-lg placeholder:text-gray-400 h-12"
              />
              <Button 
                type="submit"
                disabled={!newTask.trim()}
                className="bg-black hover:bg-gray-800 text-white rounded-xl px-6 h-10 transition-all font-medium"
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