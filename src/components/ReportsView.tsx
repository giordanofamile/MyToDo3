import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileBarChart, Download, Printer, TrendingUp, 
  CheckCircle2, Clock, AlertCircle, PieChart as PieIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';

interface ReportsViewProps {
  tasks: any[];
}

const ReportsView = ({ tasks }: ReportsViewProps) => {
  const completed = tasks.filter(t => t.is_completed).length;
  const pending = tasks.length - completed;
  const important = tasks.filter(t => t.is_important).length;
  
  const data = [
    { name: 'Terminées', value: completed, color: '#10B981' },
    { name: 'En cours', value: pending, color: '#3B82F6' },
    { name: 'Importantes', value: important, color: '#EC4899' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight dark:text-white">Rapport d'Activité</h2>
          <p className="text-gray-500 font-medium">Analyse détaillée de votre productivité</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl gap-2 font-bold text-xs uppercase tracking-widest">
            <Printer className="w-4 h-4" /> Imprimer
          </Button>
          <Button className="rounded-xl gap-2 font-bold text-xs uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black">
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KPIs */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-4xl font-black dark:text-white">{completed}</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Tâches Terminées</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">Stable</span>
            </div>
            <h3 className="text-4xl font-black dark:text-white">{pending}</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">En Attente</p>
          </motion.div>
        </div>

        {/* Graphiques */}
        <div className="lg:col-span-2 bg-white dark:bg-white/5 p-8 rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold dark:text-white">Répartition de la Charge</h4>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[15, 15, 15, 15]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94A3B8' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;