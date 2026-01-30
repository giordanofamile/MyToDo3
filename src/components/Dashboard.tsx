import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { CheckCircle2, Clock, Target, TrendingUp, ArrowLeft, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, subDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DashboardProps {
  onClose: () => void;
}

const Dashboard = ({ onClose }: DashboardProps) => {
  const [stats, setStats] = useState<any>({
    completedToday: 0,
    totalFocusTime: 0,
    weeklyData: [],
    statusDistribution: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Tâches terminées aujourd'hui
    const today = startOfDay(new Date()).toISOString();
    const { count: completedToday } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true)
      .gte('updated_at', today);

    // 2. Temps de focus total
    const { data: focusSessions } = await supabase
      .from('focus_sessions')
      .select('duration_minutes, created_at');
    
    const totalFocus = focusSessions?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0;

    // 3. Données hebdomadaires
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        name: format(date, 'EEE', { locale: fr }),
        fullDate: startOfDay(date).toISOString(),
        tasks: 0
      };
    });

    const { data: weeklyTasks } = await supabase
      .from('tasks')
      .select('updated_at')
      .eq('is_completed', true)
      .gte('updated_at', subDays(new Date(), 7).toISOString());

    weeklyTasks?.forEach(task => {
      const taskDate = startOfDay(new Date(task.updated_at)).toISOString();
      const day = last7Days.find(d => d.fullDate === taskDate);
      if (day) day.tasks++;
    });

    // 4. Répartition par Statut
    const { data: tasks } = await supabase.from('tasks').select('status');
    const statusCounts: Record<string, number> = {};
    tasks?.forEach(t => {
      const s = t.status || 'En attente';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: name === 'En cours' ? '#3B82F6' : 
             name === 'Terminé' ? '#10B981' : 
             name === 'En pause' ? '#F59E0B' : '#94A3B8'
    }));

    setStats({
      completedToday: completedToday || 0,
      totalFocusTime: totalFocus,
      weeklyData: last7Days,
      statusDistribution: statusData
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col p-8 overflow-y-auto custom-scrollbar"
    >
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-black tracking-tight dark:text-white">Insights</h2>
          <p className="text-gray-500 font-medium mt-1">Analyse de votre productivité</p>
        </div>
        <Button variant="ghost" onClick={onClose} className="rounded-full h-12 w-12 p-0">
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-white/5 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/10">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Aujourd'hui</p>
          <h3 className="text-3xl font-black mt-1 dark:text-white">{stats.completedToday} <span className="text-lg text-gray-400 font-medium">tâches</span></h3>
        </div>

        <div className="bg-white dark:bg-white/5 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/10">
          <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Temps Focus</p>
          <h3 className="text-3xl font-black mt-1 dark:text-white">{Math.floor(stats.totalFocusTime / 60)}h {stats.totalFocusTime % 60}m</h3>
        </div>

        <div className="bg-white dark:bg-white/5 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/10">
          <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Objectif</p>
          <h3 className="text-3xl font-black mt-1 dark:text-white">{Math.round((stats.completedToday / 5) * 100)}% <span className="text-lg text-gray-400 font-medium">du but</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-white/5 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold dark:text-white">Activité Hebdomadaire</h4>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyData}>
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="tasks" radius={[10, 10, 10, 10]}>
                  {stats.weeklyData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? '#3B82F6' : '#E2E8F0'} />
                  ))}
                </Bar>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94A3B8' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold dark:text-white">Répartition par Statut</h4>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {stats.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {stats.statusDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 font-medium">Pas encore de données</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;