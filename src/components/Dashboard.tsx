import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, AreaChart, 
  Area, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  RadialBarChart, RadialBar, Legend
} from 'recharts';
import { 
  CheckCircle2, Clock, Target, TrendingUp, ArrowLeft, 
  Activity, Zap, Star, Layout, BarChart3 
} from 'lucide-react';
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
    statusDistribution: [],
    priorityData: [],
    focusTrend: [],
    completionRate: [],
    listData: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Tâches du jour
    const today = startOfDay(new Date()).toISOString();
    const { count: completedToday } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true)
      .gte('updated_at', today);

    // 2. Sessions de Focus
    const { data: focusSessions } = await supabase
      .from('focus_sessions')
      .select('duration_minutes, created_at')
      .order('created_at', { ascending: true });
    
    const totalFocus = focusSessions?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0;

    // 3. Activité Hebdomadaire & Tendance Focus
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        name: format(date, 'EEE', { locale: fr }),
        fullDate: startOfDay(date).toISOString(),
        tasks: 0,
        focus: 0
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

    focusSessions?.forEach(session => {
      const sessionDate = startOfDay(new Date(session.created_at)).toISOString();
      const day = last7Days.find(d => d.fullDate === sessionDate);
      if (day) day.focus += session.duration_minutes;
    });

    // 4. Distribution Statuts & Priorités
    const { data: allTasks } = await supabase.from('tasks').select('status, priority, list_id, lists(name)');
    
    const statusCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = { high: 0, medium: 0, low: 0 };
    const listCounts: Record<string, number> = {};

    allTasks?.forEach((t: any) => {
      const s = t.status || 'En attente';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
      
      const p = t.priority || 'medium';
      priorityCounts[p] = (priorityCounts[p] || 0) + 1;

      // Fix: Handle lists as either an object or an array of objects
      const list = Array.isArray(t.lists) ? t.lists[0] : t.lists;
      if (list?.name) {
        listCounts[list.name] = (listCounts[list.name] || 0) + 1;
      }
    });

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: name === 'En cours' ? '#3B82F6' : 
             name === 'Terminé' ? '#10B981' : 
             name === 'En pause' ? '#F59E0B' : '#94A3B8'
    }));

    const priorityData = [
      { subject: 'Haute', A: priorityCounts.high, fullMark: 10 },
      { subject: 'Moyenne', A: priorityCounts.medium, fullMark: 10 },
      { subject: 'Basse', A: priorityCounts.low, fullMark: 10 },
    ];

    const listData = Object.entries(listCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const totalTasks = allTasks?.length || 0;
    const completedTotal = allTasks?.filter(t => t.status === 'Terminé').length || 0;
    const completionRate = [{
      name: 'Taux',
      value: totalTasks > 0 ? Math.round((completedTotal / totalTasks) * 100) : 0,
      fill: '#10B981'
    }];

    setStats({
      completedToday: completedToday || 0,
      totalFocusTime: totalFocus,
      weeklyData: last7Days,
      statusDistribution: statusData,
      priorityData,
      focusTrend: last7Days,
      completionRate,
      listData
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col p-4 sm:p-8 overflow-y-auto custom-scrollbar bg-transparent"
    >
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-black tracking-tight dark:text-white">Insights Pro</h2>
          <p className="text-gray-500 font-medium mt-1">Analyse prédictive et performance</p>
        </div>
        <Button variant="ghost" onClick={onClose} className="rounded-full h-12 w-12 p-0 hover:bg-gray-100 dark:hover:bg-white/10">
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Aujourd'hui", val: `${stats.completedToday} tâches`, icon: CheckCircle2, color: "blue", grad: "from-blue-500 to-indigo-600" },
          { label: "Temps Focus", val: `${Math.floor(stats.totalFocusTime / 60)}h ${stats.totalFocusTime % 60}m`, icon: Clock, color: "orange", grad: "from-orange-400 to-red-500" },
          { label: "Productivité", val: `${stats.completionRate[0]?.value}% global`, icon: Zap, color: "green", grad: "from-emerald-400 to-teal-600" }
        ].map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="relative group overflow-hidden rounded-[2rem] p-8 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-xl"
          >
            <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 blur-3xl transition-opacity group-hover:opacity-20", card.grad)} />
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:rotate-12", `bg-${card.color}-500/10`)}>
              <card.icon className={cn("w-7 h-7", `text-${card.color}-500`)} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
            <h3 className="text-3xl font-black mt-1 dark:text-white">{card.val}</h3>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        
        {/* 1. Activité Hebdomadaire (Barres 3D) */}
        <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-bold dark:text-white">Activité Hebdomadaire</h4>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyData}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '15px' }}
                  cursor={{ fill: 'rgba(59,130,246,0.05)' }}
                />
                <Bar dataKey="tasks" radius={[10, 10, 10, 10]} animationDuration={2000}>
                  {stats.weeklyData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? 'url(#barGrad)' : '#E2E8F0'} />
                  ))}
                </Bar>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94A3B8' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Répartition Statuts (Donut 3D) */}
        <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-bold dark:text-white">Statuts des Tâches</h4>
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusDistribution}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1500}
                >
                  {stats.statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Analyse des Priorités (Radar) */}
        <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-bold dark:text-white">Équilibre Priorités</h4>
            <Star className="w-5 h-5 text-pink-500" />
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.priorityData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 800, fill: '#94A3B8' }} />
                <Radar
                  name="Priorités"
                  dataKey="A"
                  stroke="#EC4899"
                  fill="#EC4899"
                  fillOpacity={0.3}
                  animationDuration={2000}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Tendance Focus (Aire) */}
        <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-bold dark:text-white">Intensité Focus</h4>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.focusTrend}>
                <defs>
                  <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                <Area 
                  type="monotone" 
                  dataKey="focus" 
                  stroke="#F59E0B" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#focusGrad)" 
                  animationDuration={2500}
                />
                <XAxis dataKey="name" hide />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Taux de Complétion (Radial) */}
        <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-bold dark:text-white">Objectif Global</h4>
            <Target className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex-1 w-full flex items-center justify-center relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <span className="text-4xl font-black dark:text-white">{stats.completionRate[0]?.value}%</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Atteint</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="60%" 
                outerRadius="100%" 
                barSize={20} 
                data={stats.completionRate}
                startAngle={180}
                endAngle={-180}
              >
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={15}
                  animationDuration={2000}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Top Listes (Barres Horizontales) */}
        <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-bold dark:text-white">Top Projets</h4>
            <Layout className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={stats.listData}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={80}
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#94A3B8' }}
                />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                <Bar dataKey="value" fill="#8B5CF6" radius={[0, 10, 10, 0]} animationDuration={2000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Dashboard;