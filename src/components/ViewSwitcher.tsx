import React from 'react';
import { 
  LayoutList, LayoutGrid, Trello, BarChart3, 
  CalendarDays, Clock, GanttChart, FileBarChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ViewType = 'list' | 'grid' | 'kanban' | 'dashboard' | 'calendar' | 'timeline' | 'gantt' | 'reports';

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const VIEWS = [
  { id: 'dashboard', label: 'Tableau de bord', description: 'Vue d\'ensemble de vos performances', icon: BarChart3, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'list', label: 'Liste', description: 'Gestion classique par liste', icon: LayoutList, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'grid', label: 'Grille', description: 'Vue visuelle riche', icon: LayoutGrid, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { id: 'kanban', label: 'Kanban', description: 'Flux de travail par colonnes', icon: Trello, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'calendar', label: 'Calendrier', description: 'Planification temporelle', icon: CalendarDays, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { id: 'timeline', label: 'Timeline', description: 'Chronologie des tâches', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'gantt', label: 'Gantt', description: 'Planification de projet avancée', icon: GanttChart, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'reports', label: 'Rapports', description: 'Analyses et statistiques', icon: FileBarChart, color: 'text-amber-500', bg: 'bg-amber-500/10' },
];

const ViewSwitcher = ({ currentView, onViewChange }: ViewSwitcherProps) => {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex items-center gap-1 p-1.5 bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl shadow-sm">
        {VIEWS.map((view) => (
          <Tooltip key={view.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onViewChange(view.id as ViewType)}
                className={cn(
                  "relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group",
                  currentView === view.id 
                    ? cn("shadow-inner", view.bg) 
                    : "hover:bg-gray-100 dark:hover:bg-white/5"
                )}
              >
                <view.icon className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  currentView === view.id ? view.color : "text-gray-400 group-hover:scale-110"
                )} />
                {currentView === view.id && (
                  <motion.div 
                    layoutId="active-view"
                    className="absolute inset-0 border-2 border-blue-500/20 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="rounded-xl border-none shadow-2xl bg-black text-white p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest">{view.label}</span>
                <span className="text-[9px] font-medium text-gray-400">{view.description}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

import { motion } from 'framer-motion';
export default ViewSwitcher;