import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Auth from './Auth';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, Circle, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showError, showSuccess } from '@/utils/toast';

interface Task {
  id: string;
  title: string;
  is_completed: boolean;
  is_important: boolean;
  user_id: string;
}

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [activeList, setActiveList] = useState('my-day');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchTasks();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchTasks();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

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

  const toggleComplete = async (task: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !task.is_completed })
      .eq('id', task.id);

    if (error) showError(error.message);
    else {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, is_completed: !t.is_completed } : t));
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold tracking-tight text-gray-900"
            >
              {activeList === 'my-day' ? 'Ma journée' : 
               activeList === 'important' ? 'Important' : 'Toutes les tâches'}
            </motion.h1>
            <p className="text-gray-500 mt-1">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </header>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <button 
                    onClick={() => toggleComplete(task)}
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    {task.is_completed ? (
                      <CheckCircle2 className="w-6 h-6 text-blue-500" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  
                  <span className={cn(
                    "flex-1 text-[15px] transition-all duration-300",
                    task.is_completed ? "text-gray-400 line-through" : "text-gray-900"
                  )}>
                    {task.title}
                  </span>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-pink-500">
                      <Star className={cn("w-4 h-4", task.is_important && "fill-pink-500 text-pink-500")} />
                    </button>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Input flottant style Apple */}
        <div className="absolute bottom-8 left-0 right-0 px-8">
          <div className="max-w-4xl mx-auto">
            <form 
              onSubmit={addTask}
              className="bg-white/80 backdrop-blur-2xl p-2 rounded-[1.5rem] shadow-2xl border border-white/20 flex items-center gap-2"
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
                className="bg-black hover:bg-gray-800 text-white rounded-xl px-6 h-10 transition-all"
              >
                Ajouter
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;