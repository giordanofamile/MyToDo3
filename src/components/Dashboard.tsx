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
import { cn } from '@/lib/utils';

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

    const today = startOfDay(new Date()).toISOString();
    const { count: completedToday } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true)
      .gte('updated_at', today);

    const { data: focusSessions } = await supabase
      .from('focus_sessions')
      .select('duration_minutes, created_at');
    
    const totalFocus = focusSessions?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0;

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
             name === 'En pause' ? '#F59E0B' : '#94A3B8',
      gradient: name === 'En cours' ? 'url(#blueGrad)' : 
                name === 'Terminé' ? 'url(#greenGrad)' : 
                name === 'En pause' ? 'url(#orangeGrad)' : 'url(#grayGrad)'
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
        <Button variant="ghost" onClick={onClose} className="rounded-full h-12 w-12 p-0 hover:bg-gray-100 dark:hover:bg-white/10">
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Aujourd'hui", val: `${stats.completedToday} tâches`, icon: CheckCircle2, color: "blue" },
          { label: "Temps Focus", val: `${Math.floor(stats.totalFocusTime / 60)}h ${stats.totalFocusTime % 60}m`, icon: Clock, color: "orange" },
          { label: "Objectif", val: `${Math.round((stats.completedToday / 5) * 100)}% du but`, icon: Target, color: "green" }
        ].map((card, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white dark:bg-white/5 p-6 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-white/10 relative overflow-hidden group"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", `bg-${card.color}-500/10`)}>
              <card.icon className={cn("w-6 h-6", `text-${card.color}-500`)} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{card.label}</p>
            <h3 className="text-3xl font-black mt-1 dark:text-white">{card.val}</h3>
            <div className={cn("absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-10", `bg-${card.color}-500`)} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-white/5 p-8 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold dark:text-white">Activité Hebdomadaire</h4>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyData}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.6}/>
                  </linearGradient>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="2" dy="4" result="offsetblur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.2" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '12px 20px' }}
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                />
                <Bar 
                  dataKey="tasks" 
                  radius={[12, 12, 12, 12]} 
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {stats.weeklyData.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 6 ? 'url(#barGrad)' : '#E2E8F0'} 
                      style={{ filter: index === 6 ? 'url(#shadow)' : 'none' }}
                    />
                  ))}
                </Bar>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 800, fill: '#94A3B8' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 p-8 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold dark:text-white">Répartition par Statut</h4>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {stats.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#1D4ED8"/></linearGradient>
                    <linearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#10B981"/><stop offset="100%" stopColor="#047857"/></linearGradient>
                    <linearGradient id="orangeGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#B45309"/></linearGradient>
                    <linearGradient id="grayGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#94A3B8"/><stop offset="100%" stopColor="#475569"/></linearGradient>
                  </defs>
                  <Pie
                    data={stats.statusDistribution}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                    animationBegin={200}
                    animationDuration={1200}
                  >
                    {stats.statusDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.gradient} style={{ filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.1))' }} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
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