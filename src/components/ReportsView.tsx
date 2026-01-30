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
import { cn } from '@/lib/utils';

interface ReportsViewProps {
  tasks: any[];
}

const ReportsView = ({ tasks }: ReportsViewProps) => {
  const completed = tasks.filter(t => t.is_completed).length;
  const pending = tasks.length - completed;
  const important = tasks.filter(t => t.is_important).length;
  
  const data = [
    { name: 'Terminées', value: completed, color: '#10B981', grad: 'url(#greenGrad)' },
    { name: 'En cours', value: pending, color: '#3B82F6', grad: 'url(#blueGrad)' },
    { name: 'Importantes', value: important, color: '#EC4899', grad: 'url(#pinkGrad)' },
  ];

  return (
    <div className="space-y-8 h-full flex flex-col p-2">
      <div className="flex items-center justify-between flex-none">
        <div>
          <h2 className="text-3xl font-black tracking-tight dark:text-white">Rapport d'Activité</h2>
          <p className="text-gray-500 font-medium">Analyse détaillée de votre productivité</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-lg gap-2 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5">
            <Printer className="w-4 h-4" /> Imprimer
          </Button>
          <Button className="rounded-lg gap-2 font-bold text-xs uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black shadow-lg hover:scale-105 transition-transform">
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {[
            { label: "Tâches Terminées", val: completed, icon: CheckCircle2, color: "green", trend: "+12%" },
            { label: "En Attente", val: pending, icon: Clock, color: "blue", trend: "Stable" },
            { label: "Tâches Importantes", val: important, icon: AlertCircle, color: "pink", trend: "Prioritaire" }
          ].map((kpi, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="bg-white dark:bg-white/5 p-8 rounded-xl border border-gray-100 dark:border-white/10 shadow-xl relative group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12", `bg-${kpi.color}-500/10`)}>
                  <kpi.icon className={cn("w-6 h-6", `text-${kpi.color}-500`)} />
                </div>
                <span className={cn("text-[10px] font-black px-2 py-1 rounded-full", `text-${kpi.color}-500 bg-${kpi.color}-500/10`)}>{kpi.trend}</span>
              </div>
              <h3 className="text-4xl font-black dark:text-white">{kpi.val}</h3>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">{kpi.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-white/5 p-8 rounded-xl border border-gray-100 dark:border-white/10 shadow-2xl flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 flex-none">
            <h4 className="text-xl font-bold dark:text-white">Répartition de la Charge</h4>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981"/><stop offset="100%" stopColor="#059669"/></linearGradient>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#2563EB"/></linearGradient>
                  <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EC4899"/><stop offset="100%" stopColor="#DB2777"/></linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '12px 20px' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 8, 8]}
                  animationDuration={2000}
                  animationEasing="ease-out"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.grad} />
                  ))}
                </Bar>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 800, fill: '#94A3B8' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;